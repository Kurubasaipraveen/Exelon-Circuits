const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());


let cities = [];

// API Routes

// Add City API
app.post('/api/cities', (req, res) => {
  const { name, population, country, latitude, longitude } = req.body;

  // Check if city already exists
  const existingCity = cities.find(city => city.name === name);
  if (existingCity) {
    return res.status(400).json({ message: 'City already exists' });
  }

  // Add new city
  const newCity = { name, population, country, latitude, longitude };
  cities.push(newCity);
  res.status(201).json({ message: 'City added successfully', city: newCity });
});

// Update City API
app.put('/api/cities/:name', (req, res) => {
    const { name } = req.params;
    const { population, country, latitude, longitude } = req.body;
  
    // Check if all required fields are provided
    if (!population || !country || !latitude || !longitude) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    // Read the current list of cities
    const cities = readDataFromFile();
  
    // Find the index of the city to be updated
    const cityIndex = cities.findIndex(city => city.name === name);
    
    // If the city is not found, return a 404 error
    if (cityIndex === -1) {
      return res.status(404).json({ message: 'City not found' });
    }
  
    // Update city details
    cities[cityIndex] = { name, population, country, latitude, longitude };
  
    // Write the updated list of cities to the file
    writeDataToFile(cities);
  
    // Respond with the updated city
    res.status(200).json({ message: 'City updated successfully', city: cities[cityIndex] });
  });
  

// Delete City API
app.delete('/api/cities/:name', (req, res) => {
  const { name } = req.params;
  
  const cityIndex = cities.findIndex(city => city.name === name);
  if (cityIndex === -1) {
    return res.status(404).json({ message: 'City not found' });
  }

  // Remove city
  cities.splice(cityIndex, 1);
  res.status(200).json({ message: 'City deleted successfully' });
});

// Get Cities API
app.get('/api/cities', (req, res) => {
  const { page = 1, limit = 10, sort = 'name', search = '', projection = '' } = req.query;

  let filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(search.toLowerCase()) ||
    city.country.toLowerCase().includes(search.toLowerCase())
  );

  if (sort) {
    filteredCities.sort((a, b) => (a[sort] > b[sort] ? 1 : -1));
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);

  let paginatedCities = filteredCities.slice(startIndex, endIndex);

  // Handle projection
  if (projection) {
    const projectionFields = projection.split(',').map(field => field.trim());
    paginatedCities = paginatedCities.map(city =>
      projectionFields.reduce((acc, field) => {
        if (city[field]) acc[field] = city[field];
        return acc;
      }, {})
    );
  }

  res.status(200).json(paginatedCities);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
