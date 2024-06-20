import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="header">
      <div className="menu-icon" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>
      <nav className={`nav-menu ${isOpen ? 'active' : ''}`}>
        <div className="close-icon" onClick={toggleMenu}>
          <FaTimes />
        </div>
        <Link className="nav-link" to='/' onClick={toggleMenu}>Home</Link>
        <Link className="nav-link" to='/login' onClick={toggleMenu}>Login</Link>
        <Link className="nav-link" to='/profilepage' onClick={toggleMenu}>Profile</Link>
        <Link className="nav-link" to='/Playnow' onClick={toggleMenu}>Find Games</Link>
        <Link className="nav-link" to='/livefeed' onClick={toggleMenu}>Live Feed</Link>
      </nav>
    </div>
  );
}

export default Header;





