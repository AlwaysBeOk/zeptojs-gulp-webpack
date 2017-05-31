/**
 * Created by zhangshuang on 2017/5/4.
 */
import '../common/styles/reset.css';
import './style.css';
const $ = require('zepto');
const dot = require('dot/doT');
require('../common/scripts/dingtalk');
const myWelfareHistoryTemplate = require('./my-welfare-history.tpl.html');
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
    }
  });
  dd.biz.navigation.setRight({ // 设置页面右侧导航
    show: false,
    control: false,
  });
  dd.biz.navigation.setLeft({
    show: true,
    showIcon: true,
    control: true,
    text: ' ',
    onSuccess: function (result) {
      window.history.go(-1);
    }
  });
  dd.ui.pullToRefresh.enable({
    onSuccess: function () {
      myWelfareHistoryObj.init();
    }
  })
});

let myWelfareHistoryObj = {
  welfareHistoryUrl: 'http://rapapi.org/mockjsdata/18747/gettedWelfareData',
  init: function () {
    this.getWelfareHistory();
  },
  getWelfareHistory: function () {
    const _this = this;
    $.ajax({
      url: _this.welfareHistoryUrl,
      type: "GET",
      success: function (data) {
        dd.ui.pullToRefresh.stop();
        const myWelfareHistory = dot.template(myWelfareHistoryTemplate);
        const myWelfareHistoryContent = myWelfareHistory(data[0].data);
        $('#historyWelfare').html(myWelfareHistoryContent);

        $('#historyWelfare div').on('click', function () {
          console.log($(this).index());
          window.location.href = '/payrolls/my-welfare-info/index.html' + ddNavigatorColorUrl + '&type=3';
        });
      }
    });
  }
};

myWelfareHistoryObj.init();
