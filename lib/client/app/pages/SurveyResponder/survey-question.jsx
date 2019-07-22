import React from 'react'
import shortid from 'shortid'
import M from 'materialize-css'

// todo: move this to a functional component with hooks?
class MultiGroup extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			options: props.options,
			selected: -1,
		}
		this.setSelected = this.setSelected.bind(this)
	}

	setSelected(num) {
		return () => this.setState({selected: num})
	}

	componentDidMount() {
		console.log('oi')
		const range = document.querySelectorAll('input[type="range"]')
		console.log({range})
		range.forEach(elem => M.Range.init(elem))
	}

	render() {
		// generate a random ID per place in hierarchy in order to select multiple items
		const groupID = shortid.generate()
		return this.state.options.map((option, idx) => (
			<React.Fragment key={option._id}>
				<p onClick={this.setSelected(idx)}>
					<label data-question-group>
						<input
							name={groupID}
							type="radio"
							className="with-gap"
							checked={idx === this.state.selected}
							value={option.value}
							data-question-name={this.props.questionText}
						/>
						<span>{option.value}</span>
					</label>
				</p>
				{((idx === this.state.selected) && option.question) ? <Question {...option.question} idx={idx} /> : ''}
			</React.Fragment>
		))
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
