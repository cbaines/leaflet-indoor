Leaflet Indoor
=====================

Provides basic tools to create indoor maps with
[Leaflet](http://leafletjs.com).

This plugin provides a layer intended for displaying indoor data (rooms,
corridors, ...). It also provides a control component to change the level
displayed.

## Demo

You can see the demo included in the example directory
[here](http://cbaines.github.io/leaflet-indoor/examples/).

## Using the plugin

See the included example for usage.

### Basic Usage

Create a L.Indoor, then add the data to it.

```javascript
// where data is a GeoJSON feature collection
var indoorLayer = new L.Indoor(data);

// set the initial level to show
indoorLayer.setLevel("0");

indoorLayer.addTo(map);

var levelControl = new L.Control.Level({
    level: "0",
    levels: indoorLayer.getLevels()
});

// Connect the level control to the indoor layer
levelControl.addEventListener("levelchange", indoorLayer.setLevel, indoorLayer);

levelControl.addTo(map);
```

## Events

L.Control.Level will fire levelchange events when a level is selected.

## License

Leaflet Indoor is free software, and may be redistributed under the BSD
2-Clause License.
