import React from 'react'
import flattenDeep from 'lodash/flattenDeep'

import {fetchJSON} from '../../util'
import Question from './survey-question'

function recurAndGetQuestions(question) {
	const {questionText} = question
	const elem = document.querySelector(`div[data-question-name='${questionText}'`)
	const ret = {questionText, value: 'No response'}
	const ds = [ret]
	const selector = `input[data-question-name='${questionText}`

	// no element? user has not unihdden the correct option
	if (!elem) {
		ret.value = 'Not found on form'
	}

	if (question.options) {
		ds.push(
			question.options
				.filter(option => option.question)
				.map(option => recurAndGetQuestions(option.question)),
		)
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
	return ds
}

class SurveyResponder extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			questions: [],
			title: 'Loading',
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

	async respond() {
		const questionsAndAnswers = this.state.questions.map(recurAndGetQuestions)
		console.log(flattenDeep(questionsAndAnswers))
	}

	render() {
		return (
			<>
				<h1>{this.state.title}</h1>
				{this.state.questions.map((question, idx) => <Question key={question._id} {...question} idx={idx} />)}
				<button className="btn waves-effect waves-light" type="submit" name="action" onClick={this.respond}>
				Submit <i className="material-icons right">send</i>
				</button>
			</>
		)
	}
}

export default SurveyResponder
