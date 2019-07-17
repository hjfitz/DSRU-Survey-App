import React from 'react'
import cloneDeep from 'lodash/cloneDeep'

class SurveyBuilder extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			questions: [],
			surveyName: '',
		}
		this.changeTitle = this.changeTitle.bind(this)
		this.appendQuestion = this.appendQuestion.bind(this)
	}

	changeTitle(ev) {
		this.setState({
			surveyName: ev.target.value
		})
	}

	renderQuestions() {
		return this.state.questions.map(question => {
			console.log(question)
			return 'oi'
		})
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
						{/* final row - add button */}
						<a class="btn-floating btn-large waves-effect waves-light red" onClick={this.appendQuestion}>
							<i class="material-icons">add</i>
						</a>
					</div>
				</div>
			</div>
		)
	}
}

export default SurveyBuilder
