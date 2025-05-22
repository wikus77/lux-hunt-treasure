
// Dark mode style for Google Maps - Refined for M1SSION branding
export const darkModeStyle = [
  // Background - Neutral dark
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#121220"
      }
    ]
  },
  // Text elements
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
        "color": "#1a1a2a"
      }
    ]
  },
  // Administrative boundaries with subtle M1SSION violet
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#B960FF"
      },
      {
        "weight": 0.8
      },
      {
        "visibility": "on"
      }
    ]
  },
  // Country borders - M1SSION cyan
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#00D1FF"
      },
      {
        "weight": 1.2
      },
      {
        "visibility": "on"
      }
    ]
  },
  // Province borders - lighter violet
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#B960FF"
      },
      {
        "weight": 0.7
      }
    ]
  },
  // Landscape background
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#121220"
      }
    ]
  },
  // Hide POIs for cleaner look
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  // Regular roads - subtle dark
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#1e1e30"
      },
      {
        "weight": 1
      },
      {
        "visibility": "simplified"
      }
    ]
  },
  // Highways - M1SSION violet with glow effect
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#B960FF"
      },
      {
        "weight": 0.8
      }
    ]
  },
  // Arterial roads - M1SSION cyan
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#00D1FF"
      },
      {
        "weight": 0.6
      }
    ]
  },
  // Local roads - subtle magenta
  {
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#7B2EFF"
      },
      {
        "weight": 0.4
      }
    ]
  },
  // Simplify road labels
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  },
  // Water areas - dark blue
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#0a0a18"
      }
    ]
  },
  // Water edges - subtle cyan
  {
    "featureType": "water",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#00D1FF"
      },
      {
        "weight": 0.4
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
