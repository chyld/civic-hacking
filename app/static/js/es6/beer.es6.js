/*jshint camelcase:false */
(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    var url = 'http://data.nashville.gov/resource/3wb6-xy3j?permit_type=ON-SALE BEER';
    $.getJSON(url, receive);
  }

  function receive(data){
    console.log(data[0]);
    data.forEach(plotOnMap);
  }

  function plotOnMap(data){
    addMarker(data.mapped_location.latitude, data.mapped_location.longitude, data.business_name);
  }

})();
