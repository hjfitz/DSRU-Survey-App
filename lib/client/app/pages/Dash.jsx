import React from 'react'
import format from 'date-fns/format'
import {Link, Redirect} from 'react-router-dom'
import M from 'materialize-css'

import {fetchJSON} from '../util'
import Modal from '../partials/modal'

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
			redir: false,
			modalText: 'Should not see this',
		}
	}

	async componentDidMount() {
		const resp = await fetchJSON('/api/builder/all')
		if (resp.ok) {
			const surveys = await resp.json()
			this.setState({surveys})
		} else {
			M.toast({html: 'You need to login to do this'})
			this.setState({redir: true})
		}
	}

	deleteSurvey(id, title) {
		return () => {
			const cb = async () => {
				const resp = await fetchJSON(`/api/builder/${id}`, {}, 'delete')
				if (resp.ok) {
					const surveys = await resp.json()
					this.setState({surveys}, () => {
						M.toast({html: `Deleted "${title}"`})
					})
				}
			}

			const modalText = `# Warning
You are about to delete this survey. You can download the results as a CSV <a href="/api/builder/csv/${id}.csv" download >here</a>.

Do you wish to continue?`
			this.setState({
				modalText,
				cb,
			}, () => {
				const inst = M.Modal.init(this.modal)
				inst.open()
			})
		}
	}

	render() {
		if (this.state.redir) {
			return <Redirect to={`/login?prev=${encodeURIComponent(window.location.pathname)}`} />
		}
		return (
			<>
				<h1>Welcome!</h1>
				<section className="row">
					<div className="col s12">
						<Link to="/builder" className="waves-effect waves-light btn">Create a new survey</Link>
					</div>
				</section>
				{this.state.surveys.map(survey => (
					<section className="row" key={survey._id}>
						<div className="col s12">
							<div className="card horizontal">
								<div className="card-content survey-info">
									<span className="card-title">{survey.title}</span>
									<p>Total responses: {survey.count || 0}</p>
									<p>Created: {format(survey.created, 'HH:mm on ddd Do MMMM (YYYY)')}</p>
								</div>
								<div className="card-stacked card-action right-align survey-options">
									<Link to={`/respond/${survey._id}`}>View</Link>
									<Link to={`/builder/${survey._id}`}>Edit</Link>
									<a className="cp" download href={`/api/builder/csv/${survey._id}.csv`}>Get CSV</a>
									<a className="cp" onClick={() => copySurveyLink(survey._id, survey.title)}>Copy Link</a>
									<a className="cp" onClick={this.deleteSurvey(survey._id, survey.title)}>Delete</a>
								</div>
							</div>
						</div>
					</section>
				))}
				<Modal text={this.state.modalText} cb={this.state.cb} cbText="Delete" inRef={ref => this.modal = ref} />
			</>
		)
	}
}

export default Dash
