/* global google */
/* jshint unused:false, latedef:false */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    initMap(36, -86, 2);
    $('#geolocate').click(geolocate);
  }

  function initMap(lat, lng, zoom){
    var styles = [{'featureType':'water','elementType':'geometry','stylers':[{'color':'#ffdfa6'}]},{'featureType':'landscape','elementType':'geometry','stylers':[{'color':'#b52127'}]},{'featureType':'poi','elementType':'geometry','stylers':[{'color':'#c5531b'}]},{'featureType':'road.highway','elementType':'geometry.fill','stylers':[{'color':'#74001b'},{'lightness':-10}]},{'featureType':'road.highway','elementType':'geometry.stroke','stylers':[{'color':'#da3c3c'}]},{'featureType':'road.arterial','elementType':'geometry.fill','stylers':[{'color':'#74001b'}]},{'featureType':'road.arterial','elementType':'geometry.stroke','stylers':[{'color':'#da3c3c'}]},{'featureType':'road.local','elementType':'geometry.fill','stylers':[{'color':'#990c19'}]},{'elementType':'labels.text.fill','stylers':[{'color':'#ffffff'}]},{'elementType':'labels.text.stroke','stylers':[{'color':'#74001b'},{'lightness':-8}]},{'featureType':'transit','elementType':'geometry','stylers':[{'color':'#6a0d10'},{'visibility':'on'}]},{'featureType':'administrative','elementType':'geometry','stylers':[{'color':'#ffdfa6'},{'weight':0.4}]},{'featureType':'road.local','elementType':'geometry.stroke','stylers':[{'visibility':'off'}]}];
    var mapOptions = {center: new google.maps.LatLng(lat, lng), zoom: zoom, mapTypeId: google.maps.MapTypeId.ROADMAP, styles: styles};
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
  }
})();

/* GLOBAL MAP VARIABLES */

var map;
var loc = {};
var markers = [];

/* GLOBAL MAP FUNCTIONS */

function addMarker(lat, lng, name, icon){
  'use strict';
  var latLng = new google.maps.LatLng(lat, lng);
  var marker = new google.maps.Marker({map: map, position: latLng, title: name, animation: google.maps.Animation.DROP, icon:icon});
  markers.push(marker);
  google.maps.event.addListener(marker, 'click', clickMarker);
}


function geolocate(){
  'use strict';
  var options = {enableHighAccuracy: true, timeout: 60000, maximumAge: 0};
  navigator.geolocation.getCurrentPosition(
    p=>centerMap(p.coords.latitude, p.coords.longitude),
    e=>console.log(e),
    options);
}

function centerMap(lat, lng){
  'use strict';
  loc.lat = lat;
  loc.lng = lng;

  var latLng = new google.maps.LatLng(lat, lng);
  map.setCenter(latLng);
  map.setZoom(10);
}

function clickMarker(){
  'use strict';
  alert('you clicked a marker');
}
