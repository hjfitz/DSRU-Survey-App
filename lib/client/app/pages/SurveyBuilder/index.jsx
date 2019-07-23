import React from 'react'
import cloneDeep from 'lodash/cloneDeep'
import M from 'materialize-css'
import {Redirect} from 'react-router-dom'

import QuestionBuilder from './question-builder'
import Modal from '../../partials/modal'
import {fetchJSON} from '../../util'

function extractData(question, level) {
	// get title, type and then based on type, maxVal or options
	const {value: questionText} = question.querySelector('.question-title')
	const {questionType: type} = question.dataset

	// create a dataset to return
	// should be of form: {questionText, type, [options]} or {questionText, type, maxVal}
	const ds = {questionText, type}

	// fetch and recur
	if (type === 'multi') {
		// QuestionBuilder has a level, each input has the associated level (to handle sub-questions)
		const optsDOM = question.querySelectorAll(`.multi-input-level-${level}`)
		// if there are options, add them
		if (optsDOM && optsDOM.length) {
			const options = [...optsDOM].map((option) => {
				const {value} = option.querySelector('input.question-value')
				const {value: helpText} = option.querySelector('textarea.question-help')
				const optDS = {value, helpText}
				const subQuestion = option.querySelector(`.question-builder.level-${level + 1}`)
				if (subQuestion) {
					// recur if there's a lower level
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
		this.removeLastQuestion = this.removeLastQuestion.bind(this)
		this.removeQuestion = this.removeQuestion.bind(this)
		this.updateSurvey = this.updateSurvey.bind(this)
		// this.createSurvey = this.createSurvey.bind
	}

	async componentDidMount() {
		// if we have an ID, we're in edit mode
		if (this.props.match && this.props.match.params.id) {
			const {id} = this.props.match.params
			// we're in edit mode. fetch the survey data and populate
			const resp = await fetchJSON(`/api/builder/edit/${id}`)
			if (resp.ok) {
				const {questions, title} = await resp.json()
				this.setState({
					questions,
					surveyName: title,
					edit: true,
				})
			}
		} else {
			// fetch the data from localStorage. Follow the usual schema
		}
	}

	componentDidUpdate() {
		const areas = document.querySelectorAll('textarea');
		[...areas].forEach(area => M.textareaAutoResize(area))
	}

	changeTitle(ev) {
		this.setState({
			surveyName: ev.target.value,
		})
	}

	appendQuestion() {
		// clone so as not to mess with the current state (can be any number of levels of JSON)
		const questions = cloneDeep(this.state.questions)
		// question schema
		questions.push({type: 'multi', questionText: null, options: []})
		// update and re-render
		this.setState({questions})
	}

	removeLastQuestion() {
		const questions = cloneDeep(this.state.questions)
		questions.pop()
		this.setState({questions})
	}

	async updateSurvey() {
		const allQuestions = document.querySelectorAll('.question-builder.level-1')
		const surveyData = [...allQuestions].map(elem => extractData(elem, 1))
		const newSurvey = {
			questions: surveyData,
			title: this.state.surveyName,
		}
		const resp = await fetchJSON(`/api/builder/edit/${this.props.match.params.id}`, newSurvey, 'put').catch(console.log)
		if (resp.ok) {
			M.toast({html: 'Successfully updated survey'})
			this.setState({redir: true})
		} else {
			const {message} = await resp.json()
			M.toast({html: `There was an error updating: ${message}`})
		}
	}

	async fetchData() {
		const allQuestions = document.querySelectorAll('.question-builder.level-1')
		const surveyData = [...allQuestions].map(elem => extractData(elem, 1))
		const newSurvey = {
			questions: surveyData,
			title: this.state.surveyName,
		}
		if (this.state.edit) {
			const inst = M.Modal.init(this.modal)
			inst.open()
		} else {
			const resp = await fetchJSON('/api/builder/new', newSurvey, 'POST')
			if (!resp.ok) {
				// user is unauthorised
				if (resp.status === 401) {
					this.setState({redir: true})
				}
			} else {
				const message = this.state.edit ? 'Successfully updated survey' : 'Successfully created survey'
				M.toast({html: message})
				this.setState({redir: true})
			}
		}
	}

	removeQuestion(idx) {
		return () => {
			const questions = cloneDeep(this.state.questions)
			questions.splice(idx, 1)
			this.setState({questions})
		}
	}

	renderQuestions() {
		return this.state.questions.map((props, idx) => (
			<div className="card" key={props.type + props.questionText + idx}>
				<div className="card-content">
					<div className="row">
						<QuestionBuilder
							idx={idx + 1}
							origQuestion={idx + 1}
							level={1}
							{...props}
							edit={this.state.edit}
							removeSubQuestion={this.removeQuestion(idx)}
						/>
					</div>
				</div>
			</div>
		))
	}


	render() {
		if (this.state.redir) return <Redirect to="/dash" />
		const modalText = `# Warning
Are you sure that you want to do this? In order to ensure that results remain consistent, **this will delete all currently collected responses**.

You can <a href="/api/builder/csv/${this.props.match.params.id}.csv" download>download the dataset here before doing this.</a>`

		return (
			<div className="row">
				<div className="col s12">
					<div className="row">
						{/* first row - title */}

						<section className="input-field col s12">
							<input
								placeholder="Untitled Survey"
								id="survey_title"
								type="text"
								className="validate"
								value={this.state.surveyName}
								onChange={this.changeTitle}
							/>
						</section>

					</div>
					<div className="row">
						{/* next row - questions */}
						{this.renderQuestions()}
					</div>
					<div className="row">
						{/* final row, question setup */}
						<a className="col s12 m4 waves-effect waves-light btn green" onClick={this.appendQuestion}>
								Add Question
						</a>
						<a className="col s12 m4 push-m4 waves-effect waves-light btn red" onClick={this.removeLastQuestion}>
								Remove Question
						</a>
					</div>
					<div className="row">
						<a className="col s12 waves-effect waves-light btn" onClick={this.fetchData}>
							{this.state.edit ? 'Save and Update Survey' : 'Create Survey'}
						</a>
					</div>
				</div>
				<Modal
					inRef={ref => this.modal = ref}
					cbText="Continue"
					cb={this.updateSurvey}
					text={modalText}
				/>
			</div>
		)
	}
}

export default SurveyBuilder
