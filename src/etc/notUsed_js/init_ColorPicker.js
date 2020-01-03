/* COLOR PICKER */

function init_ColorPicker() {

  if( typeof ($.fn.colorpicker) === 'undefined'){ return; }
  console.log('init_ColorPicker');

  $('.demo1').colorpicker();
  $('.demo2').colorpicker();

  $('#demo_forceformat').colorpicker({
    format: 'rgba',
    horizontal: true
  });

  $('#demo_forceformat3').colorpicker({
    format: 'rgba',
  });

  $('.demo-auto').colorpicker();

}
