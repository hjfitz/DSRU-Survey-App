import React from 'react'
import cloneDeep from 'lodash/cloneDeep'
import M from 'materialize-css'
import shortid from 'shortid'

import RadioButton from '../../partials/radio-button'
import Options from './multiple-options'
import Slider from './slider'
import MultiChoice from './multiple-choice'

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
			uniqueID: shortid.generate(),
		}
		this.questionText = React.createRef()
		this.updState = this.updState.bind(this)
	}

	componentDidMount() {
		M.updateTextFields()
	}

	removeSubQuestion(idx) {
		return () => {
			const options = cloneDeep(this.state.options)
			const [curOption] = options.filter(opt => opt._id === idx)
			delete curOption.question
			this.setState({options})
		}
	}

	updState(key) {
		return ev => this.setState({[key]: ev.target.value})
	}

	render() {
		const {type, questionText, maxVal, options} = this.state

		let inner = '' // for open-text
		if (type === 'multi') inner = <MultiChoice options={options} questionText={questionText} level={this.props.level} cb={this.props.removeSubQuestion} />
		if (type === 'scalar') inner = <Slider maxVal={maxVal} cb={this.updState('maxVal')} />
		if (type === 'options') inner = <Options openOptions={options} questionText={questionText} level={this.props.level} />

		return (
			<section className={`question-builder level-${this.props.level} col s12`} data-question-type={this.state.type}>
				<div className="row">
					<div className="col s12">
						{this.props.children}
						<h5>{this.props.subText || `Question ${this.props.idx}`}</h5>
					</div>
					<div className="col s12" />
					<div className="col m8 s12">
						Question:
						<div className="inline input-field col s12">
							<input
								ref={this.questionText}
								placeholder="Question Name"
								value={this.state.questionText || undefined}
								type="text"
								className="validate question-title"
								onChange={this.updState('questionText')}
								// onChange={ev => this.setState({questionText: ev.target.value})}
							/>
						</div>
					</div>
					<aside className="col m4 s12">
						Type:
						<RadioButton
							label="Multiple choice"
							name={this.state.uniqueID}
							checked={type === 'multi'}
							cb={() => this.setState({type: 'multi'})}
						/>
						<RadioButton
							label="Open"
							name={this.state.uniqueID}
							checked={type === 'open'}
							cb={() => this.setState({type: 'open'})}
						/>
						<RadioButton
							label="Scalar"
							name={this.state.uniqueID}
							checked={type === 'scalar'}
							cb={() => this.setState({type: 'scalar'})}
						/>
						<RadioButton
							label="Multiple Options"
							name={this.state.uniqueID}
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
					<div className="col s12">
						{inner}
					</div>
				</div>

			</section>
		)
	}
}

export default QuestionBuilder
