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
  }

  setInitialTracks(): void {
    const mediaInfo = this._playerManager.getMediaInformation();
    if (mediaInfo.customData) {
      this._setInitialAudioTrack(mediaInfo.customData.audioLanguage);
      this._setInitialTextTrack(mediaInfo.customData.textLanguage);
    }
  }

  handleTextTrackSelection(activeTrackIds: Array<number>): void {
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

  handleAudioTrackSelection(activeTrackIds: Array<number>): void {
    const audioTracks = this._player.getTracks(TrackType.AUDIO);
    const activeAudioTrack = audioTracks.find(t => t.active);
    const nextActiveAudioTrack = audioTracks.find(t => activeTrackIds.includes(t.id));
    if (activeAudioTrack.id !== nextActiveAudioTrack.id) {
      this._player.selectTrack(nextActiveAudioTrack);
    }
  }

  handleTextStyleSelection(textStyle: Object): void {
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
}

export {ReceiverTracksManager};
