/**
 * Created by zhangshuang on 2017/5/4.
 */
import '../common/styles/reset.css';
import './style.css';
const utils = require('../common/scripts/utils');
const welfareInfoTemplate = require('./my-welfare-info.tpl.html');
require('../common/scripts/dingtalk');
const $ = require('zepto');
const dot = require('dot/doT');
const FastClick = require('../common/scripts/fastclick.min');
FastClick.attach(document.body);
const ddNavigatorColorUrl = '?dd_nav_bgcolor=FF38ACFF'; // 钉钉webview中的navigator样式，需要在url中拼接上

// dingding
const pageTitle = document.title; // 本页面表态，从index.html文件中获取。
dd.ready(function () { // 钉钉
  dd.biz.navigation.setTitle({ // 设置页面标题
    title: pageTitle
  });
  dd.biz.navigation.setIcon({ // 设置页面标题 问号Icon
    showIcon: false,
  });
  dd.biz.navigation.setRight({ // 设置页面右侧导航
    show: false,
    control: false
  });
  dd.biz.navigation.setLeft({ // 设置左侧后退按钮
    show: true,
    showIcon: true,
    control: true,
    text: ' ',
    onSuccess: function (result) {
      window.history.go(-1);
    },
    onFail: function (err) {
      alert(err);
    }
  });
  dd.ui.pullToRefresh.disable(); // 禁止下拉刷新
  // dd.ui.progressBar.setColors({
  //   colors: ['#ffff00','#ff0000'], //array[number] 进度条变化颜色，最多支持4个颜色
  //   onSuccess: function(data) {
  //     /*
  //      true:成功  false:失败
  //      */
  //   },
  //   onFail: function() {
  //   }
  // });
});

// 本页面功能
let myWelfareInfoObj = {

  welfareInfoUrl : 'http://rapapi.org/mockjsdata/18747/getWelfareInfo',
  CDKeyUrl : 'http://rapapi.org/mockjsdata/18747/getCDKey',

  init: function () {
    this.getWelfareInfo();
  },

  getWelfareInfo: function () { // 获取福利详情，并渲染到页面中
    const _this = this;
    $.ajax({
      url: _this.welfareInfoUrl,
      type: "GET",
      success: function (data) {
        const welfareInfo = dot.template(welfareInfoTemplate);
        const welfareInfoContent = welfareInfo(data);
        $('#welfareInfoContent').html(welfareInfoContent);
        _this.getShowType();
        _this.goHelpCenter();
      }
    });
  },

  getShowType: function () { // 获取应该显示什么样的状态
    const parameter = utils.getQueryParameters(window.location.search);
    if(parameter.type === '1') {
      this.clickShowCDKey();
      $('#getCDKeyWrapper').show();
      $('#getCDKeyWrapper').siblings('div').hide();
    }else if(parameter.type === '2') { // 如果type为2，则获取CDKey
      this.getCDKey();
      $('#CDKeyWrapper').show();
      $('#CDKeyWrapper').siblings('div').hide();
    }else if(parameter.type === '3') {
      $('#welfarePast').show();
      $('#welfarePast').siblings('div').hide();
    }
  },

  getCDKey: function () {
    $.ajax({
      url: this.CDKeyUrl,
      type: "GET",
      success: function (data) {
        const code = data.code;
        $('#getCDKeyWrapper').hide();
        $('#CDKeyWrapper .CDKey').html(code);
        $('#CDKeyWrapper').show();
        // $('#CDKeyWrapper .CDKey').on('click', function () {
        //   dd.biz.clipboardData.setData({
        //     text: code,
        //     onSuccess: function () {
        //       dd.device.notification.toast({
        //         icon: '', //icon样式，有success和error，默认为空 0.0.2
        //         text: '复制成功', //提示信息
        //         duration: 2, //显示持续时间，单位秒，默认按系统规范[android只有两种(<=2s >2s)]
        //         delay: 0, //延迟显示，单位秒，默认0
        //         onSuccess : function(result) {
        //           /*{}*/
        //         },
        //         onFail : function(err) {}
        //       });
        //     }
        //   });
        // });
      }
    });
  },

  clickShowCDKey: function () { // 点击 立即领取 显示CDKey
    const _this = this;
    $('#getCDKeyWrapper').on('click', function () {
      _this.getCDKey();
    });
  },

  goHelpCenter: function () {
    $('.welfare-question a').on('click', function () {
      window.location.href = '/payrolls/help-center/index.html' + ddNavigatorColorUrl;
    });
  }

};
myWelfareInfoObj.init();
