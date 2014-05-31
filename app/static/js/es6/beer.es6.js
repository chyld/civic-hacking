/*jshint camelcase:false */
(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $('#get-beer').on('click', getBeerData);
  }

  function getBeerData(){
    var url = 'http://data.nashville.gov/resource/3wb6-xy3j?permit_type=ON-SALE BEER';
    $.getJSON(url, receive);
  }

  function receive(data){
    data.forEach(plotOnMap);
  }

  function plotOnMap(data){
    window.addMarker(data.mapped_location.latitude, data.mapped_location.longitude, data.business_name);
  }

})();
