import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Component to Add City
const AddCityForm = ({ onBack }) => {
  const [city, setCity] = useState({
    name: '',
    population: '',
    country: '',
    latitude: '',
    longitude: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCity({ ...city, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/cities', city);
      onBack(); // Notify parent component of success
    } catch (error) {
      setError('Error adding city');
      console.error('Add City Error:', error); // Log detailed error for debugging
    }
  };

  return (
    <div>
      <h1>Add City</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="City Name"
          value={city.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="population"
          placeholder="Population"
          value={city.population}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={city.country}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="latitude"
          placeholder="Latitude"
          value={city.latitude}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="longitude"
          placeholder="Longitude"
          value={city.longitude}
          onChange={handleChange}
          required
        />
        <button type="submit">Add City</button>
      </form>
      {error && <p>{error}</p>}
      <button onClick={onBack}>Back to List</button>
    </div>
  );
};

// Component to Update City
const UpdateCityForm = ({ city, onUpdateSuccess, onCancel }) => {
  const [updatedCity, setUpdatedCity] = useState(city);
  const [error, setError] = useState('');

  useEffect(() => {
    setUpdatedCity(city);
  }, [city]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCity(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure the name field is not updated if it's meant to be unique
      const { name, ...cityUpdates } = updatedCity;
      
      // Send the updated city details to the backend
      await axios.put(`http://localhost:5000/api/cities/${name}`, cityUpdates);
      
      // Notify parent component of success
      onUpdateSuccess(); 
    } catch (error) {
      setError('Error updating city');
      console.error('Update City Error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <h1>Update City</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={updatedCity.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="population"
          value={updatedCity.population}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="country"
          value={updatedCity.country}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="latitude"
          value={updatedCity.latitude}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="longitude"
          value={updatedCity.longitude}
          onChange={handleChange}
          required
        />
        <button type="submit">Update City</button>
      </form>
      {error && <p>{error}</p>}
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

// Component to Delete City
const DeleteCity = ({ city, onDeleteSuccess, onCancel }) => {
  const [error, setError] = useState('');

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/cities/${city.name}`);
      onDeleteSuccess(); // Notify parent component of success
    } catch (error) {
      setError('Error deleting city');
      console.error('Delete City Error:', error); // Log detailed error for debugging
    }
  };

  return (
    <div>
      <h1>Delete City</h1>
      <p>Are you sure you want to delete {city.name}?</p>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={onCancel}>Cancel</button>
      {error && <p>{error}</p>}
    </div>
  );
};

// Component to List Cities
const CityList = ({ onUpdateClick, onDeleteClick }) => {
  const [cities, setCities] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cities');
        setCities(response.data);
      } catch (error) {
        setError('Error fetching cities');
        console.error('Fetch Cities Error:', error); // Log detailed error for debugging
      }
    };
    fetchCities();
  }, []);

  return (
    <div>
      <h1>City List</h1>
      <ul>
        {cities.map((city) => (
          <li key={city.name}>
            {city.name} - {city.country} - {city.population}-{city.latitude}-{city.longitude}
            <button onClick={() => onUpdateClick(city)}>Update</button>
            <button onClick={() => onDeleteClick(city)}>Delete</button>
          </li>
        ))}
      </ul>
      {error && <p>{error}</p>}
    </div>
  );
};

// Main App Component
function App() {
  const [view, setView] = useState('list');
  const [selectedCity, setSelectedCity] = useState(null);

  const handleAddClick = () => setView('add');
  const handleUpdateClick = (city) => {
    setSelectedCity(city);
    setView('update');
  };
  const handleDeleteClick = (city) => {
    setSelectedCity(city);
    setView('delete');
  };
  const handleBackClick = () => setView('list');
  const handleUpdateSuccess = () => setView('list');
  const handleDeleteSuccess = () => setView('list');

  return (
    <div className="App">
      <header>
        <h1>City Management</h1>
      </header>
      <main>
        {view === 'list' && (
          <>
            <button onClick={handleAddClick}>Add City</button>
            <CityList onUpdateClick={handleUpdateClick} onDeleteClick={handleDeleteClick} />
          </>
        )}
        {view === 'add' && <AddCityForm onBack={handleBackClick} />}
        {view === 'update' && (
          <UpdateCityForm
            city={selectedCity}
            onUpdateSuccess={handleUpdateSuccess}
            onCancel={handleBackClick}
          />
        )}
        {view === 'delete' && (
          <DeleteCity
            city={selectedCity}
            onDeleteSuccess={handleDeleteSuccess}
            onCancel={handleBackClick}
          />
        )}
      </main>
    </div>
  );
}

export default App;
