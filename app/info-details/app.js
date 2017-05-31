/**
 * Created by pangguitao on 2017/3/31.
 */
require('../common/styles/reset.css');
require('./style.css');

require('../common/scripts/dingtalk');
const $ = require('zepto');

dd.biz.navigation.setTitle({
  title : '详情',//控制标题文本，空字符串表示显示默认文本
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

