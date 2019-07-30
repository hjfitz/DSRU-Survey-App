import React from 'react'
import cloneDeep from 'lodash/cloneDeep'

// eslint-disable-next-line import/no-cycle
import QuestionBuilder from './question-builder'

class MultiChoice extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			options: props.options,
			questionText: props.questionText,
		}
		this.appendOption = this.appendOption.bind(this)
		this.removeOption = this.removeOption.bind(this)
		this.addSubquestion = this.addSubquestion.bind(this)
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

	render() {
		return [

			<div className="row multi">
				{this.state.options.map((option, idx) => (
					<React.Fragment key={this.props.questionText + idx}>
						<div className={`col s12 multi-input-level-${this.props.level} option`}>
							<div className="row">
								<div className="col s12">
									<h6>{`Option ${idx + 1}: `}</h6>
								</div>
								<div className="col m6 s12">
									<div className="input-field">
										{/* text inputs for multiple choice answers */}
										<input
											id={` ${option.value}${this.props.questionText}`}
											type="text"
											className="validate question-value"
											value={option.value || undefined}
											onChange={(ev) => {
												const opts = cloneDeep(this.state.options)
												opts[idx].value = ev.target.value
												this.setState({options: opts})
											}}
										/>
										<label htmlFor={` ${option.value}${this.props.questionText}`}>Question Response</label>
									</div>

								</div>

								<div className="col m6 s12">
									<div className="file-field input-field">
										<div className="btn right">
											<span>File</span>
											<input
												type="file"
												accept="image/png, image/jpeg, image/jpg"
												className="question-img"
												data-has-image={!!option.imgPath}
												data-orig-path={option.imgPath}
											/>
										</div>
										<div className="file-path-wrapper">
											<input className="file-path validate" type="text" placeholder="Upload an image" value={option.imgPath} />
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
											id={` ${this.props.questionText}${option.helpText}`}
											value={option.helpText || undefined}
											onChange={(ev) => {
												const opts = cloneDeep(this.state.options)
												opts[idx].helpText = ev.target.value
												this.setState({options: opts})
											}}
										/>
										<label htmlFor={` ${this.props.questionText}${option.helpText}`}>Help Text (Optional)</label>
									</div>
								</div>
								{/* if there's an existing subquestion, show it. if not, give the option */}
								{option.question
									? (
										<div className="col s12">
											<div className="card-panel">
												<div className="row">
													<QuestionBuilder
														subText={`Sub-Question for "${this.props.questionText || 'No question given'}" (Option: "${option.value || 'No option set'}")`}
														{...option.question}
														idx={idx + 1}
														level={this.props.level + 1}
														removeSubQuestion={this.removeSubQuestion(option._id)}
													/>
												</div>
											</div>
										</div>
									)
									: <a onClick={this.addSubquestion(idx)} className="waves-effect waves-light btn col s12 m6 push-m3">Add Sub-question</a>
								}
							</div>
						</div>
					</React.Fragment>
				))}
			</div>,
			<div className="row">
				<a className="col s12 m4 waves-effect waves-light btn green darken-3" onClick={this.appendOption}>Add Option</a>
				<a className="col s12 m4 push-m4 waves-effect waves-light btn red darken-3" onClick={this.removeOption}>Remove Option</a>
			</div>,
		]
	}
}


export default MultiChoice
