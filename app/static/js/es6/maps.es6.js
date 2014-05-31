/* global google */
/* jshint unused:false, latedef:false */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    initMap(36, -86, 8);
    $('#geolocate').click(geolocate);
  }

  function initMap(lat, lng, zoom){
    var styles = [{'featureType':'water','elementType':'geometry','stylers':[{'color':'#a2daf2'}]}];
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
    p=>{
      centerMap(p.coords.latitude, p.coords.longitude);
      map.setZoom(14);
      addMarker(p.coords.latitude, p.coords.longitude, 'Me', '/img/geolocate.png');
    },
    e=>console.log(e),
    options);
}

function centerMap(lat, lng){
  'use strict';
  loc.lat = lat;
  loc.lng = lng;
  var latLng = new google.maps.LatLng(lat, lng);
  map.setCenter(latLng);
}

function clickMarker(){
  'use strict';
  alert('you clicked a marker');
}
