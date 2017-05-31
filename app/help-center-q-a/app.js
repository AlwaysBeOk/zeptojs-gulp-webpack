/**
 * Created by zhangshuang on 2017/5/10.
 */
require('../common/styles/reset.css');
require('./style.css');
require('../common/scripts/dingtalk');

const $ = require('zepto');
const dot = require('dot/doT');
const utils = require('../common/scripts/utils'); // 公共方法
const pageTitle = document.title;
const ddNavigatorColorUrl = '?dd_nav_bgcolor=FF38ACFF'; // 钉钉webview中的navigator样式，需要在url中拼接上

dd.ready(function () {
  dd.biz.navigation.setTitle({
    title: pageTitle
  });
  dd.biz.navigation.setIcon({
    showIcon: false
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
  dd.biz.navigation.setRight({
    show: false
  });
  dd.ui.pullToRefresh.disable();
});

let helpCenterQAObj = {

  question: null,
  answer: null,

  init: function () {
    this.getPageData();
  },

  getPageData: function () {
    let queryStr = window.location.search;
    const parameters = utils.getQueryParameters(queryStr);
    this.question = decodeURI(parameters.question);
    this.answer = decodeURI(parameters.answer);
    this.renderPage();
  },

  renderPage: function () {
    $('.question').html(this.question);
    $('.answer').html(this.answer);
  }
};
helpCenterQAObj.init();
