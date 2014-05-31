/* global google, map */
/* jshint unused:false */
/* jshint camelcase:false */

'use strict';

(function(){
  $(document).ready(init);

  function init(){
    var url = 'http://data.nashville.gov/resource/74d7-b74t.json?';
    $.getJSON(url, addParksDataToMap);
  }

  function addParksDataToMap(data) {
    $.each(data, function(i, entry) {
      console.log(entry);
      addMarker(entry.mapped_location.latitude, entry.mapped_location.longitude, entry.mapped_location.park_name);
    });
  }
})();
