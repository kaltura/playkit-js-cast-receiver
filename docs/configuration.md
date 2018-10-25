## Configuration

Kaltura Receiver SDK configuration parameters are provided whenever a receiver player instance is created.

```js
var config = {
  ...
};
var receiver = new KalturaPlayer.cast.receiver.Receiver(config);
```

#### Configuration Structure

The configuration uses the following structure:

```js
{
  provider: ProviderOptionsObject, // mandatory
  playback: KPReceiverPlaybackOptions,
  sources: KPReceiverSourcesOptions,
  logLevel: boolean
}
```

#### Default Configuration Values

```js
{
  logLevel: "OFF",
  playback: {
    streamPriority: [
      {
        engine: "cast",
        format: "hls"
      },
      {
        engine: "cast",
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

##

> ### config.provider
>
> ##### Type: [ProviderOptionsObject](https://github.com/kaltura/playkit-js-providers/blob/master/docs/configuration.md#configuration-structure)
>
> ##### Description: Defines the provider configuration.

##

> ### config.playback
>
> ##### Type: `KPReceiverPlaybackOptions`
>
> ```js
> {
>  streamPriority: Array<PKStreamPriorityObject>
> }
> ```
>
> ##### Default:
>
> ```js
> {
>   streamPriority: [
>     {
>       engine: 'cast',
>       format: 'hls'
>     },
>     {
>       engine: 'cast',
>       format: 'dash'
>     },
>     {
>       engine: 'cast',
>       format: 'progressive'
>     }
>   ];
> }
> ```
>
> ##### Description: Defines the playback options.
>
> ##
>
> > ### config.playback.streamPriority
> >
> > ##### Type: `Array<PKStreamPriorityObject`
> >
> > > ##### Type `PKStreamPriorityObject`
> > >
> > > ```js
> > > {
> > >   engine: string,
> > >   format: string
> > > }
> > > ```
> >
> > ##### Default:
> >
> > ```js
> > [
> >   {
> >     engine: 'cast',
> >     format: 'hls'
> >   },
> >   {
> >     engine: 'cast',
> >     format: 'dash'
> >   },
> >   {
> >     engine: 'cast',
> >     format: 'progressive'
> >   }
> > ];
> > ```
> >
> > ##### Description: Specifies the list of engine and stream format pairs of the player by ascending order.

##

> ### config.sources
>
> ##### Type: `KPReceiverSourcesOptions`
>
> ```js
> {
>  options: PKMediaSourceOptionsObject,
> }
> ```
>
> > ##### Type `PKMediaSourceOptionsObject`
> >
> > ```js
> > {
> >   forceRedirectExternalStreams: boolean;
> > }
> > ```
>
> ##### Default:
>
> ```js
> {
>   options: {
>     forceRedirectExternalStreams: false;
>   }
> }
> ```
>
> ##### Description: Defines related sources configurations.

##

> ### config.logLevel
>
> ##### Type: `string`
>
> ##### Default: `"OFF"`
>
> ##### Description: Defines the player log level.
>
> Possible values: `"DEBUG", "INFO", "TIME", "WARN", "ERROR", "OFF"`
