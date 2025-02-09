const zipCodes = {
    "10001": { city: "New York", state: "NY", lat: 40.7128, lng: -74.0060 },
    "90210": { city: "Beverly Hills", state: "CA", lat: 34.1030, lng: -118.4105 },
    "33101": { city: "Miami", state: "FL", lat: 25.7617, lng: -80.1918 },
    "60601": { city: "Chicago", state: "IL", lat: 41.8781, lng: -87.6298 },
    "77001": { city: "Houston", state: "TX", lat: 29.7604, lng: -95.3698 }
};

// Create a more efficient search structure
const searchData = [];
for (const zip in zipCodes) {
  const { city, state, lat, lng } = zipCodes[zip];
  const cityState = `${city}, ${state}`.toLowerCase();
  searchData.push({ type: 'zip', zip, city, state, cityState, lat, lng });
  searchData.push({ type: 'cityState', zip, city, state, cityState, lat, lng });
}

const searchInput = document.getElementById('searchInput');
const resultDiv = document.getElementById('result');
const mapDiv = document.getElementById('map');

// Initialize the map (but don't display it yet)
const map = L.map(mapDiv).setView([37.8, -96], 4); // Centered on the US

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

let currentMarker = null; // Keep track of the current marker

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  resultDiv.innerHTML = ''; // Clear previous results

  if (!query) {
    if (currentMarker) {
      map.removeLayer(currentMarker);
      currentMarker = null;
    }
    mapDiv.style.display = 'none'; // Hide the map
    return;
  }

  const matches = [];

  // Perform the search
  for (const item of searchData) {
    if (item.type === 'zip' && item.zip.startsWith(query)) {
      matches.push(item);
    } else if (item.type === 'cityState' && item.cityState.includes(query)) {
      matches.push(item);
    }
  }

  // Display results and update map
  if (matches.length > 0) {
    const displayedZips = new Set();

        for (const match of matches) {
            if (!displayedZips.has(match.zip)) {
                const resultElement = document.createElement('div');
                resultElement.textContent = `${match.city}, ${match.state} (${match.zip})`;
                resultElement.classList.add(match.type === 'zip' ? 'zip-match' : 'city-state-match');
                resultDiv.appendChild(resultElement);
                displayedZips.add(match.zip);

              if (match.lat && match.lng) {
                if (currentMarker) {
                    map.removeLayer(currentMarker);
                }
                currentMarker = L.marker([match.lat, match.lng]).addTo(map);
                map.setView([match.lat, match.lng], 10); // Adjust zoom level
                currentMarker.bindPopup(`${match.city}, ${match.state} (${match.zip})`).openPopup();
                mapDiv.style.display = 'block'; // Show the map
                map.invalidateSize(); // Very important!
              }
            }
        }


  } else {
    resultDiv.textContent = "No matches found.";
     if (currentMarker) {
      map.removeLayer(currentMarker);
      currentMarker = null;
    }
    mapDiv.style.display = 'none'; // Hide the map
  }
});
