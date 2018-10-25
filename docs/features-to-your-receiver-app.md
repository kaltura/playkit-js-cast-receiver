# Add Features to Your Receiver App

#### Intercept the Load Request

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
// Receiver player
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

#### Manage Stream Priority

#### Redirect Your Streams

#### Set Your Own Splash Image
