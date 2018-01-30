// Switchery
/*
$(document).ready(function() {
  if ($(".js-switch")[0]) {
    var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
    elems.forEach(function (html) {
      var switchery = new Switchery(html, {
        color: '#26B99A'
      });
    });
  }
});
// /Switchery*/

// iCheck
$(document).ready(function() {
  if ($("input.flat")[0]) {
    $(document).ready(function () {
      $('input.flat').iCheck({
        checkboxClass: 'icheckbox_flat-green',
        radioClass: 'iradio_flat-green'
      });
    });
  }
});
// iCheck

// Table
$('table input').on('ifChecked', function () {
  checkState = '';
  $(this).parent().parent().parent().addClass('selected');
  countChecked();
});
$('table input').on('ifUnchecked', function () {
  checkState = '';
  $(this).parent().parent().parent().removeClass('selected');
  countChecked();
});

var checkState = '';

$('.bulk_action input').on('ifChecked', function () {
  checkState = '';
  $(this).parent().parent().parent().addClass('selected');
  countChecked();
});
$('.bulk_action input').on('ifUnchecked', function () {
  checkState = '';
  $(this).parent().parent().parent().removeClass('selected');
  countChecked();
});
$('.bulk_action input#check-all').on('ifChecked', function () {
  checkState = 'all';
  countChecked();
});
$('.bulk_action input#check-all').on('ifUnchecked', function () {
  checkState = 'none';
  countChecked();
});

function countChecked() {
if (checkState === 'all') {
  $(".bulk_action input[name='table_records']").iCheck('check');
}
if (checkState === 'none') {
  $(".bulk_action input[name='table_records']").iCheck('uncheck');
}

var checkCount = $(".bulk_action input[name='table_records']:checked").length;

if (checkCount) {
  $('.column-title').hide();
  $('.bulk-actions').show();
  $('.action-cnt').html(checkCount + ' Records Selected');
} else {
  $('.column-title').show();
  $('.bulk-actions').hide();
}
}

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
