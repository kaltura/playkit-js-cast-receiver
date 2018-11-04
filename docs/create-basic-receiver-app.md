# Create a Basic Receiver App

The following is the main structure of a basic receiver app, which has no customization:

1.  A script element to load the Google Cast Receiver Framework.

```html
<script src="//www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js"></script>
```

2.  A script element to load the Kaltura Receiver Player SDK.

```html
<script src="//cdnapisec.kaltura.com/p/{YOUR_PARTNER_ID}/embedPlaykitJs/uiconf_id/{UI_CONF_ID}"></script>
```

3.  A `cast-media-player` element to represent the media player.

```html
<body>
  <cast-media-player/>
</body>
```

The following is the minimum code for a receiver application without any customization (except for entering your partner and entry IDs in the proper places). You can copy and paste this script exactly as-is into your app to create the receiver app.

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
    uiConfId: {UI_CONF_ID} // receiver type
  }
};
var receiver = new KalturaPlayer.cast.receiver.Receiver(conf);
receiver.start();
</script>
</body>
</html>
```

> Support for setting receiver player type is coming to player studio soon. In the meanwhile please reach out to delivery desk if you require setting up a receiver uiConf.

## Next Step

Go to [Add features to your receiver app](./features-to-your-receiver-app.md).
