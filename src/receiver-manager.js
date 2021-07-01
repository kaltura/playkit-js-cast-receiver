// @flow
import {cast as remote, core} from 'kaltura-player-js';
import {PlayerLoader} from './player-loader';
import {ReceiverTracksManager} from './receiver-tracks-manager';
import {ReceiverAdsManager} from './receiver-ads-manager';

const {FakeEvent, EventManager, DrmScheme, Utils, getLogger} = core;
const {CustomMessageType, CustomActionType, CustomActionMessage} = remote;

export const CUSTOM_CHANNEL = 'urn:x-cast:com.kaltura.cast.playkit';
const BROADCAST_STATUS_INTERVAL_FREQ: number = 1000;
const LIVE_EDGE = -1;

class ReceiverManager {
  _logger: any = getLogger('ReceiverManager');
  _context: Object;
  _playerManager: Object;
  _eventManager: EventManager;
  _player: Object;
  _shouldAutoPlay: boolean = true;
  _firstPlay: boolean = true;
  _tracksManager: ReceiverTracksManager;
  _adsManager: ReceiverAdsManager;
  _broadcastStatusIntervalId: IntervalID | null = null;
  _messageInterceptorsHandlers: {[message: string]: Function} = {
    [cast.framework.messages.MessageType.LOAD]: this.onLoad,
    [cast.framework.messages.MessageType.MEDIA_STATUS]: this.onMediaStatus,
    [cast.framework.messages.MessageType.STOP]: this.onStop
  };
  _playerManagerEventHandlers: {[event: string]: Function} = {
    [cast.framework.events.EventType.REQUEST_PLAY]: this._onRequestPlayEvent,
    [cast.framework.events.EventType.REQUEST_PAUSE]: this._onRequestPauseEvent,
    [cast.framework.events.EventType.PLAY]: this._onPlayEvent,
    [cast.framework.events.EventType.PLAYER_LOAD_COMPLETE]: this._onPlayerLoadCompleteEvent
  };
  _castContextEventHandlers: {[event: string]: Function} = {
    [cast.framework.system.EventType.SYSTEM_VOLUME_CHANGED]: this._onSystemVolumeChangedEvent
  };

  constructor(config: Object) {
    this._context = cast.framework.CastReceiverContext.getInstance();
    this._playerManager = this._context.getPlayerManager();
    this._eventManager = new EventManager();
    this._player = PlayerLoader.loadPlayer(config);
    this._tracksManager = new ReceiverTracksManager(this._player);
    this._adsManager = new ReceiverAdsManager(this._player);
    this._attachListeners();
  }

  getPlayer(): Object {
    return this._player;
  }

  start(options: Object): void {
    const defaultOptions = new cast.framework.CastReceiverOptions();
    defaultOptions.customNamespaces = {
      [CUSTOM_CHANNEL]: cast.framework.system.MessageType.JSON
    };
    Utils.Object.mergeDeep(defaultOptions, options);
    this._logger.debug('Start receiver', defaultOptions);
    this._context.start(defaultOptions);
  }

  onLoad(loadRequestData: Object): Promise<Object> {
    this._logger.debug('onLoad', loadRequestData);
    this._reset();
    return new Promise((resovle, reject) => {
      const mediaInfo = loadRequestData.media.customData.mediaInfo;
      const mediaConfig = loadRequestData.media.customData.mediaConfig;
      this._maybeCreateVmapAdsRequest(loadRequestData.media);
      this._maybeReplaceAdTagTimestamp(loadRequestData.media);
      this._eventManager.listen(this._player, this._player.Event.ERROR, event => reject(event));
      this._eventManager.listen(this._player, this._player.Event.SOURCE_SELECTED, event => this._onSourceSelected(event, loadRequestData, resovle));
      if (mediaInfo) {
        this._logger.debug('loadMedia', mediaInfo);
        this._player.loadMedia(mediaInfo);
      } else {
        this._logger.debug('setMedia', mediaConfig);
        this._player.setMedia(mediaConfig);
      }
    });
  }

  onStop(requestData: Object): Promise<Object> {
    this._logger.debug('onStop', requestData);
    this._destroy();
    return requestData;
  }

  onMediaStatus(mediaStatus: Object): Promise<Object> {
    this._logger.debug('mediaStatus', mediaStatus);
    mediaStatus.customData = mediaStatus.customData || {};
    if (this._player) {
      mediaStatus.customData.mediaInfo = this._player.getMediaInfo();
      if (this._player.isLive() && mediaStatus.media) {
        mediaStatus.media.duration = this._player.liveDuration;
      }
    }
    if (mediaStatus.playerState !== this._playerManager.getPlayerState()) {
      mediaStatus.playerState = this._playerManager.getPlayerState();
    }
    return mediaStatus;
  }

  _attachListeners(): void {
    this._context.addCustomMessageListener(CUSTOM_CHANNEL, customMessage => this._onCustomMessage(customMessage));
    Object.keys(this._playerManagerEventHandlers).forEach(event =>
      this._playerManager.addEventListener(event, this._playerManagerEventHandlers[event].bind(this))
    );
    Object.keys(this._messageInterceptorsHandlers).forEach(msg =>
      this._playerManager.setMessageInterceptor(msg, this._messageInterceptorsHandlers[msg].bind(this))
    );
    Object.keys(this._castContextEventHandlers).forEach(event =>
      this._context.addEventListener(event, this._castContextEventHandlers[event].bind(this))
    );
  }

  _reset(): void {
    this._shouldAutoPlay = true;
    this._firstPlay = true;
    this._clearBroadcastStatusInterval();
    this._eventManager.removeAll();
    this._player.reset();
  }

  _destroy(): void {
    this._shouldAutoPlay = true;
    this._firstPlay = true;
    this._clearBroadcastStatusInterval();
    this._eventManager.destroy();
    this._player.destroy();
  }

  _onSourceSelected(event: FakeEvent, loadRequestData: Object, resolve: Function): void {
    const source = event.payload.selectedSource[0];
    this._handleAutoPlay(loadRequestData);
    this._handleLiveDvr(loadRequestData);
    this._setMediaInfo(loadRequestData, source);
    this._maybeSetDrmLicenseUrl(source);
    const sources = this._player.config.sources;
    if (sources.options && sources.options.forceRedirectExternalStreams) {
      this._logger.debug('Redirect stream started');
      Utils.Http.jsonp(loadRequestData.media.contentUrl, (data, url) => {
        loadRequestData.media.contentUrl = sources.options.redirectExternalStreamsHandler(data, url);
        this._logger.debug('Redirect stream ended', loadRequestData.media.contentUrl);
        resolve(loadRequestData);
      });
    } else {
      resolve(loadRequestData);
    }
  }

  _setMediaInfo(loadRequestData: Object, source: Object): void {
    loadRequestData.media.contentId = loadRequestData.media.contentId || source.id;
    loadRequestData.media.contentUrl = loadRequestData.media.contentUrl || source.url;
    loadRequestData.media.contentType = loadRequestData.media.contentType || source.mimetype;
    loadRequestData.media.streamType = this._player.isLive() ? cast.framework.messages.StreamType.LIVE : cast.framework.messages.StreamType.BUFFERED;
    loadRequestData.media.metadata = loadRequestData.media.metadata || new cast.framework.messages.GenericMediaMetadata();
    loadRequestData.media.metadata.title = loadRequestData.media.metadata.title || this._player.config.sources.metadata.name;
    loadRequestData.media.metadata.subtitle = loadRequestData.media.metadata.subtitle || this._player.config.sources.metadata.description;
    loadRequestData.media.metadata.images = loadRequestData.media.metadata.images || [{url: this._player.config.sources.poster}];
    loadRequestData.media.hlsSegmentFormat = loadRequestData.media.hlsSegmentFormat || cast.framework.messages.HlsSegmentFormat.TS;
    this._logger.debug('Media info has been set', loadRequestData);
  }

  _handleAutoPlay(loadRequestData: Object): void {
    if (!loadRequestData.autoplay) {
      this._shouldAutoPlay = false;
      loadRequestData.autoplay = true;
    }
  }

  _handleLiveDvr(loadRequestData: Object): void {
    if (this._player.isDvr() && loadRequestData.currentTime === LIVE_EDGE) {
      delete loadRequestData.currentTime;
      this._logger.debug(`Live DVR will seek to live edge`);
    }
  }

  _maybeSetDrmLicenseUrl(source: Object): void {
    if (source.drmData) {
      const data = source.drmData.find(data => data.scheme === DrmScheme.WIDEVINE);
      if (data) {
        this._playerManager.setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
          playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
          playbackConfig.licenseUrl = data.licenseUrl;
          this._logger.debug(`Set drm license url`, playbackConfig);
          return playbackConfig;
        });
      }
    }
  }

  _onPlayEvent(): void {
    this._logger.debug('Play event', {firstPlay: this._firstPlay});
    if (this._firstPlay) {
      if (this._shouldAutoPlay) {
        this._player.play();
      } else {
        this._playerManager.pause();
      }
      this._firstPlay = false;
    }
  }

  _onRequestPlayEvent(): void {
    this._logger.debug('Request play event');
    this._player.play();
    this._clearBroadcastStatusInterval();
  }

  _onRequestPauseEvent(): void {
    this._logger.debug('Request pause event');
    this._player.pause();
    // on live dvr pause continue to broadcast media status to help senders refresh their UIs
    if (this._player.isDvr()) {
      this._clearBroadcastStatusInterval();
      this._broadcastStatusIntervalId = setInterval(() => {
        this._playerManager.broadcastStatus(true);
      }, BROADCAST_STATUS_INTERVAL_FREQ);
    }
  }

  _clearBroadcastStatusInterval(): void {
    if (this._broadcastStatusIntervalId) {
      clearInterval(this._broadcastStatusIntervalId);
      this._broadcastStatusIntervalId = null;
    }
  }

  _onPlayerLoadCompleteEvent(): void {
    const loadPlayerAndSetInitialTracks = () => {
      this._player.load();
      this._player.ready().then(() => this._tracksManager.setInitialTracks());
    };
    this._logger.debug('Player load complete');
    if (this._adsManager.adBreak()) {
      this._eventManager.listenOnce(this._player, this._player.Event.AD_BREAK_END, () => {
        this._eventManager.listenOnce(this._player, this._player.Event.PLAYING, loadPlayerAndSetInitialTracks);
      });
    } else {
      loadPlayerAndSetInitialTracks();
    }
  }

  _onSystemVolumeChangedEvent(systemVolumeChangedEvent: Object): void {
    const data = systemVolumeChangedEvent.data;
    if (this._player.volume !== data.level) {
      this._player.volume = data.level;
    }
    if (this._player.muted !== data.muted) {
      this._player.muted = data.muted;
    }
  }

  _onCustomMessage(customMessageEvent: Object): void {
    const customMessage = customMessageEvent.data;
    this._logger.debug('Custom message received', customMessage);
    switch (customMessage.type) {
      case CustomMessageType.ACTION:
        this._handleCustomAction(customMessage);
        break;
      default:
        break;
    }
  }

  _handleCustomAction(customAction: CustomActionMessage): void {
    switch (customAction.action) {
      case CustomActionType.SKIP_AD:
        this._adsManager.skipAd();
        break;
      default:
        break;
    }
  }

  _maybeCreateVmapAdsRequest(media: Object): void {
    if (media.customData && media.customData.vmapAdsRequest) {
      media.vmapAdsRequest = media.customData.vmapAdsRequest;
    }
  }

  _maybeReplaceAdTagTimestamp(media: Object): void {
    const replaceTimestamp = adtag => {
      if (adtag && regex.test(adtag)) {
        const match = adtag.match(regex);
        return adtag.replace(match[1], Date.now());
      }
      return adtag;
    };
    const regex = /correlator=(\[timestamp\])/;
    if (media.breakClips) {
      const breakClips = media.breakClips;
      breakClips.forEach(breakClip => {
        if (breakClip.vastAdsRequest && breakClip.vastAdsRequest.adTagUrl) {
          breakClip.vastAdsRequest.adTagUrl = replaceTimestamp(breakClip.vastAdsRequest.adTagUrl);
        }
      });
    }
    if (media.vmapAdsRequest) {
      media.vmapAdsRequest.adTagUrl = replaceTimestamp(media.vmapAdsRequest.adTagUrl);
    }
  }
}

export {ReceiverManager};
