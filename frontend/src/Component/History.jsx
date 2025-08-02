// src/Component/History.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const History = () => {
  const [queryHistory, setQueryHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user_information');
    if (!user) {
      navigate('/login');
    } else {
      const userData = JSON.parse(user);
      const savedHistory = JSON.parse(localStorage.getItem(`history_${userData.email}`)) || [];
      setQueryHistory(savedHistory);
    }
  }, []);

  const clearHistory = () => {
    const user = JSON.parse(localStorage.getItem('user_information'));
    if (user?.email) {
      localStorage.removeItem(`history_${user.email}`);
      setQueryHistory([]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f9' }}>
      <Navbar />

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">Your Previous Queries</h3>
          {queryHistory.length > 0 && (
            <button className="btn btn-outline-danger btn-sm" onClick={clearHistory}>
              Clear History
            </button>
          )}
        </div>

        {queryHistory.length === 0 ? (
          <div className="text-muted text-center">No history found.</div>
        ) : (
          <div className="row g-3">
            {[...queryHistory].reverse().map((entry, index) => {
              // If entry is string only (older format), handle gracefully
              const query = typeof entry === 'string' ? entry : entry.query;
              const date = typeof entry === 'object' && entry.date ? new Date(entry.date) : null;

              return (
                <div key={index} className="col-md-6 col-lg-4">
                  <div className="card shadow-sm rounded-4 border-0 h-100 hover-shadow">
                    <div className="card-body">
                      <h6 className="fw-semibold mb-2 text-primary">{query}</h6>
                      {date && (
                        <p className="text-muted small mb-0">
                          <i className="bi bi-clock me-1"></i>
                          {date.toLocaleDateString()} — {date.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
