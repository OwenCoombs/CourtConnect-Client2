import React from 'react';
import { Link } from 'react-router-dom';


function Header() {
  return (
    <div className="header">
      <Link className="nav-link" to='/'>Home</Link>
      <Link className="nav-link" to='/login'>Login</Link>
      <Link className="nav-link" to='/profilepage'>Profile</Link>
      <Link className="nav-link" to='/Playnow'>Find Games</Link>
    </div>
  );
}

export default Header;