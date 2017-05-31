import './page-slider.css';

import * as $ from 'zepto';

/**
 * PageSlider
 * @param {String} target
 * @param {Object} options
 * @param {Function} options.onSlideEnd 在滑动结束后的回调函数
 * @constructor
 */
function PageSlider(target, options) {
  this.init(target, options);
}

PageSlider.prototype = {
  init: function (target, options) {
    this.options = options;
    this.$root = $(target);
    this.$slidesContainer = this.$root.children('.i-sliders');

    this.touchstarty = undefined;
    this.touchmoveY = undefined;
    this.moveY = undefined;
    this.index = 0;
    this.longTouch = undefined;

    this.screenHeight = $(window).height();
    let slideHeight = this.$root.height();
    if (this.screenHeight != slideHeight) {
      this.$root.css('height', this.screenHeight);
      this.$slidesContainer.children().css('height', this.screenHeight);
    }

    this.bindEvents();
  },

  bindEvents: function () {
    const self = this;
    this.$root.on("touchstart", function (event) {
      self.start(event);
    });

    this.$root.on("touchmove", function (event) {
      self.move(event);
    });

    this.$root.on("touchend", function (event) {
      self.end(event);
    });

    if (self.options.onSlideEnd) {
      self.$slidesContainer.on('transitionend', function () {
        self.options.onSlideEnd.call(self, self.index);
      });
    }

  },

  start: function (event) {
    const self = this;

    self.longTouch = false;
    setTimeout(function () {
      self.longTouch = true;
    }, 250);

    self.touchstarty = event.touches[0].pageY;
    $('.animate').removeClass('animate');
  },

  move: function (event) {
    event.preventDefault();
    this.touchmoveY = event.touches[0].pageY;
    this.moveY = this.index * this.screenHeight + (this.touchstarty - this.touchmoveY);
    this.$slidesContainer.css('transform', 'translate3d(0,-' + this.moveY + 'px,0)');
  },

  end: function () {
    if (this.moveY == undefined) {
      return;
    }
    let absMove = Math.abs(this.index * this.screenHeight - this.moveY);
    if (absMove > this.screenHeight / 3 || this.longTouch === false) {
      if (this.moveY > this.index * this.screenHeight && this.index < 2) {
        this.index++;
      } else if (this.moveY < this.index * this.screenHeight && this.index > 0) {
        this.index--;
      }
    }
    // Move and animate the elements.
    this.$slidesContainer.addClass('animate').css('transform', 'translate3d(0,-' + this.index * this.screenHeight + 'px,0)');
    this.moveY = undefined;
  }
};

export { PageSlider };
