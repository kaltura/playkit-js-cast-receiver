const App = config => {
  this.context = cast.framework.CastReceiverContext.getInstance();
  this.playerManager = this.context.getPlayerManager();
  this.receiverManager = KalturaPlayer.cast.receiver.getReceiverManager(config);

  this.context.setLoggerLevel(cast.framework.LoggerLevel.DEBUG);
};

App.prototype.start = () => {
  this.addListeners();
  this.context.start();
};

App.prototype.addListeners = () => {
  this.playerManager.setMessageInterceptor(cast.framework.messages.MessageType.LOAD, requestData => {
    return this.receiverManager.loadMedia(requestData);
  });
};
