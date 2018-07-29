// @flow
import {core} from 'kaltura-player-js';

const {StreamType, EngineType} = core;

const DefaultPlayerConfig: Object = {
  playback: {
    autoplay: false,
    preload: 'none',
    disableUserCache: true,
    streamPriority: [
      {
        engine: EngineType.CAST,
        format: StreamType.HLS
      },
      {
        engine: EngineType.CAST,
        format: StreamType.DASH
      },
      {
        engine: EngineType.CAST,
        format: StreamType.PROGRESSIVE
      }
    ]
  },
  ui: {
    disable: true
  }
};

export {DefaultPlayerConfig};
