/**
 * Created by zhangshuang on 2017/5/10.
 */
require('../common/styles/reset.css');
require('./style.css');
require('../common/scripts/dingtalk');

const $ = require('zepto');
const dot = require('dot/doT');
const helpCenterTemplate = require('./help-center.tpl.html');
const helpCenter = dot.template(helpCenterTemplate);
const pageTitle = document.title;
const ddNavigatorColorUrl = '?dd_nav_bgcolor=FF38ACFF'; // 钉钉webview中的navigator样式，需要在url中拼接上
const FastClick = require('../common/scripts/fastclick.min');
FastClick.attach(document.body);

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

  setTimeout(function () {
    dd.biz.utils.scan({
      type: 'qrCode',
      onSuccess: function () {
        alert('扫码成功');
      }
    });
  },2000);
});

let helpCenterObj = {
  helpCenterManagerData: [
    {question: '如何给HR开通薪酬管理权限?', answer: '我了个去去去，这个要授权呀!我了个去去去，这个要授权呀!我了个去去去，这个要授权呀!'},
    {question: '如何发工资条?', answer: '我了个去去去，这个要授权呀!我了个去去去，这个要授权呀!我了个去去去，这个要授权呀!'},
    {question: '如何发免费福利?', answer: '我了个去去去，这个要授权呀!我了个去去去，这个要授权呀!我了个去去去，这个要授权呀!'},
    {question: '如何提升福利?', answer: '我了个去去去，这个要授权呀!我了个去去去，这个要授权呀!我了个去去去，这个要授权呀!'}
  ],
  helpCenterStaffData: [
    {question: '如何查看福利?', answer: '点开看!'},
    {question: '如何做一名好员工', answer: '努力工作!'},
    {question: '如何为公司创造更好的效益', answer: '努力工作，多动脑子!'},
  ],
  init: function () {
    this.handleTabSpan();
    this.renderManagerContent();
  },
  handleTabSpan: function () {
    const _this = this;
    $('.help-center-tab>span').on('click', function () {
      $(this).addClass('active').siblings('span').removeClass('active');
      if($(this).hasClass('help-center-manager')) {
        _this.renderManagerContent();
      }else {
        _this.renderStaffContent();
      }
    });
  },
  renderManagerContent: function () {
    const helpCenterContent = helpCenter(this.helpCenterManagerData);
    $('#helpCenterContentWrapper').html(helpCenterContent);
    this.jumpToInfoPage();

  },
  renderStaffContent: function () {
    const helpCenterContent = helpCenter(this.helpCenterStaffData);
    $('#helpCenterContentWrapper').html(helpCenterContent);
    this.jumpToInfoPage();
  },
  jumpToInfoPage: function () {
    $('.help-center-content-wrapper ul li').on('click', function () {
      const question = $(this).find('span').text();
      const answer = $(this).children('a').data('answer');
      window.location.href = encodeURI(`/payrolls/help-center-q-a${ddNavigatorColorUrl}&question=${question}&answer=${answer}`);
    });
  }
};

helpCenterObj.init();
