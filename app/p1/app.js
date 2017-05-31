import '../common/styles/reset.css';
import * as $ from 'zepto';

import { PageSlider } from '../common/page-slider';
import { foo } from './test';

import './styles.css';

import { show as showToast } from '../common/toast';

foo();
new PageSlider('#ps', {
  onSlideEnd: function () {
    showToast('hahaha');
  }
});

$('#target').click(function () {
  "use strict";
});
