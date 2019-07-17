import React from 'react'

class QuestionBuilder extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			type: this.props.type,
			questionText: this.props.questionText,
			options: this.props.options || [],
			maxVal: this.props.maxVal || 5,
		}
	}

	render() {
		const slider = <input type="range" id="test5" min="0" max={this.state.maxVal} />
		const multi = this.state.options.map(option => {
			console.log(option)
		})
	}
}