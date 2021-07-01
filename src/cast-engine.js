// @flow
import {core} from 'kaltura-player-js';
import {CAST_MEDIA_PLAYER_TAG} from './player-loader';

const {Track, Utils, FakeEvent, MediaType, getLogger, FakeEventTarget, EventManager, EventType, AudioTrack, TextTrack, AbrMode, MimeType} = core;

class CastEngine extends FakeEventTarget {
  static get id(): string {
    return 'cast';
  }

  static canPlaySource(source: Object): boolean {
    const mimeType = source.mimetype.toLowerCase();
    const supported = CastEngine._supportedMimeTypes.includes(mimeType);
    if (supported) {
      if (source.drmData) {
        return MimeType.DASH.includes(mimeType);
      }
      return true;
    }
    return false;
  }

  static createEngine(source: Object, config: Object): Object {
    return new this(source, config);
  }

  static _logger: any = getLogger('CastEngine');

  static _supportedMimeTypes: Array<string> = [...MimeType.HLS, ...MimeType.DASH, ...MimeType.PROGRESSIVE, ...MimeType.SMOOTH_STREAMING];

  _el: HTMLVideoElement;
  _source: Object;
  _config: Object;
  _eventManager: EventManager;
  _isLoaded: boolean = false;
  _tracks: Array<Track> = [];
  _volume: number = 1;
  _muted: boolean = false;
  _paused: boolean = false;
  _seeking: boolean = false;
  _ended: boolean = false;
  _mediaElementEvents: Array<string> = [
    EventType.ABORT,
    EventType.CAN_PLAY,
    EventType.CAN_PLAY_THROUGH,
    EventType.DURATION_CHANGE,
    EventType.EMPTIED,
    EventType.ENDED,
    EventType.LOADED_DATA,
    EventType.LOADED_METADATA,
    EventType.LOAD_START,
    EventType.PAUSE,
    EventType.PLAY,
    EventType.PLAYING,
    EventType.PROGRESS,
    EventType.RATE_CHANGE,
    EventType.SEEKED,
    EventType.SEEKING,
    EventType.STALLED,
    EventType.TIME_UPDATE,
    EventType.SUSPEND,
    EventType.WAITING
  ];

  constructor(source: Object, config: Object) {
    super();
    this._context = cast.framework.CastReceiverContext.getInstance();
    this._playerManager = this._context.getPlayerManager();
    this._eventManager = new EventManager();
    this._createVideoElement();
    this._init(source, config);
  }

  restore(source: Object, config: Object): void {
    this.reset();
    this._init(source, config);
  }

  attach(): void {
    const videoElement = this.getVideoElement();
    this._eventManager.listen(videoElement, EventType.SEEKED, () => (this._seeking = false));
    this._eventManager.listen(videoElement, EventType.SEEKING, () => (this._seeking = true));
    this._eventManager.listen(videoElement, EventType.ENDED, () => {
      this._ended = true;
      // Receiver has a problem where the current time isn't equals to the duration when
      // playback is ended. This prevent from analytics plugins to report 100% reached.
      // So we're trigger time update event again on ended and take care to handle this state also in the
      // current time setter.
      if (!this.isLive()) {
        this.dispatchEvent(new FakeEvent(EventType.TIME_UPDATE));
      }
    });
    if (this.isLive()) {
      this._eventManager.listen(videoElement, EventType.TIME_UPDATE, () => this._playerManager.broadcastStatus(true));
    }
    this._mediaElementEvents.forEach(mediaElementEvent =>
      this._eventManager.listen(videoElement, mediaElementEvent, () => this.dispatchEvent(new FakeEvent(mediaElementEvent)))
    );
  }

  detach(): void {
    // Empty implementation
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
    this.dispatchEvent(new FakeEvent(EventType.ABR_MODE_CHANGED, {mode: AbrMode.AUTO}));
    CastEngine._logger.debug('Load end', this._tracks);
    return Promise.resolve({tracks: this._tracks});
  }

  play(): void {
    this._paused = false;
  }

  pause(): void {
    this._paused = true;
  }

  hideTextTrack(): void {
    // Empty implementation
  }

  selectTextTrack(textTrack: TextTrack): void {
    this.dispatchEvent(new FakeEvent(EventType.TEXT_TRACK_CHANGED, {selectedTextTrack: textTrack}));
  }

  selectAudioTrack(audioTrack: AudioTrack): void {
    this.dispatchEvent(new FakeEvent(EventType.AUDIO_TRACK_CHANGED, {selectedAudioTrack: audioTrack}));
  }

  selectVideoTrack(videoTrack: VideoTrack): void {
    this.dispatchEvent(new FakeEvent(EventType.VIDEO_TRACK_CHANGED, {selectedVideoTrack: videoTrack}));
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
    this._eventManager.removeAll();
    this._tracks = [];
    this._isLoaded = false;
    this._paused = false;
    this._seeking = false;
    this._ended = false;
  }

  destroy(): void {
    this._eventManager.destroy();
    this._tracks = [];
    this._isLoaded = false;
    this._mediaElementEvents = [];
    this._volume = 1;
    this._muted = false;
    this._paused = false;
    this._seeking = false;
    this._ended = false;
    if (this._el) {
      Utils.Dom.removeAttribute(this._el, 'src');
      Utils.Dom.removeChild(this._el.parentNode, this._el);
    }
  }

  set currentTime(value: number): void {
    // Empty implementation
  }

  get currentTime(): number {
    if (this._ended) {
      return this._playerManager.getDurationSec();
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
    this.dispatchEvent(EventType.VOLUME_CHANGE);
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

  get liveDuration(): number {
    const range = this._playerManager.getLiveSeekableRange();
    if (range) {
      return range.end;
    }
    return NaN;
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

  get crossOrigin(): ?string {
    // Empty implementation
    return null;
  }

  get ended(): boolean {
    return this._ended;
  }

  _createVideoElement(): void {
    const castMediaPlayerEl: Object = document.getElementsByTagName(CAST_MEDIA_PLAYER_TAG)[0];
    if (castMediaPlayerEl) {
      this._el = castMediaPlayerEl.getMediaElement();
    }
  }

  _init(source: Object, config: Object): void {
    this._source = source;
    this._config = config;
    this.attach();
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
