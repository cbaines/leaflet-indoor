Leaflet Indoor
=====================

Provides basic tools to create indoor maps with
[Leaflet](http://leafletjs.com).

## Demo

You can see the demo included in the example directory
[here](http://cbaines.github.io/leaflet-indoor/examples/).

## Using the plugin

See the included examples for usage.

### Basic Usage

Create a L.IndoorLayer, then add the data to it.

```javascript
var indoorLayer = new L.IndoorLayer();

var levelControl = new L.Control.Level()

// Connect the level control to the indoor layer
levelControl.addEventListener("levelchange", indoorLayer.setLevel, indoorLayer);
```

## Events

L.Control.Level will fire levelchange events when a level is selected.

## License

Leaflet Indoor is free software, and may be redistributed under the
MIT-LICENSE.
