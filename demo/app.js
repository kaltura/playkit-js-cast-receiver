const App = function(config) {
  this.context = cast.framework.CastReceiverContext.getInstance();
  this.playerManager = this.context.getPlayerManager();
  this.receiverManager = KalturaPlayer.cast.receiver.getReceiverManager(config);

  this.context.setLoggerLevel(cast.framework.LoggerLevel.DEBUG);
};

App.prototype.start = function() {
  this.addListeners();
  this.context.start();
};

App.prototype.addListeners = function() {
  this.playerManager.setMessageInterceptor(cast.framework.messages.MessageType.LOAD, requestData => {
    return this.receiverManager.loadMedia(requestData);
  });
};
