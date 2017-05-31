/**
 * Created by cloverzero on 2016/12/16.
 */
const domainConfig = require('domainConfig');
const $ = require('zepto');

function getTicket(url, callback) {
  url = url || location.href;
  $.ajax({
    url: domainConfig.face2face + '/th/jsonp/CreateJsapiSignature',
    data: {
      url: encodeURI(url)
    },
    dataType: "jsonp",
    success: function (data) {
      if (data.retCode === 0) {
        callback(data.payload);
      }
    }
  });
}

function initWxConfig(options) {
  window.wx.config({
    appId: options.appid,
    timestamp: options.timestamp,
    nonceStr: options.noncestr,
    signature: options.signature,
    jsApiList: [
      'checkJsApi',
      'onMenuShareTimeline',
      'onMenuShareAppMessage'
    ]
  });
}

exports.init = function (options) {
  options = options || {};
  getTicket(options.url, initWxConfig);
};

exports.configShareInfo = function (info, onSuccess, onCancel) {
  window.wx.ready(function () {
    window.wx.onMenuShareTimeline({
      title: info.title,
      desc: info.desc,
      link: info.link,
      imgUrl: info.imgUrl,
      success: function () {
        if (onSuccess) {
          onSuccess();
        }
      },
      cancel: function () {
        if (onCancel) {
          onCancel();
        }
      }
    });

    window.wx.onMenuShareAppMessage({
      desc: info.desc,
      title: info.title,
      link: info.link,
      imgUrl: info.imgUrl,
      success: function () {
        if (onSuccess) {
          onSuccess();
        }
      },
      cancel: function () {
        if (onCancel) {
          onCancel();
        }
      }
    });
  });

};
