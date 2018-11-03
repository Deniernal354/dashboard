// Progressbar
function init_progressbar() {
  if ($(".progress .progress-bar")[0]) {
    $(".progress .progress-bar").progressbar();
  }
}

// ---- Menu component functions end
// Must input to below $(document).ready function
/* initialize menu components
$(document).ready(function() {
  init_sidebar();
  init_panel();
  init_tooltip();
});*/
