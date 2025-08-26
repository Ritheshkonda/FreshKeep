import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Navbar.css";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <button
        className="navbar-toggle-btn"
        onClick={toggleMenu}
        aria-expanded={isOpen}
      >
        <div className="hamburger-icon">
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </div>
      </button>

      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        <NavLink to="/" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
          Home
        </NavLink>
        <NavLink to="/add-food" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
          Add Food
        </NavLink>
        <NavLink to="/inventory" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
          Inventory
        </NavLink>
        <NavLink to="/recipe" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
          Recipes
        </NavLink>
        <NavLink to="/about" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
          About
        </NavLink>
      </div>
    </nav>
  );
}

export default NavBar;