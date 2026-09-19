/**
 * JyotishVeda — a small built-in place list so the tools work without any
 * third-party geocoding call. Latitude is north-positive, longitude is
 * east-positive, and `tz` is the standard UTC offset in hours.
 *
 * Birthplaces not on the list can be entered by coordinates directly.
 */
export const PLACES = Object.freeze([
  { name: "Delhi, India", lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { name: "Mumbai, India", lat: 19.0760, lon: 72.8777, tz: 5.5 },
  { name: "Pune, India", lat: 18.5204, lon: 73.8567, tz: 5.5 },
  { name: "Nagpur, India", lat: 21.1458, lon: 79.0882, tz: 5.5 },
  { name: "Kolkata, India", lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { name: "Chennai, India", lat: 13.0827, lon: 80.2707, tz: 5.5 },
  { name: "Bengaluru, India", lat: 12.9716, lon: 77.5946, tz: 5.5 },
  { name: "Hyderabad, India", lat: 17.3850, lon: 78.4867, tz: 5.5 },
  { name: "Ahmedabad, India", lat: 23.0225, lon: 72.5714, tz: 5.5 },
  { name: "Jaipur, India", lat: 26.9124, lon: 75.7873, tz: 5.5 },
  { name: "Lucknow, India", lat: 26.8467, lon: 80.9462, tz: 5.5 },
  { name: "Kanpur, India", lat: 26.4499, lon: 80.3319, tz: 5.5 },
  { name: "Patna, India", lat: 25.5941, lon: 85.1376, tz: 5.5 },
  { name: "Bhopal, India", lat: 23.2599, lon: 77.4126, tz: 5.5 },
  { name: "Indore, India", lat: 22.7196, lon: 75.8577, tz: 5.5 },
  { name: "Surat, India", lat: 21.1702, lon: 72.8311, tz: 5.5 },
  { name: "Nashik, India", lat: 19.9975, lon: 73.7898, tz: 5.5 },
  { name: "Aurangabad, India", lat: 19.8762, lon: 75.3433, tz: 5.5 },
  { name: "Varanasi, India", lat: 25.3176, lon: 82.9739, tz: 5.5 },
  { name: "Amritsar, India", lat: 31.6340, lon: 74.8723, tz: 5.5 },
  { name: "Chandigarh, India", lat: 30.7333, lon: 76.7794, tz: 5.5 },
  { name: "Guwahati, India", lat: 26.1445, lon: 91.7362, tz: 5.5 },
  { name: "Bhubaneswar, India", lat: 20.2961, lon: 85.8245, tz: 5.5 },
  { name: "Kochi, India", lat: 9.9312, lon: 76.2673, tz: 5.5 },
  { name: "Thiruvananthapuram, India", lat: 8.5241, lon: 76.9366, tz: 5.5 },
  { name: "Coimbatore, India", lat: 11.0168, lon: 76.9558, tz: 5.5 },
  { name: "Visakhapatnam, India", lat: 17.6868, lon: 83.2185, tz: 5.5 },
  { name: "Ludhiana, India", lat: 30.9010, lon: 75.8573, tz: 5.5 },
  { name: "Raipur, India", lat: 21.2514, lon: 81.6296, tz: 5.5 },
  { name: "Ranchi, India", lat: 23.3441, lon: 85.3096, tz: 5.5 },
  { name: "Dehradun, India", lat: 30.3165, lon: 78.0322, tz: 5.5 },
  { name: "Srinagar, India", lat: 34.0837, lon: 74.7973, tz: 5.5 },
  { name: "Ujjain, India", lat: 23.1793, lon: 75.7849, tz: 5.5 },
  { name: "Tirupati, India", lat: 13.6288, lon: 79.4192, tz: 5.5 },
  { name: "Kathmandu, Nepal", lat: 27.7172, lon: 85.3240, tz: 5.75 },
  { name: "Colombo, Sri Lanka", lat: 6.9271, lon: 79.8612, tz: 5.5 },
  { name: "Dhaka, Bangladesh", lat: 23.8103, lon: 90.4125, tz: 6 },
  { name: "Karachi, Pakistan", lat: 24.8607, lon: 67.0011, tz: 5 },
  { name: "Lahore, Pakistan", lat: 31.5204, lon: 74.3587, tz: 5 },
  { name: "Dubai, UAE", lat: 25.2048, lon: 55.2708, tz: 4 },
  { name: "Doha, Qatar", lat: 25.2854, lon: 51.5310, tz: 3 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, tz: 8 },
  { name: "Kuala Lumpur, Malaysia", lat: 3.1390, lon: 101.6869, tz: 8 },
  { name: "Bangkok, Thailand", lat: 13.7563, lon: 100.5018, tz: 7 },
  { name: "Hong Kong", lat: 22.3193, lon: 114.1694, tz: 8 },
  { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503, tz: 9 },
  { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093, tz: 10 },
  { name: "Melbourne, Australia", lat: -37.8136, lon: 144.9631, tz: 10 },
  { name: "Auckland, New Zealand", lat: -36.8485, lon: 174.7633, tz: 12 },
  { name: "London, UK", lat: 51.5074, lon: -0.1278, tz: 0 },
  { name: "Birmingham, UK", lat: 52.4862, lon: -1.8904, tz: 0 },
  { name: "Dublin, Ireland", lat: 53.3498, lon: -6.2603, tz: 0 },
  { name: "Paris, France", lat: 48.8566, lon: 2.3522, tz: 1 },
  { name: "Berlin, Germany", lat: 52.5200, lon: 13.4050, tz: 1 },
  { name: "Zurich, Switzerland", lat: 47.3769, lon: 8.5417, tz: 1 },
  { name: "Moscow, Russia", lat: 55.7558, lon: 37.6173, tz: 3 },
  { name: "Nairobi, Kenya", lat: -1.2921, lon: 36.8219, tz: 3 },
  { name: "Johannesburg, South Africa", lat: -26.2041, lon: 28.0473, tz: 2 },
  { name: "Lagos, Nigeria", lat: 6.5244, lon: 3.3792, tz: 1 },
  { name: "Dubai Marina, UAE", lat: 25.0805, lon: 55.1403, tz: 4 },
  { name: "New York, USA", lat: 40.7128, lon: -74.0060, tz: -5 },
  { name: "Chicago, USA", lat: 41.8781, lon: -87.6298, tz: -6 },
  { name: "Houston, USA", lat: 29.7604, lon: -95.3698, tz: -6 },
  { name: "San Francisco, USA", lat: 37.7749, lon: -122.4194, tz: -8 },
  { name: "Los Angeles, USA", lat: 34.0522, lon: -118.2437, tz: -8 },
  { name: "Seattle, USA", lat: 47.6062, lon: -122.3321, tz: -8 },
  { name: "Toronto, Canada", lat: 43.6532, lon: -79.3832, tz: -5 },
  { name: "Vancouver, Canada", lat: 49.2827, lon: -123.1207, tz: -8 },
  { name: "Mexico City, Mexico", lat: 19.4326, lon: -99.1332, tz: -6 },
  { name: "São Paulo, Brazil", lat: -23.5505, lon: -46.6333, tz: -3 },
]);

/** Fill a <select> with the built-in place list. */
export function populatePlaceSelect(select, defaultName = "Delhi, India") {
  PLACES.forEach((p, i) => {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = p.name;
    if (p.name === defaultName) option.selected = true;
    select.appendChild(option);
  });
  const custom = document.createElement("option");
  custom.value = "custom";
  custom.textContent = "Other — enter coordinates";
  select.appendChild(custom);
}

export function placeAt(value) {
  return PLACES[Number(value)] || null;
}

