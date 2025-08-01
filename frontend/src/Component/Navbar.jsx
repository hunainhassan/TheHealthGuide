// src/Component/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
      <Link className="navbar-brand fw-bold" to="/">The Health Guide</Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link className="nav-link text-white" to="/dashboard">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/dashboard">Doctor Suggest</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/history">History</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/login">Logout</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
