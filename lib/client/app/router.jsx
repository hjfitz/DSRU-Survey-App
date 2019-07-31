import 'core-js/stable'
import 'regenerator-runtime/runtime'


import React from 'react'
import {render} from 'react-dom'
import {BrowserRouter as Router, Route} from 'react-router-dom'

// styles

// page imports
import Dashboard from './pages/Dash'
import SurveyBuilder from './pages/SurveyBuilder'
import SurveyResponder from './pages/SurveyResponder'
import Login from './pages/Login'
import Thanks from './pages/Thanks'
import Layout from './layout'
import Fab from './partials/fab'

const App = () => (
	<Router>
		<Layout>
			<Route path="/respond/:id" component={SurveyResponder} />
			<Route exact path="/thanks" component={Thanks} />
			<Route exact path="/dash" component={Dashboard} />
			<Route exact path="/builder" component={SurveyBuilder} />
			<Route exact path="/login" component={Login} />
			<Route path="/builder/:id" component={SurveyBuilder} />
			<Route path={['/dash', '/builder', '/builder/:id']} component={Fab} />
		</Layout>
	</Router>
)

// fetch entrypoint
const entry = document.getElementById('react-root')
render(<App />, entry)
