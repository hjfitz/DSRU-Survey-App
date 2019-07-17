import React from 'react'
import cloneDeep from 'lodash/cloneDeep'

import QuestionBuilder from './question-builder'

function extractData(question, level) {
		// get title, type and then based on type, maxVal or options
		const {value: questionText} = question.querySelector('.question-title')
		const {questionType: type} = question.dataset
		const ds = {
			questionText,
			type,
		}
		if (type === 'multi') {
			// fetch and recur
			const optsDOM = question.querySelectorAll('.multi-input-level-' + level)
			if (optsDOM && optsDOM.length) {
				const options = [...optsDOM].map(option => {
					const {value} = option.querySelector('input')
					const optDS = {
						value,
					}
					const subQuestion = option.querySelector('.question-builder.level-' + (level + 1))
					if (subQuestion) {
						optDS.question = extractData(subQuestion, level + 1)
					}
					return optDS
				})
				ds.options = options
			}
		} else {
			const scalarInput = question.querySelector('.slider-input>input')
			ds.maxVal = parseInt(scalarInput.value, 10)
		}
		return ds
}

function extractAnswers(elems, level) {
	const dataset = [...elems].map(elem => extractData(elem, level))
	return dataset
}

class SurveyBuilder extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			questions: [],
			surveyName: '',
		}
		this.fetchData = this.fetchData.bind(this)
		this.changeTitle = this.changeTitle.bind(this)
		this.appendQuestion = this.appendQuestion.bind(this)
		this.removeQuestion = this.removeQuestion.bind(this)
	}

	changeTitle(ev) {
		this.setState({
			surveyName: ev.target.value
		})
	}

	renderQuestions() {
		return this.state.questions.map((props, idx) => (
			<div className="card">
				<div className="card-content">
					<div className="row">
						<QuestionBuilder key={props.type + props.questionText + idx} idx={idx + 1} level={1} {...props} />
					</div>
				</div>
			</div>
		))
	}

	appendQuestion() {
		const questions = cloneDeep(this.state.questions)
		const newQuestion = {
			type: 'multi',
			questionText: 'Untitled Question',
			options: []
		}

		questions.push(newQuestion)
		this.setState({questions})
	}

	removeQuestion() {
		const questions = cloneDeep(this.state.questions)
		questions.pop()
		this.setState({questions})
	}

	fetchData() {
		const allQuestions = document.querySelectorAll('.question-builder.level-1')
		const surveyData = extractAnswers(allQuestions, 1)
		console.log({surveyData})
	}

	render() {
		return (
			<div className="row">
				<div className="col s12">
					<div className="row">
						{/* first row - title */}
						<form className="col s12">
							<div className="row">
								<div className="input-field col s12">
									<input placeholder="Untitled Survey" id="survey_title" type="text" className="validate" value={this.surveyName} onChange={this.changeTitle} />
								</div>
							</div>
						</form>
					</div>
					<div className="row">
						{/* next row - questions */}
						{this.renderQuestions()}
					</div>
					<div className="row">
						<div className="col s4">
							<a className="waves-effect waves-light btn green" onClick={this.appendQuestion}>
								Add Question
							</a>
						</div>
						<div className="col s4">
							<a className="waves-effect waves-light btn red" onClick={this.removeQuestion}>
								Remove Question
							</a>
						</div>
						<div className="col s4">
							<a className="waves-effect waves-light btn" onClick={this.fetchData}>
								Save and Submit
							</a>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default SurveyBuilder
