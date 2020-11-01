
var transformRequest = (url, resourceType) => {
    var isMapboxRequest =
        url.slice(8, 22) === "api.mapbox.com" ||
        url.slice(10, 26) === "tiles.mapbox.com";
    return {
        url: isMapboxRequest
            ? url.replace("?", "?pluginName=sheetMapper&")
            : url
    };
};




mapboxgl.accessToken = 'pk.eyJ1IjoicmJhY3RvbCIsImEiOiJja2d5MDJzenYwMHEzMnhtbGxmYW1yZzVhIn0.E0cHmApH4e2C193UPCh-aA'; // replace this with your access token
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rbactol/ckgy0fsr97kwu19pgm12vfcuk', // replace this with your style URL
    center: [-93.0900, 44.9537],
    zoom: 8.7,
    transformRequest: transformRequest
});

$(document).ready(function () {
    $.ajax({
        type: "GET",
        //YOUR TURN: Replace with csv export link
        url: 'https://docs.google.com/spreadsheets/d/1FEQEHV5x8LER2zBlY1qhI8neUKNya001afn0NvNuIWU/gviz/tq?tqx=out:csv&sheet=mapData1',
        dataType: "text",
        success: function (csvData) { makeGeoJSON(csvData); }
    });

    function makeGeoJSON(csvData) {
        csv2geojson.csv2geojson(csvData, {
            latfield: 'Latitude',
            lonfield: 'Longitude',
            delimiter: ','
        }, function (err, data) {
            map.on('load', function () {

                //Add the the layer to the map 
                map.addLayer({
                    'id': 'csvData',
                    'type': 'circle',
                    'source': {
                        'type': 'geojson',
                        'data': data
                    },
                    'paint': {
                        'circle-radius': 5,
                        'circle-color': "purple"
                    }
                });


        // When a click event occurs on a feature in the csvData layer, open a popup at the
        // location of the feature, with description HTML from its properties.
                map.on('click', 'csvData', function (e) {
                    var coordinates = e.features[0].geometry.coordinates.slice();

        //set popup text 
        //You can adjust the values of the popup to match the headers of your CSV. 
        // For example: e.features[0].properties.Name is retrieving information from the field Name in the original CSV. 
                    var description = `<h3>` + e.features[0].properties.Name + `</h3>` + `<h4>` + `<b>` + `Address: ` + `</b>` + e.features[0].properties.Address + `</h4>` + `<h4>` + `<b>` + `Phone: ` + `</b>` + e.features[0].properties.Phone + `</h4>`;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }

        //add Popup to map

                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(description)
                        .addTo(map);
                });

                // Change the cursor to a pointer when the mouse is over the places layer.
                map.on('mouseenter', 'csvData', function () {
                    map.getCanvas().style.cursor = 'pointer';
                });

                // Change it back to a pointer when it leaves.
                map.on('mouseleave', 'places', function () {
                    map.getCanvas().style.cursor = '';
                });

                var bbox = turf.bbox(data);
                map.fitBounds(bbox, { padding: 50 });

            });

        });
    };
});




// Add geolocate control to the map.
map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
    },
    showUserLocation: true,
    })
);






// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
