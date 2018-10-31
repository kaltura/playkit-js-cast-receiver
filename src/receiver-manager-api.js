// @flow
import {ReceiverManager} from './receiver-manager';

let receiverManager;

/**
 * Kaltura Receiver Player SDK.
 * @class Receiver
 * @param {KPReceiverOptionsObject} config - The receiver SDK configuration.
 */
class ReceiverManagerAPI {
  constructor(config: KPReceiverOptionsObject) {
    receiverManager = new ReceiverManager(config);
  }

  /**
   * Initializes the receiver SDK, so that receiver app can receive requests from senders.
   * Internally calls to cast.framework.CastReceiverContext.start() to initializes system manager and media manager.
   * @public
   * @instance
   * @param {Object=} options - Cast receiver context options. All options are optional. See {@link https://developers.google.com/cast/docs/reference/caf_receiver/cast.framework.CastReceiverOptions|cast.framework.CastReceiverOptions}
   * @returns {void}
   * @memberof Receiver
   */
  start(options?: Object = {}): void {
    receiverManager.start(options);
  }

  /**
   * The LOAD default handler of the receiver SDK. This handler should be called just in case LOAD interceptor is override by the app, otherwise it will be called internally.
   * @public
   * @instance
   * @param {Object} loadRequestData - Media event LOAD request data. See {@link https://developers.google.com/cast/docs/reference/caf_receiver/cast.framework.messages.LoadRequestData|cast.framework.messages.LoadRequestData}
   * @returns {Promise<Object>} - The load promise.
   * @memberof Receiver
   */
  onLoad(loadRequestData: Object): Promise<Object> {
    return receiverManager.onLoad(loadRequestData);
  }

  /**
   * Adding an event listener to a receiver player event.
   * @public
   * @instance
   * @param {string} type - The event type.
   * @param {Function} listener - The event handler.
   * @returns {void}
   * @memberof Receiver
   */
  addEventListener(type: string, listener: Function): void {
    receiverManager.getPlayer().addEventListener(type, listener);
  }

  /**
   * Removing an event listener from a receiver player event.
   * @public
   * @instance
   * @param {string} type - The event type.
   * @param {Function} listener - The event handler.
   * @returns {void}
   * @memberof Receiver
   */
  removeEventListener(type: string, listener: Function): void {
    receiverManager.getPlayer().removeEventListener(type, listener);
  }
}

export {ReceiverManagerAPI};
