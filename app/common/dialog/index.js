require('./dialog.css');

const $ = require('zepto');
const dot = require('dot/doT');

const tpl = require('./dialog.tpl.html');
const builder = dot.template(tpl);

const $body = $("body");

/**
 * Dialog
 * @param {Object} options
 * @param {String} options.title 标题
 * @param {String} options.content 内容
 * @param {Object} options.buttons 按钮数组
 * @constructor
 */
function Dialog(options) {
  const self = this;
  let domString = builder(options);
  self.$root = $(domString);

  self.$root.on('click', '.dialog-button', function () {
    let $this = $(this);
    let button = options.buttons[$this.index()];
    button.handler.call(self);
  });

  $body.append(this.$root);
}

Dialog.prototype = {
  show: function () {
    this.$root.show();
  },

  hide: function () {
    this.$root.hide();
  },

  destroy: function () {
    this.$root.remove();
  }
};

exports.Dialog = Dialog;

/**
 * 警告弹窗
 * @param {String} title 标题
 */
exports.alert = function (title) {
  let dialog = new Dialog({
    title: title,
    buttons: [
      {
        text: '确定',
        handler: function () {
          this.destroy();
        }
      }
    ]
  });
  dialog.show();
};

/**
 * 确认用弹窗
 * @param {String} title 标题
 * @param {String} content 内容
 * @param {Function} onConfirmed 点击确认的回调函数
 */
exports.confirm = function (title, content, onConfirmed) {
  let dialog = new Dialog({
    title: title,
    content: content,
    buttons: [
      {
        text: '取消',
        handler: function () {
          this.destroy();
        }
      },
      {
        text: '确定',
        handler: onConfirmed
      }
    ]
  });
  dialog.show();
};
