/**
 * Created by pangguitao on 2017/3/27.
 */
require('../common/styles/reset.css');
require('./style.css');

require('../common/scripts/dingtalk');
const $ = require('zepto');
const dot = require('dot/doT');
//工资条模板
const payrollItemTemplate = require('./payrolls-detail.tpl.html');
const welfareItemTemplate = require('./welfare.tpl.html')
//模拟数据
var templateData = {'array':[
  {'itemName':'通讯费','sumo':'500','explain':'通讯补助本月为固定500元'},
  {'itemName':'绩效奖金','sumo':'2000','explain':'绩效奖金为你本月除该完成任务其余任务奖励'},
  {'itemName':'餐补','sumo':'600','explain':'餐补为600元'},
  {'itemName':'基本工资','sumo':'7000','explain':''}
]}
var templateData2 = {'array':[
  {'itemName':'100M通用流量券','sumo':'1'},
  {'itemName':'爱奇艺会员','sumo':'1'}
]}
const payrollItemList = dot.template(payrollItemTemplate);
const welfareItemList = dot.template(welfareItemTemplate);
const payrollItemContent = payrollItemList(templateData);
const welfareItemContent = welfareItemList(templateData2);
dd.biz.navigation.setTitle({
  title : '薪资详情',//控制标题文本，空字符串表示显示默认文本
  onSuccess : function(result) {
    /*结构
     {
     }*/
  },
  onFail : function(err) {}
});
dd.biz.navigation.setIcon({
  showIcon : true,//是否显示icon
  iconIndex : 1,//显示的iconIndex,如上图
  onSuccess : function(result) {
    /*结构
     {
     }*/
    //点击icon之后将会回调这个函数
  },
  onFail : function(err) {
    //jsapi调用失败将会回调此函数
  }
});
//盒子内填充模板
$('#payroll-items').html(payrollItemContent);
$('#welfare-items').html(welfareItemContent);
//点击眼睛图标切换图案
$('.eyes').on('click',function () {
  $('.eyes_open').toggleClass("toggle_eyes");
  $('.eyes_close').toggleClass("toggle_eyes");
  $('.money_show').toggleClass("money_hide");
  $('.asterisk_hide').toggleClass("asterisk_show");
  $('.payrolls-money').toggleClass('payrolls-money-toggle');
})
//点击问题出现提示

$('.question').on('click',function () {
  console.log(templateData.array[0].explain);
  dd.device.notification.alert({
    message: templateData.array[0].explain,
    title: templateData.array[0].itemName,//可传空
    buttonName: "知道了",
    onSuccess : function() {
      //onSuccess将在点击button之后回调
      /*回调*/
    },
    onFail : function(err) {}
  });
})
$('#confirm').on('click',function () {
  dd.device.notification.confirm({
    message: "我已查看并确认以上薪资信息",
    title: "",
    buttonLabels: ['取消', '确定'],
    onSuccess : function(result) {
      //onSuccess将在点击button之后回调
      /*
       {
       buttonIndex: 0 //被点击按钮的索引值，Number类型，从0开始
       }
       */
    },
    onFail : function(err) {}
  });
})






