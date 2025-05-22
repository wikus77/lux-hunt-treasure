
// Dark mode style for Google Maps
export const darkModeStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#0d0d1f"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#f8f8f8"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1a1a1a"
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
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#7B2EFF"
      },
      {
        "weight": 0.8
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#1EAEDB"
      },
      {
        "weight": 0.6
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#D946EF"
      },
      {
        "weight": 0.4
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
