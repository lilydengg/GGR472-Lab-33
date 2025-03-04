/*--------------------------------------------------------------------
GGR472 WEEK 8: JavaScript for Web Maps
Adding elements and interactivity to the map (JavaScript legend and events)
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
INITIALISE MAP
--------------------------------------------------------------------*/
mapboxgl.accessToken = 'pk.eyJ1IjoibGlseWRlbmciLCJhIjoiY201eGIwOG5jMDB6ZDJqcHJrdGtudzVscSJ9.-cRhTqv-44DxjWWHAi9GmQ'; //***ADD YOUR ACCESS TOKEN HERE***

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/lilydeng/cm7p7o49v019301qsd8cp0uqa', // or select existing mapbox style - https://docs.mapbox.com/api/maps/styles/
    center: [-96.386709, 60.049787],
    zoom: 4,
});


/*--------------------------------------------------------------------
MAP CONTROLS
--------------------------------------------------------------------*/

map.addControl(new mapboxgl.FullscreenControl());

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: "ca"
});

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));


/*--------------------------------------------------------------------
ACCESS AND VISUALIZE DATA
--------------------------------------------------------------------*/
//Add data source and draw initial visiualization of layer
map.on('load', () => {
    map.addSource('canada-provterr', {
        'type': 'vector',
        'url': 'mapbox://lgsmith.843obi8n'
    });

    map.addLayer({
        'id': 'provterr-fill',
        'type': 'fill',
        'source': 'canada-provterr',
        'paint': {
            'fill-color':         [
                'step', // STEP expression produces stepped results based on value pairs
                ['get', 'POP2021'], // GET expression retrieves property value from 'population' data field
                '#fd8d3c', // Colour assigned to any values < first step
                100000, '#fc4e2a', // Colours assigned to values >= each step
                500000, '#e31a1c',
                1000000, '#bd0026',
                5000000, '#800026'
            ],
            'fill-opacity': 0.5,
            'fill-outline-color': 'white'
        },
        'source-layer': 'can-provterr2021-9crjaq'
    });

});


/*--------------------------------------------------------------------
CREATE LEGEND IN JAVASCRIPT
--------------------------------------------------------------------*/
//Declare array variables for labels and colours
const legendlabels = [
    '0-100,000',
    '100,000-500,000',
    '500,000-1,000,000',
    '1,000,000-5,000,000',
    '>5,000,000'
];

const legendcolours = [
    '#fd8d3c',
    '#fc4e2a',
    '#e31a1c',
    '#bd0026',
    '#800026'
];

//Declare legend variable using legend div tag
const legend = document.getElementById('legend');

//For each layer create a block to put the colour and label in
legendlabels.forEach((label, i) => {
    const colour = legendcolours[i];

    const item = document.createElement('div'); //each layer gets a 'row' - this isn't in the legend yet, we do this later
    const key = document.createElement('span'); //add a 'key' to the row. A key will be the colour circle

    key.className = 'legend-key'; //the key will take on the shape and style properties defined in css
    key.style.backgroundColor = colour; // the background color is retreived from teh layers array

    const value = document.createElement('span'); //add a value variable to the 'row' in the legend
    value.innerHTML = `${label}`; //give the value variable text based on the label

    item.appendChild(key); //add the key (colour cirlce) to the legend row
    item.appendChild(value); //add the value to the legend row

    legend.appendChild(item); //add row to the legend
});


/*--------------------------------------------------------------------
ADD INTERACTIVITY BASED ON HTML EVENT
--------------------------------------------------------------------*/

// 1) Add event listener which returns map view to full screen on button click using flyTo method
document.getElementById('returnbutton').addEventListener('click', () => {
    map.flyTo({
        center: [-96.386709, 60.049787],
        zoom: 4,
        essential: true
    });
});


// 2) Change display of legend based on check box
let legendcheck = document.getElementById('legendcheck');

legendcheck.addEventListener('click', () => {
    if (legendcheck.checked) {
        legendcheck.checked = true;
        legend.style.display = 'block';
    }
    else {
        legend.style.display = "none";
        legendcheck.checked = false;
    }
});


// 3) Change map layer display based on check box using setLayoutProperty method
document.getElementById('layercheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'provterr-fill',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});


// 4) Filter data layer to show selected Province from dropdown selection
let boundaryvalue;

document.getElementById("boundaryfieldset").addEventListener('change',(e) => {   
    boundaryvalue = document.getElementById('boundary').value;

    //console.log(boundaryvalue); // Useful for testing whether correct values are returned from dropdown selection

    if (boundaryvalue == 'All') {
        map.setFilter(
            'provterr-fill',
            ['has', 'PRENAME'] // Returns all polygons from layer that have a value in PRENAME field
        );
    } else {
        map.setFilter(
            'provterr-fill',
            ['==', ['get', 'PRENAME'], boundaryvalue] // returns polygon with PRENAME value that matches dropdown selection
        );
    }

});
map.on('click', 'listing_data', (e) => {
    console.log('Click event triggered');
    console.log('Event features:', e.features);

    if (e.features.length > 0) {
        const feature = e.features[0];
        console.log('Feature properties:', feature.properties);

        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML('Area' + " = " +feature.properties.LANDAREA || 'No name available')
            .addTo(map);
    } else {
        console.log('No features found at click location');
    }
});




map.on('mouseenter', 'listing_data', () => {
    map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'listing_data', () => {
    map.getCanvas().style.cursor = '';
});

map.addControl(new mapboxgl.NavigationControl());
//This loads the map so it can be seen
map.on('load', () => {
// This adds the data that outlines the ski resort
map.addSource('listing_data', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/smith-lg/ggr472-wk8-demo1/refs/heads/main/data/can-provterr.geojson', // Corrected URL
});

// This provides a physical aesthetic element to the data
map.addLayer({
    'id': 'listing_data',
    'type': 'fill',
    'source': 'listing_data',
    'paint': {
        'fill-color': [
            'step',
            ['get', 'POP2021'],
            '#fd8d3c',
            100000, '#fc4e2a',
            500000, '#e31a1c',
            1000000, '#bd0026',
            5000000, '#800026'
        ],
        'fill-opacity': 0,
        'fill-outline-color': 'white'
    },

});
});
