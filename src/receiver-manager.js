// @flow
import {cast as remote, core} from 'kaltura-player-js';
import {PlayerLoader} from './player/player-loader';

const {TextStyleConverter} = remote;
const {FakeEvent, TrackType} = core;

class ReceiverManager {
  _context: Object;
  _playerManager: Object;

  constructor(config: Object) {
    this._context = cast.framework.CastReceiverContext.getInstance();
    this._playerManager = this._context.getPlayerManager();
    window.player = this._player = PlayerLoader.loadPlayer(config);
    this._attachListeners();
    this._attachInterceptors();
  }

  loadMedia(loadRequestData: Object): Promise<Object> {
    return new Promise((resovle, reject) => {
      const mediaInfo = loadRequestData.media.customData.mediaInfo;
      this._player.addEventListener(this._player.Event.ERROR, event => reject(event));
      this._player.addEventListener(this._player.Event.SOURCE_SELECTED, event => this._setMediaInfo(event, loadRequestData, resovle));
      this._player.loadMedia(mediaInfo);
    });
  }

  _setMediaInfo(event: FakeEvent, loadRequestData: Object, resolve: Function): void {
    const source = event.payload.selectedSource[0];
    loadRequestData.media.contentId = source.id;
    loadRequestData.media.contentUrl = source.url;
    loadRequestData.media.contentType = source.mimetype;
    loadRequestData.media.streamType = this._player.isLive() ? cast.framework.messages.StreamType.LIVE : cast.framework.messages.StreamType.BUFFERED;
    loadRequestData.media.metadata = new cast.framework.messages.GenericMediaMetadata();
    loadRequestData.media.metadata.title = this._player.config.sources.metadata.name;
    loadRequestData.media.metadata.subtitle = this._player.config.sources.metadata.description;
    loadRequestData.media.metadata.images = [{url: this._player.config.sources.poster}];
    resolve(loadRequestData);
  }

  _setInitialTracks(): void {
    const mediaInfo = this._playerManager.getMediaInformation();
    this._setInitialAudioTrack(mediaInfo.customData.audioLanguage);
    this._setInitialTextTrack(mediaInfo.customData.textLanguage);
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
      const audioTrackId = audioTracks[0].trackId;
      const audioTrack = this._player.getTracks(TrackType.AUDIO).find(t => t.id === audioTrackId);
      if (audioTrack) {
        audioTracksManager.setActiveById(audioTrackId);
        this._player.selectTrack(audioTrack);
      }
    }
  }

  _attachListeners(): void {
    this._playerManager.addEventListener(cast.framework.events.EventType.PLAYER_LOAD_COMPLETE, () => {
      this._player.load();
      this._player.ready().then(() => {
        this._setInitialTracks();
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
    this._playerManager.addEventListener(cast.framework.events.EventType.REQUEST_VOLUME_CHANGE, requestEvent => {
      const volume = requestEvent.requestData.volume.level;
      const muted = requestEvent.requestData.volume.muted;
      if (this._player.volume !== volume) {
        this._player.volume = volume;
      }
      if (this._player.muted !== muted) {
        this._player.muted = muted;
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
    this._playerManager.setMessageInterceptor(cast.framework.messages.MessageType.MEDIA_STATUS, status => {
      if (this._player) {
        status.customData = {
          mediaInfo: this._player.getMediaInfo()
        };
      }
      return status;
    });
  }
}

export {ReceiverManager};
