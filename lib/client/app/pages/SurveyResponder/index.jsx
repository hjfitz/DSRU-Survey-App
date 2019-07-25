import React from 'react'
import flattenDeep from 'lodash/flattenDeep'
import M from 'materialize-css'
import {Redirect} from 'react-router-dom'

import {fetchJSON} from '../../util'
import Question from './survey-question'
import Modal from '../../partials/modal'
import Markdown from '../../partials/markdown'


function recurAndGetQuestions(question, prev = '') {
	const {questionText, _id: id} = question

	const elem = document.querySelector(`div[data-question-id="${id}"]`)
	const ret = {questionText: `${prev + questionText} (id: ${id})`, value: 'No response'}

	const ds = [ret]
	const selector = `input[data-question-id="${id}"]`
	// no element? user has not unihdden the correct option
	if (!elem) {
		ret.value = 'Not found on form'
	}
	// multi choice
	if (elem) {
		// find parent elem
		const parent = elem.parentElement.parentElement
		parent.classList.remove('invalid-response')

		const {required} = elem.dataset
		if (elem.dataset.questionType === 'multi') {
			// get all checkboxes and find the selected one.
			const checkboxes = elem.querySelectorAll(selector)
			const [selectedCheck] = [...checkboxes].filter(box => box.checked)
			if (selectedCheck) {
				ret.value = selectedCheck.value
			// unselected and is required? uh oh
			} else if (required === 'true') {
				// colour the element
				parent.classList.add('invalid-response')
				return false
			}
			// recur if necessary for all questions with an 'option' (subquestion)

			// scalar - find the scalar input and pick it's value
		} else if (elem.dataset.questionType === 'scalar') {
			// do this
			const inp = elem.querySelector(selector)
			ret.value = inp.value || 'Not found on form'
		} else if (elem.dataset.questionType === 'open') {
			const inp = elem.querySelector(selector.replace('input', 'textarea'))
			ret.value = inp.value
			if (!inp.value) {
				parent.classList.add('invalid-response')
				return false
			}
		}


		if (question.options) {
			ds.push(
				question.options
					.filter(option => option.question)
					.map(option => recurAndGetQuestions(option.question, `${questionText} (${option.value}) > `)),
				// for without a prefix
				// .map(option => recurAndGetQuestions(option.question)),

			)
		}
	}

	return ds
}

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
