import React from 'react'
import cloneDeep from 'lodash/cloneDeep'
import M from 'materialize-css'
import RadioButton from '../../partials/radio-button'
import Options from './multiple-options'

class QuestionBuilder extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			type: props.type,
			questionText: props.questionText,
			options: props.options || [],
			maxVal: props.maxVal || 5,
			// used as we want to declare it as false and otherwise return true
			// mongo questions in edit mode have 'false' as a required option
			// however, undefined is falsey and we wish for *new* questions to default to true
			required: props.required !== false,
		}
		this.questionText = React.createRef()
		this.appendOption = this.appendOption.bind(this)
		this.removeOption = this.removeOption.bind(this)
		this.addSubquestion = this.addSubquestion.bind(this)
	}

	componentDidMount() {
		M.updateTextFields()
	}

	appendOption() {
		const options = cloneDeep(this.state.options)
		// if there is a subquestion, it should follow: { type, questionText, options }
		options.push({value: '', question: null})
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
		const {type, questionText, maxVal} = this.state

		const slider = (
			<>
				Maximum value:
				<div className="input-field inline slider-input">
					<input type="number" name="max-val" id="max-val" value={maxVal} onChange={ev => this.setState({maxVal: ev.target.value})} />
				</div>
			</>
		)
		const multi = (
			<>
				<div className="row multi">
					{this.state.options.map((option, idx) => (
						<React.Fragment key={this.state.questionText + idx}>
							<div className={`col s12 multi-input-level-${this.props.level} option`}>
								<div className="row">
									<div className="col s12">
										<h6>{`Option ${idx + 1}: `}</h6>
									</div>
									<div className="col m6 s12">
										<div className="input-field">
											{/* text inputs for multiple choice answers */}
											<input
												id={option.value + this.state.questionText}
												type="text"
												className="validate question-value"
												value={option.value || undefined}
												onChange={(ev) => {
													const opts = cloneDeep(this.state.options)
													opts[idx].value = ev.target.value
													this.setState({options: opts})
												}}
											/>
											<label htmlFor={option.value + this.state.questionText}>Question Response</label>
										</div>

									</div>

									<div className="col m6 s12">
										<div className="file-field input-field">
											<div className="btn right">
												<span>File</span>
												<input type="file" />
											</div>
											<div className="file-path-wrapper">
												<input className="file-path validate" type="text" placeholder="Upload an image" />
											</div>
										</div>
									</div>

									<div className="col s12">
										{/* {`(Optional) Help Text for ${idx + 1}: `} */}
										<div className="input-field">
											{/* text inputs for multiple choice answers */}
											<textarea
												type="text"
												className="materialize-textarea question-help"
												// id={this.state.questionText + option.helpText}
												value={option.helpText || undefined}
												onChange={(ev) => {
													const opts = cloneDeep(this.state.options)
													opts[idx].helpText = ev.target.value
													this.setState({options: opts})
												}}
											/>
											<label htmlFor={this.state.questionText + option.helpText}>Help Text (Optional)</label>
										</div>
									</div>
									{/* if there's an existing subquestion, show it. if not, give the option */}
									{option.question
										? (
											<div className="col s12">
												<div className="card-panel">
													<div className="row">
														<QuestionBuilder
															subText={`Sub-Question for "${this.state.questionText || 'No question given'}" (Option: "${option.value || 'No option set'}")`}
															{...option.question}
															idx={idx + 1}
															level={this.props.level + 1}
															removeSubQuestion={this.removeSubQuestion(option._id)}
														/>
													</div>
												</div>
											</div>
										)
										: <a onClick={this.addSubquestion(idx)} className="waves-effect waves-light btn col s12 m5">Add Sub-question</a>
									}
								</div>
							</div>
						</React.Fragment>
					))}
				</div>
				<div className="row">
					<a className="col s12 m4 waves-effect waves-light btn green darken-3" onClick={this.appendOption}>Add Option</a>
					<a className="col s12 m4 push-m4 waves-effect waves-light btn red darken-3" onClick={this.removeOption}>Remove Option</a>
				</div>
			</>
		)

		let inner = '' // for open-text
		if (type === 'multi') inner = multi
		if (type === 'scalar') inner = slider
		if (type === 'options') inner = <Options openOptions={this.state.options} questionText={this.state.questionText} />

		return (
			<section className={`question-builder level-${this.props.level} col s12`} data-question-type={this.state.type}>
				<div className="row">
					<div className="col s12">
						<i className="material-icons right remove-button cp" onClick={this.props.removeSubQuestion}>clear</i>
						<h5>{this.props.subText || `Question ${this.props.idx}`}</h5>
					</div>
					<div className="col s12" />
					<div className="col m9 s12">
						Question title:
						<div className="inline input-field">
							<input
								ref={this.questionText}
								placeholder="Question Name"
								value={this.state.questionText}
								type="text"
								className="validate question-title"
								onChange={ev => this.setState({questionText: ev.target.value})}
							/>
						</div>
					</div>
					<aside className="col m3 s12">
						Question Type:
						<RadioButton
							label="Multiple choice"
							name={`${questionText}toggle`}
							checked={type === 'multi'}
							cb={() => this.setState({type: 'multi'})}
						/>
						<RadioButton
							label="Open"
							name={`${questionText}toggle`}
							checked={type === 'open'}
							cb={() => this.setState({type: 'open'})}
						/>
						<RadioButton
							label="Scalar"
							name={`${questionText}toggle`}
							checked={type === 'scalar'}
							cb={() => this.setState({type: 'scalar'})}
						/>
						<RadioButton
							label="Multiple Options"
							name={`${questionText}toggle`}
							checked={type === 'options'}
							cb={() => this.setState({type: 'options'})}
						/>
						<p className="required-toggle">
							<label>
								<input
									type="checkbox"
									defaultChecked={this.state.required || null}
									checked={this.state.required || null}
									className="question-required"
									onChange={() => this.setState({required: !this.state.required})}
								/>
								<span>Required</span>
							</label>
						</p>
					</aside>
					<form className="col s12">
						{inner}
					</form>
				</div>

			</section>
		)
	}
}

export default QuestionBuilder
