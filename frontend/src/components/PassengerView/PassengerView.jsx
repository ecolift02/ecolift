// src/components/PassengerView/PassengerView.jsx
import React from 'react';

const PassengerView = () => {
  return (
    <div className="passenger-view" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginTop: '20px' }}>
      <h3>Search for a Ride</h3>
      <p>Enter your route to find available drivers.</p>
      
      <form style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <input type="text" placeholder="Leaving from..." />
        <input type="text" placeholder="Going to..." />
        <label>Departure Time: <input type="datetime-local" /></label>
        <label>Desired Arrival: <input type="datetime-local" /></label>
        <button type="button" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none' }}>
          Search Rides
        </button>
      </form>
    </div>
  );
};

export default PassengerView;