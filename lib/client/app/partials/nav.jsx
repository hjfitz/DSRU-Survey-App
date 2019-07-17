import React from 'react';
import {Link} from 'react-router-dom'

const NavBar = () => (
  <nav>
    <div className="nav-wrapper">
      <a href="#" className="brand-logo">SurveyApp</a>
      <ul id="nav-mobile" className="right hide-on-med-and-down">
        <li><Link to="/dash">Admin Panel</Link></li>
      </ul>
    </div>
  </nav>
)

export default NavBar