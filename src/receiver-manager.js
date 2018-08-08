// @flow
import {core} from 'kaltura-player-js';
import {PlayerLoader} from './player-loader';
import {ReceiverTracksManager} from './receiver-tracks-manager';
import {ReceiverAdsManager} from './receiver-ads-manager';

const {FakeEvent, EventManager, DrmScheme} = core;

class ReceiverManager {
  _context: Object;
  _playerManager: Object;
  _eventManager: EventManager;
  _player: Object;
  _shouldAutoPlay: boolean = true;
  _firstPlay: boolean = true;
  _tracksManager: ReceiverTracksManager;
  _adsManager: ReceiverAdsManager;

  constructor(config: Object) {
    this._context = cast.framework.CastReceiverContext.getInstance();
    this._playerManager = this._context.getPlayerManager();
    this._eventManager = new EventManager();
    this._player = PlayerLoader.loadPlayer(config);
    this._tracksManager = new ReceiverTracksManager(this._player);
    this._adsManager = new ReceiverAdsManager(this._player);
    this._addEventListeners();
    this._setMessageInterceptors();
  }

  onLoad(loadRequestData: Object): Promise<Object> {
    this._reset();
    return new Promise((resovle, reject) => {
      const mediaInfo = loadRequestData.media.customData.mediaInfo;
      this._eventManager.listen(this._player, this._player.Event.ERROR, event => reject(event));
      this._eventManager.listen(this._player, this._player.Event.SOURCE_SELECTED, event => this._onSourceSelected(event, loadRequestData, resovle));
      this._player.loadMedia(mediaInfo);
    });
  }

  onStop(requestData: Object): Promise<Object> {
    this._destroy();
    return requestData;
  }

  onMediaStatus(mediaStatus: Object): Promise<Object> {
    mediaStatus.customData = mediaStatus.customData || {};
    if (this._player) {
      mediaStatus.customData.mediaInfo = this._player.getMediaInfo();
      if (this._player.isLive()) {
        mediaStatus.currentTime = this._player.currentTime;
        if (mediaStatus.media) {
          mediaStatus.media.duration = this._player.duration;
        }
      }
    }
    if (mediaStatus.playerState !== this._playerManager.getPlayerState()) {
      mediaStatus.playerState = this._playerManager.getPlayerState();
    }
    return mediaStatus;
  }

  _reset(): void {
    this._shouldAutoPlay = true;
    this._firstPlay = true;
    this._eventManager.removeAll();
    this._player.reset();
  }

  _destroy(): void {
    this._shouldAutoPlay = true;
    this._firstPlay = true;
    this._eventManager.destroy();
    this._player.destroy();
  }

  _onSourceSelected(event: FakeEvent, loadRequestData: Object, resolve: Function): void {
    const source = event.payload.selectedSource[0];
    this._handleAutoPlay(loadRequestData);
    this._setMediaInfo(loadRequestData, source);
    this._maybeSetDrmLicenseUrl(source);
    resolve(loadRequestData);
  }

  _setMediaInfo(loadRequestData: Object, source: Object): void {
    loadRequestData.media.contentId = source.id;
    loadRequestData.media.contentUrl = source.url;
    loadRequestData.media.contentType = source.mimetype;
    loadRequestData.media.streamType = this._player.isLive() ? cast.framework.messages.StreamType.LIVE : cast.framework.messages.StreamType.BUFFERED;
    loadRequestData.media.metadata = new cast.framework.messages.GenericMediaMetadata();
    loadRequestData.media.metadata.title = this._player.config.sources.metadata.name;
    loadRequestData.media.metadata.subtitle = this._player.config.sources.metadata.description;
    loadRequestData.media.metadata.images = [{url: this._player.config.sources.poster}];
  }

  _handleAutoPlay(loadRequestData: Object): void {
    if (!loadRequestData.autoplay) {
      this._shouldAutoPlay = false;
      loadRequestData.autoplay = true;
    }
  }

  _maybeSetDrmLicenseUrl(source: Object): void {
    if (source.drmData) {
      const data = source.drmData.find(data => data.scheme === DrmScheme.WIDEVINE);
      if (data) {
        this._playerManager.setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
          playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
          playbackConfig.licenseUrl = data.licenseUrl;
          return playbackConfig;
        });
      }
    }
  }

  _addEventListeners(): void {
    const eventHandlers = {
      [cast.framework.events.EventType.PLAY]: this._onPlayEvent,
      [cast.framework.events.EventType.PAUSE]: this._onPauseEvent,
      [cast.framework.events.EventType.PLAYER_LOAD_COMPLETE]: this._onPlayerLoadCompleteEvent,
      [cast.framework.events.EventType.REQUEST_EDIT_TRACKS_INFO]: this._onRequestEditTracksInfoEvent
    };
    Object.keys(eventHandlers).forEach(event => this._playerManager.addEventListener(event, eventHandlers[event].bind(this)));
  }

  _setMessageInterceptors(): void {
    const msgHandlers = {
      [cast.framework.messages.MessageType.LOAD]: this.onLoad,
      [cast.framework.messages.MessageType.MEDIA_STATUS]: this.onMediaStatus,
      [cast.framework.messages.MessageType.STOP]: this.onStop
    };
    Object.keys(msgHandlers).forEach(msg => this._playerManager.setMessageInterceptor(msg, msgHandlers[msg].bind(this)));
  }

  _onPlayEvent(): void {
    if (this._firstPlay) {
      if (!this._shouldAutoPlay) {
        this._playerManager.pause();
      } else {
        this._player.play();
      }
      this._firstPlay = false;
    } else {
      this._player.play();
    }
  }

  _onPauseEvent(): void {
    this._player.pause();
  }

  _onPlayerLoadCompleteEvent(): void {
    this._player.load();
    this._player.ready().then(() => this._tracksManager.setInitialTracks());
  }

  _onRequestEditTracksInfoEvent(requestEvent): void {
    const activeTrackIds = requestEvent.requestData.activeTrackIds;
    if (activeTrackIds) {
      this._tracksManager.handleAudioTrackSelection(activeTrackIds);
      this._tracksManager.handleTextTrackSelection(activeTrackIds);
    } else {
      const textTrackStyle = requestEvent.requestData.textTrackStyle;
      this._tracksManager.handleTextStyleSelection(textTrackStyle);
    }
  }
}

export {ReceiverManager};
