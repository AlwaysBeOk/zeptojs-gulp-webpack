/**
 * Created by cloverzero on 2016/12/12.
 */
const $ = require('zepto');
const ed = require('./environment_detection');

import { getQueryParameters } from './utils';

let params = getQueryParameters();
let downloadUrl = 'http://app.thfund.com.cn/thapp/wangneng.html?ckey=';
if (params.sp === '1') {
  downloadUrl = 'http://app.thfund.com.cn/thapp/wangneng-sp.html?ckey=';
}
downloadUrl += params.utm_source;

function openApp() {
  if (params.d === '1') {
    location.href = downloadUrl;
  } else if (ed.Android) {
    openAppInAndroid();
  } else if (ed.iOS) {
    openAppInIOS();
  }
}

function openAppInIOS() {
  location.href = 'com.thfund.thfundclient://';
  goToAppStore();
}

function openAppInAndroid() {
  location.href = 'ailicai://www.thfund.com.cn';
  goToAppStore();
}

let timeoutId;
function goToAppStore() {
  let timeout = 4000;
  let start = new Date().getTime();
  timeoutId = setTimeout(function () {
    let end = new Date().getTime();
    if ((end - start) < (timeout + 100)) {
      location.href = downloadUrl;
    }
  }, timeout);
}

$(window).on('pagehide', function () {
  clearTimeout(timeoutId);
});

$(document).on('visibilitychange webkitvisibilitychange', function() {
  let tag = document.hidden || document.webkitHidden;
  if (tag) {
    clearTimeout(timeoutId);
  }
});

exports.openApp = openApp;
