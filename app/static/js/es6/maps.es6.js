/* global google */
/* jshint unused:false, latedef:false */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    initMap(36, -86, 8);
    $('#geolocate').click(geolocate);
    $('#map').css({
      'height': winHeight,
    });
    $(window).resize(function(){
      $('#map').css({
        'height': winHeight,
      });
    });
  }

  function initMap(lat, lng, zoom){
    var styles = [{'featureType':'water','elementType':'geometry','stylers':[{'color':'#a2daf2'}]}];
    var mapOptions = {center: new google.maps.LatLng(lat, lng), zoom: zoom, mapTypeId: google.maps.MapTypeId.ROADMAP, styles: styles};
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions'));
  }
})();

/* GLOBAL MAP VARIABLES */

var winHeight = $(window).height();
var map;
var loc = {};
var markers = [];

var directionsDisplay;
var directionsService;

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
      loc.lat = p.coords.latitude;
      loc.lng = p.coords.longitude;
      centerMap(p.coords.latitude, p.coords.longitude);
      map.setZoom(14);
      addMarker(p.coords.latitude, p.coords.longitude, 'Me', '/img/geolocate.png');
    },
    e=>console.log(e),
    options);
}

function centerMap(lat, lng){
  'use strict';
  var latLng = new google.maps.LatLng(loc.lat, loc.lng);
  map.setCenter(latLng);
}

function clickMarker(){
  'use strict';
  var pos = {};
  pos.lat = this.position.lat();
  pos.lng = this.position.lng();
  getDirections(pos);
}

function getDirections(pos){
  'use strict';
  var start = new google.maps.LatLng(loc.lat, loc.lng);
  var end = new google.maps.LatLng(pos.lat, pos.lng);
  var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.TravelMode.DRIVING
  };

  directionsService.route(request, (response, status)=>{
    if(status === google.maps.DirectionsStatus.OK){
      directionsDisplay.setDirections(response);
    }
  });
}

function getDistance(lat1, lon1, lat2, lon2) {
  'use strict';
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  'use strict';
  return deg * (Math.PI/180);
}
