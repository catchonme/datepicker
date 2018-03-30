(function(doc) {
  var datepicker = {}, monthData, $wrapper;

  datepicker.getMonthData = function(year, month) {
    var ret = [];

    if (!year || !month) {
      var today = new Date();
      year = today.getFullYear();
      month = today.getMonth() + 1;
    }

    var firstDay = new Date(year, month - 1, 1);
    var firstDayWeekDay = firstDay.getDay();

    if (firstDayWeekDay === 0) firstDayWeekDay = 7;

    year = firstDay.getFullYear();
    month = firstDay.getMonth() + 1;

    var lastDayOfLastMonth = new Date(year, month - 1, 0);
    var lastDateOfLastMonth = lastDayOfLastMonth.getDate();

    var preMonthDayCount = firstDayWeekDay - 1;
    var lastDay = new Date(year, month, 0);
    var lastDate = lastDay.getDate();

    for (var i=0; i< 7 * 6; i++) {
      var date = i + 1 - preMonthDayCount;
      var showDate = date;
      var thisMonth = month;

      if (date <= 0) {
        thisMonth = month -1;
        showDate = lastDateOfLastMonth + date;
      } else if (date > lastDate) {
        thisMonth = month + 1;
        showDate = showDate - lastDate;
      }

      if (thisMonth === 0) thisMonth = 12;
      if (thisMonth === 13) thisMonth = 1;

      ret.push ({
        month:thisMonth,
        date:date,
        showDate:showDate
      });
    }

    return {
      year:year,
      month:month,
      days:ret
    };
  }

  datepicker.buildUI = function(year, month) {
    var self = this;
    monthData = self.getMonthData(year, month);

    var html =
      '<div class="ui-datepicker-header">' +
      ' <a href="javascript:;" class="ui-datepicker-btn ui-datepicker-prev-btn"><</a>' +
      ' <a href="javascript:;" class="ui-datepicker-btn ui-datepicker-next-btn">></a>' +
      ' <span class="ui-datepicker-curmonth">' +
          monthData.year + '-' + monthData.month +
      ' </span>' +
      '</div>' +
      ' <div class="ui-datepicker-body">' +
      '   <table>' +
      '     <thead>' +
      '       <tr>' +
      '         <th>一</th>' +
      '         <th>二</th>' +
      '         <th>三</th>' +
      '         <th>四</th>' +
      '         <th>五</th>' +
      '         <th>六</th>' +
      '         <th>日</th>' +
      '       </tr>' +
      '     </thead>' +
      '     <tbody>';

    for (var i=0;i<monthData.days.length; i++) {
      var date = monthData.days[i];
      if (i % 7 === 0) {
        html += '<tr>';
      }
      html += '<td data-date="' + date.date + '">' + date.showDate + '</td>';
      if (i % 7 === 6) {
        html += '</tr>';
      }
    }

    html +=
      '</tbody>' +
      '</table>' +
      '</div>';

    return html;
  }

  datepicker.render = function(direction) {
    var year, month, self = this;

    if (monthData) {
      year = monthData.year;
      month = monthData.month;
    }

    if (direction === 'prev') month --;
    if (direction === 'next') month ++;

    if (month === 0) {
      year--;
      month = 12;
    }

    if (month == 13) {
      year++;
      month = 1;
    }

    var html = self.buildUI(year, month);
    $wrapper = doc.querySelector('.ui-datepicker-wrapper');
    if (!$wrapper) {
      $wrapper = doc.createElement("div");
      doc.body.appendChild($wrapper);
      $wrapper.className = 'ui-datepicker-wrapper';
    }
    $wrapper.innerHTML = html;
  }

  datepicker.init = function() {
    var self = this, isOpen = false, inputIndex = null,
        $inputAll = doc.querySelectorAll('.datepicker');

    self.render();

    ([].slice.call($inputAll)).forEach(function($input, index){
      $input.addEventListener("click", function(){
        var inputLeft = $input.offsetLeft;
        var inputTop = $input.offsetTop;
        var inputHeight = $input.offsetHeight;

        var wrapperLeft = $wrapper.offsetLeft;
        var wrapperTop = $wrapper.offsetTop;

        var isCurInput = (inputLeft == wrapperLeft && wrapperTop == inputTop + inputHeight + 2);

        if (isOpen && isCurInput) {
          $wrapper.classList.remove('ui-datepicker-wrapper-show');
          isOpen = false;
        } else {
          $wrapper.classList.remove('ui-datepicker-wrapper-show');
          isOpen = false;

          $wrapper.classList.add('ui-datepicker-wrapper-show');
          var left = $input.offsetLeft;
          var top = $input.offsetTop;
          var height = $input.offsetHeight;
          $wrapper.style.top = top + height + 2 + 'px';
          $wrapper.style.left = left + 'px';

          inputIndex = index;
          isOpen = true;
        }
      }, false);
    })

    $wrapper.addEventListener('click', function(e){
      var $target = e.target;

      if (!$target.classList.contains('ui-datepicker-btn')) return;

      if ($target.classList.contains('ui-datepicker-prev-btn')) {
        self.render('prev');
      } else if ($target.classList.contains('ui-datepicker-next-btn')) {
        self.render('next');
      }
    }, false);

    $wrapper.addEventListener('click', function(e) {
      var $target = e.target;

      if ($target.tagName.toLowerCase() !== 'td') return;

      var date = new Date(monthData.year, monthData.month - 1, $target.dataset.date);
      ([].slice.call($inputAll))[inputIndex].value = format(date);

      $wrapper.classList.remove('ui-datepicker-wrapper-show');
      isOpen = false;
    }, false);

    // 点击其他区域，隐藏组件
    doc.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var elm = e.target;
      var isContain = $wrapper.contains(elm);
      // elm.tagName !== 'A' 是为了兼容点击左右按钮切换月份，导致组件隐藏的问题
      // 单独使用 document.querySelector('.ui-datepicker-next-btn')发现是包含在$wrapper里的，但是还不明白为什么返回的结果是false
      if (!isContain && elm.tagName !== 'INPUT' && elm.tagName !== 'A') {
        $wrapper.classList.remove('ui-datepicker-wrapper-show');
        isOpen = false;
      }
    }, false);
  }

  function format(date) {
    var ret = '';
    var padding = function(num) {
      if (num < 9) {
        return '0' + num;
      }
      return num;
    }

    ret += date.getFullYear() + '-';
    ret += padding(date.getMonth() + 1) + '-';
    ret += padding(date.getDate());

    return ret;
  }

  window.datepicker = datepicker;

  datepicker.init();
})(document);