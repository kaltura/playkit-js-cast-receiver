// @flow
import {core} from 'kaltura-player-js';

const {Track, Utils, FakeEvent, MediaType, EventManager, getLogger, FakeEventTarget, EventType, AudioTrack, TextTrack} = core;

class CastEngine extends FakeEventTarget {
  static get id(): string {
    return 'cast';
  }

  // eslint-disable-next-line no-unused-vars
  static canPlaySource(source: Object, preferNative: boolean): boolean {
    return CastEngine._supportedMimeTypes.includes(source.mimetype);
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
  _eventManager: EventManager;
  _volume: number = 1;
  _muted: boolean = false;
  _paused: boolean = false;
  _seeking: boolean = false;
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
    this._eventManager = new EventManager();
    this._createVideoElement();
    this.attach();
  }

  // eslint-disable-next-line no-unused-vars
  restore(source: Object, config: Object): void {
    // TODO
  }

  attach(): void {
    this._mediaElementEvents.forEach(mediaElementEvent => {
      this._playerManager.addEventListener(mediaElementEvent, () => {
        this.dispatchEvent(new FakeEvent(EventType[mediaElementEvent]));
      });
    });
    this._playerManager.addEventListener(cast.framework.events.EventType.SEEKED, () => {
      this._seeking = false;
    });
    this._playerManager.addEventListener(cast.framework.events.EventType.SEEKING, () => {
      this._seeking = true;
    });
    this._playerManager.addEventListener(cast.framework.events.EventType.PLAY, () => {
      this._paused = true;
    });
    this._playerManager.addEventListener(cast.framework.events.EventType.PAUSE, () => {
      this._paused = false;
    });
  }

  detach(): void {}

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
    // TODO
  }

  getStartTimeOfDvrWindow(): number {
    // TODO
  }

  reset(): void {
    // TODO
  }

  destroy(): void {
    // TODO
  }

  set currentTime(value: number): void {
    // Empty implementation
  }

  get currentTime(): number {
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

  get defaultPlaybackRate(): Array<number> {
    return 1;
  }

  set crossOrigin(crossOrigin: ?string): void {
    // Empty implementation
  }

  get crossOrigin(): ?string {}

  _createVideoElement(): void {
    this._el = document.createElement('video');
    this._el.className = 'mediaElement';
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
}

export {CastEngine};
