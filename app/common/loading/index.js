require('./loading.css');

const $ = require('zepto');

const $spinners = $(".i-spinner");

export function show() {
  $spinners.show();
}

export function hide() {
  $spinners.hide();
}

