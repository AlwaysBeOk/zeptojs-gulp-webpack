/**
 * Created by zhangshuang on 2017/5/3.
 * 钉钉导航栏文档：https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.WxzRR5&treeId=171&articleId=104928&docType=1
 * url，请在url后拼接：?dd_nav_bgcolor=FF38ACFF // 设置导航栏背景颜色及文字颜色
 *
 */
require('../common/styles/reset.css');
require('./style.css');
require('../common/scripts/dingtalk');
const currentWelfareTemplate = require('./current-welfare.tpl.html'); // 本月福利template
const gettedWelfareTemplate = require('./getted-welfare.tpl.html'); // 已领福利template
const $ = require('zepto');
const dot = require('dot/doT');
const FastClick = require('../common/scripts/fastclick.min');
FastClick.attach(document.body);

// dingding
const pageTitle = document.title; // 本页面表态，从index.html文件中获取。
const ddNavigatorColorUrl = '?dd_nav_bgcolor=FF38ACFF'; // 钉钉webview中的navigator样式，需要在url中拼接上
dd.ready(function () { // 钉钉
  dd.biz.navigation.setTitle({ // 设置页面标题
    title: pageTitle
  });
  dd.biz.navigation.setIcon({ // 设置页面标题 问号Icon
    showIcon: true,
    iconIndex: 1,
    onSuccess: function (result) {
      window.location.href = '/payrolls/help-center/index.html' + ddNavigatorColorUrl;
    },
    onFail: function (err) {
      alert(err);
    }
  });
  dd.biz.navigation.setRight({ // 设置页面右侧导航
    show: true,
    control: true,
    text: '历史福利',
    onSuccess: function (result) {
      window.location.href = '/payrolls/my-welfare-history/index.html' + ddNavigatorColorUrl + '&type=1';
    },
    onFail: function (err) {
      alert(err);
    }
  });
  dd.biz.navigation.setLeft({ // 设置左侧后退按钮
    show: true,
    showIcon: true,
    control: true,
    text: ' ',
    onSuccess: function (result) {
      dd.biz.navigation.close();
    },
    onFail: function (err) {
      alert(err);
    }
  });
  dd.ui.pullToRefresh.enable({ // 下拉刷新
    onSuccess: function() {
      myWelfareObj.init();
    }
  });
});


let myWelfareObj = {
  currentWelfareUrl: 'http://rapapi.org/mockjsdata/18747/currentWelfareList',
  gettedWelfareUrl: 'http://rapapi.org/mockjsdata/18747/gettedWelfareData',

  init: function () {
    this.getCurrentWelfare();
    this.getGettedWelfare();
  },

  getCurrentWelfare: function () { // 获取当前福利
    const _this = this;
    $.ajax({
      url: this.currentWelfareUrl,
      type: 'GET',
      success: function (data) {
        dd.ui.pullToRefresh.stop(); // 停止下拉刷新
        const currentWelfare = dot.template(currentWelfareTemplate);
        const currentWelfareContent = currentWelfare(data[0].data);
        $('#welfare_current').html(currentWelfareContent);

        $('#welfare_current .welfare_card').on('click', function () {
          window.location.href = '/payrolls/my-welfare-info/index.html' + ddNavigatorColorUrl + '&type=1';
        });
      }
    });
  },

  getGettedWelfare: function () { // 获取已领取福利
    $.ajax({
      url: this.gettedWelfareUrl,
      type: 'GET',
      success: function (data) {
        const gettedWelfare = dot.template(gettedWelfareTemplate);
        const gettedWelfareContent = gettedWelfare(data[0].data);
        $('#welfare_getted').html(gettedWelfareContent);

        $('#welfare_getted .welfare_card').on('click', function () {
          window.location.href = '/payrolls/my-welfare-info/index.html' + ddNavigatorColorUrl + '&type=2';
        });
      }
    });
  }

};
myWelfareObj.init();
