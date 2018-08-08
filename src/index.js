// @flow
import {ReceiverManagerAPI} from './receiver-manager-api';

declare var __VERSION__: string;
declare var __NAME__: string;

let instance;

/**
 * Factory instantiation method.
 * @param {Object} config - The receiver manager config.
 * @returns {ReceiverManagerAPI} - The receiver manager API.
 */
export default function(config: Object): ReceiverManagerAPI {
  if (!instance) {
    instance = new ReceiverManagerAPI(config);
  }
  return instance;
}

export {__VERSION__ as VERSION, __NAME__ as NAME};
