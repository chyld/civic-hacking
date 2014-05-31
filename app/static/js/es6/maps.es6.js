/* global google */
/* jshint unused:false */

(function(){
  'use strict';

  $(document).ready(init);

  var map;

  function init(){
    initMap(36, -86, 2);
  }

  function addMarker(lat, lng, name){
    let latLng = new google.maps.LatLng(lat, lng);
    new google.maps.Marker({map: map, position: latLng, title: name});
  }

  function initMap(lat, lng, zoom){
    let styles = [{'featureType':'water','elementType':'geometry','stylers':[{'color':'#ffdfa6'}]},{'featureType':'landscape','elementType':'geometry','stylers':[{'color':'#b52127'}]},{'featureType':'poi','elementType':'geometry','stylers':[{'color':'#c5531b'}]},{'featureType':'road.highway','elementType':'geometry.fill','stylers':[{'color':'#74001b'},{'lightness':-10}]},{'featureType':'road.highway','elementType':'geometry.stroke','stylers':[{'color':'#da3c3c'}]},{'featureType':'road.arterial','elementType':'geometry.fill','stylers':[{'color':'#74001b'}]},{'featureType':'road.arterial','elementType':'geometry.stroke','stylers':[{'color':'#da3c3c'}]},{'featureType':'road.local','elementType':'geometry.fill','stylers':[{'color':'#990c19'}]},{'elementType':'labels.text.fill','stylers':[{'color':'#ffffff'}]},{'elementType':'labels.text.stroke','stylers':[{'color':'#74001b'},{'lightness':-8}]},{'featureType':'transit','elementType':'geometry','stylers':[{'color':'#6a0d10'},{'visibility':'on'}]},{'featureType':'administrative','elementType':'geometry','stylers':[{'color':'#ffdfa6'},{'weight':0.4}]},{'featureType':'road.local','elementType':'geometry.stroke','stylers':[{'visibility':'off'}]}];
    let mapOptions = {center: new google.maps.LatLng(lat, lng), zoom: zoom, mapTypeId: google.maps.MapTypeId.ROADMAP, styles: styles};
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
  }
})();
