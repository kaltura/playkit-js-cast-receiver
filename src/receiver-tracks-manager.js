// @flow
import {cast as remote, core} from 'kaltura-player-js';

const {TextStyleConverter} = remote;
const {TrackType} = core;

class ReceiverTracksManager {
  _playerManager: Object;
  _player: Object;

  constructor(player: Object) {
    this._playerManager = cast.framework.CastReceiverContext.getInstance().getPlayerManager();
    this._player = player;
    this._attachListeners();
  }

  setInitialTracks(): void {
    const mediaInfo = this._playerManager.getMediaInformation();
    if (mediaInfo.customData) {
      this._setInitialAudioTrack(mediaInfo.customData.audioLanguage);
      this._setInitialTextTrack(mediaInfo.customData.textLanguage);
    }
  }

  _attachListeners(): void {
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

  _setInitialTextTrack(textLanguage: ?string): void {
    const textTracksManager = this._playerManager.getTextTracksManager();
    if (textLanguage) {
      textTracksManager.setActiveByLanguage(textLanguage);
    }
  }

  _setInitialAudioTrack(audioLanguage: ?string): void {
    const audioTracksManager = this._playerManager.getAudioTracksManager();
    const audioTracks = audioTracksManager.getTracks();
    if (audioTracks.length > 0) {
      if (audioLanguage) {
        audioTracksManager.setActiveByLanguage(audioLanguage);
      } else {
        const audioTrackId = audioTracks[0].trackId;
        const audioTrack = this._player.getTracks(TrackType.AUDIO).find(t => t.id === audioTrackId);
        if (audioTrack) {
          audioTracksManager.setActiveById(audioTrackId);
          this._player.selectTrack(audioTrack);
        }
      }
    }
  }
}

export {ReceiverTracksManager};
