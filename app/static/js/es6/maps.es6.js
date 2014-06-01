/* global google, _, addMarker */
/* jshint unused:false, latedef:false, camelcase:false */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    initMap(36.1, -86.75, 11);
    $('#geolocate').click(geolocate);
    $('#map').css({
      'height': winHeight,
    });
    $(window).resize(function(){
      $('#map').css({
        'height': winHeight,
      });
    });
    $('#submit').click(getActivities);
    $('#clear-tmp-markers').click(clearTmpMarkers);
    $('#trip').click(trip);
    $('#waypoints').on('click', '.waypoint', removeWayPoint);
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
var tmpMarkers = [];
var savMarkers = [];
var waypoints = [];

var directionsDisplay;
var directionsService;

/* GLOBAL MAP FUNCTIONS */

function addMarker(info, lat, lng, name, icon, type){
  'use strict';
  var latLng = new google.maps.LatLng(lat, lng);
  var marker = new google.maps.Marker({map: map, position: latLng, title: name, animation: google.maps.Animation.DROP, icon:icon, info:info});

  if(type === 'save'){
    savMarkers.push(marker);
  }else{
    tmpMarkers.push(marker);
  }

  google.maps.event.addListener(marker, 'click', clickMarker);
}

function geolocate(){
  'use strict';
  $('#showLeftPush').removeClass('hide');
  $('#geolocate').addClass('hide');
  var options = {enableHighAccuracy: true, timeout: 60000, maximumAge: 0};
  navigator.geolocation.getCurrentPosition(
    p=>{
      loc.lat = p.coords.latitude;
      loc.lng = p.coords.longitude;
      centerMap(p.coords.latitude, p.coords.longitude);
      map.setZoom(14);
      addMarker(null, p.coords.latitude, p.coords.longitude, 'Me', '/img/geolocate.png', 'save');
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
  pos.title = this.title || 'Anonymous';
  pos.lat = this.position.lat();
  pos.lng = this.position.lng();
  addWayPoint(pos);
  _(tmpMarkers).pull(this);
  savMarkers.push(this);
  markerInfo(this.info);
}

function markerInfo(info){
  'use strict';
  $('#info').empty();
  _.forOwn(info, printInfo);
}

function printInfo(value, key){
  'use strict';
  if (value !== 'No' && value !== '0' && key !== 'mapped_location' && key !== 'latitude' && key !== 'longitude') {
    var $info = $('<p>');
    $info.text(key+': '+value);
    $('#info').append($info);
  }
}

function addWayPoint(pos){
  'use strict';
  var latLng = new google.maps.LatLng(pos.lat, pos.lng);
  waypoints.push({location:latLng, stopover:true});
  $('#waypoints').append(`<button class=waypoint>${pos.title}</button>`);
}

function removeWayPoint(){
  'use strict';
  var i = $('.waypoint').index(this);
  this.remove();
  waypoints.splice(i, 1);
  savMarkers[i+1].setMap(null);
  savMarkers.splice(i+1, 1);
  trip();
}

function trip(){
  'use strict';
  var origin = new google.maps.LatLng(loc.lat, loc.lng);
  var destination = _(waypoints).last().location;
  var tmppoints = _(waypoints).clone();
  tmppoints.pop();

  var mode = $('#mode').val();
  var travelMode = google.maps.TravelMode[mode];

  var request = {
    origin: origin,
    destination: destination,
    waypoints: tmppoints,
    optimizeWaypoints: false,
    travelMode: travelMode
  };

  directionsService.route(request, (response, status)=>{
    if(status === google.maps.DirectionsStatus.OK){
      directionsDisplay.setDirections(response);
    }
  });
}

function clearDirections(){
  'use strict';
  directionsDisplay.set('directions', null);
}

function clearTmpMarkers() {
  'use strict';
  for (var i = 0; i < tmpMarkers.length; i++ ) {
    tmpMarkers[i].setMap(null);
  }

  tmpMarkers = [];
  $('#info').empty();

  clearDirections();
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

function getActivities() {
  'use strict';
  var activity = $('select[name="activities"]').val();
  var radius = $('select[name="radius"]').val();
  callOpenDataForResults(activity, radius);
}

function callOpenDataForResults(activity, radius) {
  'use strict';
  if(activity === 'restaurants') {
    return getFoodData(radius);
  }
  var key;
  var name;
  var icon;
  switch(activity) {
    case 'parks':
      key = '74d7-b74t';
      name = 'park_name';
      icon = '/img/marker-icons/park.png';
      break;
    case 'beer':
      //query string limits to on-site consumption (no convienence stores, etc.)
      //can change this later if we fully integerate across multiple datasets
      key = '3wb6-xy3j?permit_type=ON-SALE BEER';
      name = 'business_name';
      icon = '/img/marker-icons/bar.png';
      break;
    case 'bus-stops':
      key = 'vfe9-k7vc';
      name = 'stopname';
      icon = '/img/marker-icons/bus.png';
      break;
    case 'art':
      key = 'eviu-nxp6';
      name = 'artwork';
      icon = '/img/marker-icons/art.png';
      break;
    case 'wifi':
      key = '4ugp-s85t';
      name = 'site_name';
      icon = '/img/marker-icons/wifi.png';
      break;
    case 'historical-sites':
      key = 'vk65-u7my';
      name = 'title';
      icon = '/img/marker-icons/history.png';
  }

  // .json? was breaking any request with a query string
  // var url = 'http://data.nashville.gov/resource/' + key + '.json?';

  var url = 'http://data.nashville.gov/resource/' + key;
  $.getJSON(url, function(data) {
    findClosestActivities(data, radius, name, icon);
  });
}

function findClosestActivities(data, radius, name, icon) {
  'use strict';
  var activities;
  if(window.loc.lat) {
    activities = [];
    $.each(data, function(i, entry) {
      if(entry.mapped_location) {
        var dist = window.getDistance(window.loc.lat, window.loc.lng, entry.mapped_location.latitude, entry.mapped_location.longitude);
        if(dist <= parseFloat(radius, 10)) {
          activities.push(entry);
        }
      }
    });
  } else {
    activities = data;
  }
  addActivitiesToMap(activities, name, icon);
}

function addActivitiesToMap(activities, name, icon) {
  'use strict';
  $.each(activities, function(i, entry) {
    if(entry.mapped_location) {
      addMarker(entry, entry.mapped_location.latitude, entry.mapped_location.longitude, entry[name], icon, 'temp');
    }
  });
}

function getFoodData(radius){
    'use strict';
    var meters = parseFloat(radius, 10) * 1609.34;
    var url = 'http://api.yelp.com/business_review_search?term=yelp&lat=' + window.loc.lat + '&long=' + window.loc.lng + '&radius_filter=' + meters + '&limit=10&ywsid=EJDoFH3OEMV8iJKwE3pfag&category=restaurants&callback=?';
    $.getJSON(url, addRestaurantsToMap);
  }

  function addRestaurantsToMap(data){
    'use strict';
    $.each(data.businesses, function(i, business) {
      formatRestaurant(business);
    });
  }

  function formatRestaurant(entry) {
    'use strict';
    var geocoder = new google.maps.Geocoder();
    var address = entry.address1 + ',' + entry.city + ',' + entry.state + ',' + entry.country + ',' + entry.zip;
    var location = {};
    location.name = entry.name;
    geocoder.geocode({ 'address' : address }, function(restaurant, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        location.lat = restaurant[0].geometry.location.lat();
        location.lng = restaurant[0].geometry.location.lng();
        addMarker(location, location.lat, location.lng, location.name, '/img/marker-icons/treasure.png');
      }
      else {
        alert(status);
      }
    });
  }
