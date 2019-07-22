import React from 'react'
import {Link} from 'react-router-dom'

const NavBar = () => (
	<div className="navbar-fixed">
		<nav>
			<div className="nav-wrapper white">
				<a href="#" className="brand-logo black-text">SurveyApp</a>
				<ul id="nav-mobile" className="right">
					<li><Link to="/dash" className="black-text">Dashboard</Link></li>
				</ul>
			</div>
		</nav>
	</div>
)

export default NavBar
