/* INPUT MASK */
//입력창 형식 설정하는거
function init_InputMask() {

  if( typeof ($.fn.inputmask) === 'undefined'){ return; }
  console.log('init_InputMask');

  $(":input").inputmask();

}
