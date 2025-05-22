
// Dark mode style for Google Maps
export const darkModeStyle = [
  {
    "featureType": "all",
    "elementType": "labels.text",
    "stylers": [
      {
        "color": "#f9f9f9"
      },
      {
        "weight": "0.50"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#9b87f5"
      },
      {
        "weight": 1.3
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#9b87f5"
      },
      {
        "weight": 2
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#9b87f5"
      },
      {
        "weight": 1.5
      }
    ]
  },
  {
    "featureType": "administrative.continent",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1EAEDB"
      },
      {
        "weight": 3
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#0d0d1f"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#1a1a3a"
      },
      {
        "weight": 1
      },
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#070714"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1EAEDB"
      },
      {
        "weight": 0.5
      },
      {
        "visibility": "on"
      }
    ]
  }
];

// Map container styles
export const mapContainerStyle = {
  width: '100%',
  height: '60vh',
  borderRadius: '0.5rem',
};

// Define map libraries as a constant to prevent rerendering
export const mapLibraries = ["places"] as ["places"];
