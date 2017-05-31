/**
 * Created by pangguitao on 2017/3/27.
 */
require('../common/styles/reset.css');
require('./style.css');

require('../common/scripts/dingtalk');
const $ = require('zepto');
const dot = require('dot/doT');
//工资条模板
const payrollsTemlpate = require('./payrolls-list.tpl.html');
//模拟数据
let templateData = {'array':[
  {'time':'2017-01-10','year':'2017','month':'1','money':'10000.50'},
  {'time':'2017-02-10','year':'2017','month':'2','money':'20000.50'},
  {'time':'2017-03-10','year':'2017','month':'3','money':'30000.50'},
  {'time':'2017-04-10','year':'2017','month':'4','money':'40000.50'}
]}
const payrollsList = dot.template(payrollsTemlpate);
const payrollsItemContent = payrollsList(templateData);
dd.biz.navigation.setTitle({
  title : '薪资历史',//控制标题文本，空字符串表示显示默认文本
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

$('#payrolls-list').html(payrollsItemContent);






