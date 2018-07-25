// @flow
import {core, setup} from 'kaltura-player-js';
import {CastEngine} from '../engine/cast-engine';
import {DefaultPlayerConfig} from './default-player-config';

const {Utils, unRegisterEngine, registerEngine, EngineType} = core;

const CAST_MEDIA_PLAYER_TAG: string = 'cast-media-player';
const KALTURA_PLAYER_CONTAINER: string = 'kaltura-player-container';

class PlayerLoader {
  static loadPlayer(config: Object): Object {
    const castMediaPlayerEl = document.getElementsByTagName(CAST_MEDIA_PLAYER_TAG)[0];
    if (castMediaPlayerEl && castMediaPlayerEl.parentNode) {
      const playerContainerEl = document.createElement('div');
      playerContainerEl.id = KALTURA_PLAYER_CONTAINER;
      playerContainerEl.style.display = 'none';
      castMediaPlayerEl.parentNode.insertBefore(playerContainerEl, castMediaPlayerEl);
      const playerConfig = Utils.Object.mergeDeep(config, {targetId: KALTURA_PLAYER_CONTAINER}, DefaultPlayerConfig);
      unRegisterEngine(EngineType.HTML5);
      registerEngine(EngineType.CAST, CastEngine);
      return setup(playerConfig);
    }
  }
}

export {PlayerLoader};
