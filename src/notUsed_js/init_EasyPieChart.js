/* EASYPIECHART */

function init_EasyPieChart() {

  if( typeof ($.fn.easyPieChart) === 'undefined'){ return; }
  console.log('init_EasyPieChart');

  $('.chart').easyPieChart({
    easing: 'easeOutElastic',
    delay: 3000,
    barColor: '#26B99A',
    trackColor: '#fff',
    scaleColor: false,
    lineWidth: 20,
    trackWidth: 16,
    lineCap: 'butt',
    onStep: function(from, to, percent) {
      $(this.el).find('.percent').text(Math.round(percent));
    }
  });
  var chart = window.chart = $('.chart').data('easyPieChart');
  $('.js_update').on('click', function() {
    chart.update(Math.random() * 200 - 100);
  });

  //hover and retain popover when on popover content
  var originalLeave = $.fn.popover.Constructor.prototype.leave;
  $.fn.popover.Constructor.prototype.leave = function(obj) {
    var self = obj instanceof this.constructor ?
    obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type);
    var container, timeout;

    originalLeave.call(this, obj);

    if (obj.currentTarget) {
      container = $(obj.currentTarget).siblings('.popover');
      timeout = self.timeout;
      container.one('mouseenter', function() {
        //We entered the actual popover – call off the dogs
        clearTimeout(timeout);
        //Let's monitor popover content instead
        container.one('mouseleave', function() {
          $.fn.popover.Constructor.prototype.leave.call(self, self);
        });
      });
    }
  };

  $('body').popover({
    selector: '[data-popover]',
    trigger: 'click hover',
    delay: {
      show: 50,
      hide: 400
    }
  });

}
