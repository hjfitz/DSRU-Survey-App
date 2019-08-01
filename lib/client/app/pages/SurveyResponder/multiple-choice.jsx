import React from 'react'
import shortid from 'shortid'
import M from 'materialize-css'

import Modal from '../../partials/modal'
import Question from './survey-question'

function byType(first, second) {
	if (first.type < second.type) return 1
	if (first.type > second.type) return -1
	return 0
}

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
		this.renderSubQuestion = this.renderSubQuestion.bind(this)
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

	renderHelpText(option) {
		if (!option.helpText) return ''
		return (
			<i
				className="material-icons right cp grey-text"
				onClick={this.showHelp(option.helpText)}
			>help_outline
			</i>
		)
	}

	static renderImg(option) {
		if (!option.imgPath) return ''
		return (
			<div className="survey-image">
				<img className="materialboxed" alt="" src={option.imgPath} />
			</div>
		)
	}

	renderSubQuestion(option, idx) {
		if ((idx === this.state.selected) && option.question) {
			return (
				<div className="sub-question" key={`question-${option._id}`}>
					<Question {...option.question} idx={idx} parentNum={this.props.parentNum} />
				</div>
			)
		}
		return ''
	}

	render() {
		const hasImages = this.state.options.filter(option => option.imgPath)
		const outerClass = hasImages.length ? 'center-radio' : ''
		// generate a random ID per place in hierarchy in order to select multiple items
		const options = this.state.options.map((option, idx) => (
			[
				<p key={`option-${option._id}`}>
					<label onClick={this.setSelected(idx)} data-question-group>
						<input
							name={this.state.groupID}
							type="radio"
							className="with-gap"
							checked={idx === this.state.selected}
							value={option.value}
							data-question-name={this.props.questionText}
							data-question-id={this.props.id}
						/>
						<span>{option.value}</span>
					</label>
					{this.renderHelpText(option)}
					{MultiGroup.renderImg(option)}
				</p>,
				this.renderSubQuestion(option, idx),
			]
		)).flat().filter(Boolean).sort(byType)
		return (
			<div className={`center-text ${outerClass}`}>
				{options}
				<Modal inRef={ref => this.modal = ref} id={this.state.groupID} header="information" text={this.state.helpText} />
			</div>
		)
	}
}

export default MultiGroup
