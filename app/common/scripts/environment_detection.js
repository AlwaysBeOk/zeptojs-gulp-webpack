const userAgent = navigator.userAgent || navigator.vendor || window.opera;

const result = {
  iPad: /iPad/i.test(userAgent),
  iPhone: /iPhone/i.test(userAgent),
  Android: /Android/i.test(userAgent),
  WeiXin: /micromessenger/i.test(userAgent),
  WeiBo: /weibo/i.test(userAgent)
};

result.iOS = result.iPad || result.iPhone;

module.exports = result;
