// src/components/DriverView/DriverView.jsx
import React from 'react';

const DriverView = () => {
  return (
    <div className="driver-view" style={{ padding: '20px', background: '#e9ecef', borderRadius: '8px', marginTop: '20px' }}>
      <h3>Publish a Ride</h3>
      <p>Share your empty seats and reduce emissions.</p>
      
      <form style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <input type="text" placeholder="Source City" />
        <input type="text" placeholder="Destination City" />
        <label>Departure Time: <input type="datetime-local" /></label>
        <label>Arrival Time: <input type="datetime-local" /></label>
        <label>Available Seats: <input type="number" min="1" max="7" defaultValue="3" /></label>
        <button type="button" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none' }}>
          Publish Route
        </button>
      </form>
    </div>
  );
};

export default DriverView;