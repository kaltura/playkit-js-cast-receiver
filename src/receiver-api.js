// @flow
import {ReceiverManager} from './receiver-manager';

let manager;

class ReceiverAPI {
  constructor(config: Object) {
    manager = new ReceiverManager(config);
  }

  onLoad(loadRequestData: Object): Promise<Object> {
    return manager.onLoad(loadRequestData);
  }

  onStop(requestData: Object): Promise<Object> {
    return manager.onStop(requestData);
  }

  onMediaStatus(mediaStatus: Object): Promise<Object> {
    return manager.onMediaStatus(mediaStatus);
  }
}

export {ReceiverAPI};
