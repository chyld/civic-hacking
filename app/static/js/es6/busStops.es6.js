/*jshint camelcase:false */
(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $('#get-bus-stops').on('click', getBusData);
  }

  function getBusData(){
    var url = 'http://data.nashville.gov/resource/vfe9-k7vc';
    $.getJSON(url, receive);
  }

  function receive(data){
    data.forEach(plotOnMap);
  }

  function plotOnMap(data){
    window.addMarker(data.mapped_location.latitude, data.mapped_location.longitude, data.stopname);
  }

})();
