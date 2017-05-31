import { getQueryParameters } from './utils';

let params = getQueryParameters();
let utmSource = params.utm_source || '';
let utmMedium = params.utm_medium || '';
let utmCampaign = params.utm_campaign || '';

/*eslint-disable */
// GA统计代码
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
/*eslint-enable */

window.ga('create', 'UA-28784835-3', 'auto');
window.ga('send', 'pageview', location.pathname);

// 棱镜统计
(function (w, d, tag, src, namespace) {
  w._to = {
    _fnCacheList: [],
    bizScenario: `${utmSource}^${utmMedium}^${utmCampaign}`,
    server: 'https://analyse.tianhongjijin.com.cn/loggw/webLog.do'
  };
  let fnList = ['click', 'calc', 'log', 'logPv', 'err', 'pushWindow', 'expo', 'step'];
  w[namespace] = {};
  for (let i = 0; i < fnList.length; i++) {
    let fn = fnList[i];
    (function(fn){
      w[namespace][fn] = function() {
        let args = arguments;
        w._to._fnCacheList.push(function() {
          (function(fn, args){
            setTimeout(function() {
              w[namespace][fn].apply(w[namespace], args);
            }, 1000);
          })(fn, args);
        });
      };
    })(fn);
  }
  let el = d.createElement(tag);
  let s = d.getElementsByTagName(tag)[0];
  el.async = 1;
  el.src = src;
  s.parentNode.insertBefore(el, s);
})(window, document, 'script', '//a.alipayobjects.com/g/animajs/mtracker/3.1.1/mtracker-mdap.js', 'Tracker');


/**
 * 发送事件统计
 * @param category
 * @param [action]
 * @param [label]
 * @param [value]
 * @param {Boolean} [nonInteraction] 是否为用户交互事件
 */
export function sendEvent(category, action, label, value, nonInteraction) {
  action = action || 'click';
  label = label || '';
  value = value || 0;
  nonInteraction = nonInteraction || false;
  window.ga('send', 'event', category, action, label, value, {
    nonInteraction: nonInteraction
  });
  window.Tracker.click(category, {
    label: label,
    value: value,
    nonInteraction: nonInteraction
  });
}


export function sendTiming(category, timingVar, value) {
  try {
    if (value == undefined) {
      value = Math.floor(window.performance.now());
    }
    window.ga('send', 'timing', category, timingVar, value);
  } catch (e) {
    // ignore
  }
}


export function sendException(exDescription, exFatal) {
  window.ga('send', 'exception', {
    exDescription: exDescription,
    exFatal: exFatal
  });
}
