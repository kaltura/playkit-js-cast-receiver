// @flow
class ReceiverAdsManager {
  _playerManager: Object;
  _player: Object;

  constructor(player: Object) {
    this._playerManager = cast.framework.CastReceiverContext.getInstance().getPlayerManager();
    this._player = player;
  }
}

export {ReceiverAdsManager};
