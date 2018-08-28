// @flow
import {core} from 'kaltura-player-js';

const {EventType} = core;

class ReceiverAdsManager {
  _playerManager: Object;
  _player: Object;
  _ad: Object;
  _adType: ?string;
  _adBreak: boolean;
  _adPlaying: boolean;
  _adLifecycleEventHandlers: {[event: string]: Function} = {
    [cast.framework.events.EventType.BREAK_STARTED]: this._onBreakStarted,
    [cast.framework.events.EventType.BREAK_ENDED]: this._onBreakEnded,
    [cast.framework.events.EventType.BREAK_CLIP_LOADING]: this._onBreakClipLoading,
    [cast.framework.events.EventType.BREAK_CLIP_STARTED]: this._onBreakClipStarted,
    [cast.framework.events.EventType.BREAK_CLIP_ENDED]: this._onBreakClipEnded,
    [cast.framework.events.EventType.BREAK_CLIP_ENDED]: this._onBreakClipEnded
  };
  _adTrackingEventHandlers: {[event: string]: Function} = {
    [cast.framework.events.EventType.PAUSE]: this._onAdPaused,
    [cast.framework.events.EventType.PLAY]: this._onAdResumed,
    [cast.framework.events.EventType.TIME_UPDATE]: this._onAdProgress
  };
  _playerEventHandlers: {[event: string]: Function} = {
    [EventType.MUTE_CHANGE]: this._onMuteChange,
    [EventType.VOLUME_CHANGE]: this._onVolumeChange
  };
  _timePercentEvent: {[time: string]: boolean} = {
    AD_REACHED_25_PERCENT: false,
    AD_REACHED_50_PERCENT: false,
    AD_REACHED_75_PERCENT: false
  };

  constructor(player: Object) {
    this._playerManager = cast.framework.CastReceiverContext.getInstance().getPlayerManager();
    this._player = player;
    Object.keys(this._adLifecycleEventHandlers).forEach(event =>
      this._playerManager.addEventListener(event, this._adLifecycleEventHandlers[event].bind(this))
    );
  }

  _onBreakStarted(breaksEvent: Object): void {
    Object.keys(this._adTrackingEventHandlers).forEach(event =>
      this._playerManager.addEventListener(event, this._adTrackingEventHandlers[event].bind(this))
    );
    Object.keys(this._playerEventHandlers).forEach(event => this._player.addEventListener(event, this._playerEventHandlers[event].bind(this)));
    this._player.dispatchEvent(this._player.Event.AD_BREAK_START);
    this._adBreak = true;
    this._setAdType(breaksEvent);
  }

  _onBreakEnded(): void {
    Object.keys(this._adTrackingEventHandlers).forEach(event =>
      this._playerManager.removeEventListener(event, this._adTrackingEventHandlers[event].bind(this))
    );
    Object.keys(this._playerEventHandlers).forEach(event => this._player.removeEventListener(event, this._playerEventHandlers[event].bind(this)));
    this._player.dispatchEvent(this._player.Event.AD_BREAK_END);
    this._adBreak = false;
    this._adType = null;
  }

  _onBreakClipLoading(): void {
    this._player.dispatchEvent(this._player.Event.AD_LOADED, {
      // TODO: ad loaded payload
    });
  }

  _onBreakClipStarted(): void {
    this._player.dispatchEvent(this._player.Event.AD_STARTED);
    this._adPlaying = true;
  }

  _onBreakClipEnded(): void {
    this._player.dispatchEvent(this._player.Event.AD_COMPLETED);
    this._adPlaying = false;
  }

  _onAdPaused(): void {
    this._player.dispatchEvent(this._player.Event.AD_PAUSED);
    this._adPlaying = false;
  }

  _onAdResumed(): void {
    this._player.dispatchEvent(this._player.Event.AD_RESUMED);
    this._adPlaying = true;
  }

  _onAdProgress(): void {
    const adDuration = this._playerManager.getBreakClipDurationSec();
    const adCurrentTime = this._playerManager.getBreakClipCurrentTimeSec();
    const percent = adCurrentTime / adDuration;
    if (!this._timePercentEvent.AD_REACHED_25_PERCENT && percent >= 0.25) {
      this._timePercentEvent.AD_REACHED_25_PERCENT = true;
      this._player.dispatchEvent(this._player.Event.AD_FIRST_QUARTILE);
    }
    if (!this._timePercentEvent.AD_REACHED_50_PERCENT && percent >= 0.5) {
      this._timePercentEvent.AD_REACHED_50_PERCENT = true;
      this._player.dispatchEvent(this._player.Event.AD_MIDPOINT);
    }
    if (!this._timePercentEvent.AD_REACHED_75_PERCENT && percent >= 0.75) {
      this._timePercentEvent.AD_REACHED_75_PERCENT = true;
      this._player.dispatchEvent(this._player.Event.AD_THIRD_QUARTILE);
    }
    this._player.dispatchEvent(this._player.Event.AD_PROGRESS, {
      adProgress: {
        currentTime: adCurrentTime,
        duration: adDuration
      }
    });
  }

  _onMuteChange(): void {
    if (this._player.muted) {
      this._player.dispatchEvent(this._player.Event.AD_MUTED);
    }
  }

  _onVolumeChange(): void {
    this._player.dispatchEvent(this._player.Event.AD_VOLUME_CHANGED);
  }

  _setAdType(breaksEvent: Object): void {
    const adBreak = this._playerManager.getBreaks().find(b => b.id === breaksEvent.breakId);
    if (adBreak) {
      switch (adBreak.position) {
        case 0:
          this._adType = 'preroll';
          break;
        case -1:
          this._adType = 'postroll';
          break;
        default:
          this._adType = 'midroll';
          break;
      }
    }
  }
}

export {ReceiverAdsManager};
