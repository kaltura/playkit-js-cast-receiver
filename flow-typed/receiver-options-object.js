// @flow

/**
 * @typedef {Object} KPReceiverOptionsObject
 * @property {ProviderOptionsObject} provider
 * @property {Object} [playback]
 * @property {Array<PKStreamPriorityObject>} [playback.streamPriority]
 * @property {Object} [sources]
 * @property {PKMediaSourceOptionsObject} [sources.options]
 * @property {string} logLevel
 */
type _KPReceiverOptionsObject = {
  provider: ProviderOptionsObject,
  playback?: {
    streamPriority: Array<PKStreamPriorityObject>
  },
  sources?: {
    options?: PKMediaSourceOptionsObject
  },
  logLevel?: string
};

/**
 * See {@link https://github.com/kaltura/playkit-js-providers/blob/master/docs/configuration.md#configuration-structure|ProviderOptionsObject}
 * @external  ProviderOptionsObject
 */

/**
 * See {@link https://github.com/kaltura/playkit-js/blob/master/docs/configuration.md#type-arraypkstreampriorityobject|PKStreamPriorityObject}
 * @external PKStreamPriorityObject
 */

/**
 * See {@link https://github.com/kaltura/playkit-js/blob/master/docs/configuration.md#type-pkmediasourceoptionsobject|PKMediaSourceOptionsObject}
 * @external PKMediaSourceOptionsObject
 */

declare type KPReceiverOptionsObject = _KPReceiverOptionsObject;
