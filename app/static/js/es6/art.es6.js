/*jshint camelcase:false */
(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $('#get-art').on('click', getArtData);
  }

  function getArtData(){
    var url = 'http://data.nashville.gov/resource/eviu-nxp6';
    $.getJSON(url, receive);
  }

  function receive(data){
    data.forEach(plotOnMap);
  }

  function plotOnMap(data){
    window.addMarker(data.mapped_location.latitude, data.mapped_location.longitude, data.artwork);
  }

})();
