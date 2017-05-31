const $ = require('zepto');
/*eslint-disable */
function initWebViewBridge() {
  if (window.WebViewJavascriptBridge) { return }
  var messagingIframe;
  var sendMessageQueue = [];
  var receiveMessageQueue = [];
  var messageHandlers = {};

  var CUSTOM_PROTOCOL_SCHEME = 'wvjbscheme';
  var QUEUE_HAS_MESSAGE = '__WVJB_QUEUE_MESSAGE__';

  var responseCallbacks = {};
  var uniqueId = 1;

  function _createQueueReadyIframe(doc) {
    messagingIframe = doc.createElement('iframe');
    messagingIframe.style.display = 'none';
    messagingIframe.src = CUSTOM_PROTOCOL_SCHEME + '://' + QUEUE_HAS_MESSAGE;
    doc.documentElement.appendChild(messagingIframe);
  }

  function init(messageHandler) {
    if (WebViewJavascriptBridge._messageHandler) { throw new Error('WebViewJavascriptBridge.init called twice') }
    WebViewJavascriptBridge._messageHandler = messageHandler;
    var receivedMessages = receiveMessageQueue;
    receiveMessageQueue = null;
    for (var i=0; i<receivedMessages.length; i++) {
      _dispatchMessageFromObjC(receivedMessages[i])
    }
  }

  function send(data, responseCallback) {
    _doSend({ data:data }, responseCallback)
  }

  function registerHandler(handlerName, handler) {
    messageHandlers[handlerName] = handler
  }

  function callHandler(handlerName, data, responseCallback) {
    _doSend({ handlerName:handlerName, data:data }, responseCallback)
  }

  function _doSend(message, responseCallback) {
    if (responseCallback) {
      var callbackId = 'cb_'+(uniqueId++)+'_'+new Date().getTime();
      responseCallbacks[callbackId] = responseCallback;
      message['callbackId'] = callbackId;
    }
    sendMessageQueue.push(message);
    messagingIframe.src = CUSTOM_PROTOCOL_SCHEME + '://' + QUEUE_HAS_MESSAGE
  }

  function _fetchQueue() {
    var messageQueueString = JSON.stringify(sendMessageQueue);
    sendMessageQueue = [];
    return messageQueueString;
  }

  function _dispatchMessageFromObjC(messageJSON) {
    setTimeout(function _timeoutDispatchMessageFromObjC() {
      var message = JSON.parse(messageJSON);
      var messageHandler;
      var responseCallback;

      if (message.responseId) {
        responseCallback = responseCallbacks[message.responseId];
        if (!responseCallback) { return; }
        responseCallback(message.responseData);
        delete responseCallbacks[message.responseId]
      } else {
        if (message.callbackId) {
          var callbackResponseId = message.callbackId;
          responseCallback = function(responseData) {
            _doSend({ responseId:callbackResponseId, responseData:responseData })
          }
        }

        var handler = WebViewJavascriptBridge._messageHandler;
        if (message.handlerName) {
          handler = messageHandlers[message.handlerName]
        }

        try {
          handler(message.data, responseCallback)
        } catch(exception) {
          if (typeof console != 'undefined') {
            console.log("WebViewJavascriptBridge: WARNING: javascript handler threw.", message, exception)
          }
        }
      }
    })
  }

  function _handleMessageFromObjC(messageJSON) {
    if (receiveMessageQueue) {
      receiveMessageQueue.push(messageJSON)
    } else {
      _dispatchMessageFromObjC(messageJSON)
    }
  }

  window.WebViewJavascriptBridge = {
    init: init,
    send: send,
    registerHandler: registerHandler,
    callHandler: callHandler,
    _fetchQueue: _fetchQueue,
    _handleMessageFromObjC: _handleMessageFromObjC
  };

  var doc = document;
  _createQueueReadyIframe(doc);
  var readyEvent = doc.createEvent('Events');
  readyEvent.initEvent('WebViewJavascriptBridgeReady');
  readyEvent.bridge = WebViewJavascriptBridge;
  doc.dispatchEvent(readyEvent);
}


let thJs = (function(){
  var DeviceInfos=DeviceInfos || (function(){
    var sUserAgent = navigator.userAgent.toLowerCase();
    return{
      isIpad : sUserAgent.match(/ipad/i) == "ipad"
      ,isIphoneOs : sUserAgent.match(/iphone os/i) == "iphone os"
      ,isAndroid : sUserAgent.match(/android/i) == "android"
      ,isWeiXin : sUserAgent.match(/micromessenger/i) == "micromessenger"
      ,isWeiBo: sUserAgent.match(/weibo/i) == "weibo"
    };
  })();

  if (DeviceInfos.isIpad || DeviceInfos.isIphoneOs) {
    initWebViewBridge();
  }

  function _setupBridge(callback){
    if (window.WebViewJavascriptBridge) { return callback(window.WebViewJavascriptBridge); }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
  }

  function _callNative(jsMethod,params){
    if(DeviceInfos.isIpad||DeviceInfos.isIphoneOs){
      _setupBridge(function(bridge){
        bridge.callHandler(jsMethod, params, function(response) {
          params.callback && params.callback(response);
          // console.log(response);
        });
      });

      /* window.WebViewJavascriptBridge && WebViewJavascriptBridge.callHandler(jsMethod, params, function(response) {
       params.callback && params.callback(response);
       console.log(response);
       });*/
    }else if(DeviceInfos.isAndroid && window.thfund && window.thfund[jsMethod]){
      if(jsMethod=='openfundnextpage'){
        window.thfund[jsMethod](params.title,params.url,params.showfooterview,params.isNeedSecret,params.fundCode,null,null);
      }else{
        window.thfund[jsMethod](JSON.stringify(params));
      }
    }

  }

  /**
   *  原生
   */
  function g_openNativeView(params){
    var _params =  {
      iOSClassName:"THPensionPlanWelcomeViewController",
      androidClassName:"THTopicListViewController",
      bundleId:"",
      title:"",
      topicIsSecret:false,
      type:1,
      parameter: []
    };

    $.extend(true,_params,params);
    _callNative('g_openNativeView',_params);
  }

  /**
   * 分享
   *
   */
  var _jsCallShareCb=null;
  function g_jsCallShare(params){
    var _params =  {
      url:null,
      imgURL:null,
      imgName:null,
      isNeedSecret:false,
      isNeedSecretOpenId:false,
      isRedirect:false
    };

    _jsCallShareCb = params && params.callback;
    $.extend(true,_params,params);
    _params.callback = !!_params.callback;
    _callNative('g_jsCallShare',_params);
  }

  /**
   * 设置分享内容
   */
  function g_jsGiveNativeShareContent(params){
    var _params={ title: "", desc: "", link:"", imgUrl: "" };
    $.extend(true,_params,params);
    _callNative('jsGiveNativeShareContent',_params);
  }

  /**
   *
   *阿里快登
   */
  function g_jsLoginAL(params){
    var _params={
      isNeedSecret: true,
      authentication:false  //是否鉴权
    };
    $.extend(true,_params,params);
    _callNative('g_jsLoginAL',_params);
  }

  /**
   *
   *判断是否已经登录
   */
  var _isLoginInCb=null;
  function g_jsisLogin(params){
    var _params={callback:function(){}};
    $.extend(true,_params,params);
    _isLoginInCb=_params.callback;

    if(params.authentication){
      _callNative('g_jsisLoginAndisAuth',_params);
    }else{
      _callNative('g_jsisLogin',_params);
    }
  }

  /**
   * js调用app 上传图片
   * params {type:[1:摄像头,2:相册,0:app控制],callback:回调函数}
   */
  var _uploladCb=null;
  function  g_jsCallUploadImg(params){
    var _params={
      callback:function(){
        //ignore
      },
      type:0
    };
    $.extend(true,_params,params);
    _uploladCb=_params.callback;
    _callNative('g_jsCallUploadImg',_params);
  }
  /**
   * 绑卡
   */
  function g_tiedCard(params){
    var _params=$.extend(true,{},params);
    _callNative('g_tiedCard',_params);
  }


  /**
   *基金详情显示购买按钮
   */
  function _ShowBuyButton(params){
    var _params = params || false;
    _callNative('ShowBuyButton',_params);
  }
  /**
   * 打开下一视图
   */
  function g_openPage(params){
    var _params={
      title:'',
      url:'',
      showfooterview:0,
      isNeedSecret:false,
      fundCode:''
    };
    $.extend(true,_params,params);
    _callNative('openfundnextpage',_params);
  }

  /**
   * 调用聚安全
   */

  var _uploadJaqToken=null;
  function  g_jsCallJaqToken(params){
    _uploadJaqToken=params.callback;

    _callNative('g_jsCallJaqToken',params);
  }

  /**
   *  js调用登陆接口
   */
  var _loginInCb=null;
  function g_jsLoginIn(params){
    _loginInCb=params.callback; //isNeedSecret 默认为false
    _callNative('g_jsLoginIn',params);
  }

  /**
   * 外部登陆接口
   */
  var _externalLoginInCb=null;
  function g_externalLoginIn(params){
    _externalLoginInCb=params.callback;
    _callNative('g_externalLoginIn',params);
  }
  /**
   * 风险评测js调用客户端
   */
  function g_riskSubmitSuccessCb(params){
    var _params={score:0,riskType:''};
    $.extend(true,_params,params);
    _callNative('g_riskSubmitSuccessCb',_params);
  }

  /**
   *  是否为爱理财App登陆
   */
  var _isAilicaiAppCb=null;
  function g_isAilicaiApp(params){
    _isAilicaiAppCb=params && params.callback;
    _callNative('g_isAilicaiApp',params);
  }
  //获取app版本信息
  var _appBundleIdentifierName=null;
  function g_appBundleIdentifierName(params){
    _appBundleIdentifierName=params && params.callback;
    _callNative('g_appBundleIdentifierName',params);
  }
//获取用户选项卡是否开通2.6.0
  var _userOpenCardCb=null;
  function g_userOpenCard(params){
    _userOpenCardCb = params && params.callback;
    _callNative('g_userOpenCard',params);
  }
//签约余额宝 2.6.0
  var _signYebCb=null;
  function g_signYeb(params){
    _signYebCb = params && params.callback;
    _callNative('g_signYeb',params);
  }

  //告知原生，跳回此页面时需要刷新页面数据 2.6.3
  var _refreshDataCb=null;
  function g_needRefreshData(params){
    _refreshDataCb = params && params.callback;
    _callNative('g_needRefreshData',params);
  }

  /**
   * app调用H5通用接口
   *
   */
  var _shareInfo={};
  function g_appCallJs(){
    return {
      getShareInfo:function(){
        if(DeviceInfos.isAndroid){
          return g_jsGiveNativeShareContent(_shareInfo);
        }
        return _shareInfo;
      },
      setShareInfo:function(info){
        $.extend(true,_shareInfo,info);
      },
      //客户端g_jsCallUploadImg 回调类
      _uploadImgCb:function(url){
        _uploladCb &&_uploladCb(url);
      },
      _isLoginInCb:function(userId){
        var isLogin=false;
        if(userId){
          isLogin=true;
        }
        _isLoginInCb && _isLoginInCb(isLogin);
      },
      _uploadJaqToken:function(token,deviceType,deviceIp,userId){
        _uploadJaqToken && _uploadJaqToken(token,deviceType,deviceIp,userId);
      },
      _loginInCb:function(deviceId,loginType,secret){
        _loginInCb && _loginInCb(deviceId,loginType,secret);
      },
      _isAilicaiAppCb:function(status){
        _isAilicaiAppCb && _isAilicaiAppCb(status);
      },
      _jsCallShareCb:function(flag){
        _jsCallShareCb && _jsCallShareCb(flag);
      },
      _appBundleIdentifierNameCb:function(appVersion){
        _appBundleIdentifierName && _appBundleIdentifierName(appVersion);
      },
      _externalLoginInCb:function(deviceId,loginType,secret,appUserId,nickName,head){
        _externalLoginInCb && _externalLoginInCb(deviceId,loginType,secret,appUserId,nickName,head);
      },
      _userOpenCardCb:function(isHaveYeb,isSignYeb){
        _userOpenCardCb && _userOpenCardCb({isHaveYeb:isHaveYeb,isSignYeb:isSignYeb});
      },
      _signYebCb:function(isSignSuccess){
        _signYebCb && _signYebCb(isSignSuccess);
      },
      _refreshDataCb:function(){
        _refreshDataCb && _refreshDataCb();
      }
    };
  }

  if(DeviceInfos.isIpad||DeviceInfos.isIphoneOs){
    document.addEventListener('WebViewJavascriptBridgeReady', function() {

      window.WebViewJavascriptBridge.init(function(message, responseCallback) {
        var data = { 'Javascript Responds':'Hello!' };
        responseCallback(data);
      });
      /*var cbs=[{name:'thAppCall_uploadImgCb',cb:'_uploladCb',comment:'url'},
       {name:'thAppCall_isLoginInCb',cb:'_isLoginInCb',comment:'userId'},
       {name:'thAppCall_loginInCb',cb:'_loginInCb',comment:'deviceId,secret'},
       {name:'thAppCall_isAilicaiAppCb',cb:'_isAilicaiAppCb',comment:'status'},
       {name:'thAppCall_jsCallShareCb',cb:'_jsCallShareCb',comment:'flag'}
       ];*/
      _setupBridge(function(birdge){

        birdge.registerHandler('thAppCall_uploadImgCb', function(url) {
          _uploladCb &&_uploladCb(url);
        });
        birdge.registerHandler('thAppCall_isLoginInCb', function(userId) {
          g_appCallJs()._isLoginInCb(userId);
        });
        birdge.registerHandler('thAppCall_loginInCb', function(obj) {
          //deviceId,loginType,secret
          g_appCallJs()._loginInCb(obj.deviceId,obj.loginType,obj.secret);
        });
        birdge.registerHandler('thAppCall_isAilicaiAppCb', function(status) {
          g_appCallJs()._isAilicaiAppCb(status);
        });
        birdge.registerHandler('thAppCall_jsCallShareCb', function(flag) {
          g_appCallJs()._jsCallShareCb(flag);
        });
        birdge.registerHandler('thAppCall_appBundleIdentifierNameCb', function(appVersion) {
          g_appCallJs()._appBundleIdentifierNameCb(appVersion);
        });
        birdge.registerHandler('thAppCall_getShareInfo', function(data, responseCallback) {
          responseCallback(g_appCallJs().getShareInfo());
        });

        birdge.registerHandler('thAppCall_externalLoginCb', function(obj) {
          g_appCallJs()._externalLoginInCb(obj.deviceId,obj.loginType,obj.secret,obj.appUserId,obj.nickName,obj.head);
        });

        birdge.registerHandler('thAppCall_userOpenCardCb', function(obj) {
          g_appCallJs()._userOpenCardCb(obj.isOpenYeb,obj.isSignYeb);
        });
        birdge.registerHandler('thAppCall_signYebCb', function(obj) {
          g_appCallJs()._signYebCb(obj);
        });
        birdge.registerHandler('thAppCall_refreshDataCb', function() {
          g_appCallJs()._refreshDataCb();
        });
      });

    },false);
  }

  return {
    openNativeView:g_openNativeView
    ,jsCallShare:g_jsCallShare
    ,jsLoginAL:g_jsLoginAL
    ,showBuyButton:_ShowBuyButton
    ,appCallJs:g_appCallJs()
    ,jsGiveNativeShareContent:g_jsGiveNativeShareContent
    ,jsCallUploadImg:g_jsCallUploadImg
    ,tiedCard:g_tiedCard
    ,isLogin:g_jsisLogin
    ,openPage:g_openPage
    ,jsCallJaqToken:g_jsCallJaqToken
    ,loginIn:g_jsLoginIn
    ,isAlicaiApp:g_isAilicaiApp
    ,getAppIdentifier:g_appBundleIdentifierName
    ,externalLoginIn:g_externalLoginIn
    ,riskSubmitSuccess:g_riskSubmitSuccessCb
    ,getUserRegisterCard:g_userOpenCard
    ,signYeb:g_signYeb
    ,needRefreshData:g_needRefreshData
  };
})();

thJs.initWebViewBridge = initWebViewBridge;
window['thJs'] = thJs;

module.exports = thJs;
/*eslint-enable */






