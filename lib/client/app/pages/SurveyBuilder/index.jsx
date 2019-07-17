import React from 'react'
import cloneDeep from 'lodash/cloneDeep'

import QuestionBuilder from './question-builder'

class SurveyBuilder extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			questions: [],
			surveyName: '',
		}
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
						<QuestionBuilder key={props.type + props.questionText + idx} {...props} />
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
						<div className="col s12">
							<div className="row">
								<a className="waves-effect waves-light btn green" onClick={this.appendQuestion}>
									Add Question
								</a>
							</div>
							<div className="row">
								<a className="waves-effect waves-light btn red" onClick={this.removeQuestion}>
									Remove Question
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default SurveyBuilder
