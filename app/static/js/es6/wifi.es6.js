/*jshint camelcase:false */
(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $('#get-wifi').on('click', getWifiData);
  }

  function getWifiData(){
    var url = 'http://data.nashville.gov/resource/4ugp-s85t';
    $.getJSON(url, receive);
  }

  function receive(data){
    data.forEach(plotOnMap);
  }

  function plotOnMap(data){
    window.addMarker(data.mapped_location.latitude, data.mapped_location.longitude, data.site_name);
  }

})();
