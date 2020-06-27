// Get your data set
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Import & Visualize the Data

// Create a map using Leaflet that plots all of the earthquakes from your data set based on their longitude and latitude.
var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
});

// Add tilelayer

var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  }).addTo(myMap);

d3.json(url, function(data) {
    createFeatures(data.features);
});

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
       
        L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
           color: colorMag(mag),
           fillColor: colorMag(mag),
           fillOpacity: 0.75,
           radius: Math.pow(2, mag) * 1000,  
         })
         // Include popups that provide additional information about the earthquake when a marker is clicked.
         .bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>Magnitude: " + mag + "</p>")
         .addTo(myMap);

    }
    
    // add earthquake layer to map
    var earthquakes = L.geoJson(earthquakeData, {
        onEachFeature: onEachFeature
    });

    
    
}

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