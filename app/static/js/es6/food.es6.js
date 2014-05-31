/*jshint camelcase:false */
/* global loc */

(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $('#restaurants').on('click', getFoodData);
  }

//build query for Yelp
  function getFoodData(){
    var str1 = 'http://api.yelp.com/business_review_search?term=yelp&lat=';
    var str2 = loc.lat;
    var str3 = '&long=';
    var str4 = loc.lng;
    var str5 = '&radius=25&limit=5&ywsid=EJDoFH3OEMV8iJKwE3pfag&category=restaurants&callback=?';
    var url = str1.concat(str2,str3, str4, str5);
    $.getJSON(url, receive);
  }

  function receive(data){
    console.log(data);
    //data.forEach(plotOnMap);
  }

  // function plotOnMap(data){
  //   window.addMarker(data.mapped_location.latitude, data.mapped_location.longitude, data.title);
  // }

})();