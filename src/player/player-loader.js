// @flow
import {core, setup} from 'kaltura-player-js';
import {CastEngine} from '../engine/cast-engine';
import {DefaultPlayerConfig} from './default-player-config';
import {ReceiverError} from '../error/error';
import {ErrorType} from '../error/error-type';

const {Utils, unRegisterEngine, registerEngine, EngineType} = core;

export const CAST_MEDIA_PLAYER_TAG: string = 'cast-media-player';
const PLAYER_CONTAINER: string = 'kaltura-receiver-player-container';

class PlayerLoader {
  static loadPlayer(config: Object): Object {
    const castMediaPlayerEl = Utils.Dom.getElementsByTagName(CAST_MEDIA_PLAYER_TAG)[0];
    if (castMediaPlayerEl) {
      const castMediaElement = castMediaPlayerEl.getMediaElement();
      castMediaElement.style.position = 'absolute';
      const playerContainerEl = Utils.Dom.createElement('div');
      playerContainerEl.id = PLAYER_CONTAINER;
      Utils.Dom.appendChild(document.body, playerContainerEl);
      unRegisterEngine(EngineType.HTML5);
      registerEngine(EngineType.CAST, CastEngine);
      const playerConfig = Utils.Object.mergeDeep(config, {targetId: PLAYER_CONTAINER}, DefaultPlayerConfig);
      const player = setup(playerConfig);
      Utils.Dom.prependTo(playerContainerEl, castMediaElement.parentNode);
      return player;
    } else {
      throw new ReceiverError(ErrorType.CAST_ELEMENT_NOT_FOUND);
    }
  }
}

export {PlayerLoader};
