import React from 'react'
import cloneDeep from 'lodash/cloneDeep'
import M from 'materialize-css'
import {Redirect} from 'react-router-dom'

import QuestionBuilder from './question-builder'
import Modal from '../../partials/modal'
import {fetchJSON} from '../../util'
import Loader from '../../partials/loader'

function imgToB64(file) {
	return new Promise((res, rej) => {
		const reader = new FileReader()
		reader.addEventListener('load', () => res(reader.result), false)
		reader.addEventListener('error', rej)
		reader.readAsDataURL(file)
	})
}

function resizeImg(dataUrl) {
	const img = new Image()
	img.src = dataUrl
	return new Promise((res, rej) => {
		img.onerror = rej
		img.onload = async () => {
			const {width, height} = img
			const canvas = document.createElement('canvas')
			const ctx = canvas.getContext('2d')
			// scale to 1000 if the image is larger
			if (width > 1000) {
				const scalingFactor = width / 1000
				const newWidth = width / scalingFactor
				const newHeight = height / scalingFactor
				canvas.height = newHeight
				canvas.width = newWidth
				ctx.drawImage(img, 0, 0, newWidth, newHeight)
				const newDataUrl = canvas.toDataURL('image/jpeg', 1.0)
				res(newDataUrl)
			} else {
				res(dataUrl)
			}
		}
	})
}

// todo: add some validation for question text and value
async function extractData(question, level) {
	// get title, type and then based on type, maxVal or options
	const {value: questionText} = question.querySelector('.question-title')
	const {questionType: type} = question.dataset
	const {checked: required} = question.querySelector('input.question-required')

	// create a dataset to return
	// should be of form: {questionText, type, [options]} or {questionText, type, maxVal}
	const ds = {questionText, type, required}


	// fetch and recur
	if (type === 'multi' || type === 'options') {
		// QuestionBuilder has a level, each input has the associated level (to handle sub-questions)
		const optsDOM = question.querySelectorAll(`.multi-input-level-${level}`)
		// if there are options, add them
		if (optsDOM && optsDOM.length) {
			const options = await Promise.all([...optsDOM].map(async (option) => {
				const {value} = option.querySelector('input.question-value')
				const {value: helpText} = option.querySelector('textarea.question-help')
				const optDS = {value, helpText}
				console.log('attempting to find image')
				try {
					const {files: [file]} = option.querySelector('input.question-img')
					console.log(option.querySelector('input.question-img'))
					const dataUrl = await imgToB64(file)
					const imgResized = await resizeImg(dataUrl)
					console.log('found image', {imgResized})
					optDS.imgUrl = imgResized
				} catch (err) {
					console.warn(err)
				}
				const subQuestion = option.querySelector(`.question-builder.level-${level + 1}`)
				if (subQuestion) {
					// recur if there's a lower level
					optDS.question = await extractData(subQuestion, level + 1)
				}
				return optDS
			}))
			ds.options = options
		}
	} else if (type === 'scalar') {
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
			introText: '',
			edit: this.props.match && this.props.match.params.id,
			redirTo: '/dash',
		}
		this.fetchData = this.fetchData.bind(this)
		this.changeTitle = this.changeTitle.bind(this)
		this.appendQuestion = this.appendQuestion.bind(this)
		this.removeLastQuestion = this.removeLastQuestion.bind(this)
		this.removeQuestion = this.removeQuestion.bind(this)
		this.updateSurvey = this.updateSurvey.bind(this)
		this.changeIntroText = this.changeIntroText.bind(this)
		// this.createSurvey = this.createSurvey.bind
	}

	async componentDidMount() {
		// check our auth status first
		const authResp = await fetchJSON('/api/builder/checkauth')
		if (!authResp.ok && authResp.status === 401) {
			const prev = encodeURIComponent(window.location.pathname)
			this.setState({redir: true, redirTo: `/login?prev=${prev}`}, () => {
				M.toast({html: 'You need to login in order to edit or create a survey'})
			})
		}

		// if we have an ID, we're in edit mode
		if (this.state.edit) {
			const {id} = this.props.match.params
			this.setState({loading: true}, async () => {
				// we're in edit mode. fetch the survey data and populate
				const resp = await fetchJSON(`/api/builder/edit/${id}`)
				if (resp.ok) {
					const {questions, title, introText} = await resp.json()
					this.setState({
						questions,
						surveyName: title,
						edit: true,
						introText,
						loading: false,
					})
				} else if (resp.status === 404) {
					this.setState({redir: true, redirTo: '/builder'}, () => {
						M.toast({html: "Couldn't find the survey!"})
					})
				}
			})
		} else {
			// fetch the data from localStorage. Follow the usual schema
		}
	}

	componentDidUpdate() {
		const areas = document.querySelectorAll('textarea');
		[...areas].forEach(area => M.textareaAutoResize(area))
	}

	changeTitle(ev) {
		this.setState({surveyName: ev.target.value})
	}

	changeIntroText(ev) {
		this.setState({introText: ev.target.value})
	}

	appendQuestion() {
		const questions = cloneDeep(this.state.questions)
		questions.push({type: 'multi', questionText: null, options: []})
		this.setState({questions})
	}

	removeLastQuestion() {
		const questions = cloneDeep(this.state.questions)
		questions.pop()
		this.setState({questions})
	}

	async updateSurvey() {
		const allQuestions = document.querySelectorAll('.question-builder.level-1')
		const questions = [...allQuestions].map(elem => extractData(elem, 1))
		const {introText, surveyName: title} = this.state
		const newSurvey = {questions, title, introText}
		const resp = await fetchJSON(`/api/builder/edit/${this.props.match.params.id}`, newSurvey, 'put').catch(console.log)
		if (resp.ok) {
			M.toast({html: 'Successfully updated survey'})
			this.setState({redir: true, redirTo: '/dash'})
		} else {
			const {message} = await resp.json()
			M.toast({html: `There was an error updating: ${message}`})
		}
	}

	async fetchData() {
		const allQuestions = document.querySelectorAll('.question-builder.level-1')
		const questions = await Promise.all([...allQuestions].map(elem => extractData(elem, 1)))
		const {introText, surveyName: title} = this.state
		const newSurvey = {questions, title, introText}

		// in edit mode, pop up a prompt
		if (this.state.edit) {
			const inst = M.Modal.init(this.modal)
			inst.open()
			return
		}

		// building a new survey - POST it.
		// todo: consider adding a prompt for this
		const resp = await fetchJSON('/api/builder/new', newSurvey, 'POST')
		if (!resp.ok) {
			// user is unauthorised
		} else {
			const message = this.state.edit ? 'Successfully updated survey' : 'Successfully created survey'
			M.toast({html: message})
			this.setState({redir: true, redirTo: '/dash'})
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
		if (this.state.redir) return <Redirect to={this.state.redirTo} />
		const modalText = `# Warning
Are you sure that you want to do this? In order to ensure that results remain consistent, **this will delete all currently collected responses**.

You can <a href="/api/builder/csv/${this.props.match.params.id}.csv" download>download the dataset here before doing this.</a>`
		if (!this.state.edit || !this.state.loading) {
			return (
				<div className="row">
					<div className="col s12">
						<div className="row">

							<div className="card">
								<div className="card-content">
									{/* first row - title and intro */}
									<div className="row">
										<h5 className="col s12">Survey Information</h5>
										<section className="input-field col s12">
											<input
												placeholder="Untitled Survey"
												id="survey_title"
												type="text"
												className="validate"
												value={this.state.surveyName}
												onChange={this.changeTitle}
											/>
											<label htmlFor="survey_title" className="active">Survey Title</label>
										</section>

										<div className="input-field col s12">
											<textarea
												value={this.state.introText}
												onChange={this.changeIntroText}
												id="intro-text"
												className="materialize-textarea"
											/>
											<label htmlFor="intro-text">Intro text</label>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="row">
							{/* row - questions */}
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
		return <Loader />
	}
}

export default SurveyBuilder
