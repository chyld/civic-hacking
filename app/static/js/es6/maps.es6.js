/* global google, _ */
/* jshint unused:false, latedef:false */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    initMap(36.1, -86.7, 11);
    $('#geolocate').click(geolocate);
    $('#clear-markers').click(clearMarkers);
    $('#trip').click(trip);
  }

  function initMap(lat, lng, zoom){
    var styles = [{'featureType':'water','elementType':'geometry','stylers':[{'color':'#ffdfa6'}]},{'featureType':'landscape','elementType':'geometry','stylers':[{'color':'#b52127'}]},{'featureType':'poi','elementType':'geometry','stylers':[{'color':'#c5531b'}]},{'featureType':'road.highway','elementType':'geometry.fill','stylers':[{'color':'#74001b'},{'lightness':-10}]},{'featureType':'road.highway','elementType':'geometry.stroke','stylers':[{'color':'#da3c3c'}]},{'featureType':'road.arterial','elementType':'geometry.fill','stylers':[{'color':'#74001b'}]},{'featureType':'road.arterial','elementType':'geometry.stroke','stylers':[{'color':'#da3c3c'}]},{'featureType':'road.local','elementType':'geometry.fill','stylers':[{'color':'#990c19'}]},{'elementType':'labels.text.fill','stylers':[{'color':'#ffffff'}]},{'elementType':'labels.text.stroke','stylers':[{'color':'#74001b'},{'lightness':-8}]},{'featureType':'transit','elementType':'geometry','stylers':[{'color':'#6a0d10'},{'visibility':'on'}]},{'featureType':'administrative','elementType':'geometry','stylers':[{'color':'#ffdfa6'},{'weight':0.4}]},{'featureType':'road.local','elementType':'geometry.stroke','stylers':[{'visibility':'off'}]}];
    var mapOptions = {center: new google.maps.LatLng(lat, lng), zoom: zoom, mapTypeId: google.maps.MapTypeId.ROADMAP, styles: styles};
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions'));
  }
})();

/* GLOBAL MAP VARIABLES */

var map;
var loc = {};
var markers = [];
var waypoints = [];

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
  pos.title = this.position.title || 'Empty';
  pos.lat = this.position.lat();
  pos.lng = this.position.lng();
  addWayPoint(pos);
}

function addWayPoint(pos){
  'use strict';
  pos = new google.maps.LatLng(pos.lat, pos.lng);
  waypoints.push({location:pos, stopover:true});
  $('#waypoints').append(`<button class=waypoint>${pos.title}</button>`);
}

function trip(){
  'use strict';

  debugger;

  var origin = new google.maps.LatLng(loc.lat, loc.lng);
  var destination = _(waypoints).last().location;
  var tmppoints = _(waypoints).clone();
  tmppoints.pop();

  var request = {
    origin: origin,
    destination: destination,
    waypoints: tmppoints,
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING
  };

  debugger;

  directionsService.route(request, (response, status)=>{
    if(status === google.maps.DirectionsStatus.OK){
      directionsDisplay.setDirections(response);
    }
  });
}

function clearMarkers() {
  'use strict';
  for (var i = 0; i < markers.length; i++ ) {
    markers[i].setMap(null);
  }
  markers.length = 0;
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
