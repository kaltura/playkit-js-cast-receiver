# Add Features to Your Receiver App

- **Table of Contents**
  - [Intercept the Load Request](#intercept-the-load-request)
  - [Manage Stream Priority](#manage-stream-priority)
  - [Redirect Your Streams](#redirect-your-streams)
  - [Set Your Own Splash Image](#set-your-own-splash-image)

### Intercept the Load Request

In case you want to make some manipulations on the data that was sent by the sender, you can set a message interceptor, manipulate the data and return it to the receiver default load handler.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="//www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js"></script>
  <script src="//www.kaltura.com/p/{YOUR_PARTNER_ID}/sp/{YOUR_PARTNER_ID}00/embedPlaykitJs/uiconf_id/{UI_CONF_ID}/partner_id/{YOUR_PARTNER_ID}"></script>
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
  // Intercept google home request and translate it to media ID
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

> **Important**: you must return the `receiver.onLoad` default handler from this function with the manipulated data, unless it won't work!

### Manage Stream Priority

The Kaltura Receiver SDK allows you to choose what stream protocol you are preferring to play. By default, the receiver attempting to play first with HLS, then with DASH, and finally mp4. If you wish to change this priority you can just configure it differently.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="//www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js"></script>
  <script src="//www.kaltura.com/p/{YOUR_PARTNER_ID}/sp/{YOUR_PARTNER_ID}00/embedPlaykitJs/uiconf_id/{UI_CONF_ID}/partner_id/{YOUR_PARTNER_ID}"></script>
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

> **Important**: the defined engine must be "cast" (using that string or the enum above) and not "html5", since this is the engine that plays in the receiver.

### Redirect Your Streams

If your are hosting your streams at third party and not at Kaltura platform, you'll need the receiver to handle the redirecting logic. To do so, configure it to force redirect to external streams.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="//www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js"></script>
  <script src="//www.kaltura.com/p/{YOUR_PARTNER_ID}/sp/{YOUR_PARTNER_ID}00/embedPlaykitJs/uiconf_id/{UI_CONF_ID}/partner_id/{YOUR_PARTNER_ID}"></script>
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
  <script src="//www.kaltura.com/p/{YOUR_PARTNER_ID}/sp/{YOUR_PARTNER_ID}00/embedPlaykitJs/uiconf_id/{UI_CONF_ID}/partner_id/{YOUR_PARTNER_ID}"></script>
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

> For more various styling options of the receiver UI, you can look for **Styling the player** section in this [Google CAF doc](https://developers.google.com/cast/docs/caf_receiver_features).
