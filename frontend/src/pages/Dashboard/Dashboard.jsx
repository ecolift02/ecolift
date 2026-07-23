// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import PassengerView from '../../components/PassengerView/PassengerView';
import DriverView from '../../components/DriverView/DriverView';
import { useAuth } from '../../context/AuthContext'; // Import your Auth context
// import './Dashboard.css';

const Dashboard = () => {
  // 1. Grab the currently logged-in user directly from your global Auth state!
  const { user } = useAuth();
  
  // 2. State to track whether the user is acting as a PASSENGER or a DRIVER
  // We can even default this based on their actual roles!
  const defaultMode = user?.roles?.includes('DRIVER') ? 'DRIVER' : 'PASSENGER';
  const [dashboardMode, setDashboardMode] = useState(defaultMode);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="welcome-banner">
          {/* 3. DYNAMICALLY INJECT THE USER - Falling back to email if name is missing */}
          <h2>Welcome back, {user?.firstName || user?.name || user?.email || 'Commuter'}!</h2>
          <p>Share rides, reduce emissions, and commute smarter.</p>
        </div>

        {/* Role Toggle Switcher */}
        <div className="role-switcher-tabs">
          <button 
            className={dashboardMode === 'PASSENGER' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setDashboardMode('PASSENGER')}
          >
            Passenger Mode
          </button>
          
          {/* Optional: You could hide this button if the user doesn't have a DRIVER role */}
          <button 
            className={dashboardMode === 'DRIVER' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setDashboardMode('DRIVER')}
          >
            Driver Mode
          </button>
        </div>
      </header>

      {/* Conditional Rendering based on Role */}
      <main className="dashboard-content">
        {dashboardMode === 'PASSENGER' ? <PassengerView /> : <DriverView />}
      </main>
    </div>
  );
};

export default Dashboard;