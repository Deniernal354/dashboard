function init_JQVmap(){

  //console.log('check init_JQVmap [' + typeof (VectorCanvas) + '][' + typeof (jQuery.fn.vectorMap) + ']' );

  if(typeof (jQuery.fn.vectorMap) === 'undefined'){ return; }

  console.log('init_JQVmap');

  if ($('#world-map-gdp').length ){

    $('#world-map-gdp').vectorMap({
      map: 'world_en',
      backgroundColor: null,
      color: '#ffffff',
      hoverOpacity: 0.7,
      selectedColor: '#666666',
      enableZoom: true,
      showTooltip: true,
      values: sample_data,
      scaleColors: ['#E6F2F0', '#149B7E'],
      normalizeFunction: 'polynomial'
    });

  }

  if ($('#usa_map').length ){

    $('#usa_map').vectorMap({
      map: 'usa_en',
      backgroundColor: null,
      color: '#ffffff',
      hoverOpacity: 0.7,
      selectedColor: '#666666',
      enableZoom: true,
      showTooltip: true,
      values: sample_data,
      scaleColors: ['#E6F2F0', '#149B7E'],
      normalizeFunction: 'polynomial'
    });

  }

}
