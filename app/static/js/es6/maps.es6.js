/* global google, _, classie, addMarker */
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
    $('#waypoints').on('mousedown', '.waypoint', getSortedPoint);
    $('#mode').change(trip);
    $('.glyphicon-arrow-left').click(hidePlanningMenu);
    $('.glyphicon-align-justify').click(showPlanningMenu);
    makeSortable();
  }

  function initMap(lat, lng, zoom){
    var styles = [{'featureType':'water','elementType':'geometry','stylers':[{'color':'#a2daf2'}]}];
    var mapOptions = {
      center: new google.maps.LatLng(lat, lng),
      zoom: zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styles
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions'));

    weatherLayer = new google.maps.weather.WeatherLayer({temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT});
    weatherLayer.setMap(map);

    cloudLayer = new google.maps.weather.CloudLayer();
    cloudLayer.setMap(map);
  }
})();

/* GLOBAL MAP VARIABLES */

var winHeight = $(window).height();
var map;
var loc = {};
var tmpMarkers = [];
var savMarkers = [];
var waypoints = [];
var selectedPoint;

var directionsDisplay;
var directionsService;
var weatherLayer;
var cloudLayer;

/* GLOBAL MAP FUNCTIONS */

function makeSortable(){
  'use strict';
  $('#waypoints').sortable({update: function(event, ui){
    console.log(this);
    rearrangePoints();
  } });
}

//on change
function rearrangePoints(){
  'use strict';
  var newIndex = $(selectedPoint).index();
  var text = $(selectedPoint).text();
  var savMarker = _.find(savMarkers, { 'title': text });
  var spliceIndex = _.indexOf(savMarkers, savMarker);
  var tempWaypoint = waypoints[spliceIndex - 1];

  savMarkers.splice(spliceIndex, 1);
  savMarkers.splice(newIndex + 1, 0, savMarker);

  waypoints.splice(spliceIndex - 1, 1);
  waypoints.splice(newIndex, 0, tempWaypoint);

  trip();
}

//gets selected point on mousedown
function getSortedPoint(){
  'use strict';
  selectedPoint = this;
}

function addMarker(info, lat, lng, name, icon, type){
  'use strict';
  var latLng = new google.maps.LatLng(lat, lng);
  var marker = new google.maps.Marker({map: map, position: latLng, title: name, icon:icon, info:info});

  if(type === 'save'){
    savMarkers.push(marker);
  }else{
    tmpMarkers.push(marker);
  }


  google.maps.event.addListener(marker, 'click', clickMarker);
}

function geolocate(){
  'use strict';
  $('#geolocate').replaceWith('<img src="/img/loadr.gif" id="loading"/>').off('click');
  var options = {enableHighAccuracy: true, timeout: 60000, maximumAge: 0};
  navigator.geolocation.getCurrentPosition(
    p=>{
      loc.lat = p.coords.latitude;
      loc.lng = p.coords.longitude;
      centerMap(p.coords.latitude, p.coords.longitude);
      map.setZoom(14);
      addMarker(null, p.coords.latitude, p.coords.longitude, 'Me', '/img/geolocate.png', 'save');
      $('#loading').addClass('hide');
      showPlanningMenu();
    },
    e=>console.log(e),
    options);
}

function showPlanningMenu() {
  'use strict';
  var menuLeft = document.getElementById( 'cbp-spmenu-s1' );
  var body = document.body;
  classie.toggle( body, 'cbp-spmenu-push-toright' );
  classie.toggle( menuLeft, 'cbp-spmenu-open' );
  $('.glyphicon-align-justify').addClass('hide');
}

function hidePlanningMenu() {
  'use strict';
  var menuLeft = document.getElementById( 'cbp-spmenu-s1' );
  var body = document.body;
  classie.toggle( body, 'cbp-spmenu-push-toright' );
  classie.toggle( menuLeft, 'cbp-spmenu-open' );
  $('.glyphicon-align-justify').removeClass('hide');
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
  $('#waypoints').append(`<p class=waypoint>${pos.title}<i class="fa fa-trash-o"></i></p>`);
  makeSortable();
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
  var socrataRadius = radius * 1609.34; // Socrata uses meters.
  switch(activity) {
    case 'parks':
      key = '74d7-b74t?';
      name = 'park_name';
      icon = '/img/marker-icons/park.png';
      break;
    case 'beer':
      key = '3wb6-xy3j?permit_type=ON-SALE%20BEER&';
      name = 'business_name';
      icon = '/img/marker-icons/bar.png';
      break;
    case 'bus-stops':
      key = 'vfe9-k7vc?';
      name = 'stopname';
      icon = '/img/marker-icons/bus.png';
      break;
    case 'art':
      key = 'eviu-nxp6?';
      name = 'artwork';
      icon = '/img/marker-icons/art.png';
      break;
    case 'wifi':
      key = '4ugp-s85t?';
      name = 'site_name';
      icon = '/img/marker-icons/wifi.png';
      break;
    case 'historical-sites':
      key = 'vk65-u7my?';
      name = 'title';
      icon = '/img/marker-icons/history.png';
  }

  // takes advantage of Socrata's within_circle function to significantly reduce size of data returned
  var url = 'http://data.nashville.gov/resource/' + key + '$where=within_circle(mapped_location,' + window.loc.lat + ',' + window.loc.lng + ',' + socrataRadius + ')';

  $.getJSON(url, function(data) {
    addActivitiesToMap(data, name, icon);
  });
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
    var url = 'http://api.yelp.com/business_review_search?term=yelp&lat=' + window.loc.lat + '&long=' + window.loc.lng + '&radius=' + radius + '&limit=10&ywsid=EJDoFH3OEMV8iJKwE3pfag&category=restaurants&callback=?';
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
      addMarker(location, location.lat, location.lng, location.name, '/img/marker-icons/food.png');
    }
    else {
      alert(status);
    }
  });
}
