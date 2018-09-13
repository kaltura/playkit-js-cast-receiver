// @flow
import {ReceiverManager} from './receiver-manager';

let receiverManager;

class ReceiverManagerAPI {
  constructor(config: Object) {
    receiverManager = new ReceiverManager(config);
  }

  start(options?: Object = {}): void {
    receiverManager.start(options);
  }

  onLoad(loadRequestData: Object): Promise<Object> {
    return receiverManager.onLoad(loadRequestData);
  }

  onStop(requestData: Object): Promise<Object> {
    return receiverManager.onStop(requestData);
  }

  onMediaStatus(mediaStatus: Object): Promise<Object> {
    return receiverManager.onMediaStatus(mediaStatus);
  }

  addEventListener(type: string, listener: Function): void {
    receiverManager.getPlayer().addEventListener(type, listener);
  }

  removeEventListener(type: string, listener: Function): void {
    receiverManager.getPlayer().removeEventListener(type, listener);
  }
}

export {ReceiverManagerAPI};
