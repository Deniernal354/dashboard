/* PARSLEY */

function init_parsley() {

  if( typeof (parsley) === 'undefined'){ return; }
  console.log('init_parsley');

  $/*.listen*/('parsley:field:validate', function() {
    validateFront();
  });
  $('#demo-form .btn').on('click', function() {
    $('#demo-form').parsley().validate();
    validateFront();
  });

  var validateFront = function() {
    if (true === $('#demo-form').parsley().isValid()) {
      $('.bs-callout-info').removeClass('hidden');
      $('.bs-callout-warning').addClass('hidden');
    } else {
      $('.bs-callout-info').addClass('hidden');
      $('.bs-callout-warning').removeClass('hidden');
    }
  };

  $/*.listen*/('parsley:field:validate', function() {
    validateFront();
  });
  $('#demo-form2 .btn').on('click', function() {
    $('#demo-form2').parsley().validate();
    validateFront();
  });

  var validateFront = function() {
    if (true === $('#demo-form2').parsley().isValid()) {
      $('.bs-callout-info').removeClass('hidden');
      $('.bs-callout-warning').addClass('hidden');
    } else {
      $('.bs-callout-info').addClass('hidden');
      $('.bs-callout-warning').removeClass('hidden');
    }
  };
  try {
    hljs.initHighlightingOnLoad();
  } catch (err) {}
}
