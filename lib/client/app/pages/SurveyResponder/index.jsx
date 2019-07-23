import React from 'react'
import flattenDeep from 'lodash/flattenDeep'
import M from 'materialize-css'
import {Redirect} from 'react-router-dom'

import {fetchJSON} from '../../util'
import Question from './survey-question'


function recurAndGetQuestions(question, prev = '') {
	const {questionText} = question

	const elem = document.querySelector(`div[data-question-name="${questionText}"]`)

	const ret = {questionText: prev + questionText, value: 'No response'}
	const ds = [ret]
	const selector = `input[data-question-name="${questionText}"]`
	// no element? user has not unihdden the correct option
	if (!elem) {
		ret.value = 'Not found on form'
	}
	// multi choice
	if (elem) {
		if (elem.dataset.questionType === 'multi') {
			// get all checkboxes and find the selected one.
			const checkboxes = elem.querySelectorAll(selector)
			const [selectedCheck] = [...checkboxes].filter(box => box.checked)
			if (selectedCheck) ret.value = selectedCheck.value
			// recur if necessary for all questions with an 'option' (subquestion)

			// scalar - find the scalar input and pick it's value
		} else if (elem.dataset.questionType === 'scalar') {
			// do this
			const inp = elem.querySelector(selector)
			ret.value = inp.value
		}
	}

	// todo: for questionText, append previous question title
	if (question.options) {
		ds.push(
			question.options
				.filter(option => option.question)
				.map(option => recurAndGetQuestions(option.question, `${questionText} (${option.value}) > `)),
			// for without a prefix
			// .map(option => recurAndGetQuestions(option.question)),

		)
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
		const resp = await fetchJSON(`/api/survey/${this.props.match.params.id}`, questionsAndAnswers, 'post')
		if (resp.ok) {
			M.toast({html: 'Successfully saved result'})
			// todo: redirect to a thankyou page
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
					<h1>{this.state.title}</h1>
					{this.state.questions.map((question, idx) => <Question key={question._id} {...question} idx={idx} />)}
					<a className="btn waves-effect waves-light s12 m4 col" href="#" onClick={this.respond}>
					Submit your response <i className="material-icons right">send</i>
					</a>
				</div>
			</div>


		)
	}
}

export default SurveyResponder
