import React from 'react'
import flattenDeep from 'lodash/flattenDeep'
import M from 'materialize-css'
import {Redirect} from 'react-router-dom'

import {fetchJSON} from '../../util'
import Question from './survey-question'
import Modal from '../../partials/modal'
import Markdown from '../../partials/markdown'
import recurAndGetQuestions from './fetch-data'

class SurveyResponder extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			questions: [],
			title: 'Loading',
			redir: false,
			introText: '',
		}
		this.respond = this.respond.bind(this)
	}

	async componentDidMount() {
		const {id} = this.props.match.params
		const url = `/api/survey/${id}`
		const resp = await fetchJSON(url)
		if (resp.ok) {
			const survey = await resp.json()
			this.setState(survey)
		}
	}

	componentDidUpdate() {
		const range = document.querySelectorAll('input[type="range"]')
		const textarea = document.querySelectorAll('textarea')
		range.forEach(elem => M.Range.init(elem))
		textarea.forEach(area => M.CharacterCounter.init(area))
		M.AutoInit()
	}

	async respond(ev) {
		ev.preventDefault()
		const questionsAndAnswers = flattenDeep(this.state.questions.map(qu => recurAndGetQuestions(qu)))
		const isValidResponse = questionsAndAnswers.reduce((acc, cur) => cur && acc, true)
		if (!isValidResponse) {
			const inst = M.Modal.init(this.modal)
			inst.open()
			return
		}
		const resp = await fetchJSON(`/api/survey/${this.props.match.params.id}`, questionsAndAnswers, 'post')
		if (resp.ok) {
			M.toast({html: 'Successfully saved result'})
			this.setState({redir: true})
		} else {
			M.toast({html: 'There was an error submitting your response'})
		}
	}

	render() {
		if (this.state.redir) return <Redirect to={`/thanks?title=${encodeURIComponent(this.state.title)}`} />
		return (
			<div className="row">
				<div className="col s12">
					<div className="card">
						<div className="card-content">
							<div className="row">
								<div className="col s12">
									<h3>{this.state.title}</h3>
								</div>
								<div className="col s12">
									<Markdown content={this.state.introText} />
								</div>
							</div>
						</div>
					</div>
					{this.state.questions.map((question, idx) => <Question key={question._id} {...question} idx={idx} />)}
					<a className="btn waves-effect waves-light s12 m4 col" href="#" onClick={this.respond}>
					Submit your response <i className="material-icons right">send</i>
					</a>
				</div>
				<Modal
					inRef={ref => this.modal = ref}
					text={`##### There Was a Problem Saving Your Results!

Please ensure that you respond to every required question.

Missing questions are outlined in red.
				`}
				/>
			</div>


		)
	}
}

export default SurveyResponder
