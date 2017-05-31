import './toast.css';

import * as $ from 'zepto';

const $toast = $('<div class="i-toast"></div>');
let inited = false;

let timeoutId = null;

export function show(content, timeout) {
  timeout = timeout || 3000;
  if (!inited) {
    $toast.appendTo('body');
  }
  $toast.text(content).show();
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(function () {
    $toast.hide();
  }, timeout);
}
