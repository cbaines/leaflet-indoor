Leaflet Indoor
=====================

Provides basic tools to create indoor maps with
[Leaflet](http://leafletjs.com).

This plugin provides a layer intended for displaying indoor data (rooms,
corridors, ...). It also provides a control component to change the level
displayed.

## Demo

You can see the demo included in the example directory
[here](http://cbaines.net/projects/osm/leaflet-indoor/examples/).

## Using the plugin

See the included example for usage.

### Basic Usage

Create a L.Indoor, then add the data to it.

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

### Usage Instructions

The data should be a GeoJSON feature collection (or an array of GeoJSON
features). With the standard configuration, each feature must have a property
attribute "level", which can be a integer, string or array of either (or both).

    {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                geometry: ...,
                properties: {
                    ...
                    level: 1
                    ....
                }
            },
            {
                type: "Feature",
                geometry: ...,
                properties: {
                    ...
                    level: [2, 3]
                    ....
                }
            }
        ]
    }

If the data is not in this format, you can pass in a replacement getLevel
function, that will be used to get the level for each Feature.

    var indoorLayer = new L.Indoor(data, {
        getLevel: function(feature) {
            return feature.properties.otherLevel;
        }
        onEachFeature

        markerForFeature
    });

L.Control.Level is the user interface component that allows for the easy
switching of levels. It takes in some levels (which you can get from the indoor
layer by using getLevels()), and displays a list.

    var levelControl = new L.Control.Level({
        level: "0",
        levels: indoorLayer.getLevels()
    });

When using the L.Control.Indoor, if the levels are not integers, by default,
the levels will be converted to integers for the ordering in the control. If
the levels given to the control are not integers, then the parseLevel option
can be used to replace the default function that uses parseInt(level, 10).

    var levelControl = new L.Control.Level({
        level: "1A",
        levels: indoorLayer.getLevels()
        parseLevel: function(level) {
            var levels = {
                "1A": 1,
                "1B": 2,
                "1C": 3,
                "2": 4
            };
            return levels[level];
        }
    });

You can then bind the "levelchange" event, to change the level displayed by the
layer. Note that the levels that the control has must match that used by the
layer, if the levels in the control have been set via getLevels), this should
be the case.

    levelControl.addEventListener("levelchange", indoorLayer.setLevel, indoorLayer);

## Events

L.Control.Level will fire levelchange events when a level is selected.

## License

Leaflet Indoor is free software, and may be redistributed under the BSD
2-Clause License.
