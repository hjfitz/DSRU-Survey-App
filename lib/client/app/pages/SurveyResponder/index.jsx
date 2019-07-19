import React from 'react'

import {fetchJSON} from '../../util'
import Question from './survey-question'

function recurAndGetQuestions(question) {
	const {questionText} = question
	const elem = document.querySelector(`div[data-question-name='${questionText}'`)
	const ret = {questionText, value: 'No Response'}
	const ds = [ret]
	if (!elem) return ret
	if (elem.dataset.questionType === 'multi') {
		const checkboxes = elem.querySelectorAll(`input[data-question-name='${questionText}`)
		const [selectedCheck] = [...checkboxes].filter(box => box.checked)
		if (selectedCheck) ret.value = selectedCheck.value
		// recur if necessary. we know there are options, because these elemts are rendered from options
		ds.push(...question.options.map((option) => {
			if (option.question) return recurAndGetQuestions(option.question)
			return null
		}).filter(Boolean))
		console.log(question)
	} else if (elem.dataset.type === 'scalar') {
		// do this
	}
	return ds.flat()
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
		// select all questions on the screen
		// console.log(this.state.questions)
		// const allQuestions = document.querySelectorAll('div[data-question-name]')
		// console.log(allQuestions)
		const questionsAndAnswers = this.state.questions.map(recurAndGetQuestions).flat()
		console.log({questionsAndAnswers, questions: this.state.questions})
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
