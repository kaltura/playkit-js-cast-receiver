var KalturaPlayer="object"==typeof KalturaPlayer?KalturaPlayer:{};KalturaPlayer.cast=KalturaPlayer.cast||{},KalturaPlayer.cast.receiver=function(e){var t={};function a(n){if(t[n])return t[n].exports;var r=t[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,a),r.l=!0,r.exports}return a.m=e,a.c=t,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)a.d(n,r,function(t){return e[t]}.bind(null,r));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="",a(a.s=1)}([function(e,t){e.exports=KalturaPlayer},function(e,t,a){"use strict";a.r(t),a.d(t,"Receiver",(function(){return ee})),a.d(t,"VERSION",(function(){return te})),a.d(t,"NAME",(function(){return ae}));var n=a(0);function r(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function i(e,t){for(var a=0;a<t.length;a++){var n=t[a];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function s(e,t,a){return t&&i(e.prototype,t),a&&i(e,a),e}function o(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}n.core.Track;var c=n.core.Utils,d=n.core.FakeEvent,u=n.core.MediaType,l=n.core.getLogger,_=n.core.FakeEventTarget,g=n.core.EventManager,p=n.core.EventType,h=n.core.AudioTrack,y=n.core.TextTrack,v=n.core.AbrMode,E=n.core.MimeType,f=function(e){var t,a;function n(t,a){var n;return o(r(n=e.call(this)||this),"_isLoaded",!1),o(r(n),"_tracks",[]),o(r(n),"_volume",1),o(r(n),"_muted",!1),o(r(n),"_paused",!1),o(r(n),"_seeking",!1),o(r(n),"_ended",!1),o(r(n),"_mediaElementEvents",[p.ABORT,p.CAN_PLAY,p.CAN_PLAY_THROUGH,p.DURATION_CHANGE,p.EMPTIED,p.ENDED,p.LOADED_DATA,p.LOADED_METADATA,p.LOAD_START,p.PAUSE,p.PLAY,p.PLAYING,p.PROGRESS,p.RATE_CHANGE,p.SEEKED,p.SEEKING,p.STALLED,p.TIME_UPDATE,p.SUSPEND,p.WAITING]),n._context=cast.framework.CastReceiverContext.getInstance(),n._playerManager=n._context.getPlayerManager(),n._eventManager=new g,n._createVideoElement(),n._init(t,a),n}a=e,(t=n).prototype=Object.create(a.prototype),t.prototype.constructor=t,t.__proto__=a,n.canPlaySource=function(e){var t=e.mimetype.toLowerCase();return!!n._supportedMimeTypes.includes(t)&&(!e.drmData||E.DASH.includes(t))},n.createEngine=function(e,t){return new this(e,t)},s(n,null,[{key:"id",get:function(){return"cast"}}]);var i=n.prototype;return i.restore=function(e,t){this.reset(),this._init(e,t)},i.attach=function(){var e=this,t=this.getVideoElement();this._eventManager.listen(t,p.SEEKED,(function(){return e._seeking=!1})),this._eventManager.listen(t,p.SEEKING,(function(){return e._seeking=!0})),this._eventManager.listen(t,p.ENDED,(function(){e._ended=!0,e.isLive()||e.dispatchEvent(new d(p.TIME_UPDATE))})),this.isLive()&&this._eventManager.listen(t,p.TIME_UPDATE,(function(){return e._playerManager.broadcastStatus(!0)})),this._mediaElementEvents.forEach((function(a){return e._eventManager.listen(t,a,(function(){return e.dispatchEvent(new d(a))}))}))},i.detach=function(){},n.runCapabilities=function(){},n.prepareVideoElement=function(){},n.getCapabilities=function(){var e;return Promise.resolve(((e={})[n.id]={autoplay:!0,mutedAutoPlay:!0},e))},i.getVideoElement=function(){return this._el},i.load=function(e){return n._logger.debug("Load start",e),this._isLoaded=!0,this._parseTracks(),this.dispatchEvent(new d(p.ABR_MODE_CHANGED,{mode:v.AUTO})),n._logger.debug("Load end",this._tracks),Promise.resolve({tracks:this._tracks})},i.play=function(){this._paused=!1},i.pause=function(){this._paused=!0},i.hideTextTrack=function(){},i.selectTextTrack=function(e){this.dispatchEvent(new d(p.TEXT_TRACK_CHANGED,{selectedTextTrack:e}))},i.selectAudioTrack=function(e){this.dispatchEvent(new d(p.AUDIO_TRACK_CHANGED,{selectedAudioTrack:e}))},i.selectVideoTrack=function(e){this.dispatchEvent(new d(p.VIDEO_TRACK_CHANGED,{selectedVideoTrack:e}))},i.enableAdaptiveBitrate=function(){},i.isAdaptiveBitrateEnabled=function(){return!0},i.getSelectedSource=function(){return c.Object.copyDeep(this._source)},i.isLive=function(){return this._config.sources.type===u.LIVE},i.seekToLiveEdge=function(){var e=this._playerManager.getLiveSeekableRange();e&&this._playerManager.seek(e.end)},i.getStartTimeOfDvrWindow=function(){var e=this._playerManager.getLiveSeekableRange();return e?e.start:0},i.reset=function(){this._eventManager.removeAll(),this._tracks=[],this._isLoaded=!1,this._paused=!1,this._seeking=!1,this._ended=!1},i.destroy=function(){this._eventManager.destroy(),this._tracks=[],this._isLoaded=!1,this._mediaElementEvents=[],this._volume=1,this._muted=!1,this._paused=!1,this._seeking=!1,this._ended=!1,this._el&&(c.Dom.removeAttribute(this._el,"src"),c.Dom.removeChild(this._el.parentNode,this._el))},i._createVideoElement=function(){var e=document.getElementsByTagName(P)[0];e&&(this._el=e.getMediaElement())},i._init=function(e,t){this._source=e,this._config=t,this.attach()},i._parseTracks=function(){var e=this._playerManager.getAudioTracksManager().getTracks(),t=this._parseAudioTracks(e),a=this._playerManager.getTextTracksManager().getTracks(),n=this._parseTextTracks(a);this._tracks=t.concat(n)},i._parseTextTracks=function(e){var t=[];return e.forEach((function(e){var a={id:e.trackId,index:e.trackId-1,label:e.name,language:e.language,kind:e.subType||"subtitles",active:!1};t.push(new y(a))})),t},i._parseAudioTracks=function(e){var t=[];return e.forEach((function(e){var a={id:e.trackId,index:e.trackId-1,label:e.name,language:e.language,active:!1};t.push(new h(a))})),t},s(n,[{key:"id",get:function(){return n.id}},{key:"currentTime",set:function(e){},get:function(){return this.isLive()?this._playerManager.getCurrentTimeSec()-this.getStartTimeOfDvrWindow():this._ended?this._playerManager.getDurationSec():this._playerManager.getCurrentTimeSec()}},{key:"muted",set:function(e){this._muted=e},get:function(){return this._muted}},{key:"volume",set:function(e){this._volume=e,this.dispatchEvent(p.VOLUME_CHANGE)},get:function(){return this._volume}},{key:"paused",get:function(){return this._paused}},{key:"seeking",get:function(){return this._seeking}},{key:"buffered",get:function(){return[]}},{key:"duration",get:function(){if(this.isLive()){var e=this._playerManager.getLiveSeekableRange();if(e)return e.end-this.getStartTimeOfDvrWindow()}return this._playerManager.getDurationSec()}},{key:"src",get:function(){return this._isLoaded?this._source.url:""}},{key:"playsinline",set:function(e){},get:function(){return!0}},{key:"playbackRate",set:function(e){},get:function(){return this._playerManager.getPlaybackRate()}},{key:"playbackRates",get:function(){return[1]}},{key:"defaultPlaybackRate",get:function(){return 1}},{key:"crossOrigin",set:function(e){},get:function(){return null}},{key:"ended",get:function(){return this._ended}}]),n}(_);o(f,"_logger",l("CastEngine")),o(f,"_supportedMimeTypes",[].concat(E.HLS,E.DASH,E.PROGRESSIVE,E.SMOOTH_STREAMING));var m=n.core.StreamType,T=n.core.EngineType,k={playback:{autoplay:!1,preload:"none",disableUserCache:!0,streamPriority:[{engine:T.CAST,format:m.HLS},{engine:T.CAST,format:m.DASH},{engine:T.CAST,format:m.PROGRESSIVE}]},ui:{disable:!0}},A=function(e){this.code=e.code,this.description=e.description},M={code:100020,description:"<cast-media-element> tag isn't found in the DOM"},D=n.core.Utils,C=n.core.unRegisterEngine,S=n.core.registerEngine,b=n.core.EngineType,P="cast-media-player",L=function(){function e(){}return e.loadPlayer=function(e){var t=D.Dom.getElementsByTagName(P)[0];if(t){var a=t.getMediaElement();a.style.position="absolute";var r=D.Dom.createElement("div");r.id="kaltura-receiver-player-container",D.Dom.appendChild(document.body,r),C(b.HTML5),S(b.CAST,f);var i=D.Object.mergeDeep({targetId:"kaltura-receiver-player-container"},k,e),s=Object(n.setup)(i);return D.Dom.prependTo(r,a.parentNode),s}throw new A(M)},e}();var R=n.cast.TextStyleConverter,I=n.core.TrackType,O=n.core.getLogger,w=function(){function e(e){var t,a,n;t=this,a="_logger",n=O("ReceiverTracksManager"),a in t?Object.defineProperty(t,a,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[a]=n,this._playerManager=cast.framework.CastReceiverContext.getInstance().getPlayerManager(),this._player=e,this._attachListeners()}var t=e.prototype;return t.setInitialTracks=function(){var e=this._playerManager.getMediaInformation();this._logger.debug("Set initial tracks",e.customData),e.customData&&(this._setInitialAudioTrack(e.customData.audioLanguage),this._setInitialTextTrack(e.customData.textLanguage))},t._attachListeners=function(){var e=this;this._playerManager.addEventListener(cast.framework.events.EventType.REQUEST_EDIT_TRACKS_INFO,(function(t){var a=t.requestData.activeTrackIds;if(a)e._handleAudioTrackSelection(a),e._handleTextTrackSelection(a);else{var n=t.requestData.textTrackStyle;e._handleTextStyleSelection(n)}}))},t._handleTextTrackSelection=function(e){var t=this._player.getTracks(I.TEXT),a=t.find((function(e){return e.active})),n=t.find((function(t){return e.includes(t.id)}));if(n)this._player.selectTrack(n);else if(a&&"off"!==a.language){var r=t.find((function(e){return"off"===e.language}));this._player.selectTrack(r)}},t._handleAudioTrackSelection=function(e){var t=this._player.getTracks(I.AUDIO),a=t.find((function(e){return e.active})),n=t.find((function(t){return e.includes(t.id)}));a&&n&&a.id!==n.id&&this._player.selectTrack(n)},t._handleTextStyleSelection=function(e){this._player.textStyle=R.toPlayerTextStyle(e)},t._setInitialTextTrack=function(e){var t=this._playerManager.getTextTracksManager(),a=this._player.getTracks(I.TEXT);e&&(a.some((function(t){return t.language===e}))?(this._logger.debug("Set initial text track - setActiveByLanguage",e),t.setActiveByLanguage(e)):this._logger.warn("Text track "+e+" doesn't exist in the supported text tracks"))},t._setInitialAudioTrack=function(e){var t=this._playerManager.getAudioTracksManager(),a=t.getTracks();if(this._logger.debug("Set initial audio track",e,a),a.length>0)if(e)this._logger.debug("Set initial audio track - setActiveByLanguage",e),t.setActiveByLanguage(e);else{var n=a[0].trackId,r=this._player.getTracks(I.AUDIO).find((function(e){return e.id===n}));r&&(this._logger.debug("Set initial audio track - setActiveById",n),t.setActiveById(n),this._player.selectTrack(r))}},e}();function B(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}var H=n.core.EventType,x=n.core.Ad,N=n.core.AdBreak,U=n.core.AdBreakType,j=n.core.getLogger,K=n.core.FakeEvent,V=n.cast.CustomEventMessage,G=function(){function e(e){var t=this;B(this,"_logger",j("ReceiverAdsManager")),B(this,"_adCanSkipTriggered",!1),B(this,"_timePercentEvent",{AD_REACHED_25_PERCENT:!1,AD_REACHED_50_PERCENT:!1,AD_REACHED_75_PERCENT:!1}),B(this,"_onPlayerLoadComplete",(function(){var e=[],a=t._playerManager.getBreakManager();if(a){var n=a.getBreaks();n&&n.length>0&&(n.forEach((function(t){return e.push(t.position)})),t._sendEventAndCustomMessage(t._player.Event.AD_MANIFEST_LOADED,{adBreaksPosition:e}))}})),B(this,"_onBreakStarted",(function(e){t._toggleAdBreakListeners(!0);var a=t._getAdBreakOptions(e),n=new N(a);t._sendEventAndCustomMessage(t._player.Event.AD_BREAK_START,{adBreak:n}),t._adBreak=n})),B(this,"_onBreakEnded",(function(e){t._toggleAdBreakListeners(!1),t._sendEventAndCustomMessage(t._player.Event.AD_BREAK_END),t._adBreak=null;var a=t._playerManager.getBreakManager().getBreaks();a.findIndex((function(t){return t.id===e.breakId}))+1===a.length&&t._sendEventAndCustomMessage(t._player.Event.ALL_ADS_COMPLETED)})),B(this,"_onBreakClipLoading",(function(e){var a=t._getAdOptions(e),n=new x(e.breakClipId,a);t._sendEventAndCustomMessage(t._player.Event.AD_LOADED,{ad:n}),t._ad=n})),B(this,"_onBreakClipStarted",(function(e){var a=t._getAdOptions(e),n=new x(e.breakClipId,a);t._sendEventAndCustomMessage(t._player.Event.AD_STARTED,{ad:n}),t._adIsPlaying=!0})),B(this,"_onBreakClipEnded",(function(){t._sendEventAndCustomMessage(t._player.Event.AD_COMPLETED),t._adIsPlaying=!1,t._adCanSkipTriggered=!1,t._ad=null})),B(this,"_onAdPaused",(function(){t._sendEventAndCustomMessage(t._player.Event.AD_PAUSED),t._adIsPlaying=!1})),B(this,"_onAdResumed",(function(){t._sendEventAndCustomMessage(t._player.Event.AD_RESUMED),t._adIsPlaying=!0})),B(this,"_onAdProgress",(function(){if(t._ad){var e=t._playerManager.getBreakClipDurationSec(),a=t._playerManager.getBreakClipCurrentTimeSec(),n=a/e;!t._timePercentEvent.AD_REACHED_25_PERCENT&&n>=.25&&(t._timePercentEvent.AD_REACHED_25_PERCENT=!0,t._sendEventAndCustomMessage(t._player.Event.AD_FIRST_QUARTILE)),!t._timePercentEvent.AD_REACHED_50_PERCENT&&n>=.5&&(t._timePercentEvent.AD_REACHED_50_PERCENT=!0,t._sendEventAndCustomMessage(t._player.Event.AD_MIDPOINT)),!t._timePercentEvent.AD_REACHED_75_PERCENT&&n>=.75&&(t._timePercentEvent.AD_REACHED_75_PERCENT=!0,t._sendEventAndCustomMessage(t._player.Event.AD_THIRD_QUARTILE)),t._ad&&!t._adCanSkipTriggered&&t._ad&&t._ad.skippable&&a>=t._ad.skipOffset&&(t._sendEventAndCustomMessage(t._player.Event.AD_CAN_SKIP),t._adCanSkipTriggered=!0),t._sendEventAndCustomMessage(t._player.Event.AD_PROGRESS,{adProgress:{currentTime:a,duration:e}})}})),B(this,"_onMuteChange",(function(){t._player.muted&&t._sendEventAndCustomMessage(t._player.Event.AD_MUTED)})),B(this,"_onVolumeChange",(function(){t._sendEventAndCustomMessage(t._player.Event.AD_VOLUME_CHANGED)})),this._context=cast.framework.CastReceiverContext.getInstance(),this._playerManager=this._context.getPlayerManager(),this._player=e,this._attachListeners()}var t=e.prototype;return t.skipAd=function(){this._logger.debug("Skip ad");var e=new cast.framework.messages.RequestData(cast.framework.messages.MessageType.SKIP_AD);this._playerManager.sendLocalMediaRequest(e)},t.adBreak=function(){return!!this._adBreak},t._attachListeners=function(){var e,t,a,n=this;this._adLifecycleEventHandlers=((e={})[cast.framework.events.EventType.PLAYER_LOAD_COMPLETE]=this._onPlayerLoadComplete.bind(this),e[cast.framework.events.EventType.BREAK_STARTED]=this._onBreakStarted.bind(this),e[cast.framework.events.EventType.BREAK_ENDED]=this._onBreakEnded.bind(this),e[cast.framework.events.EventType.BREAK_CLIP_LOADING]=this._onBreakClipLoading.bind(this),e[cast.framework.events.EventType.BREAK_CLIP_STARTED]=this._onBreakClipStarted.bind(this),e[cast.framework.events.EventType.BREAK_CLIP_ENDED]=this._onBreakClipEnded.bind(this),e),this._adTrackingEventHandlers=((t={})[cast.framework.events.EventType.PAUSE]=this._onAdPaused.bind(this),t[cast.framework.events.EventType.PLAY]=this._onAdResumed.bind(this),t),this._playerEventHandlers=((a={})[H.MUTE_CHANGE]=this._onMuteChange.bind(this),a[H.VOLUME_CHANGE]=this._onVolumeChange.bind(this),a),Object.keys(this._adLifecycleEventHandlers).forEach((function(e){return n._playerManager.addEventListener(e,n._adLifecycleEventHandlers[e])}))},t._toggleAdBreakListeners=function(e){var t=this;e?(Object.keys(this._adTrackingEventHandlers).forEach((function(e){return t._playerManager.addEventListener(e,t._adTrackingEventHandlers[e])})),Object.keys(this._playerEventHandlers).forEach((function(e){return t._player.addEventListener(e,t._playerEventHandlers[e])})),this._adProgressIntervalId=setInterval(this._onAdProgress.bind(this),300)):(Object.keys(this._adTrackingEventHandlers).forEach((function(e){return t._playerManager.removeEventListener(e,t._adTrackingEventHandlers[e])})),Object.keys(this._playerEventHandlers).forEach((function(e){return t._player.removeEventListener(e,t._playerEventHandlers[e])})),this._adProgressIntervalId&&(clearInterval(this._adProgressIntervalId),this._adProgressIntervalId=null))},t._getAdBreakOptions=function(e){var t={},a=this._playerManager.getBreakManager().getBreakById(e.breakId);return a&&(t.position=a.position,t.type=this._getAdBreakTypeByPosition(a.position),t.numAds=a.breakClipIds.length),t},t._getAdBreakTypeByPosition=function(e){switch(e){case 0:return U.PRE;case-1:return U.POST;default:return U.MID}},t._getAdOptions=function(e){var t={},a=this._playerManager.getBreakManager().getBreakById(e.breakId);if(a){var n=this._playerManager.getBreakManager().getBreakClipById(e.breakClipId);t.url=n.contentId,t.contentType=n.contentType,t.title=n.title,t.position=a.breakClipIds.indexOf(n.id)+1,t.duration=n.duration,t.clickThroughUrl=n.clickThroughUrl,t.posterUrl=n.posterUrl,t.skipOffset=n.whenSkippable,t.linear=!0}return t},t._sendEventAndCustomMessage=function(e,t){this._logger.debug(e.toUpperCase(),t),this._player.dispatchEvent(new K(e,t)),this._context.sendCustomMessage(Z,void 0,new V(e,t))},e}();function q(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}n.core.FakeEvent;var F,Y=n.core.EventManager,W=n.core.DrmScheme,Q=n.core.Utils,X=n.core.getLogger,J=n.cast.CustomMessageType,z=n.cast.CustomActionType,Z=(n.cast.CustomActionMessage,"urn:x-cast:com.kaltura.cast.playkit"),$=function(){function e(e){var t,a,n;q(this,"_logger",X("ReceiverManager")),q(this,"_shouldAutoPlay",!0),q(this,"_firstPlay",!0),q(this,"_messageInterceptorsHandlers",((t={})[cast.framework.messages.MessageType.LOAD]=this.onLoad,t[cast.framework.messages.MessageType.MEDIA_STATUS]=this.onMediaStatus,t[cast.framework.messages.MessageType.STOP]=this.onStop,t)),q(this,"_playerManagerEventHandlers",((a={})[cast.framework.events.EventType.REQUEST_PLAY]=this._onRequestPlayEvent,a[cast.framework.events.EventType.REQUEST_PAUSE]=this._onRequestPauseEvent,a[cast.framework.events.EventType.PLAY]=this._onPlayEvent,a[cast.framework.events.EventType.PLAYER_LOAD_COMPLETE]=this._onPlayerLoadCompleteEvent,a)),q(this,"_castContextEventHandlers",((n={})[cast.framework.system.EventType.SYSTEM_VOLUME_CHANGED]=this._onSystemVolumeChangedEvent,n)),this._context=cast.framework.CastReceiverContext.getInstance(),this._playerManager=this._context.getPlayerManager(),this._eventManager=new Y,this._player=L.loadPlayer(e),this._tracksManager=new w(this._player),this._adsManager=new G(this._player),this._attachListeners()}var t=e.prototype;return t.getPlayer=function(){return this._player},t.start=function(e){var t,a=new cast.framework.CastReceiverOptions;a.customNamespaces=((t={})[Z]=cast.framework.system.MessageType.JSON,t),Q.Object.mergeDeep(a,e),this._logger.debug("Start receiver",a),this._context.start(a)},t.onLoad=function(e){var t=this;return this._logger.debug("onLoad",e),this._reset(),new Promise((function(a,n){var r=e.media.customData.mediaInfo,i=e.media.customData.mediaConfig;t._maybeCreateVmapAdsRequest(e.media),t._maybeReplaceAdTagTimestamp(e.media),t._eventManager.listen(t._player,t._player.Event.ERROR,(function(e){return n(e)})),t._eventManager.listen(t._player,t._player.Event.SOURCE_SELECTED,(function(n){return t._onSourceSelected(n,e,a)})),r?(t._logger.debug("loadMedia",r),t._player.loadMedia(r)):(t._logger.debug("setMedia",i),t._player.setMedia(i))}))},t.onStop=function(e){return this._logger.debug("onStop",e),this._destroy(),e},t.onMediaStatus=function(e){return this._logger.debug("mediaStatus",e),e.customData=e.customData||{},this._player&&(e.customData.mediaInfo=this._player.getMediaInfo(),this._player.isLive()&&(e.currentTime=this._player.currentTime,e.media&&(e.media.duration=this._player.duration))),e.playerState!==this._playerManager.getPlayerState()&&(e.playerState=this._playerManager.getPlayerState()),e},t._attachListeners=function(){var e=this;this._context.addCustomMessageListener(Z,(function(t){return e._onCustomMessage(t)})),Object.keys(this._playerManagerEventHandlers).forEach((function(t){return e._playerManager.addEventListener(t,e._playerManagerEventHandlers[t].bind(e))})),Object.keys(this._messageInterceptorsHandlers).forEach((function(t){return e._playerManager.setMessageInterceptor(t,e._messageInterceptorsHandlers[t].bind(e))})),Object.keys(this._castContextEventHandlers).forEach((function(t){return e._context.addEventListener(t,e._castContextEventHandlers[t].bind(e))}))},t._reset=function(){this._shouldAutoPlay=!0,this._firstPlay=!0,this._eventManager.removeAll(),this._player.reset()},t._destroy=function(){this._shouldAutoPlay=!0,this._firstPlay=!0,this._eventManager.destroy(),this._player.destroy()},t._onSourceSelected=function(e,t,a){var n=this,r=e.payload.selectedSource[0];this._handleAutoPlay(t),this._handleLiveDvr(t),this._setMediaInfo(t,r),this._maybeSetDrmLicenseUrl(r);var i=this._player.config.sources;i.options&&i.options.forceRedirectExternalStreams?(this._logger.debug("Redirect stream started"),Q.Http.jsonp(t.media.contentUrl,(function(e,r){t.media.contentUrl=i.options.redirectExternalStreamsHandler(e,r),n._logger.debug("Redirect stream ended",t.media.contentUrl),a(t)}))):a(t)},t._setMediaInfo=function(e,t){e.media.contentId=e.media.contentId||t.id,e.media.contentUrl=e.media.contentUrl||t.url,e.media.contentType=e.media.contentType||t.mimetype,e.media.streamType=this._player.isLive()?cast.framework.messages.StreamType.LIVE:cast.framework.messages.StreamType.BUFFERED,e.media.metadata=e.media.metadata||new cast.framework.messages.GenericMediaMetadata,e.media.metadata.title=e.media.metadata.title||this._player.config.sources.metadata.name,e.media.metadata.subtitle=e.media.metadata.subtitle||this._player.config.sources.metadata.description,e.media.metadata.images=e.media.metadata.images||[{url:this._player.config.sources.poster}],e.media.hlsSegmentFormat=e.media.hlsSegmentFormat||cast.framework.messages.HlsSegmentFormat.TS,this._logger.debug("Media info has been set",e)},t._handleAutoPlay=function(e){e.autoplay||(this._shouldAutoPlay=!1,e.autoplay=!0)},t._handleLiveDvr=function(e){this._player.isDvr()?(-1===e.currentTime&&(delete e.currentTime,this._logger.debug("Live DVR will seek to live edge")),this._playerManager.removeSupportedMediaCommands(cast.framework.messages.Command.SEEK)):this._player.isLive()||this._playerManager.addSupportedMediaCommands(cast.framework.messages.Command.SEEK)},t._maybeSetDrmLicenseUrl=function(e){var t=this;if(e.drmData){var a=e.drmData.find((function(e){return e.scheme===W.WIDEVINE}));a&&this._playerManager.setMediaPlaybackInfoHandler((function(e,n){return n.protectionSystem=cast.framework.ContentProtection.WIDEVINE,n.licenseUrl=a.licenseUrl,t._logger.debug("Set drm license url",n),n}))}},t._onPlayEvent=function(){this._logger.debug("Play event",{firstPlay:this._firstPlay}),this._firstPlay&&(this._shouldAutoPlay?this._player.play():this._playerManager.pause(),this._firstPlay=!1)},t._onRequestPlayEvent=function(){this._logger.debug("Request play event"),this._player.play()},t._onRequestPauseEvent=function(){this._logger.debug("Request pause event"),this._player.pause()},t._onPlayerLoadCompleteEvent=function(){var e=this,t=function(){e._player.load(),e._player.ready().then((function(){return e._tracksManager.setInitialTracks()}))};this._logger.debug("Player load complete"),this._adsManager.adBreak()?this._eventManager.listenOnce(this._player,this._player.Event.AD_BREAK_END,(function(){e._eventManager.listenOnce(e._player,e._player.Event.PLAYING,t)})):t()},t._onSystemVolumeChangedEvent=function(e){var t=e.data;this._player.volume!==t.level&&(this._player.volume=t.level),this._player.muted!==t.muted&&(this._player.muted=t.muted)},t._onCustomMessage=function(e){var t=e.data;switch(this._logger.debug("Custom message received",t),t.type){case J.ACTION:this._handleCustomAction(t)}},t._handleCustomAction=function(e){switch(e.action){case z.SKIP_AD:this._adsManager.skipAd()}},t._maybeCreateVmapAdsRequest=function(e){e.customData&&e.customData.vmapAdsRequest&&(e.vmapAdsRequest=e.customData.vmapAdsRequest)},t._maybeReplaceAdTagTimestamp=function(e){var t=function(e){if(e&&a.test(e)){var t=e.match(a);return e.replace(t[1],Date.now())}return e},a=/correlator=(\[timestamp\])/;e.breakClips&&e.breakClips.forEach((function(e){e.vastAdsRequest&&e.vastAdsRequest.adTagUrl&&(e.vastAdsRequest.adTagUrl=t(e.vastAdsRequest.adTagUrl))}));e.vmapAdsRequest&&(e.vmapAdsRequest.adTagUrl=t(e.vmapAdsRequest.adTagUrl))},e}(),ee=function(){function e(e){F=new $(e)}var t=e.prototype;return t.start=function(e){void 0===e&&(e={}),F.start(e)},t.onLoad=function(e){return F.onLoad(e)},t.addEventListener=function(e,t){F.getPlayer().addEventListener(e,t)},t.removeEventListener=function(e,t){F.getPlayer().removeEventListener(e,t)},e}(),te="1.0.1",ae="@playkit-js/playkit-js-cast-receiver"}]);
//# sourceMappingURL=playkit-cast-receiver.js.map