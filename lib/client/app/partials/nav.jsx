import React from 'react'
import {Link} from 'react-router-dom'

const NavBar = () => (
	<div className="navbar-fixed">
		<nav>
			<div className="nav-wrapper white">
				<div className="brand-logo left">
					<img alt="The University of Portsmouth logo" className="h100 p8" src="/ports-logo.png" />
				</div>
				<div className="brand-logo right">
					<Link to="/dash">
						<img alt="The DSRU Logo" className="h100 p8 right" src="/dsru-logo.png" />
					</Link>
				</div>
			</div>
		</nav>
	</div>
)

export default NavBar
