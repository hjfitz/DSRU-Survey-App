import React from 'react'
import {render} from 'react-dom'
import {BrowserRouter as Router, Route} from 'react-router-dom'

// styles

// page imports
import Dashboard from './pages/Dash'
import SurveyBuilder from './pages/SurveyBuilder'
import Layout from './layout'

const App = () => (
	<Router>
		<Layout>
			<Route exact path='/dash' component={Dashboard} />
			<Route exact path='/builder' component={SurveyBuilder} />
		</Layout>
	</Router>
)

// fetch entrypoint
const entry = document.getElementById('react-root')
render(<App />, entry)