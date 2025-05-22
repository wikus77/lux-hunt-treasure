
// Enhanced neon map styles with dynamic border thickness
export const neonMapStyles = [
  {
    featureType: "all",
    elementType: "labels.text",
    stylers: [{ color: "#f9f9f9" }, { weight: "0.50" }, { visibility: "on" }]
  },
  // Administrative borders - Thinner at higher zoom levels
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#9b87f5" }, { weight: 1.3 }, { visibility: "on" }]
  },
  // Country borders - Neon purple for all
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#9b87f5" }, { weight: 2 }, { visibility: "on" }]
  },
  // Provincial/State borders - Slightly thinner
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#9b87f5" }, { weight: 1.5 }, { visibility: "on" }]
  },
  // Background color - Dark blue
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#0d0d1f" }]
  },
  // Hide POIs for cleaner look
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }]
  },
  // Roads - Subtle but visible
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [
      { color: "#1a1a3a" },
      { weight: 1 },
      { visibility: "simplified" }
    ]
  },
  // Simplify road labels
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }]
  },
  // Water areas - Darker blue
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#070714" }]
  },
  // Water borders - Light effect
  {
    featureType: "water",
    elementType: "geometry.stroke",
    stylers: [
      { color: "#1EAEDB" },
      { weight: 0.5 },
      { visibility: "on" }
    ]
  }
];

export const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem"
};

export const defaultCenter = { lat: 45.4642, lng: 9.19 }; // Milano
