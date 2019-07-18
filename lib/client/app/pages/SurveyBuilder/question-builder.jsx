import React from 'react'
import cloneDeep from 'lodash/cloneDeep'

class QuestionBuilder extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			type: props.type,
			questionText: props.questionText,
			options: props.options || [],
			maxVal: props.maxVal || 5,
		}
		console.log(props)
		this.questionText = React.createRef()
		this.subQuestions = []

		this.appendOption = this.appendOption.bind(this)
		this.removeOption = this.removeOption.bind(this)
		this.addSubquestion = this.addSubquestion.bind(this)
	}

	appendOption() {
		const options = cloneDeep(this.state.options)
		options.push({
			value: '',
			question: null, // if there is a subquestion, it should follow: { type, questionText, options }
		})
		this.setState({options})
	}

	removeOption() {
		const options = cloneDeep(this.state.options)
		options.pop()
		this.setState({options})
	}

	addSubquestion(idx) {
		return () => {
			const options = cloneDeep(this.state.options)
			options[idx].question = {
				type: 'multi',
				questionText: null,
				options: [],
			}

			this.setState({options})
		}
	}

	render() {
		this.subQuestions = []
		const slider = (
			<>
				Maximum value:
				<div className="input-field inline slider-input">
					<input type="number" name="max-val" id="max-val" value={this.state.maxVal || false} />
				</div>
			</>
		)
		const multi = (
			<div className="row multi">
				{this.state.options.map((option, idx) => {
					console.log(option)
					return (
						<div className={`col s12 multi-input-level-${this.props.level}`} key={this.state.questionText + option.questionText + idx}>
							{`Option ${idx + 1}: `}
							<div className="input-field inline">
								{/* text inputs for multiple choice answers */}
								<input placeholder="Placeholder" id="first_name" type="text" className="validate" value={option.questionText} />
							</div>
							{option.question
								?								(
									<div className="card-panel">
										<div className="row">
											<QuestionBuilder {...option.question} idx={idx + 1} level={this.props.level + 1} />
										</div>
									</div>
								)
								: (
									<a onClick={this.addSubquestion(idx)} className="waves-effect waves-light btn">Add Sub-question</a>

								)}
						</div>
					)
				})}
				{this.props.level <= 3
					? (
						<>
							<div className="col s6">
								<a className="waves-effect waves-light btn green darken-3" onClick={this.appendOption}>
							Add Option
								</a>
							</div>
							<div className="col s6">
								<a className="waves-effect waves-light btn red darken-3" onClick={this.removeOption}>
							Remove Option
								</a>
							</div>
						</>
					)
					: ''
				}
			</div>
		)

		return (
			<form className={`question-builder level-${this.props.level} col s12`} data-question-type={this.state.type}>
				<div className="row">
					<div className="col s12">
						<h5>Question {this.props.idx}</h5>
					</div>
					<div className="col s9">
						Question title:
						<div className="inline input-field">
							<input
								ref={this.questionText}
								placeholder="Question Name"
								value={this.state.questionText}
								id="question_name"
								type="text"
								className="validate question-title"
								onKeyUp={ev => this.setState()}
							/>
						</div>
					</div>
					<form className="col s3">
						Question Type:
						<p>
							<label>
								<input
									name={`${this.state.questionText}toggle`}
									type="radio"
									checked={this.state.type === 'multi'}
									onClick={() => this.setState({type: 'multi'})}
								/>
								<span>Multiple choice</span>
							</label>
						</p>
						<p>
							<label>
								<input
									name={`${this.state.questionText}toggle`}
									type="radio"
									checked={this.state.type === 'scalar'}
									onClick={() => this.setState({type: 'scalar'})}
								/>
								<span>Scalar</span>
							</label>
						</p>
					</form>
					<div className="col s12">
						{this.state.type === 'multi' ? multi : slider}
					</div>
				</div>

			</form>
		)
	}
}

export default QuestionBuilder
