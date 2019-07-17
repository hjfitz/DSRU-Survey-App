import React from 'react'
import NavBar from './partials/nav'

const Layout = (props) => (
  <React.Fragment>
    <NavBar />
    <div className="container">
      {props.children}
    </div>
  </React.Fragment>
)

export default Layout
