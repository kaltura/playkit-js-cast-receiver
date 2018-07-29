const ReceiverApp = function(config) {
  this.context = cast.framework.CastReceiverContext.getInstance();
  this.playerManager = this.context.getPlayerManager();
  this.receiverManager = KalturaPlayer.cast.receiver.getReceiverManager(config);
};

ReceiverApp.prototype.start = function() {
  this.addInterceptors();
  this.context.setLoggerLevel(cast.framework.LoggerLevel.DEBUG);
  this.context.start();
};

ReceiverApp.prototype.addInterceptors = function() {
  this.playerManager.setMessageInterceptor(cast.framework.messages.MessageType.LOAD, requestData => {
    return this.receiverManager.onLoad(requestData);
  });
};
