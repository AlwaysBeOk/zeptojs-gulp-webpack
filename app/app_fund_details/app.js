require('../common/styles/reset.css');
require('./styles.css');

require('es6-promise/auto');
const $ = require('zepto');
const dot = require('dot/doT');
const CountUp = require('countup.js');
const domainConfig = require('domainConfig');

const analytics = require('../common/scripts/analytics');
const thJs = require('../common/scripts/native_bridge');
import { show as showToast } from '../common/toast';

import { getQueryParameters, dateToJSONLocal, round, spliceString, throttle} from '../common/scripts/utils';
import * as loadingSpinners from '../common/loading';

const FastClick = require('fastclick');
FastClick.attach(document.body);

const searchParams = getQueryParameters();
const fundCode = searchParams.fund;

let fundType = 0;
let thSecret = searchParams.thSecret ? searchParams.thSecret : '';
let fundInfo;
let isShowBtn = searchParams.isShowBtn;
let cardConfigId = searchParams.cardConfigId;

const $window = $(window);
const $document = $(document);

const historyListTpl = require('./historyvalue_list.tpl.html');
const historyListEngine = dot.template(historyListTpl);

const consultListTpl = require('./consult_list.tpl.html');
const consultListEngine = dot.template(consultListTpl);

const upClass = 'up-color';
const downClass = 'down-color';

function formatToPercent(value, digits = 2) {
  if (typeof value === 'string') {
    value = value - 0;
  }
  return (value * 100).toFixed(digits);
}

function upOrDown(value) {
  return value > 0 ? upClass : (value < 0 ? downClass : '');
}

function convertMMdd(val) {
  return val.substr(4, 2) + '-' + val.substr(6, 2);
}

function formatDate(dateString) {
  let result = spliceString(dateString, 6, 0, '-');
  return spliceString(result, 4, 0, '-');
}

function updateChange(target, value, needAnimation = false, digits = 2) {
  let $target = $(target);
  value = value - 0;
  let changeClass = upOrDown(value);
  if (needAnimation) {
    let id = target.substr(1, target.length);
    new CountUp(id, 0, Math.abs(value * 100), 2, 2).start();
  } else  {
    let change = formatToPercent(Math.abs(value), digits);
    $target.text(change);
  }
  $target.closest('.item-value').addClass(changeClass);
}

// let bridgeReady;
// if (environment.iOS) {
//   bridgeReady = new Promise(function (resolve, reject) {
//     let timeoutId = setTimeout(function () {
//       analytics.sendException('WebViewJavascriptBridgeReady failed');
//       reject();
//     }, 3000);
//     document.addEventListener('WebViewJavascriptBridgeReady', function() {
//       clearTimeout(timeoutId);
//       resolve();
//       analytics.sendTiming("WebViewJavascriptBridgeReady");
//     });
//   });
// } else {
//   bridgeReady = Promise.resolve();
// }

addHisValData(fundCode);
// let isButtonEnabled = false;
loading(fundCode).then(function (isEnabled) {
  thJs.showBuyButton(isEnabled);
});

// Promise.all([loadingPromise, bridgeReady]).then(function (values) {
//   let isEnabled = values[0];
//   thJs.showBuyButton(isEnabled);
// }).catch(function () {
//   thJs.initWebViewBridge();
//   thJs.showBuyButton(isButtonEnabled);
// });

// 绘制中心区域的折线图
require.ensure([], function (require) {
  const HighCharts = require('highcharts');
  require('highcharts/modules/exporting')(HighCharts);

  loadChartData(fundCode, 30);

  $('.button-group').on("click", 'button', function () {
    let $button = $(this);
    let dayNumber = $button.data('dayNumber');
    loadChartData(fundCode, dayNumber);
    $button.addClass('active').siblings().removeClass('active');
    analytics.sendEvent('clk_fund_detl', "click", "duration", dayNumber);
  });

  function loadChartData(stream, day) {
    loadingSpinners.show();
    let url = domainConfig.face2face + '/th/fundInfo/viewFund/' + stream + '/days/' + day;
    $.ajax({
      url: url,
      dataType: 'jsonp',
      data: {
        thSecret: thSecret
      },
      success: function (data) {
        loadingSpinners.hide();
        if (!data.success) {
          $("#trendTable").html("<div>网络不好，请稍后再试</div>").css('textAlign', 'center');
          return;
        }
        let payload = data.payload;
        let fundHistoryRecord = payload.fundHistoryRecord, //历史数据
          fundDayRecords = fundHistoryRecord.fundDayRecordList || [], //本基金
          transInfo = payload.fundTransInfoList || [], //交易记录
          huShenDatas = payload.hushen300HistoryRecord,
          huShenList = huShenDatas ? (huShenDatas.hushenDayRecordList || []) : undefined,

          cateData = [], serieData = [], serieData1 = [], xAxis = {},   //类别数据,本基金,沪深30,x轴标签
          pdMap = {'30': 'fundMonthInc', '90': 'fundSeasonInc', '180': 'fundHalfYearInc', '365': 'fundYearInc'}, //产品映射
          hsMap = {'30': 'monthInc', '90': 'seasonInc', '180': 'halfYearInc', '365': 'yearInc'}, //沪深300映射
          legend = {
            productInc: fundHistoryRecord[pdMap[day]],
            hushenInc: huShenDatas[hsMap[day]] || huShenList[huShenList.length - 1]['navInc'],
            hushenNetValue: huShenDatas.netValue
          }, //图例
          transMap = {}, isBuy = !0, isSell = !0, max = 0, min = 0, trslen = transInfo.length;

        //交易记录排序 日期升序,买入优先
        transInfo.sort(function (a, b) {
          return a.operDate == b.operDate ? (a.businessCode - b.businessCode) : (a.operDate - b.operDate);
        });
        //写入中间坐标轴,格式化本产品数据
        for (let i = 0, len = fundDayRecords.length, mid = parseInt(len / 2) - 1 + len % 2; i < len; i++) {
          let _funInfo = fundDayRecords[i], _enabled = !1, clor = '#ff0000';

          if (_funInfo.fundIncomeRatio == undefined) {
            _funInfo.fundIncomeRatio = 0;
          }

          let theDate = formatDate(_funInfo.fundDate);
          if (mid == i) {
            xAxis[theDate] = 1;
          }

          if (trslen && _funInfo.fundDate >= transInfo[0].operDate &&
            _funInfo.fundDate <= transInfo[trslen - 1].operDate) {
            //获取净值,是否显示买入,卖出点
            for (let j = 0; j < trslen; j++) {
              if (transInfo[j].operDate == _funInfo.fundDate) {
                transInfo[j].val = _funInfo.fundNetValue;
                clor = transInfo[j].businessCode == 22 ? '#ff0000' : '#b6bac2';
                if (j + 1 < trslen && transInfo[j].businessCode != transInfo[j + 1].businessCode) {
                  transInfo[j + 1].val = _funInfo.fundNetValue;
                }
                _enabled = !0;
                break;
              }
            }
          }

          cateData[i] = theDate;
          if (fundType == 0) {
            serieData[i] = {
              y: round((_funInfo.navInc - 0) * 100, 2),
              marker: {
                enabled: _enabled,
                fillColor: clor,
                lineColor: clor
              }
            };
          } else if (fundType == 1) {
            serieData[i] = {
              y: round(((_funInfo.fundIncomeRatio - 0) * 100), 4)
            };
          }

          if (serieData[i].y > max) {
            max = serieData[i].y;
          } else if (serieData[i].y < min) {
            min = serieData[i].y;
          }

        }

        xAxis[cateData[0]] = 1;
        xAxis[cateData[cateData.length - 1]] = 1;
        //格式化沪深300数据
        for (let i = 0, len = huShenList.length; i < len; i++) {
          serieData1[i] = round((huShenList[i].navInc - 0) * 100, 2);
          if (serieData1[i] > max) {
            max = serieData1[i];
          } else if (serieData1[i] < min) {
            min = serieData1[i];
          }

        }

        //加入首次买入,卖出点
        for (let i = 0, len = transInfo.length; i < len; i++) {
          let _key = formatDate(transInfo[i].operDate);

          if (transInfo[i].val) {
            if (isBuy && transInfo[i].businessCode == '22') {
              transInfo[i].isFirstBuy = isBuy;
              isBuy = !1;
            } else if (isSell && transInfo[i].businessCode == '24') {
              transInfo[i].isFirstSell = isSell;
              isSell = !1;
            }
          }

          if (transMap[_key]) {
            //同一天处理
            $.isArray(transMap[_key]) ? transMap[_key].push(transInfo[i]) : transMap[_key] = [transMap[_key], transInfo[i]];
          } else {
            transMap[_key] = transInfo[i];
          }
        }
        //渲染图表
        if (fundType == 0) {
          renderChart({
            cateData: cateData,
            serieData: [serieData, serieData1],
            xAxis: xAxis,
            transMap: transMap,
            legend: legend,
            max: Math.round(max * 1.1),
            min: Math.round(min * 1.1)
          });
        } else if (fundType == 1) {
          renderMonetaryChart({
            cateData: cateData,
            serieData: serieData,
            xAxis: xAxis,
            max: Math.round(max * 1.1),
            min: Math.round(min * 1.1)
          });
        }

        analytics.sendTiming('chart data loaded');
      },
      error: function () {
        showToast('图表数据加载失败，请稍候重试');
        analytics.sendException(url + ' failed', true);
      }
    });
  }

  /**
   * 渲染图表
   * @pms cateData:类别数据,serieData:数据集合,xAxis:x轴下标,transMap:交易记录,legend:图例
   */
  function renderChart(pms) {
    // console.log('max:'+pms.max+' min:'+pms.min);
    HighCharts.chart('trendTable', {
      exporting: {
        enabled: false
      },
      chart: {
        type: 'line',
        marginTop: 50,
        spacingRight: 15,
        height: 250,
        events: {
          load: function () {
            this.myTooltip = new HighCharts.Tooltip(this, this.options.tooltip);
          }
        }
      },
      credits: {
        enabled: false
      },
      legend: {
        enabled: true,
        borderWidth: 0,
        align: 'left',
        verticalAlign: 'top',
        x: 0,
        itemStyle: {
          fontWeight: 400,
          color: '#666',
          fontSize: '10px'
        },
        floating: true,
        useHTML: true,
        itemDistance: 10,
        symbolWidth: 12,
        labelFormatter: function () {
          let html = '{{name}}:<span class={{cls}}>{{inc}}</span><span class=net-val>{{netValue}}</span>',
            _text = this.name == '沪深300' ? {
              name: '沪深300',
              cls: '',
              inc: pms.legend.hushenInc,
              netValue: pms.legend.hushenNetValue
            } : {name: '本产品', cls: '', inc: pms.legend.productInc};
          return html.replace(/\{\{(.*?)\}\}/g, function (m, i) {
            if (i == 'inc') {
              return (_text[i] > 0 ? '+' : '') + formatToPercent(_text[i]) + '%';
            } else if (i == 'netValue') {
              return _text[i] ? '(' + (_text[i] - 0).toFixed(2) + ')' : '';
            } else if (i == 'cls') {
              return _text['inc'] > 0 ? 'up-color' : (_text['inc'] < 0 ? 'down-color' : '');
            }
            return _text[i] || '';
          });
        }
      },
      title: {text: ''},
      xAxis: {
        categories: pms.cateData,
        tickWidth: 0,
        title: {enabled: false},
        labels: {
          enabled: true,
          staggerLines: 1,
          align: 'center',
          style: {
            color: "#999",
            whiteSpace: 'nowrap',
            textOverflow: 'none'
          },
          formatter: function () {
            return pms.xAxis[this.value] ? (this.value.substr(5)) : '';
          }
        }
      },
      yAxis: {
        gridLineColor: '#f2f2f2',
        title: {text: null},
        labels: {
          formatter: function () {
            return this.value.toFixed(2) + '%';
          },
          style: {
            color: '#999'
          }
        },
        gridLineWidth: 1
      },
      tooltip: {
        enabled: false,
        shared: false,
        formatter: function () {
          let info = pms.transMap[this.x], _val;
          if (info) {
            if (info.length) {
              _val = info[0] && info[0].val ? info[0].val : info[1].val;
            } else {
              _val = info.val;
            }
            return '<span style="font-size: 10px">' + this.x + '</span><br/><span style="color:' + this.color + '">\u25CF</span> ' + '净值: <b>' + _val + '</b><br/>';
          }

          return false;
        }
      },
      plotOptions: {
        line: {
          //  stacking: 'normal',
          marker: {
            enabled: true,
            //  lineWidth: 2,
            fillColor: '#e01818',
            lineColor: '#FF0000',
            radius: 3
          },
          states: {
            hover: {enabled: false},
            select: {enabled: true}
          }
        },
        series: {
          marker: {
            enabled: false
          },
          stickyTracking: false,
          events: {
            click: function (evt) {
              // let points = this.chart.series.map(function(d) {  return d.searchPoint(evt, true)});
              if (evt.point.series._i == 0) {
                //本产品点击
                let point = this.chart.series[0].searchPoint(evt, true);
                this.chart.myTooltip.refresh(point, evt);
              }
            },
            mouseOut: function () {
              this.chart.myTooltip.hide();
            },
            legendItemClick: function () {
              return false;
            }
          }
        }
      },
      series: [{
        name: '本产品',
        data: pms.serieData[0],
        color: "#60A5f3",
        dataLabels: {
          enabled: true,
          formatter: function () {
            return '';
          },
          y: 0,
          x: 0
        },
        zIndex: 3
      }, {
        name: '沪深300',
        data: pms.serieData[1],
        color: "#ff4421",
        lineWidth: 0.5,
        zIndex: 2
      }]
    }, function (chart) {
      //将图例写高
      $(".highcharts-legend-item path").attr('stroke-width', 5);

      //写入买入卖出标记
      function _formathtm(obj, point, index, xy) {
        let _text = {}, rgb, html = '<span data-index="{{index}}" >{{text}}</span>',
          x = point.plotX + (chart.plotLeft ? chart.plotLeft : 0) + xy.x, y = point.plotY + (chart.plotTop ? chart.plotTop : 0) + xy.y, zIndex = 6;
        if (obj.isFirstBuy) {
          _text = {cls: 'f-buy ', text: '买入', index: index};
          rgb = 'rgba(255, 0, 0, 1)';
          zIndex = 7;
        } else if (obj.isFirstSell) {
          _text = {cls: 'f-sell ', text: '卖出', index: index};
          rgb = 'rgba(182, 186, 194, 1)';
        }
        _text = _text.text ? html.replace(/\{\{(.*?)\}\}/g, function (m, i) {
          return _text[i];
        }) : '';

        chart.renderer.label(_text, x, y, 'callout', x, y, true, false, 'f-lb')
          .css({
            color: '#fff'
          })
          .attr({
            fill: rgb,
            padding: 3,
            r: 0,
            zIndex: zIndex
          })
          .add();
      }

      //循环写入标签
      let buyP;
      for (let i = 0, sdata = chart.series[0].data, len = sdata.length; i < len; i++) {
        let info = pms.transMap[sdata[i].category], _p = chart.series[0].points[i];
        if (info) {
          if (info.length && ((info[0].isFirstBuy && info[1].isFirstSell) || (info[0].isFirstSell && info[1].isFirstBuy) )) {
            _formathtm(info[0], _p, i, {x: 0, y: -30});
            _formathtm(info[1], _p, i, {x: 0, y: 10});
          } else {
            let cchart = chart.get(), xy = {x: 0, y: 0};
            if (buyP) {
              if (_p.plotY - buyP.plotY <= 20 && _p.plotX - buyP.plotX < 20) {
                xy.y = -28;
              } else {
                xy.y = 6;
              }
            }

            if (_p.plotX + 27 > cchart.width) {
              xy.x = -28;
            }

            if (_p.plotY > cchart.height - 23) {
              xy.y = -25;
            } else if (!buyP) {
              xy.y = 6;
            }
            if (info.length) {
              info = info[0].isFirstBuy ? info[0] : info[0].isFirstSell ? info[0] : info[1];
            }

            _formathtm(info, _p, i, xy);
          }
          buyP = _p;
        }
      }

      //点击弹出tooltip
      $(document).on('click', '.highcharts-f-lb', function () {
        let index = $(this).find('[data-index]').data('index');
        let point = chart.series[0].points[index];
        if (point) {
          let obj = $.extend(true, {}, point);
          obj.onMouseOver();
          chart.myTooltip.refresh(obj);
        }
      });
    });
  }

  function renderMonetaryChart(pms) {
    HighCharts.chart('trendTable', {
      exporting: {
        enabled: false
      },
      chart: {
        type: 'line',
        marginTop: 50,
        spacingRight: 15,
        height: 250,
        events: {
          load: function () {
            this.myTooltip = new HighCharts.Tooltip(this, this.options.tooltip);
          }
        }
      },
      credits: {
        enabled: false
      },
      legend: {
        enabled: false,
      },
      title: {text: ''},
      xAxis: {
        categories: pms.cateData,

        tickWidth: 0,
        title: {enabled: false},
        labels: {
          enabled: true,
          staggerLines: 1,
          align: 'center',
          style: {
            color: "#999",
            whiteSpace: 'nowrap',
            textOverflow: 'none'
          },
          formatter: function () {
            return pms.xAxis[this.value] ? (this.value.substr(5)) : '';
          }
        }
      },
      yAxis: {
        gridLineColor: '#f2f2f2',
        title: {text: null},
        labels: {
          formatter: function () {
            // TODO 确认是否要除以100
            return formatToPercent(this.value / 100) + '%';
          },
          style: {
            color: '#999'
          }
        },
        gridLineWidth: 1
        // tickInterval:1
        // max:pms.max,
        // min:pms.min
      },
      tooltip: {
        enabled: false,
        shared: false,
        crosshairs: false,
        valueSuffix: '%',
        valueDecimals: 4
      },
      plotOptions: {
        line: {
          //  stacking: 'normal',
          marker: {
            enabled: true,
            //  lineWidth: 2,
            fillColor: '#e01818',
            lineColor: '#FF0000',
            radius: 3
          },
          states: {
            hover: {enabled: false},
            select: {enabled: true}
          }
        },
        series: {
          marker: {
            enabled: false
          },
          stickyTracking: false,
          events: {
            click: function (evt) {
              // var points = this.chart.series.map(function(d) {  return d.searchPoint(evt, true)});
              if (evt.point.series._i == 0) {
                //本产品点击
                let point = this.chart.series[0].searchPoint(evt, true);
                this.chart.myTooltip.refresh(point, evt);
              }
            },
            mouseOut: function () {
              this.chart.myTooltip.hide();
            },
            legendItemClick: function () {
              return false;
            }
          }
        }
      },
      series: [{
        name: '本产品',
        data: pms.serieData,
        color: "#60A5f3",
        dataLabels: {
          enabled: true,
          formatter: function () {
            return '';
          },
          y: 0,
          x: 0
        },
        zIndex: 3
      }]
    }, function (chart) {
      //将图例写高
      $(".highcharts-legend-item path").attr('stroke-width', 5);
      //点击弹出tooltip
      $(document).on('click', 'div.highcharts-f-lb span', function () {
        let index = $(this).find('div').data('index');
        let point = chart.series[0].points[index];
        if (point) {
          let obj = $.extend(true, {}, point);
          obj.onMouseOver();
          chart.myTooltip.refresh(obj);
        }
      });
    });

  }
});

// Tab切换
$(".i-card-tabs-nav").on('click', 'a', function (e) {
  e.preventDefault();
  let $link = $(this);
  $link.closest('li').addClass('active').siblings().removeClass('active');
  const target = $link.attr('href');
  $(target).show().siblings('div').hide();

  if ($link.data("tab-name") == "valueTrend") {
    analytics.sendEvent('clk_fund_detl_now', "click");
  } else if ($link.data("tab-name") == "historyValue") {
    analytics.sendEvent('clk_fund_detl_his', "click");
  }
});


//加载历史净值信息
function addHisValData(fundCode) {
  let url = domainConfig.face2face + '/th/fundInfo/viewFund/' + fundCode + '/days/30';
  $.ajax({
    url: url,
    dataType: 'jsonp',
    success: function (data) {
      let historyRecords = data.payload.fundHistoryRecord.fundDayRecordList;
      let hisNetValueList = [];
      let length = Math.min(historyRecords.length, 5);
      for (let i = 0; i < length; i++) {
        let target = historyRecords[historyRecords.length - 1 - i];
        target.fundDate = formatDate(target.fundDate);
        target.fundDayInc = (target.fundDayInc - 0) * 100;
        hisNetValueList[i] = target;
      }

      let historyContent = historyListEngine({groups: hisNetValueList || []});
      $('#historyTab').html(historyContent);
    },
    error: function () {
      analytics.sendException(url + ' failed');
    }
  });
}

//进入页面加载数据
function loading(fundCode) {
  return new Promise(function (resolve) {
    $.ajax({
      url: domainConfig.face2face + '/th/fundInfo/viewFund/' + fundCode + (cardConfigId ? '/'+cardConfigId + '/': '/'),
      dataType: 'jsonp',
      success: function (data) {
        if (data.retCode != 0) {
          noContent();
          showToast('服务器开小差了，请稍候再试~');
          resolve(false);
          analytics.sendException('/th/fundInfo/viewFund failed', true);
          return;
        }

        fundInfo = data.payload.fundInfo;
        if (fundInfo.fundValidFlag == 0 || fundInfo.fundValidFlag == '0') {
          noContent();
          resolve(false);
          return;
        }

        $('#updateTime').text(convertMMdd(fundInfo.fundDate));
        $('#fundType').text(fundInfo.fundType + '基金');

        // isLoading = 0;
        if (fundInfo.fundType === "货币型") {
          fundType = 1;
          $("body").addClass('money-fund-container');

          updateChange("#rateOfReturn", fundInfo.fundIncomeRatio, false, 4);
          $("#returns").text((fundInfo.fundIncomeUnit - 0).toFixed(4));
          $('#riskType').text('低风险');

          if (isShowBtn) {
            resolve(true);
          } else {
            resolve(false);
          }

          $("#brokerageButton").text('0申购费');
        } else {
          fundType = 0;
          if (isShowBtn === undefined || isShowBtn == '1') {
            resolve(true);
          }
          $('#riskType').text(fundInfo.fundRiskType);

          if (fundInfo.fundYearInc) {
            updateChange("#changeByYear", fundInfo.fundYearInc, true);
            updateChange(".j-change-by-year", fundInfo.fundYearInc);
          }

          if (fundInfo.fundDayInc) {
            updateChange("#changeByDay", fundInfo.fundDayInc, true);
          }

          new CountUp('price', 0, (fundInfo.fundNetValue - 0), 4, 2).start();

          if (fundInfo.fundMonthInc) {
            updateChange("#changeByMonth", fundInfo.fundMonthInc);
          }

          if (fundInfo.fundSeasonInc) {
            updateChange("#changeBy3Month", fundInfo.fundSeasonInc);
          }

          if (fundInfo.setupInc) {
            updateChange("#change", fundInfo.setupInc);
          }

          let lowestTLRate, standardTARate, lowestYebRate;

          //基金费率与折扣
          if (data.payload.theLowestTlMr != undefined && data.payload.theLowestYebMr != undefined) {
            if (data.payload.theLowestTlMr.discount != undefined && data.payload.theLowestTlMr.taRate != undefined) {
              lowestTLRate = data.payload.theLowestTlMr.discount * data.payload.theLowestTlMr.taRate;
            }
            if (data.payload.theLowestYebMr.discount != undefined && data.payload.theLowestYebMr.taRate != undefined) {
              standardTARate = data.payload.theLowestYebMr.taRate;
              lowestYebRate = data.payload.theLowestYebMr.discount * data.payload.theLowestYebMr.taRate;
            }
          } else {
            standardTARate = 0;
            lowestTLRate = 0;
            lowestYebRate = 0;
          }
          $('.j-trade-rate').text(formatToPercent(standardTARate) + '%');
          $('.j-yeb-discount').text(formatToPercent(lowestYebRate) + '%');
          $('.j-tl-discount').text(formatToPercent(lowestTLRate) + '%');

          $("#brokerageButton").click(function () {
            forwardTo(fundInfo.fundName + '-交易费率', 'transRateShow/' + fundCode, fundCode, 0);
          });

          if ($.trim(data.payload.yebPurchaseRule).length > 0) {
            let $details = $('#bottomDetail').html(data.payload.yebPurchaseRule);
            const $bottomBar = $('.bottom-bar').click(function () {
              $details.show();
            });
            $bottomBar.addClass('show');
            setTimeout(function () {
              $bottomBar.removeClass('show');
            }, 3000);
            $window.on('scroll', throttle(function () {
              let scrollTop = $window.scrollTop();
              let windowHeight = $window.height();

              if ($document.height() - scrollTop - windowHeight < 10) {
                $bottomBar.addClass('show');
              } else if ($bottomBar.hasClass('show')) {
                setTimeout(function () {
                  $bottomBar.removeClass('show');
                }, 3000);
              }
            }, 100));
            $(document).click(function (e) {
              let target = $(e.target);
              if (!target.is('.bottom-bar') && target.closest('.bottom-bar').size() == 0) {
                $bottomBar.removeClass('show');
              }
            });
          }
        }

        $('title').text(fundInfo.fundName);

        //基金成立时间
        $('.j-setup-date').text(formatDate(fundInfo.setupDate));

        //基金最新规模
        let assets = fundInfo.lastAssets / 100000000;
        $('.j-last-assets').text(assets.toFixed(2) + "亿");

        //基金经理
        if (data.payload.fundMgrList) {
          let _mgrs = [];
          for (let i = 0, len = data.payload.fundMgrList.length; i < len; i++) {
            _mgrs[i] = data.payload.fundMgrList[i].mgrName;
          }
          $('.j-mgr-list').text(_mgrs.join('、'));
        }

        $("#toConsultPage").click(function () {
          thJs.openPage({
            title: fundInfo.fundName + '-产品咨询',
            url: domainConfig.pageUrl + '/mail/app/bridge/consultation.html?thSecret=' + thSecret + '&t='+Date.now() +
            '&fundName=' + encodeURIComponent(fundInfo.fundName) + '&fundCode=' + fundCode,
            showfooterview: 0,
            isNeedSecret: 0,
            fundCode: fundCode
          });
        });

        $("#detailsButton").click(function () {
          forwardTo(fundInfo.fundName + '-基金详情', 'fundInfoShow/' + fundCode, fundCode, 0);
        });

        $("#historyTab").on('click', '#historyButton', function () {
          forwardTo(fundInfo.fundName + '-历史净值', 'historyValue/' + fundCode, fundCode, 0);
        });


        //加载咨询
        loadConsults(4);// 一次加载记录数

        //跑马灯
        if (data.payload.noticeTxt){
          if (visualLength(data.payload.noticeTxt) > document.body.clientWidth * 0.97) {
            $('.j-marquee-notice').text(data.payload.noticeTxt).show();
            $('.j-marquee-notice-div').hide();
          } else {
            $('.j-marquee-notice-div').text(data.payload.noticeTxt).show();
            $('.j-marquee-notice').hide();
          }
        }

        analytics.sendTiming('data loaded and rendered');
      },
      error: function () {
        showToast("服务器开小差了，请稍候再试~");
        noContent();
        resolve(false);
        analytics.sendException('/th/fundInfo/viewFund failed', true);
      }
    });
  });
}

function visualLength(target) {
  let $ruler = $("#ruler");
  $ruler.text(target);
  return $ruler[0].offsetWidth;
}

//加载咨询
function loadConsults(size) { // 从服务器获八卦贴信息
  let url = '/server/publics/consult/viewAllConsult/fund/' + fundCode;
  // let url = domainConfig.pageUrl + '/face2face/publics/consult/viewAllConsult/fund/' + fundCode;
  $.ajax({
    url: url,
    type: 'get',
    data: {
      page: 0,
      size: size
    },
    success: function (data) {
      let contents = data.payload.content;
      $('#totalConsultsNo').text(data.payload.totalElements);
      if (contents.length > 0) {
        let consultsContent = consultListEngine(
          {
            groups: contents,
            dateFormat: dateToJSONLocal
          }
        );
        $('#consultContent').html(consultsContent);
      }
    },
    error: function () {
      analytics.sendException(url + ' failed');
    }
  });
}

function forwardTo(title, uri, fundCode, needSecret) {
  let absUrl = domainConfig.pageUrl + "/mail/app/" + uri;

  if (window.WebViewJavascriptBridge || window.thfund) {
    thJs.openPage({
      title: title,
      url: absUrl,
      showfooterview: 0,
      isNeedSecret: needSecret,
      fundCode: fundCode,
      dictionType: 0,
      dictionID: 0
    });
  } else {
    location.href = absUrl;
  }
}

function noContent() {
  $("#noContent").addClass('show');
}
