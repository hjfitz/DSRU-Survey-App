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

	removeSubQuestion(idx) {
		return () => {
			const options = cloneDeep(this.state.options)
			const [curOption] = options.filter(opt => opt._id === idx)
			delete curOption.question
			this.setState({options})
		}
	}

	render() {
		this.subQuestions = []
		const slider = (
			<>
				Maximum value:
				<div className="input-field inline slider-input">
					<input type="number" name="max-val" id="max-val" value={this.state.maxVal} onChange={ev => this.setState({maxVal: ev.target.value})} />
				</div>
			</>
		)
		const multi = (
			<div className="row multi">
				{this.state.options.map((option, idx) => (
					<>
						<div className={`col s12 multi-input-level-${this.props.level}`} key={this.state.questionText + idx}>
							<div className="row">
								<div className="col s6">
									{`Option ${idx + 1}: `}
									<div className="input-field">
										{/* text inputs for multiple choice answers */}
										<input
											placeholder="Response"
											type="text"
											className="validate question-value"
											value={option.value || undefined}
											onChange={(ev) => {
												const opts = cloneDeep(this.state.options)
												opts[idx].value = ev.target.value
												this.setState({options: opts})
											}}
										/>
									</div>

								</div>

								<div className="col s6">
									{`(Optional) Help Text for ${idx + 1}: `}
									<div className="input-field">
										{/* text inputs for multiple choice answers */}
										<textarea
											placeholder="Help Text"
											type="text"
											className="materialize-textarea question-help"
											value={option.helpText || undefined}
											onChange={(ev) => {
												const opts = cloneDeep(this.state.options)
												opts[idx].helpText = ev.target.value
												this.setState({options: opts})
											}}
										/>
									</div>
								</div>
							</div>
							{/* if there's an existing subquestion, show it. if not, give the option */}
							{option.question
								? (
									<div className="card-panel">
										<div className="row">
											<QuestionBuilder
												{...option.question}
												idx={idx + 1}
												level={this.props.level + 1}
												removeSubQuestion={this.removeSubQuestion(option._id)}
											/>
										</div>
									</div>
								)
								: <a onClick={this.addSubquestion(idx)} className="waves-effect waves-light btn">Add Sub-question</a>
							}
							<hr />
						</div>
					</>
				))}
				<div className="col s6">
					<a className="waves-effect waves-light btn green darken-3" onClick={this.appendOption}>Add Option</a>
				</div>
				<div className="col s6">
					<a className="waves-effect waves-light btn red darken-3" onClick={this.removeOption}>Remove Option</a>
				</div>
			</div>
		)

		return (
			<section className={`question-builder level-${this.props.level} col s12`} data-question-type={this.state.type}>

				<div className="row">
					<div className="col s12">
						<i className="material-icons right remove-button" onClick={this.props.removeSubQuestion}>clear</i>
						<h5>Question {this.props.idx}</h5>
					</div>
					<div className="col s9">
						Question title:
						<div className="inline input-field">
							<input
								ref={this.questionText}
								placeholder="Question Name"
								value={this.state.questionText}
								type="text"
								className="validate question-title"
							/>
						</div>
					</div>
					<aside className="col s3">
						Question Type:
						<p>
							<label>
								<input
									name={`${this.state.questionText}toggle`}
									type="radio"
									className="with-gap"
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
									className="with-gap"
									checked={this.state.type === 'scalar'}
									onClick={() => this.setState({type: 'scalar'})}
								/>
								<span>Scalar</span>
							</label>
						</p>
					</aside>
					<div className="col s12">
						{this.state.type === 'multi' ? multi : slider}
					</div>
				</div>

			</section>
		)
	}
}

export default QuestionBuilder
