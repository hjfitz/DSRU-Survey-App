import React from 'react'
import cloneDeep from 'lodash/cloneDeep'


class Options extends React.Component {
	constructor(props) {
		super(props)
		this.state = {options: props.openOptions || []}
		this.setOption = this.setOption.bind(this)
		this.removeOption = this.removeOption.bind(this)
		this.appendOption = this.appendOption.bind(this)
	}

	setOption(idx) {
		return (ev) => {
			const opts = cloneDeep(this.state.options)
			opts[idx].helpText = ev.target.value
			this.setState({options: opts})
		}
	}

	removeOption() {
		const options = cloneDeep(this.state.options)
		options.pop()
		this.setState({options})
	}

	appendOption() {
		const options = cloneDeep(this.state.options)
		// if there is a subquestion, it should follow: { type, questionText, options }
		options.push({value: '', question: null})
		this.setState({options})
	}

	render() {
		const {props} = this
		return (
			<>
				<div className="row multi">
					{this.state.options.map((option, idx) => (
						<React.Fragment key={props.questionText + idx}>
							<div className={`col s12 multi-input-level-${props.level || 1} option`}>
								<div className="row">

									<div className="col s12">
										<h6>{`Option ${idx + 1}: `}</h6>
									</div>
									<div className="col s12">
										<div className="input-field">
											{/* text inputs for multiple choice answers */}
											<input
												id={option.value + props.questionText + idx}
												type="text"
												className="validate question-value"
												value={option.value || undefined}
												onChange={(ev) => {
													const opts = cloneDeep(this.state.options)
													opts[idx].value = ev.target.value
													this.setState({options: opts})
												}}
											/>
											<label htmlFor={option.value + props.questionText + idx}>Question Response</label>
										</div>

									</div>


									<div className="col s12">
										{/* {`(Optional) Help Text for ${idx + 1}: `} */}
										<div className="input-field">
											{/* text inputs for multiple choice answers */}
											<textarea
												type="text"
												className="materialize-textarea question-help"
												id={props.questionText + option.helpText}
												value={option.helpText || undefined}
												onChange={this.setOption(idx)}
											/>
											<label htmlFor={props.questionText + option.helpText}>Help Text (Optional)</label>
										</div>
									</div>
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
	}
}

export default Options
