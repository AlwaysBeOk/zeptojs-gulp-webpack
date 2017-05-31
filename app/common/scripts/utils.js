/**
 * Created by cloverzero on 2016/12/12.
 */
/**
 * 将location.search转换为Object，也接受一个传递的searchString参数
 * @param {String} [str] searchString格式的字符串
 * @returns {*}
 */
export function getQueryParameters(str) {
  return (str || document.location.search).replace(/(^\?)/, '').split("&").map(function (n) {
    return n = n.split("="), this[n[0]] = n[1], this;
  }.bind({}))[0];
}

/**
 * 四舍五入
 * @param {Number} number
 * @param {Number} precision
 * @returns {number}
 */
export function round(number, precision) {
  const factor = Math.pow(10, precision);
  const tempNumber = number * factor;
  const roundedTempNumber = Math.round(tempNumber);
  return roundedTempNumber / factor;
}

/**
 *
 * @param {Date | number} date
 * @returns {string}
 */
export function dateToJSONLocal (date) {
  if (typeof date === 'number') {
    date = new Date(date);
  }
  let local = new Date(date);
  local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
}

/**
 * splice for string
 * @param {string} str
 * @param {number} index
 * @param {number} count
 * @param {string} [add]
 * @returns {string}
 */
export function spliceString(str, index, count, add) {
  if (index < 0) {
    index = str.length + index;
    if (index < 0) {
      index = 0;
    }
  }
  return str.slice(0, index) + (add || "") + str.slice(index + count);
}

/**
 * 函数节流
 * @param {function} func
 * @param {number} timeout
 * @returns {function}
 */
export function throttle(func, timeout) {
  let timeoutId;
  return function () {
    const args = arguments;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      func.apply(window, args);
    }, timeout);
  };
}
