import React from 'react'
import shortid from 'shortid'
import M from 'materialize-css'

import Modal from '../modal'

// todo: move this to a functional component with hooks?
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
		console.log('oi')
		const range = document.querySelectorAll('input[type="range"]')
		console.log({range})
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
						<p onClick={this.setSelected(idx)}>
							<label data-question-group>
								<input
									name={this.state.groupID}
									type="radio"
									className="with-gap"
									checked={idx === this.state.selected}
									value={option.value}
									data-question-name={this.props.questionText}
								/>
								<span>{option.value}</span>
								{option.helpText
									? <i className="material-icons right cp" onClick={this.showHelp(option.helpText)}>help_outline</i>
									: ''
								}
							</label>
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
	}

	componentDidUpdate() {
		M.Range.init(document.querySelectorAll('input[type="range"]'))
	}

	render() {
		const {props} = this
		let inner = ''
		const questionType = props.type.toLowerCase()
		if (questionType === 'multi') {
			inner = <MultiGroup options={props.options} questionText={props.questionText} />
		} else if (questionType === 'scalar') {
			inner = (
				<form action="#">
					<p className="range-field">
						<input type="range" min="1" max={props.maxVal} data-question-name={props.questionText} />
					</p>
				</form>
			)
		}

		return (
			<section className="row">
				<div className="col s12">
					<div className="card">
						<div className="card-content">
							<span className="card-title">{props.idx + 1}) {props.questionText}</span>
							<div data-question-name={props.questionText} data-question-type={questionType}>
								{inner}
							</div>
						</div>
					</div>
				</div>
			</section>
		)
	}
}

export default Question
