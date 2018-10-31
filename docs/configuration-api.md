# Configuration & API

### Table of Contents

- [KPReceiverOptionsObject](#kpreceiveroptionsobject)
- [PKMediaSourceOptionsObject](#pkmediasourceoptionsobject)
- [ProviderOptionsObject](#provideroptionsobject)
- [PKStreamPriorityObject](#pkstreampriorityobject)
- [Receiver](#receiver)
  - [start](#start)
  - [onLoad](#onload)
  - [addEventListener](#addeventlistener)
  - [removeEventListener](#removeeventlistener)

## KPReceiverOptionsObject

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

**Properties**

- `provider` **[ProviderOptionsObject](#provideroptionsobject)** The provider configuration.
- `playback` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** The playback configuration.
  - `playback.streamPriority` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[PKStreamPriorityObject](#pkstreampriorityobject)>?** The list of engine and stream format pairs of the player by ascending order.
- `sources` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** The sources configuration.
  - `sources.options` **[PKMediaSourceOptionsObject](#pkmediasourceoptionsobject)?** Related sources options.
- `logLevel` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The player log level.

**Examples**

```javascript
// Default config
{
 logLevel: "OFF",
 playback: {
   streamPriority: [
     {
       engine: "cast",
       format: "hls"
     },
     {
       engine: "ca`st",
       format: "dash"
     },
     {
       engine: "cast",
       format: "progressive"
     }
   ]
 },
 sources: {
   options: {
     forceRedirectExternalStreams: false
   }
 }
}
```

## PKMediaSourceOptionsObject

See [PKMediaSourceOptionsObject](https://github.com/kaltura/playkit-js/blob/master/docs/configuration.md#type-pkmediasourceoptionsobject)

## ProviderOptionsObject

See [ProviderOptionsObject](https://github.com/kaltura/playkit-js-providers/blob/master/docs/configuration.md#configuration-structure)

## PKStreamPriorityObject

See [PKStreamPriorityObject](https://github.com/kaltura/playkit-js/blob/master/docs/configuration.md#type-arraypkstreampriorityobject)

## Receiver

Kaltura Receiver Player SDK.

**Parameters**

- `config` **[KPReceiverOptionsObject](#kpreceiveroptionsobject)** The receiver SDK configuration.

### start

Initializes the receiver SDK, so that receiver app can receive requests from senders.
Internally calls to cast.framework.CastReceiverContext.start() to initializes system manager and media manager.

**Parameters**

- `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** Cast receiver context options. All options are optionals. See [cast.framework.CastReceiverOptions](https://developers.google.com/cast/docs/reference/caf_receiver/cast.framework.CastReceiverOptions) (optional, default `{}`)

Returns **void**

### onLoad

The LOAD default handler of the receiver SDK. This handler should be called just in case LOAD interceptor is override by the app, otherwise it will be called internally.

**Parameters**

- `loadRequestData` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Media event LOAD request data. See [cast.framework.messages.LoadRequestData](https://developers.google.com/cast/docs/reference/caf_receiver/cast.framework.messages.LoadRequestData)

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>** The load promise.

### addEventListener

Adding an event listener to a receiver player event.

**Parameters**

- `type` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The event type.
- `listener` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** The event handler.

Returns **void**

### removeEventListener

Removing an event listener from a receiver player event.

**Parameters**

- `type` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The event type.
- `listener` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** The event handler.

Returns **void**
