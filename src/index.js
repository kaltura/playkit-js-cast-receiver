// @flow
import {ReceiverAPI} from './receiver-api';

declare var __VERSION__: string;
declare var __NAME__: string;

let instance;

/**
 * Gets the receiver api singleton.
 * @param {Object} config - The receiver manager config.
 * @returns {ReceiverManager} - Receiver API.
 */
function getReceiverManager(config: Object): ReceiverAPI {
  if (!instance) {
    instance = new ReceiverAPI(config);
  }
  return instance;
}

export {getReceiverManager};
export {__VERSION__ as VERSION, __NAME__ as NAME};
