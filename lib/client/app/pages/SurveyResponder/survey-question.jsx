import React from 'react'
import shortid from 'shortid'
import M from 'materialize-css'

import Modal from '../../partials/modal'

class MultiGroup extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			options: props.options,
			helpText: "Shouldn't see this",
			selected: -1,
			groupID: shortid.generate(),
		}
		this.setSelected = this.setSelected.bind(this)
		// this.modal = React.createRef()
	}

	componentDidMount() {
		const range = document.querySelectorAll('input[type="range"]')
		range.forEach(elem => M.Range.init(elem))
	}


	setSelected(num) {
		return () => this.setState({selected: num})
	}

	showHelp(helpText) {
		return () => {
			this.setState({helpText}, () => {
				const inst = M.Modal.init(this.modal)
				inst.open()
			})
		}
	}

	render() {
		// generate a random ID per place in hierarchy in order to select multiple items
		return (
			<>
				{this.state.options.map((option, idx) => (
					<React.Fragment key={option._id}>
						<p>
							<label onClick={this.setSelected(idx)} data-question-group>
								<input
									name={this.state.groupID}
									type="radio"
									className="with-gap"
									checked={idx === this.state.selected}
									value={option.value}
									OpenText
data-question-name={this.props.questionText}
									data-question-id={this.props.id}
								/>
								<span>{option.value}</span>
							</label>
							{option.helpText
								? <i className="material-icons right cp grey-text" onClick={this.showHelp(option.helpText)}>help_outline</i>
								: ''
							}
						</p>
						{((idx === this.state.selected) && option.question) ? <Question {...option.question} idx={idx} /> : ''}
					</React.Fragment>
				))}
				<Modal inRef={ref => this.modal = ref} id={this.state.groupID} header="information" text={this.state.helpText} />
			</>
		)
	}
}

class Question extends React.Component {
	constructor(props) {
		super(props)
		this.range = React.createRef()
		this.textArea = React.createRef()
	}

	componentDidMount() {
		M.CharacterCounter.init(this.textArea.current)
	}

	componentDidUpdate() {
		// M.Range.init(document.querySelectorAll('input[type="range"]'))
		M.Range.init(this.range.current)
	}

	render() {
		const {props} = this
		let inner = ''
		const questionType = props.type.toLowerCase()
		if (questionType === 'multi') {
			inner = <MultiGroup options={props.options} questionText={props.questionText} id={props._id} />
		} else if (questionType === 'scalar') {
			inner = (
				// <form action="#">
				<p className="range-field">
					<input
						type="range"
						min="1"
						max={props.maxVal}
						ref={this.range}
						data-question-name={props.questionText}
						data-question-id={props._id}
					/>
				</p>
				// </form>
			)
		} else if (questionType === 'open') {
			inner = (
				<div className="input-field">
					<textarea
						id={`open-question-${props._id}`}
						className="materialize-textarea"
						data-length={500}
						ref={this.textArea}
						data-question-id={props._id}
					/>
					<label htmlFor={`open-question-${props._id}`}>Response</label>
				</div>
			)
		}
		// get options and map over option.options
		// todo: better naming

		return (

			<section className="card">
				<div className="card-content">
					<span className="card-title">
						<p>{props.idx + 1}) {props.questionText}</p>
						{props.required ? <p className="required-text">Required</p> : ''}
					</span>
					<div
						data-question-id={props._id}
						data-question-name={props.questionText}
						data-question-type={questionType}
						data-required={props.required}
						className="row"
					>
						<div className="col s12">
							{inner}
						</div>
					</div>
				</div>
			</section>

		)
	}
}

export default Question
