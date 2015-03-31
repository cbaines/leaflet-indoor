/**
 * A layer that will display indoor data
 *
 * addData takes a GeoJSON feature collection, each feature must have a level
 * property that indicates the level.
 *
 * getLevels can be called to get the array of levels that are present.
 */
L.Indoor = L.Class.extend({

    options: {
        // by default the levels are expected to be in the level attribute in
        // the feature properties, pass a replacement function in options if
        // this is not the case.
        getLevel: function(feature) {
            return feature.properties.level;
        }
    },

    initialize: function(data, options) {
        L.setOptions(this, options);
        options = this.options;

        var layers = this._layers = {};
        this._map = null;

        if ("level" in this.options) {
            this._level = this.options.level;
        } else {
            this._level = null;
        }

        if ("onEachFeature" in this.options)
            var onEachFeature = this.options.onEachFeature;

        this.options.onEachFeature = function(feature, layer) {

            if (onEachFeature)
                onEachFeature(feature, layer);

            if ("markerForFeature" in options) {
                var marker = options.markerForFeature(feature);
                if (typeof(marker) !== 'undefined') {
                    marker.on('click', function(e) {
                        layer.fire('click', e);
                    });

                    var level = options.getLevel(feature);

                    if (typeof(level) === 'undefined') {
                        console.warn("level undefined for");
                        console.log(feature);
                    } else {
                        function addToLevel(level) {
                            layers[level].addLayer(marker);
                        }

                        if (L.Util.isArray(level)) {
                            level.forEach(addToLevel);
                        } else {
                            addToLevel(level);
                        }
                    }
                }
            }
        };

        this.addData(data);
    },
    addTo: function (map) {
        map.addLayer(this);
        return this;
    },
    onAdd: function (map) {
        this._map = map;

        if (this._level === null) {
            var levels = this.getLevels();

            if (levels.length !== 0) {
                this._level = levels[0];
            }
        }

        if (this._level !== null) {
            if (this._level in this._layers) {
                this._map.addLayer(this._layers[this._level]);
            } else {
                // TODO: Display warning?
            }
        }
    },
    onRemove: function (map) {
        if (this._level in this._layers) {
            this._map.removeLayer(this._layers[this._level]);
        }

        this._map = null;
    },
    addData: function(data) {
        var layers = this._layers,
            options = this.options,
            features = L.Util.isArray(data) ? data : data.features;

        features.forEach(function (part) {

            var level = options.getLevel(part);

            var layer;

            if (typeof level === 'undefined' ||
                level === null) {
                // TODO: Display warning

                return;
            }

            if (!("geometry" in part)) {
                // TODO: Not sure if this is still needed/display warning
                return;
            }

            // if the feature is on mutiple levels
            if (L.Util.isArray(level)) {
                level.forEach(function(level) {
                    if (level in layers) {
                        layer = layers[level];
                    } else {
                        layer = layers[level] = L.geoJson({
                            type: "FeatureCollection",
                            features: []
                        }, options);
                    }

                    layer.addData(part);
                });
            } else { // feature is on a single level
                if (level in layers) {
                    layer = layers[level];
                } else {
                    layer = layers[level] = L.geoJson({
                        type: "FeatureCollection",
                        features: []
                    }, options);
                }

                layer.addData(part);
            }
        });
    },
    getLevels: function() {
        return Object.keys(this._layers);
    },
    getLevel: function() {
        return this._level;
    },
    setLevel: function(level) {
        if (typeof(level) === 'object') {
            level = level.newLevel;
        }

        if (this._level === level)
            return;

        var oldLayer = this._layers[this._level];
        var layer = this._layers[level];

        if (this._map !== null) {
            if (this._map.hasLayer(oldLayer)) {
                this._map.removeLayer(oldLayer);
            }

            if (layer) {
                this._map.addLayer(layer);
            }
        }

        this._level = level;
    },
    resetStyle: function (layer) {
      // reset any custom styles
      layer.options = layer.defaultOptions;
      this._setLayerStyle(layer, this.options.style);
      return this;
    },
    _setLayerStyle: function (layer, style) {
      if (typeof style === 'function') {
        style = style(layer.feature);
      }
      if (layer.setStyle) {
        layer.setStyle(style);
      }
    }
});

L.indoor = function(data, options) {
    return new L.Indoor(data, options);
};

L.Control.Level = L.Control.extend({
    includes: L.Mixin.Events,

    options: {
        position: 'bottomright',

        // used to get a unique integer for each level to be used to order them
        parseLevel: function(level) {
            return parseInt(level, 10);
        }
    },

    initialize: function(options) {
        L.setOptions(this, options);

        this._map = null;
        this._buttons = {};
        this._listeners = [];
        this._level = options.level;

        this.addEventListener("levelchange", this._levelChange, this);
    },
    onAdd: function(map) {
        var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        div.style.font = "18px 'Lucida Console',Monaco,monospace";

        var buttons = this._buttons;
        var activeLevel = this._level;
        var self = this;

        var levels = [];

        for (var i=0; i<this.options.levels.length; i++) {
            var level = this.options.levels[i];

            var levelNum = self.options.parseLevel(level);

            levels.push({
                num: levelNum,
                label: level
            });
        }

        levels.sort(function(a, b) {
            return a.num - b.num;
        });

        for (i=levels.length-1; i>=0; i--) {
            var level = levels[i].num;
            var originalLevel = levels[i].label;

            var levelBtn = L.DomUtil.create('a', 'leaflet-button-part', div);

            if (level === activeLevel || originalLevel === activeLevel) {
                levelBtn.style.backgroundColor = "#b0b0b0";
            }

            levelBtn.appendChild(levelBtn.ownerDocument.createTextNode(originalLevel));

            (function(level) {
                levelBtn.onclick = function() {
                    self.setLevel(level);
                };
            })(level);

            buttons[level] = levelBtn;
        }

        return div;
    },
    _levelChange: function(e) {
        if (this._map !== null) {
            if (typeof e.oldLevel !== "undefined")
                this._buttons[e.oldLevel].style.backgroundColor = "#FFFFFF";
            this._buttons[e.newLevel].style.backgroundColor = "#b0b0b0";
        }
    },
    setLevel: function(level) {

        if (level === this._level)
            return;

        var oldLevel = this._level;
        this._level = level;

        this.fireEvent("levelchange", {
            oldLevel: oldLevel,
            newLevel: level
        });
    },
    getLevel: function() {
        return this._level;
    }
});

L.Control.level = function (options) {
    return new L.Control.Level(options);
};

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}
