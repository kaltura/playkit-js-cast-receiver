// @flow
import {cast as remote, core} from 'kaltura-player-js';
import {CUSTOM_CHANNEL} from './receiver-manager';

const {EventType, Ad, AdBreak, AdBreakType} = core;
const {CustomEventMessage} = remote;

class ReceiverAdsManager {
  _context: Object;
  _playerManager: Object;
  _player: Object;
  _adProgressIntervalId: ?number;
  _ad: ?Ad;
  _adBreak: ?AdBreak;
  _adIsPlaying: boolean;
  _adCanSkipTriggered: false;
  _adLifecycleEventHandlers: {[event: string]: Function};
  _adTrackingEventHandlers: {[event: string]: Function};
  _playerEventHandlers: {[event: string]: Function};
  _timePercentEvent: {[time: string]: boolean} = {
    AD_REACHED_25_PERCENT: false,
    AD_REACHED_50_PERCENT: false,
    AD_REACHED_75_PERCENT: false
  };

  constructor(player: Object) {
    this._context = cast.framework.CastReceiverContext.getInstance();
    this._playerManager = this._context.getPlayerManager();
    this._player = player;
    this._bindMethods();
    this._attachListeners();
  }

  skipAd(): void {
    const requestData = new cast.framework.messages.RequestData(cast.framework.messages.MessageType.SKIP_AD);
    this._playerManager.sendLocalMediaRequest(requestData);
  }

  _bindMethods(): void {
    this._onPlayerLoadComplete = this._onPlayerLoadComplete.bind(this);
    this._onBreakStarted = this._onBreakStarted.bind(this);
    this._onBreakEnded = this._onBreakEnded.bind(this);
    this._onBreakClipLoading = this._onBreakClipLoading.bind(this);
    this._onBreakClipStarted = this._onBreakClipStarted.bind(this);
    this._onBreakClipEnded = this._onBreakClipEnded.bind(this);
    this._onAdPaused = this._onAdPaused.bind(this);
    this._onAdResumed = this._onAdResumed.bind(this);
    this._onAdProgress = this._onAdProgress.bind(this);
    this._onMuteChange = this._onMuteChange.bind(this);
    this._onVolumeChange = this._onVolumeChange.bind(this);
  }

  _attachListeners(): void {
    this._adLifecycleEventHandlers = {
      [cast.framework.events.EventType.PLAYER_LOAD_COMPLETE]: this._onPlayerLoadComplete,
      [cast.framework.events.EventType.BREAK_STARTED]: this._onBreakStarted,
      [cast.framework.events.EventType.BREAK_ENDED]: this._onBreakEnded,
      [cast.framework.events.EventType.BREAK_CLIP_LOADING]: this._onBreakClipLoading,
      [cast.framework.events.EventType.BREAK_CLIP_STARTED]: this._onBreakClipStarted,
      [cast.framework.events.EventType.BREAK_CLIP_ENDED]: this._onBreakClipEnded
    };
    this._adTrackingEventHandlers = {
      [cast.framework.events.EventType.PAUSE]: this._onAdPaused,
      [cast.framework.events.EventType.PLAY]: this._onAdResumed
    };
    this._playerEventHandlers = {
      [EventType.MUTE_CHANGE]: this._onMuteChange,
      [EventType.VOLUME_CHANGE]: this._onVolumeChange
    };
    Object.keys(this._adLifecycleEventHandlers).forEach(event => this._playerManager.addEventListener(event, this._adLifecycleEventHandlers[event]));
  }

  _onPlayerLoadComplete(): void {
    const positions = [];
    const breakManager = this._playerManager.getBreakManager();
    if (breakManager) {
      const breaks = breakManager.getBreaks();
      if (breaks && breaks.length > 0) {
        breaks.forEach(b => positions.push(b.position));
        this._sendEventAndCustomMessage(this._player.Event.AD_MANIFEST_LOADED, {adBreaksPosition: positions});
      }
    }
  }

  _onBreakStarted(breaksEvent: Object): void {
    this._toggleAdBreakListeners(true);
    const adBreak = new AdBreak();
    this._setAdBreakData(adBreak, breaksEvent);
    this._sendEventAndCustomMessage(this._player.Event.AD_BREAK_START, {adBreak: adBreak});
    this._adBreak = adBreak;
  }

  _onBreakEnded(): void {
    this._toggleAdBreakListeners(false);
    this._sendEventAndCustomMessage(this._player.Event.AD_BREAK_END);
    this._adBreak = null;
  }

  _onBreakClipLoading(breaksEvent: Object): void {
    const ad = new Ad(breaksEvent.breakClipId);
    this._setAdData(ad, breaksEvent);
    this._sendEventAndCustomMessage(this._player.Event.AD_LOADED, {ad: ad});
    this._ad = ad;
  }

  _onBreakClipStarted(): void {
    this._sendEventAndCustomMessage(this._player.Event.AD_STARTED);
    this._adIsPlaying = true;
  }

  _onBreakClipEnded(): void {
    this._sendEventAndCustomMessage(this._player.Event.AD_COMPLETED);
    this._adIsPlaying = false;
    this._adCanSkipTriggered = false;
    this._ad = null;
  }

  _onAdPaused(): void {
    this._sendEventAndCustomMessage(this._player.Event.AD_PAUSED);
    this._adIsPlaying = false;
  }

  _onAdResumed(): void {
    this._sendEventAndCustomMessage(this._player.Event.AD_RESUMED);
    this._adIsPlaying = true;
  }

  _onAdProgress(): void {
    if (this._ad) {
      const adDuration = this._playerManager.getBreakClipDurationSec();
      const adCurrentTime = this._playerManager.getBreakClipCurrentTimeSec();
      const percent = adCurrentTime / adDuration;
      if (!this._timePercentEvent.AD_REACHED_25_PERCENT && percent >= 0.25) {
        this._timePercentEvent.AD_REACHED_25_PERCENT = true;
        this._sendEventAndCustomMessage(this._player.Event.AD_FIRST_QUARTILE);
      }
      if (!this._timePercentEvent.AD_REACHED_50_PERCENT && percent >= 0.5) {
        this._timePercentEvent.AD_REACHED_50_PERCENT = true;
        this._sendEventAndCustomMessage(this._player.Event.AD_MIDPOINT);
      }
      if (!this._timePercentEvent.AD_REACHED_75_PERCENT && percent >= 0.75) {
        this._timePercentEvent.AD_REACHED_75_PERCENT = true;
        this._sendEventAndCustomMessage(this._player.Event.AD_THIRD_QUARTILE);
      }
      if (!this._adCanSkipTriggered && this._ad.skippable) {
        if (adCurrentTime >= this._ad.skipOffset) {
          this._sendEventAndCustomMessage(this._player.Event.AD_CAN_SKIP);
          this._adCanSkipTriggered = true;
        }
      }
      this._sendEventAndCustomMessage(this._player.Event.AD_PROGRESS, {
        adProgress: {
          currentTime: adCurrentTime,
          duration: adDuration
        }
      });
    }
  }

  _onMuteChange(): void {
    if (this._player.muted) {
      this._sendEventAndCustomMessage(this._player.Event.AD_MUTED);
    }
  }

  _onVolumeChange(): void {
    this._sendEventAndCustomMessage(this._player.Event.AD_VOLUME_CHANGED);
  }

  _toggleAdBreakListeners(toggle: boolean): void {
    if (toggle) {
      Object.keys(this._adTrackingEventHandlers).forEach(event => this._playerManager.addEventListener(event, this._adTrackingEventHandlers[event]));
      Object.keys(this._playerEventHandlers).forEach(event => this._player.addEventListener(event, this._playerEventHandlers[event]));
      this._adProgressIntervalId = setInterval(this._onAdProgress, 300);
    } else {
      Object.keys(this._adTrackingEventHandlers).forEach(event =>
        this._playerManager.removeEventListener(event, this._adTrackingEventHandlers[event])
      );
      Object.keys(this._playerEventHandlers).forEach(event => this._player.removeEventListener(event, this._playerEventHandlers[event]));
      clearInterval(this._adProgressIntervalId);
      this._adProgressIntervalId = null;
    }
  }

  _setAdBreakData(adBreak: AdBreak, breaksEvent: Object): void {
    const currentBreak = this._playerManager.getBreakManager().getBreakById(breaksEvent.breakId);
    if (currentBreak) {
      adBreak.position = currentBreak.position;
      adBreak.type = this._getAdBreakTypeByPosition(currentBreak.position);
      adBreak.numAds = currentBreak.breakClipIds.length;
    }
  }

  _getAdBreakTypeByPosition(position: number): void {
    switch (position) {
      case 0:
        return AdBreakType.PRE;
      case -1:
        return AdBreakType.POST;
      default:
        return AdBreakType.MID;
    }
  }

  _setAdData(ad: Ad, breaksEvent: Object): void {
    const currentBreak = this._playerManager.getBreakManager().getBreakById(breaksEvent.breakId);
    const currentBreakClip = this._playerManager.getBreakManager().getBreakClipById(breaksEvent.breakClipId);
    ad.url = currentBreakClip.contentId;
    ad.contentType = currentBreakClip.contentType;
    ad.title = currentBreakClip.title;
    ad.position = currentBreak.breakClipIds.indexOf(currentBreakClip.id) + 1;
    ad.duration = currentBreakClip.duration;
    ad.clickThroughUrl = currentBreakClip.clickThroughUrl;
    ad.posterUrl = currentBreakClip.posterUrl;
    ad.skipOffset = currentBreakClip.whenSkippable;
    ad.linear = true;
  }

  _sendEventAndCustomMessage(event: string, payload: any): void {
    this._player.dispatchEvent(event, payload);
    this._context.sendCustomMessage(CUSTOM_CHANNEL, undefined, new CustomEventMessage(event, payload));
  }
}

export {ReceiverAdsManager};
