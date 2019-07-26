import React from 'react'
import format from 'date-fns/format'
import {Link, Redirect} from 'react-router-dom'
import M from 'materialize-css'

import {fetchJSON} from '../util'
import Modal from '../partials/modal'
import Loader from '../partials/loader'

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
			page: 1,
			redir: false,
			modalText: 'Should not see this',
			loaded: false,
		}
		this.renderPaginator = this.renderPaginator.bind(this)
	}

	componentDidMount() {
		this.fetchSurveyData()
	}

	async fetchSurveyData() {
		const resp = await fetchJSON(`/api/builder/all?page=${this.state.page}`)
		if (resp.ok) {
			const dashData = await resp.json()
			this.setState({...dashData, loaded: true})
		} else {
			M.toast({html: 'You need to login to do this'})
			this.setState({redir: true})
		}
	}


	deleteSurvey(id, title) {
		return () => {
			const cb = async () => {
				const resp = await fetchJSON(`/api/builder/${id}?page=${this.state.page}`, {}, 'delete')
				if (resp.ok) {
					await this.fetchSurveyData()
					M.toast({html: `Deleted "${title}"`})
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

	renderPaginator() {
		const {page, count} = this.state
		const maxPages = Math.ceil(count / 10)
		if (maxPages === 1) return ''
		const cb = page => this.setState({page}, this.fetchSurveyData)
		const inner = Array.from({length: maxPages}).map((_, idx) => {
			const curNo = idx + 1
			const className = curNo === page ? 'active teal' : 'waves-effect'
			return <li key={curNo} className={className} onClick={() => cb(curNo)}><a href="#!">{curNo}</a></li>
		})
		const firstChevClass = page === 1 ? 'disabled' : 'waves-effect'
		const firstChevCallback = page === 1 ? () => {} : () => cb(page - 1)
		const lastChevClass = page === maxPages ? 'disabled' : 'waves-effect'
		const lastChevCallback = page === maxPages ? () => {} : () => cb(page + 1)
		const firstChev = (
			<li
				className={firstChevClass}
				onClick={firstChevCallback}
			><a href="#!"><i className="material-icons">chevron_left</i></a>
			</li>
		)
		const lastChev = (
			<li
				className={lastChevClass}
				onClick={lastChevCallback}
			><a href="#!"><i className="material-icons">chevron_right</i></a>
			</li>
		)
		const paginator = (
			<ul className="pagination center-align">
				{firstChev}
				{inner}
				{lastChev}
			</ul>
		)
		return paginator
	}

	render() {
		const {redir, loaded, surveys, modalText, cb} = this.state
		if (redir) return <Redirect to={`/login?prev=${encodeURIComponent(window.location.pathname)}`} />
		if (!loaded) return <Loader />
		return (
			<>
				<h1>Welcome!</h1>
				<section className="row">
					<div className="col s12">
						<Link to="/builder" className="waves-effect waves-light btn">Create a new survey</Link>
					</div>
				</section>
				{surveys.map(survey => (
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
				<div className="row">
					<div className="col s12">
						{this.renderPaginator()}
					</div>
				</div>
				<Modal text={modalText} cb={cb} cbText="Delete" inRef={ref => this.modal = ref} />
			</>
		)
	}
}

export default Dash
