import React from 'react'
import format from 'date-fns/format'
import {Link} from 'react-router-dom'
import M from 'materialize-css'

import {fetchJSON} from '../util'

async function copySurveyLink(id, title) {
	const base = `${window.location.origin}/respond/${id}`
	await navigator.clipboard.writeText(base)
	M.toast({html: `Copied "${title}"`})
}

class Dash extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			surveys: [],
		}
	}

	async componentDidMount() {
		const resp = await fetchJSON('/api/builder/all')
		if (resp.ok) {
			const surveys = await resp.json()
			this.setState({surveys})
		}
	}

	deleteSurvey(id, title) {
		return async () => {
			const resp = await fetchJSON(`/api/builder/${id}`, {}, 'delete')
			if (resp.ok) {
				console.log({id})
				const surveys = await resp.json()
				this.setState({surveys}, () => {
					M.toast({html: `Deleted "${title}"`})
				})
			}
		}
	}

	render() {
		return (
			<>
				<h1>Welcome!</h1>
				<section className="row">
					<div className="col s12">
						<Link to="/builder" class="waves-effect waves-light btn">Create a new survey</Link>
					</div>
				</section>
				{this.state.surveys.map(survey => (
					<section className="row">
						<div className="col s12">
							<div className="card horizontal">
								<div className="card-content survey-info">
									<span className="card-title">{survey.title}</span>
									<p>Total responses: {survey.count}</p>
									<p>Created: {format(survey.created, 'HH:mm on ddd Do MMMM (YYYY)')}</p>
								</div>
								<div className="card-stacked card-action right-align survey-options">
									<Link to={`/respond/${survey._id}`}>View</Link>
									<Link to={`/builder/${survey._id}`}>Edit</Link>
									<Link>Get CSV</Link>
									<Link href="!#" onClick={() => copySurveyLink(survey._id, survey.title)}>Copy Link</Link>
									<Link onClick={this.deleteSurvey(survey._id, survey.title)}>Delete</Link>
								</div>
							</div>
						</div>
					</section>
				))}
			</>
		)
	}
}

export default Dash
