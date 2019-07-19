import React from 'react'
import shortid from 'shortid'

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

	render() {
		// generate a random ID per place in hierarchy in order to select multiple items
		const groupID = shortid.generate()
		return this.state.options.map((option, idx) => {
			console.log(option)
			const isSelected = idx === this.state.selected
			return (
				<>
					<p onClick={this.setSelected(idx)}>
						<label>
							<input name={groupID} type="radio" checked={idx === this.state.selected} value={option.value} />
							<span>{option.value}</span>
						</label>
					</p>
					{(isSelected && option.question) ? <Question {...option.question} idx={idx} /> : ''}
				</>
			)
		})
	}
}

const Question = (props) => {
	let inner = ''
	const questionType = props.type.toLowerCase()
	if (questionType === 'multi') {
		// inner = props.options.map(option => <MultiChoice {...option} />)
		inner = <MultiGroup options={props.options} />
	} else if (questionType === 'scalar') {
		inner = (
			<form action="#">
				<p className="range-field">
					<input type="range" min="1" max={props.maxVal} className="browser-default" />
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
						{inner}
					</div>
				</div>
			</div>
		</section>
	)
}

export default Question
