// @flow
import {cast as remote, core} from 'kaltura-player-js';
import {CUSTOM_CHANNEL} from './receiver-manager';

const {EventType, Ad, AdBreak, AdBreakType, getLogger, FakeEvent} = core;
const {CustomEventMessage} = remote;

class ReceiverAdsManager {
  _logger: any = getLogger('ReceiverAdsManager');
  _context: Object;
  _playerManager: Object;
  _player: Object;
  _adProgressIntervalId: ?IntervalID;
  _ad: ?Ad;
  _adBreak: ?AdBreak;
  _adIsPlaying: boolean;
  _adCanSkipTriggered: boolean = false;
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
    this._attachListeners();
  }

  skipAd(): void {
    this._logger.debug('Skip ad');
    const requestData = new cast.framework.messages.RequestData(cast.framework.messages.MessageType.SKIP_AD);
    this._playerManager.sendLocalMediaRequest(requestData);
  }

  adBreak(): boolean {
    return !!this._adBreak;
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

  _onPlayerLoadComplete = () => {
    const positions = [];
    const breakManager = this._playerManager.getBreakManager();
    if (breakManager) {
      const breaks = breakManager.getBreaks();
      if (breaks && breaks.length > 0) {
        breaks.forEach(b => positions.push(b.position));
        this._sendEventAndCustomMessage(this._player.Event.AD_MANIFEST_LOADED, {adBreaksPosition: positions});
      }
    }
  };

  _onBreakStarted = (breaksEvent: Object) => {
    this._toggleAdBreakListeners(true);
    const adBreakOptions = this._getAdBreakOptions(breaksEvent);
    const adBreak = new AdBreak(adBreakOptions);
    this._sendEventAndCustomMessage(this._player.Event.AD_BREAK_START, {adBreak: adBreak});
    this._adBreak = adBreak;
  };

  _onBreakEnded = (breaksEvent: Object) => {
    this._toggleAdBreakListeners(false);
    this._sendEventAndCustomMessage(this._player.Event.AD_BREAK_END);
    this._adBreak = null;
    const breaks = this._playerManager.getBreakManager().getBreaks();
    const index = breaks.findIndex(b => b.id === breaksEvent.breakId);
    if (index + 1 === breaks.length) {
      this._sendEventAndCustomMessage(this._player.Event.ALL_ADS_COMPLETED);
    }
  };

  _onBreakClipLoading = (breaksEvent: Object) => {
    const adOptions = this._getAdOptions(breaksEvent);
    const ad = new Ad(breaksEvent.breakClipId, adOptions);
    this._sendEventAndCustomMessage(this._player.Event.AD_LOADED, {ad: ad});
    this._ad = ad;
  };

  _onBreakClipStarted = (breaksEvent: Object) => {
    const adOptions = this._getAdOptions(breaksEvent);
    const ad = new Ad(breaksEvent.breakClipId, adOptions);
    this._sendEventAndCustomMessage(this._player.Event.AD_STARTED, {ad});
    this._adIsPlaying = true;
  };

  _onBreakClipEnded = () => {
    this._sendEventAndCustomMessage(this._player.Event.AD_COMPLETED);
    this._adIsPlaying = false;
    this._adCanSkipTriggered = false;
    this._ad = null;
  };

  _onAdPaused = () => {
    this._sendEventAndCustomMessage(this._player.Event.AD_PAUSED);
    this._adIsPlaying = false;
  };

  _onAdResumed = () => {
    this._sendEventAndCustomMessage(this._player.Event.AD_RESUMED);
    this._adIsPlaying = true;
  };

  _onAdProgress = () => {
    if (!this._ad) return;
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
    if (this._ad && !this._adCanSkipTriggered && this._ad.skippable) {
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
  };

  _onMuteChange = () => {
    if (this._player.muted) {
      this._sendEventAndCustomMessage(this._player.Event.AD_MUTED);
    }
  };

  _onVolumeChange = () => {
    this._sendEventAndCustomMessage(this._player.Event.AD_VOLUME_CHANGED);
  };

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

  _getAdBreakOptions(breaksEvent: Object): Object {
    const options = {};
    const currentBreak = this._playerManager.getBreakManager().getBreakById(breaksEvent.breakId);
    if (currentBreak) {
      options.position = currentBreak.position;
      options.type = this._getAdBreakTypeByPosition(currentBreak.position);
      options.numAds = currentBreak.breakClipIds.length;
    }
    return options;
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

  _getAdOptions(breaksEvent: Object): Object {
    const options = {};
    const currentBreak = this._playerManager.getBreakManager().getBreakById(breaksEvent.breakId);
    if (currentBreak) {
      const currentBreakClip = this._playerManager.getBreakManager().getBreakClipById(breaksEvent.breakClipId);
      options.url = currentBreakClip.contentId;
      options.contentType = currentBreakClip.contentType;
      options.title = currentBreakClip.title;
      options.position = currentBreak.breakClipIds.indexOf(currentBreakClip.id) + 1;
      options.duration = currentBreakClip.duration;
      options.clickThroughUrl = currentBreakClip.clickThroughUrl;
      options.posterUrl = currentBreakClip.posterUrl;
      options.skipOffset = currentBreakClip.whenSkippable;
      options.linear = true;
    }
    return options;
  }

  _sendEventAndCustomMessage(event: string, payload: any): void {
    this._logger.debug(event.toUpperCase(), payload);
    this._player.dispatchEvent(new FakeEvent(event, payload));
    this._context.sendCustomMessage(CUSTOM_CHANNEL, undefined, new CustomEventMessage(event, payload));
  }
}

export {ReceiverAdsManager};
