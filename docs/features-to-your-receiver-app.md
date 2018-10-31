# Add Features to Your Receiver App

### Table of Contents

- [Manipulate the Load Request Data](#manipulate-the-load-request-data)
- [Set Your Preferred Streaming Protocol](#set-your-preferred-streaming-protocol)
- [Redirect Your Streams](#redirect-your-streams)
- [Set Your Own Splash Image](#set-your-own-splash-image)

### Manipulate the Load Request Data

If you want to manipulate or change the data that is sent by the sender, you can set a message interceptor, manipulate the data and return it to the receiver default load handler in the following way:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="//www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js"></script>
  <script src="//cdnapisec.kaltura.com/p/{YOUR_PARTNER_ID}/embedPlaykitJs/uiconf_id/{UI_CONF_ID}"></script>
</head>
<body>
<cast-media-player/>
<script>
var conf = {
  provider: {
    partnerId: {YOUR_PARTNER_ID},
  }
};
// Kaltura receiver player
var receiver = new KalturaPlayer.cast.receiver.Receiver(conf);
// Google cast player manager
var playerManager = cast.framework.CastReceiverContext.getInstance().getPlayerManager();
// Set the load interceptor
playerManager.setMessageInterceptor(cast.framework.messages.MessageType.LOAD, requestData => {
  // Intercept Google home request and translate it to media ID
  var mediaID = requestData.media.entity.split("/").pop();
  if (!mediaID && mediaID.length === 0){
    var trimmedURL = requestData.media.entity.replace(/^[\/]+|[\/]+$/g, "");
    mediaID = trimmedURL.split("/").pop();
  }
  // Set the media ID in the receiver custom data
  requestData.media.customData = requestData.media.customData || {};
  requestData.media.customData.mediaInfo = {
    entryId: mediaID,
    formats:["Web New"]
  };
  // Must return the manipulated data to the receiver default load handler!
  return receiver.onLoad(requestData);
});

receiver.start();
</script>
</body>
</html>
```

> **Important**: You must return the `receiver.onLoad` default handler from this function with the manipulated data, otherwise this won't work!

### Set Your Preferred Streaming Protocol

The Kaltura Receiver SDK allows you to choose which streaming protocol you prefer to play. By default, the receiver will first attempt to play first with HLS, then with DASH, and finally mp4. If you wish to change this priority you can just configure this order differently as follows:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="//www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js"></script>
  <script src="//cdnapisec.kaltura.com/p/{YOUR_PARTNER_ID}/embedPlaykitJs/uiconf_id/{UI_CONF_ID}"></script>
</head>
<body>
<cast-media-player/>
<script>
var conf = {
  provider: {
    partnerId: {YOUR_PARTNER_ID}
  },
  playback: {
    streamPriority: [
      {
        engine: KalturaPlayer.core.EngineType.CAST,
        format: KalturaPlayer.core.StreamType.DASH
      },
      {
        engine: KalturaPlayer.core.EngineType.CAST,
        format: KalturaPlayer.core.StreamType.HLS
      },
      {
        engine: KalturaPlayer.core.EngineType.CAST,
        format: KalturaPlayer.core.StreamType.PROGRESSIVE
      }
    ]
  }
};
var receiver = new KalturaPlayer.cast.receiver.Receiver(conf);
receiver.start();
```

> **Important**: The defined engine must be "cast" (using that string or the enum above) and not "html5", since this is the engine that plays on the receiver.

### Redirect Your Streams

If you're hosting your streams on a third party and not on Kaltura's platform, you'll need the receiver to handle the redirecting logic. To do so, configure it to force redirect to external streams as follows:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="//www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js"></script>
  <script src="//cdnapisec.kaltura.com/p/{YOUR_PARTNER_ID}/embedPlaykitJs/uiconf_id/{UI_CONF_ID}"></script>
</head>
<body>
<cast-media-player/>
<script>
var conf = {
  provider: {
    partnerId: {YOUR_PARTNER_ID}
  },
  sources: {
    options: {
      forceRedirectExternalStreams: true
    }
  }
};
var receiver = new KalturaPlayer.cast.receiver.Receiver(conf);
receiver.start();
```

### Set Your Own Splash Image

To display your own custom splash image in the receiver, you can override the built-in `--splash-image` CSS property.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="//www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js"></script>
  <script src="//cdnapisec.kaltura.com/p/{YOUR_PARTNER_ID}/embedPlaykitJs/uiconf_id/{UI_CONF_ID}"></script>
  <style>
  #player {
    --splash-image: url('http://some/image.png');
  }
  </style>
</head>
<body>
<cast-media-player id="player"/>
<script>
var conf = {
  provider: {
    partnerId: {YOUR_PARTNER_ID}
  }
};
var receiver = new KalturaPlayer.cast.receiver.Receiver(conf);
receiver.start();
```

> For more various styling options of the receiver UI, look for the section **Styling the player** in this [Google CAF doc](https://developers.google.com/cast/docs/caf_receiver_features).
