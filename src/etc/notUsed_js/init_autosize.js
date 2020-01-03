/* AUTOSIZE */
function init_autosize() {
  if(typeof $.fn.autosize !== 'undefined'){
    autosize($('.resizable_textarea'));
  }
}
