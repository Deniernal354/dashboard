/* STARRR */
//Star grading function
function init_starrr() {

  if( typeof (starrr) === 'undefined'){ return; }
  console.log('init_starrr');

  $(".stars").starrr();

  $('.stars-existing').starrr({
    rating: 4
  });

  $('.stars').on('starrr:change', function (e, value) {
    $('.stars-count').html(value);
  });

  $('.stars-existing').on('starrr:change', function (e, value) {
    $('.stars-count-existing').html(value);
  });
}
