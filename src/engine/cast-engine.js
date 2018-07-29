// @flow
import {core} from 'kaltura-player-js';
import {CAST_MEDIA_PLAYER_TAG} from '../player/player-loader';

const {Track, Utils, FakeEvent, MediaType, getLogger, FakeEventTarget, EventType, AudioTrack, TextTrack} = core;

class CastEngine extends FakeEventTarget {
  static get id(): string {
    return 'cast';
  }

  // eslint-disable-next-line no-unused-vars
  static canPlaySource(source: Object, preferNative: boolean): boolean {
    try {
      return CastEngine._supportedMimeTypes.includes(source.mimetype.toLowerCase());
    } catch (e) {
      return false;
    }
  }

  static createEngine(source: Object, config: Object): Object {
    return new this(source, config);
  }

  static _logger: any = getLogger('CastEngine');

  static _supportedMimeTypes: Array<string> = [
    'application/x-mpegurl',
    'application/vnd.apple.mpegurl',
    'application/dash+xml',
    'application/vnd.ms-sstr+xml'
  ];

  _el: HTMLVideoElement;
  _source: Object;
  _config: Object;
  _isLoaded: boolean = false;
  _tracks: Array<Track> = [];
  _volume: number = 1;
  _muted: boolean = false;
  _paused: boolean = false;
  _seeking: boolean = false;
  _onSeekedEvent: Function;
  _onSeekingEvent: Function;
  _onPlayEvent: Function;
  _onPauseEvent: Function;
  _onMediaElementEvent: Function;
  _mediaElementEvents: Array<string> = [
    cast.framework.events.EventType.ABORT,
    cast.framework.events.EventType.CAN_PLAY,
    cast.framework.events.EventType.CAN_PLAY_THROUGH,
    cast.framework.events.EventType.DURATION_CHANGE,
    cast.framework.events.EventType.EMPTIED,
    cast.framework.events.EventType.ENDED,
    cast.framework.events.EventType.LOADED_DATA,
    cast.framework.events.EventType.LOADED_METADATA,
    cast.framework.events.EventType.LOAD_START,
    cast.framework.events.EventType.PAUSE,
    cast.framework.events.EventType.PLAY,
    cast.framework.events.EventType.PLAYING,
    cast.framework.events.EventType.PROGRESS,
    cast.framework.events.EventType.RATE_CHANGE,
    cast.framework.events.EventType.SEEKED,
    cast.framework.events.EventType.SEEKING,
    cast.framework.events.EventType.STALLED,
    cast.framework.events.EventType.TIME_UPDATE,
    cast.framework.events.EventType.SUSPEND,
    cast.framework.events.EventType.WAITING
  ];

  constructor(source: Object, config: Object) {
    super();
    this._source = source;
    this._config = config;
    this._context = cast.framework.CastReceiverContext.getInstance();
    this._playerManager = this._context.getPlayerManager();
    this._bindEvents();
    this._createVideoElement();
    this.attach();
  }

  restore(source: Object, config: Object): void {
    this.reset();
    this._source = source;
    this._config = config;
  }

  attach(): void {
    this._mediaElementEvents.forEach(mediaElementEvent => this._playerManager.addEventListener(mediaElementEvent, this._onMediaElementEvent));
    this._playerManager.addEventListener(cast.framework.events.EventType.SEEKED, this._onSeekedEvent);
    this._playerManager.addEventListener(cast.framework.events.EventType.SEEKING, this._onSeekingEvent);
    this._playerManager.addEventListener(cast.framework.events.EventType.PLAY, this._onPlayEvent);
    this._playerManager.addEventListener(cast.framework.events.EventType.PAUSE, this._onPauseEvent);
  }

  detach(): void {
    this._mediaElementEvents.forEach(mediaElementEvent => this._playerManager.removeEventListener(mediaElementEvent, this._onMediaElementEvent));
    this._playerManager.removeEventListener(cast.framework.events.EventType.SEEKED, this._onSeekedEvent);
    this._playerManager.removeEventListener(cast.framework.events.EventType.SEEKING, this._onSeekingEvent);
    this._playerManager.removeEventListener(cast.framework.events.EventType.PLAY, this._onPlayEvent);
    this._playerManager.removeEventListener(cast.framework.events.EventType.PAUSE, this._onPauseEvent);
  }

  static runCapabilities(): void {
    // Empty implementation
  }

  static prepareVideoElement(): void {
    // Empty implementation
  }

  static getCapabilities(): Promise<Object> {
    return Promise.resolve({
      [CastEngine.id]: {
        autoplay: true,
        mutedAutoPlay: true
      }
    });
  }

  get id(): string {
    return CastEngine.id;
  }

  getVideoElement(): HTMLVideoElement {
    return this._el;
  }

  load(startTime: ?number): Promise<Object> {
    CastEngine._logger.debug('Load start', startTime);
    this._isLoaded = true;
    this._parseTracks();
    this.dispatchEvent(new FakeEvent(EventType.ABR_MODE_CHANGED, {mode: 'auto'}));
    CastEngine._logger.debug('Load end', this._tracks);
    return Promise.resolve({tracks: this._tracks});
  }

  play(): void {}

  pause(): void {}

  hideTextTrack(): void {}

  selectTextTrack(textTrack: TextTrack): void {
    this.dispatchEvent(new FakeEvent(EventType.TEXT_TRACK_CHANGED, {selectedTextTrack: textTrack}));
  }

  selectAudioTrack(audioTrack: AudioTrack): void {
    this.dispatchEvent(new FakeEvent(EventType.AUDIO_TRACK_CHANGED, {selectedAudioTrack: audioTrack}));
  }

  // eslint-disable-next-line no-unused-vars
  selectVideotTrack(videoTrack: VideoTrack): void {
    // Empty implementation
  }

  enableAdaptiveBitrate(): void {
    // Empty implementation
  }

  isAdaptiveBitrateEnabled(): boolean {
    return true;
  }

  getSelectedSource(): Object {
    return Utils.Object.copyDeep(this._source);
  }

  isLive() {
    return this._config.sources.type === MediaType.LIVE;
  }

  seekToLiveEdge(): void {
    const range = this._playerManager.getLiveSeekableRange();
    if (range) {
      this._playerManager.seek(range.end);
    }
  }

  getStartTimeOfDvrWindow(): number {
    const range = this._playerManager.getLiveSeekableRange();
    if (range) {
      return range.start;
    }
    return 0;
  }

  reset(): void {
    this._tracks = [];
    this._isLoaded = false;
    this._paused = false;
    this._seeking = false;
  }

  destroy(): void {
    this._tracks = [];
    this._isLoaded = false;
    this._mediaElementEvents = [];
    this._volume = 1;
    this._muted = false;
    this._paused = false;
    this._seeking = false;
    this.detach();
    if (this._el) {
      Utils.Dom.removeAttribute(this._el, 'src');
      Utils.Dom.removeChild(this._el.parentNode, this._el);
    }
  }

  set currentTime(value: number): void {
    // Empty implementation
  }

  get currentTime(): number {
    if (this.isLive()) {
      return this._playerManager.getCurrentTimeSec() - this.getStartTimeOfDvrWindow();
    }
    return this._playerManager.getCurrentTimeSec();
  }

  set muted(value: boolean): void {
    this._muted = value;
  }

  get muted(): boolean {
    return this._muted;
  }

  set volume(value: number): void {
    this._volume = value;
  }

  get volume(): number {
    return this._volume;
  }

  get paused(): boolean {
    return this._paused;
  }

  get seeking(): boolean {
    return this._seeking;
  }

  get buffered(): Array<any> {
    return [];
  }

  get duration(): number {
    if (this.isLive()) {
      const range = this._playerManager.getLiveSeekableRange();
      if (range) {
        return range.end - this.getStartTimeOfDvrWindow();
      }
    }
    return this._playerManager.getDurationSec();
  }

  get src(): string {
    return this._isLoaded ? this._source.url : '';
  }

  set playsinline(playsinline: boolean): void {
    // Empty implementation
  }

  get playsinline(): boolean {
    return true;
  }

  set playbackRate(playbackRate: number): void {
    // Empty implementation
  }

  get playbackRate(): number {
    return this._playerManager.getPlaybackRate();
  }

  get playbackRates(): Array<number> {
    return [1];
  }

  get defaultPlaybackRate(): number {
    return 1;
  }

  set crossOrigin(crossOrigin: ?string): void {
    // Empty implementation
  }

  get crossOrigin(): ?string {}

  _createVideoElement(): void {
    const castMediaPlayerEl: Object = document.getElementsByTagName(CAST_MEDIA_PLAYER_TAG)[0];
    if (castMediaPlayerEl) {
      this._el = castMediaPlayerEl.getMediaElement();
    }
  }

  _parseTracks(): void {
    const audioTracksManager = this._playerManager.getAudioTracksManager();
    const castAudioTracks = audioTracksManager.getTracks();
    const audioTracks = this._parseAudioTracks(castAudioTracks);

    const textTracksManager = this._playerManager.getTextTracksManager();
    const castTextTracks = textTracksManager.getTracks();
    const textTracks = this._parseTextTracks(castTextTracks);

    this._tracks = audioTracks.concat(textTracks);
  }

  _parseTextTracks(castTextTracks: Array<Object>): Array<TextTrack> {
    const textTracks = [];
    castTextTracks.forEach(track => {
      const settings: Object = {
        id: track.trackId,
        index: track.trackId - 1,
        label: track.name,
        language: track.language,
        kind: track.subType || 'subtitles',
        active: false
      };
      textTracks.push(new TextTrack(settings));
    });
    return textTracks;
  }

  _parseAudioTracks(castAudioTracks: Array<Object>): Array<AudioTrack> {
    const audioTracks = [];
    castAudioTracks.forEach(track => {
      const settings: Object = {
        id: track.trackId,
        index: track.trackId - 1,
        label: track.name,
        language: track.language,
        active: false
      };
      audioTracks.push(new AudioTrack(settings));
    });
    return audioTracks;
  }

  _bindEvents(): void {
    this._onMediaElementEvent = this._onMediaElementEvent.bind(this);
    this._onSeekingEvent = this._onSeekingEvent.bind(this);
    this._onSeekedEvent = this._onSeekedEvent.bind(this);
    this._onPlayEvent = this._onPlayEvent.bind(this);
    this._onPauseEvent = this._onPauseEvent.bind(this);
  }

  _onSeekingEvent(): void {
    this._seeking = true;
  }

  _onSeekedEvent(): void {
    this._seeking = false;
  }

  _onPlayEvent(): void {
    this._paused = false;
  }

  _onPauseEvent(): void {
    this._paused = true;
  }

  _onMediaElementEvent(mediaElementEvent: string): void {
    this.dispatchEvent(new FakeEvent(EventType[mediaElementEvent]));
  }
}

export {CastEngine};
