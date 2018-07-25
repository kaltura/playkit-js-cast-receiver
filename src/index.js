// @flow
import {ReceiverManager} from './receiver-manager';

declare var __VERSION__: string;
declare var __NAME__: string;

let instance;

/**
 * Gets the receiver manager singleton.
 * @param {Object} config - The receiver manager config.
 * @returns {ReceiverManager} - Receiver manager.
 */
function getReceiverManager(config: Object): ReceiverManager {
  if (!instance) {
    instance = new ReceiverManager(config);
  }
  return instance;
}

export {getReceiverManager};
export {__VERSION__ as VERSION, __NAME__ as NAME};
