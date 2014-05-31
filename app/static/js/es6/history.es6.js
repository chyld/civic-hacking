/*jshint camelcase:false */
(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $('#get-history').on('click', getHistoryData);
  }

  function getHistoryData(){
    var url = 'http://data.nashville.gov/resource/vk65-u7my';
    $.getJSON(url, receive);
  }

  function receive(data){
    console.log(data[0]);
    data.forEach(plotOnMap);
  }

  function plotOnMap(data){
    window.addMarker(data.mapped_location.latitude, data.mapped_location.longitude, data.title);
  }

})();
