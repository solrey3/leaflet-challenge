// Get your data set
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Import & Visualize the Data

var earthquakeCircles = [];
var faultLines = [];

var earthquakeLayer = new L.layerGroup();
var faultLayer = new L.layerGroup();

// Add tilelayer

var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-streets-v11",
    accessToken: API_KEY
  });

var greyscale = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
  });

// Create a map using Leaflet that plots all of the earthquakes from your data set based on their longitude and latitude.
var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
});

// Only one base layer can be shown at a time
var baseMaps = {
    Satellite: satellite,
    Greyscale: greyscale,
    Outdoors: outdoors,
};

myMap.addLayer(satellite);

// Overlays that may be toggled on or off
var overlayMaps = {
    Earthquakes: earthquakeLayer,
    "Fault Lines": faultLayer
};

function colorMag(magnitude) {
    var magColor;
    // colors = ['#CCFF00','#CCCC00','#CC9900','#CC6600','#CC3300','#CC0000']
    switch(true) {
        case (magnitude < 1):
            magColor = "#CCFF00";
            break;
        case (magnitude < 2):
            magColor = "#CCCC00";
            break;
        case (magnitude < 3):
            magColor = "#CC9900";
            break;
        case (magnitude < 4):
            magColor = "#CC6600";
            break;
        case (magnitude < 5):
            magColor = "#CC3300";
            break;
        case (magnitude >= 5):
            magColor = "#CC0000";
            break;
    }
    return magColor;
}

// Your data markers should reflect the magnitude of the earthquake in their size and color. Earthquakes with higher magnitudes should appear larger and darker in color.
// Define createFeatures
function createFeatures(earthquakeData){
    // access the features and layers

    // Define function onEachFeature
    function onEachFeature(feature, layer) {
        // add circles for each earthquake - on each feature
        mag = +feature.properties.mag;
       
        earthquakeCircles.push(L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
           color: colorMag(mag),
           fillColor: colorMag(mag),
           fillOpacity: 0.75,
           radius: Math.pow(2, (mag+1)) * 1000,  
         })
         // Include popups that provide additional information about the earthquake when a marker is clicked.
         .bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>Magnitude: " + mag + "</p>")
         )

    }
    
    // add earthquake layer to map
    var earthquakes = L.geoJson(earthquakeData, {
        onEachFeature: onEachFeature
    });

    overlayMaps.Earthquakes = L.layerGroup(earthquakeCircles);

    myMap.addLayer(overlayMaps.Earthquakes);

    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    

  
}

d3.json(url, function(data) {
    createFeatures(data.features);
});

function createPlateFeatures(lineData){
    // access the features and layers

    // Define function onEachFeature
    function onEachFeature(feature, layer) {
        // add circles for each earthquake - on each feature

        line = [];

        for (var i = 0; i < feature.geometry.coordinates.length; i++) {
            line.push([feature.geometry.coordinates[i][1],feature.geometry.coordinates[i][0]])
        }
               
        faultLines.push(L.polyline(line, {
           color: "yellow",
         }))

    }
    
    // add earthquake layer to map
    var plates = L.geoJson(lineData, {
        onEachFeature: onEachFeature
    });

    overlayMaps["Fault Lines"] = L.layerGroup(faultLines);

    myMap.addLayer(overlayMaps["Fault Lines"]);

    

}

tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(tectonicURL, function(data) {
     // Once we get a response, send the data.features object to the createFeatures function
     createPlateFeatures(data.features);
});

// Create a legend to display information about our map
var legend = L.control({position: "bottomright"});
legend.onAdd = function (map) {

var div = L.DomUtil.create('div', 'info legend');
labels = [],
categories = ['0-1','1-2','2-3','3-4','4-5','5+'];
colors = ['#CCFF00','#CCCC00','#CC9900','#CC6600','#CC3300','#CC0000']

for (var i = 0; i < categories.length; i++) {

        div.innerHTML += 
        labels.push(
            '<i style="background:' + colors[i] + '"></i> ' +
        (categories[i] ? categories[i] : '+'));

    }
    div.innerHTML = labels.join('<br>');
return div;
};
legend.addTo(myMap);