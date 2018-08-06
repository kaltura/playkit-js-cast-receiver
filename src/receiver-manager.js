// @flow
import {cast as remote, core} from 'kaltura-player-js';
import {PlayerLoader} from './player/player-loader';

const {TextStyleConverter} = remote;
const {FakeEvent, TrackType, EventManager, DrmScheme} = core;

class ReceiverManager {
  _context: Object;
  _playerManager: Object;
  _eventManager: EventManager;
  _player: Object;

  constructor(config: Object) {
    this._context = cast.framework.CastReceiverContext.getInstance();
    this._playerManager = this._context.getPlayerManager();
    this._eventManager = new EventManager();
    window.player = this._player = PlayerLoader.loadPlayer(config);
    this._attachListeners();
    this._attachInterceptors();
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
    return mediaStatus;
  }

  _reset(): void {
    this._eventManager.removeAll();
    this._player.reset();
  }

  _destroy(): void {
    this._eventManager.destroy();
    this._player.destroy();
  }

  _onSourceSelected(event: FakeEvent, loadRequestData: Object, resolve: Function): void {
    const source = event.payload.selectedSource[0];
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

  _setInitialTracks(): void {
    const mediaInfo = this._playerManager.getMediaInformation();
    if (mediaInfo.customData) {
      this._setInitialAudioTrack(mediaInfo.customData.audioLanguage);
      this._setInitialTextTrack(mediaInfo.customData.textLanguage);
    }
  }

  _setInitialTextTrack(textLanguage: ?string): void {
    const textTracksManager = this._playerManager.getTextTracksManager();
    if (textLanguage) {
      textTracksManager.setActiveByLanguage(textLanguage);
    }
  }

  _setInitialAudioTrack(audioLanguage: ?string): void {
    const audioTracksManager = this._playerManager.getAudioTracksManager();
    if (audioLanguage) {
      audioTracksManager.setActiveByLanguage(audioLanguage);
    } else {
      const audioTracks = audioTracksManager.getTracks();
      if (audioTracks.length > 0) {
        const audioTrackId = audioTracks[0].trackId;
        const audioTrack = this._player.getTracks(TrackType.AUDIO).find(t => t.id === audioTrackId);
        if (audioTrack) {
          audioTracksManager.setActiveById(audioTrackId);
          this._player.selectTrack(audioTrack);
        }
      }
    }
  }

  _attachListeners(): void {
    this._playerManager.addEventListener(cast.framework.events.EventType.PLAYER_LOAD_COMPLETE, () => {
      this._player.load();
      this._player.ready().then(() => {
        this._setInitialTracks();
        if (this._player.isLive() && !this._player.isDvr()) {
          this._player.seekToLiveEdge();
        }
      });
    });
    this._playerManager.addEventListener(cast.framework.events.EventType.REQUEST_EDIT_TRACKS_INFO, requestEvent => {
      const activeTrackIds = requestEvent.requestData.activeTrackIds;
      if (activeTrackIds) {
        this._handleAudioTrackSelection(activeTrackIds);
        this._handleTextTrackSelection(activeTrackIds);
      } else {
        const textTrackStyle = requestEvent.requestData.textTrackStyle;
        this._handleTextStyleSelection(textTrackStyle);
      }
    });
    this._playerManager.addEventListener(cast.framework.events.EventType.REQUEST_PLAY, () => {
      if (this._player.isLive() && !this._player.isDvr()) {
        this._player.seekToLiveEdge();
      }
    });
  }

  _handleTextTrackSelection(activeTrackIds: Array<number>): void {
    const textTracks = this._player.getTracks(TrackType.TEXT);
    const activeTextTrack = textTracks.find(t => t.active);
    const nextActiveTextTrack = textTracks.find(t => activeTrackIds.includes(t.id));
    if (nextActiveTextTrack) {
      this._player.selectTrack(nextActiveTextTrack);
    } else if (activeTextTrack.language !== 'off') {
      const offTrack = textTracks.find(t => t.language === 'off');
      this._player.selectTrack(offTrack);
    }
  }

  _handleAudioTrackSelection(activeTrackIds: Array<number>): void {
    const audioTracks = this._player.getTracks(TrackType.AUDIO);
    const activeAudioTrack = audioTracks.find(t => t.active);
    const nextActiveAudioTrack = audioTracks.find(t => activeTrackIds.includes(t.id));
    if (activeAudioTrack.id !== nextActiveAudioTrack.id) {
      this._player.selectTrack(nextActiveAudioTrack);
    }
  }

  _handleTextStyleSelection(textStyle: Object): void {
    this._player.textStyle = TextStyleConverter.toPlayerTextStyle(textStyle);
  }

  _attachInterceptors(): void {
    this._playerManager.setMessageInterceptor(cast.framework.messages.MessageType.LOAD, loadRequestData => this.onLoad(loadRequestData));
    this._playerManager.setMessageInterceptor(cast.framework.messages.MessageType.MEDIA_STATUS, mediaStatus => this.onMediaStatus(mediaStatus));
    this._playerManager.setMessageInterceptor(cast.framework.messages.MessageType.STOP, requestData => this.onStop(requestData));
  }
}

export {ReceiverManager};
