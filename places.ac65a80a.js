// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"assets/map-marker.png":[function(require,module,exports) {
module.exports = "/map-marker.9f71de28.png";
},{}],"places.js":[function(require,module,exports) {
"use strict";

var _mapMarker = _interopRequireDefault(require("./assets/map-marker.png"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loadPlaces = function loadPlaces(result) {
  // COMMENT FOLLOWING LINE IF YOU WANT TO USE STATIC DATA AND ADD COORDINATES IN THE FOLLOWING 'PLACES' ARRAY
  var method = 'api';
  var PLACES = result.data.activities.map(function (activity) {
    var individual = activity["activity"]["individual"];
    var workplace_geo = activity["activity"]["workplace"]["address"]["location"];
    var activity_name = "".concat(individual["firstName"], " ").concat(individual["lastName"], " (").concat(individual["specialties"].reduce(function (reducer, obj) {
      var sep = "";

      if (reducer.length != 0) {
        sep = ", ";
      }

      return reducer + sep + obj.label;
    }, ""), ")");
    return {
      name: activity_name,
      location: {
        lat: workplace_geo["lat"],
        // add here latitude if using static data
        lng: workplace_geo["lon"] // add here longitude if using static data

      }
    };
  });
  console.log(PLACES); // console.log("CURRENT LOCATION");
  // console.log(coords)
  // if (method === 'api') {
  //     return loadPlaceFromAPIs(coords);
  // }

  return Promise.resolve(PLACES);
};

function processActivites(result) {
  navigator.geolocation.getCurrentPosition(function (position) {
    console.log("POSITION: ");
    console.log(position); // then use it to load from remote APIs some places nearby
    // let geolocations = position.coords;
    // geolocations = {
    // latitude: 40.8185, // add here latitude if using static data
    // longitude: -74.1589, // add here longitude if using static data
    // }

    loadPlaces(result).then(placesHandler);
  }, function (err) {
    return console.error('Error in retrieving position', err);
  }, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 27000
  });
}

var placesHandler = function placesHandler(places) {
  var scene = document.querySelector('a-scene');
  places.forEach(function (place) {
    var latitude = place.location.lat;
    var longitude = place.location.lng; // add place icon

    var icon = document.createElement('a-image');
    icon.setAttribute('gps-entity-place', "latitude: ".concat(latitude, "; longitude: ").concat(longitude));
    icon.setAttribute('name', place.name);
    icon.setAttribute('src', _mapMarker.default); // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...

    icon.setAttribute('scale', '20, 20');
    icon.addEventListener('loaded', function () {
      return window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'));
    });

    var clickListener = function clickListener(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      var name = ev.target.getAttribute('name');
      var el = ev.detail.intersection && ev.detail.intersection.object.el;

      if (el && el === ev.target) {
        var label = document.createElement('span');
        var container = document.createElement('div');
        container.setAttribute('id', 'place-label');
        label.innerText = name;
        container.appendChild(label);
        document.body.appendChild(container);
        setTimeout(function () {
          container.parentElement.removeChild(container);
        }, 1500);
      }
    };

    icon.addEventListener('click', clickListener);
    scene.appendChild(icon);
  });
};

window.onload = function () {
  var hclAPI = new HclAPI({
    apiKey: '300158323ddd217b' // To replace by a working API key

  });
  var params = {
    first: 50,
    offset: 0,
    location: {
      lat: 43.6534817,
      lon: -79.3839347,
      distanceMeter: 2000
    },
    country: "ca",
    criteria: "",
    locale: "en"
  };
  hclAPI.activities(params).then(function (result) {
    // The list of activities
    console.log(result);
    result = {
      "data": {
        "activities": [{
          "distance": 161.5,
          "relevance": 1,
          "activity": {
            "id": "WCAM0008844602",
            "individual": {
              "id": "WCAM00088446",
              "firstName": "Jonathan",
              "lastName": "Levy",
              "middleName": "Michael Stephen",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAE00029833",
              "address": {
                "longLabel": "536-790 Bay St",
                "buildingLabel": "Continental Canada Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6549,
                  "lon": -79.3835
                }
              }
            }
          }
        }, {
          "distance": 161.5,
          "relevance": 2,
          "activity": {
            "id": "WCAM0003025302",
            "individual": {
              "id": "WCAM00030253",
              "firstName": "Jennifer",
              "lastName": "Salsberg",
              "middleName": "Michelle",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAE00029833",
              "address": {
                "longLabel": "536-790 Bay St",
                "buildingLabel": "Continental Canada Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6549,
                  "lon": -79.3835
                }
              }
            }
          }
        }, {
          "distance": 161.5,
          "relevance": 3,
          "activity": {
            "id": "WCAM0002964605",
            "individual": {
              "id": "WCAM00029646",
              "firstName": "Renee",
              "lastName": "Beach",
              "middleName": "Ayana",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAE00029833",
              "address": {
                "longLabel": "536-790 Bay St",
                "buildingLabel": "Continental Canada Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6549,
                  "lon": -79.3835
                }
              }
            }
          }
        }, {
          "distance": 161.5,
          "relevance": 4,
          "activity": {
            "id": "WCAM0009165306",
            "individual": {
              "id": "WCAM00091653",
              "firstName": "Michael",
              "lastName": "Cecchini",
              "middleName": "Matthew John",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAE00029833",
              "address": {
                "longLabel": "536-790 Bay St",
                "buildingLabel": "Continental Canada Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6549,
                  "lon": -79.3835
                }
              }
            }
          }
        }, {
          "distance": 161.5,
          "relevance": 5,
          "activity": {
            "id": "WCAM0005808701",
            "individual": {
              "id": "WCAM00058087",
              "firstName": "Sandra",
              "lastName": "Skotnicki Grant",
              "middleName": "Mary",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAE00029833",
              "address": {
                "longLabel": "536-790 Bay St",
                "buildingLabel": "Continental Canada Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6549,
                  "lon": -79.3835
                }
              }
            }
          }
        }, {
          "distance": 188.6,
          "relevance": 6,
          "activity": {
            "id": "WCAM0005932901",
            "individual": {
              "id": "WCAM00059329",
              "firstName": "Alexandru",
              "lastName": "Opris",
              "middleName": "Antoniu Felician",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00021433",
              "address": {
                "longLabel": "404-1240 Bay St",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6522,
                  "lon": -79.3824
                }
              }
            }
          }
        }, {
          "distance": 188.6,
          "relevance": 7,
          "activity": {
            "id": "WCAM0004000703",
            "individual": {
              "id": "WCAM00040007",
              "firstName": "Catherine",
              "lastName": "Feuer",
              "middleName": "Frances",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00021433",
              "address": {
                "longLabel": "404-1240 Bay St",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6522,
                  "lon": -79.3824
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 8,
          "activity": {
            "id": "WCAM0005420603",
            "individual": {
              "id": "WCAM00054206",
              "firstName": "Edward",
              "lastName": "Bekeris",
              "middleName": "",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00009311",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 9,
          "activity": {
            "id": "WCAM0007779304",
            "individual": {
              "id": "WCAM00077793",
              "firstName": "Renita",
              "lastName": "Ahluwalia",
              "middleName": "",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAH00009311",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 10,
          "activity": {
            "id": "WCAM0005930003",
            "individual": {
              "id": "WCAM00059300",
              "firstName": "John",
              "lastName": "Stephen",
              "middleName": "Daniel",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00009311",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 11,
          "activity": {
            "id": "WCAM0003025303",
            "individual": {
              "id": "WCAM00030253",
              "firstName": "Jennifer",
              "lastName": "Salsberg",
              "middleName": "Michelle",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAH00009311",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 12,
          "activity": {
            "id": "WCAM0005915801",
            "individual": {
              "id": "WCAM00059158",
              "firstName": "James",
              "lastName": "Aw",
              "middleName": "Jinhyck",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00009311",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 13,
          "activity": {
            "id": "WCAM0005795203",
            "individual": {
              "id": "WCAM00057952",
              "firstName": "Elizabeth",
              "lastName": "McKeown",
              "middleName": "Margaret",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00009311",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 14,
          "activity": {
            "id": "WCAM0007486104",
            "individual": {
              "id": "WCAM00074861",
              "firstName": "Julia",
              "lastName": "Carroll",
              "middleName": "Marie",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAH00009311",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 15,
          "activity": {
            "id": "WCAM0005790606",
            "individual": {
              "id": "WCAM00057906",
              "firstName": "Paul",
              "lastName": "Cohen",
              "middleName": "David",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAH00009311",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 16,
          "activity": {
            "id": "WCAM0005917101",
            "individual": {
              "id": "WCAM00059171",
              "firstName": "Susy",
              "lastName": "Lin",
              "middleName": "",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00009311",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 17,
          "activity": {
            "id": "WCAM0009846806",
            "individual": {
              "id": "WCAM00098468",
              "firstName": "Kristy",
              "lastName": "Bailey",
              "middleName": "Elisa",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAH00001232",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 18,
          "activity": {
            "id": "WCAM0005455703",
            "individual": {
              "id": "WCAM00054557",
              "firstName": "Alain",
              "lastName": "Sotto",
              "middleName": "G",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00009311",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 19,
          "activity": {
            "id": "WCAM0004084504",
            "individual": {
              "id": "WCAM00040845",
              "firstName": "William",
              "lastName": "Bateman",
              "middleName": "Aird",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00009311",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 20,
          "activity": {
            "id": "WCAM0005916101",
            "individual": {
              "id": "WCAM00059161",
              "firstName": "Subita",
              "lastName": "Behki",
              "middleName": "",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00009311",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 21,
          "activity": {
            "id": "WCAM0005768306",
            "individual": {
              "id": "WCAM00057683",
              "firstName": "Michelle",
              "lastName": "Levy",
              "middleName": "",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAH00009311",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 22,
          "activity": {
            "id": "WCAM0005830101",
            "individual": {
              "id": "WCAM00058301",
              "firstName": "David",
              "lastName": "Young",
              "middleName": "Shi Fan",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAE00019250",
              "address": {
                "longLabel": "1600-55 York St",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 23,
          "activity": {
            "id": "WCAM0007385001",
            "individual": {
              "id": "WCAM00073850",
              "firstName": "Andrew",
              "lastName": "Peller",
              "middleName": "Angus",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00001232",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 276.01,
          "relevance": 24,
          "activity": {
            "id": "WCAM0004326003",
            "individual": {
              "id": "WCAM00043260",
              "firstName": "Matthew",
              "lastName": "Burnstein",
              "middleName": "David",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00009311",
              "address": {
                "longLabel": "1500-150 York St",
                "buildingLabel": "National Bank Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6511,
                  "lon": -79.3849
                }
              }
            }
          }
        }, {
          "distance": 291.3,
          "relevance": 25,
          "activity": {
            "id": "WCAM0004155302",
            "individual": {
              "id": "WCAM00041553",
              "firstName": "Veena",
              "lastName": "Rai",
              "middleName": "P K",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00009304",
              "address": {
                "longLabel": "F.01-595 Bay St",
                "buildingLabel": "Atrium On Bay",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6561,
                  "lon": -79.3838
                }
              }
            }
          }
        }, {
          "distance": 291.3,
          "relevance": 26,
          "activity": {
            "id": "WCAM0008462902",
            "individual": {
              "id": "WCAM00084629",
              "firstName": "Faith Hallward",
              "lastName": "Paterson",
              "middleName": "",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00009304",
              "address": {
                "longLabel": "F.01-595 Bay St",
                "buildingLabel": "Atrium On Bay",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6561,
                  "lon": -79.3838
                }
              }
            }
          }
        }, {
          "distance": 300.27,
          "relevance": 27,
          "activity": {
            "id": "WCAM0005943303",
            "individual": {
              "id": "WCAM00059433",
              "firstName": "Suan-Seh",
              "lastName": "Foo",
              "middleName": "",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAE00002238",
              "address": {
                "longLabel": "401-790 Bay St",
                "buildingLabel": "Continental Canada Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6515,
                  "lon": -79.3814
                }
              }
            }
          }
        }, {
          "distance": 327.29,
          "relevance": 28,
          "activity": {
            "id": "WCAM0005370702",
            "individual": {
              "id": "WCAM00053707",
              "firstName": "Kan",
              "lastName": "Fung",
              "middleName": "Ying",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00022075",
              "address": {
                "longLabel": "201-480 Dundas St W",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6549,
                  "lon": -79.3875
                }
              }
            }
          }
        }, {
          "distance": 327.29,
          "relevance": 29,
          "activity": {
            "id": "WCAM0005370402",
            "individual": {
              "id": "WCAM00053704",
              "firstName": "John",
              "lastName": "Chan",
              "middleName": "Wing Lun",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00022075",
              "address": {
                "longLabel": "201-480 Dundas St W",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6549,
                  "lon": -79.3875
                }
              }
            }
          }
        }, {
          "distance": 327.29,
          "relevance": 30,
          "activity": {
            "id": "WCAM0005961901",
            "individual": {
              "id": "WCAM00059619",
              "firstName": "King Sun",
              "lastName": "Chan",
              "middleName": "",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00022075",
              "address": {
                "longLabel": "201-480 Dundas St W",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6549,
                  "lon": -79.3875
                }
              }
            }
          }
        }, {
          "distance": 327.54,
          "relevance": 31,
          "activity": {
            "id": "WCAM0008591404",
            "individual": {
              "id": "WCAM00085914",
              "firstName": "Glen",
              "lastName": "Armstrong",
              "middleName": "Lawrence",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00076757",
              "address": {
                "longLabel": "112 10 St",
                "buildingLabel": "",
                "county": {
                  "label": "Alberta"
                },
                "city": {
                  "label": "Beaverlodge"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6513,
                  "lon": -79.3812
                }
              }
            }
          }
        }, {
          "distance": 329.53,
          "relevance": 32,
          "activity": {
            "id": "WCAM0005965903",
            "individual": {
              "id": "WCAM00059659",
              "firstName": "Ying",
              "lastName": "Toong",
              "middleName": "Lai Hannah",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAE00056367",
              "address": {
                "longLabel": "601-123 Edward St",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6556,
                  "lon": -79.3868
                }
              }
            }
          }
        }, {
          "distance": 329.53,
          "relevance": 33,
          "activity": {
            "id": "WCAM0005853301",
            "individual": {
              "id": "WCAM00058533",
              "firstName": "Peter",
              "lastName": "Satok",
              "middleName": "Maxwell",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00018667",
              "address": {
                "longLabel": "718-123 Edward St",
                "buildingLabel": "Toronto Professional Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6556,
                  "lon": -79.3868
                }
              }
            }
          }
        }, {
          "distance": 340.96,
          "relevance": 34,
          "activity": {
            "id": "WCAM0005759701",
            "individual": {
              "id": "WCAM00057597",
              "firstName": "Ariz",
              "lastName": "Engineer",
              "middleName": "Aspi",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00026766",
              "address": {
                "longLabel": "209-2401 Yonge St",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6536,
                  "lon": -79.3797
                }
              }
            }
          }
        }, {
          "distance": 343.35,
          "relevance": 35,
          "activity": {
            "id": "WCAM0005819701",
            "individual": {
              "id": "WCAM00058197",
              "firstName": "Ian",
              "lastName": "Gallimore",
              "middleName": "Christopher Graham",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAE00014455",
              "address": {
                "longLabel": "210-1849 Yonge St",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6531,
                  "lon": -79.3797
                }
              }
            }
          }
        }, {
          "distance": 345.77,
          "relevance": 36,
          "activity": {
            "id": "WCAM0009599702",
            "individual": {
              "id": "WCAM00095997",
              "firstName": "Michael",
              "lastName": "Schiff",
              "middleName": "Dov",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00064802",
              "address": {
                "longLabel": "400-123 Edward St",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6558,
                  "lon": -79.3868
                }
              }
            }
          }
        }, {
          "distance": 352.85,
          "relevance": 37,
          "activity": {
            "id": "WCAM0006012601",
            "individual": {
              "id": "WCAM00060126",
              "firstName": "Raafat",
              "lastName": "Gindi",
              "middleName": "Fahim",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAE00042016",
              "address": {
                "longLabel": "206-1366 Yonge St",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.653,
                  "lon": -79.3796
                }
              }
            }
          }
        }, {
          "distance": 354.71,
          "relevance": 38,
          "activity": {
            "id": "WCAM0005782005",
            "individual": {
              "id": "WCAM00057820",
              "firstName": "Rami",
              "lastName": "Mozes",
              "middleName": "Shaul",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAE00039620",
              "address": {
                "longLabel": "202-2401 Yonge St",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6529,
                  "lon": -79.3796
                }
              }
            }
          }
        }, {
          "distance": 384.17,
          "relevance": 39,
          "activity": {
            "id": "WCAM0006015501",
            "individual": {
              "id": "WCAM00060155",
              "firstName": "Kenneth",
              "lastName": "Harrison",
              "middleName": "John",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00018265",
              "address": {
                "longLabel": "2.4-1001 Queen St W",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6524,
                  "lon": -79.3794
                }
              }
            }
          }
        }, {
          "distance": 393.63,
          "relevance": 40,
          "activity": {
            "id": "WCAM0003376210",
            "individual": {
              "id": "WCAM00033762",
              "firstName": "Sanjay",
              "lastName": "Siddha",
              "middleName": "Kumar",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAE00042027",
              "address": {
                "longLabel": "309-1366 Yonge St",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6562,
                  "lon": -79.3808
                }
              }
            }
          }
        }, {
          "distance": 393.63,
          "relevance": 41,
          "activity": {
            "id": "WCAM0003556202",
            "individual": {
              "id": "WCAM00035562",
              "firstName": "Martie",
              "lastName": "Gidon",
              "middleName": "Sigrid",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAE00002167",
              "address": {
                "longLabel": "307-1849 Yonge St",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6562,
                  "lon": -79.3808
                }
              }
            }
          }
        }, {
          "distance": 393.63,
          "relevance": 42,
          "activity": {
            "id": "WCAM0005930201",
            "individual": {
              "id": "WCAM00059302",
              "firstName": "Brenda",
              "lastName": "Woolley",
              "middleName": "A",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00028193",
              "address": {
                "longLabel": "305-1366 Yonge St",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6562,
                  "lon": -79.3808
                }
              }
            }
          }
        }, {
          "distance": 402.9,
          "relevance": 43,
          "activity": {
            "id": "WCAM0006032901",
            "individual": {
              "id": "WCAM00060329",
              "firstName": "Robert",
              "lastName": "Stachula",
              "middleName": "Bogdan Jan",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAE00033521",
              "address": {
                "longLabel": "214-2238 Dundas St W",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6548,
                  "lon": -79.3886
                }
              }
            }
          }
        }, {
          "distance": 408.57,
          "relevance": 44,
          "activity": {
            "id": "WCAM0005957002",
            "individual": {
              "id": "WCAM00059570",
              "firstName": "Katarina",
              "lastName": "Fiala",
              "middleName": "",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAH00002873",
              "address": {
                "longLabel": "250 University Ave",
                "buildingLabel": "Bank of Canada Building",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6504,
                  "lon": -79.3867
                }
              }
            }
          }
        }, {
          "distance": 416.2,
          "relevance": 45,
          "activity": {
            "id": "WCAM0006479701",
            "individual": {
              "id": "WCAM00064797",
              "firstName": "Isaac",
              "lastName": "Odame",
              "middleName": "",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00016496",
              "address": {
                "longLabel": "BW-9411-555 University Ave",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6551,
                  "lon": -79.3886
                }
              }
            }
          }
        }, {
          "distance": 416.2,
          "relevance": 46,
          "activity": {
            "id": "WCAM0011120703",
            "individual": {
              "id": "WCAM00111207",
              "firstName": "Patrik",
              "lastName": "Rogalla",
              "middleName": "",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00079541",
              "address": {
                "longLabel": "3-920-610 University Ave",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6551,
                  "lon": -79.3886
                }
              }
            }
          }
        }, {
          "distance": 416.2,
          "relevance": 47,
          "activity": {
            "id": "WCAM0003374502",
            "individual": {
              "id": "WCAM00033745",
              "firstName": "Miriam",
              "lastName": "Weinstein",
              "middleName": "Gayla",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }, {
                "label": "Pediatrics"
              }]
            },
            "workplace": {
              "id": "WCAH00016376",
              "address": {
                "longLabel": "555 University Ave Main Floor",
                "buildingLabel": "Elm Wing",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6551,
                  "lon": -79.3886
                }
              }
            }
          }
        }, {
          "distance": 416.2,
          "relevance": 48,
          "activity": {
            "id": "WCAM0003375803",
            "individual": {
              "id": "WCAM00033758",
              "firstName": "Maria",
              "lastName": "Lansang",
              "middleName": "Perla Lucila Estevez Tecson",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "Dermatology"
              }]
            },
            "workplace": {
              "id": "WCAH00016376",
              "address": {
                "longLabel": "555 University Ave Main Floor",
                "buildingLabel": "Elm Wing",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6551,
                  "lon": -79.3886
                }
              }
            }
          }
        }, {
          "distance": 421.96,
          "relevance": 49,
          "activity": {
            "id": "WCAM0008001901",
            "individual": {
              "id": "WCAM00080019",
              "firstName": "Natasha",
              "lastName": "Crowcroft",
              "middleName": "Sarah",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00029270",
              "address": {
                "longLabel": "300-480 University Ave",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6549,
                  "lon": -79.3888
                }
              }
            }
          }
        }, {
          "distance": 421.96,
          "relevance": 50,
          "activity": {
            "id": "WCAM0005353303",
            "individual": {
              "id": "WCAM00053533",
              "firstName": "Giorgio",
              "lastName": "Pasut",
              "middleName": "",
              "professionalType": {
                "label": "Physician"
              },
              "specialties": [{
                "label": "General Practice"
              }]
            },
            "workplace": {
              "id": "WCAH00029270",
              "address": {
                "longLabel": "300-480 University Ave",
                "buildingLabel": "",
                "county": {
                  "label": "Ontario"
                },
                "city": {
                  "label": "Toronto"
                },
                "country": "CA",
                "location": {
                  "lat": 43.6549,
                  "lon": -79.3888
                }
              }
            }
          }
        }]
      }
    };
    processActivites(result);
  }).catch(function (err) {// An error happened.
  });
};
},{"./assets/map-marker.png":"assets/map-marker.png"}],"../../.nvm/versions/node/v14.16.1/pnpm-global/5/node_modules/.pnpm/parcel-bundler@1.12.5/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "43901" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../.nvm/versions/node/v14.16.1/pnpm-global/5/node_modules/.pnpm/parcel-bundler@1.12.5/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","places.js"], null)
//# sourceMappingURL=/places.ac65a80a.js.map