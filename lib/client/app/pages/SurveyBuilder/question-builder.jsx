import React from 'react'
import cloneDeep from 'lodash/cloneDeep'

class QuestionBuilder extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			type: this.props.type,
			questionText: this.props.questionText,
			options: this.props.options || [],
			maxVal: this.props.maxVal || 5,
		}
		this.appendOption = this.appendOption.bind(this)
		this.removeOption = this.removeOption.bind(this)
	}

	appendOption() {
		const options = cloneDeep(this.state.options)
		options.push({
			value: '',
			questions: []
		})
		this.setState({options})
	}

	removeOption() {

	}

	render() {
		const slider = <input type="range" id="test5" min="0" max={this.state.maxVal} />
		const multi = (
			<div className="row">
				{this.state.options.map(option => {
					return (
						<div class="col" key={this.state.questionText + option.questionText}>
								<input placeholder="Placeholder" id="first_name" type="text" class="validate" />
								(button to add sub question)
						</div>
				)
			})}
			<div className="row">
				<div className="col s12">
					<div className="row">
						<a className="waves-effect waves-light btn green darken-3" onClick={this.appendOption}>
							Add Option
						</a>
					</div>
					<div className="row">
						<a className="waves-effect waves-light btn red darken-3" onClick={this.removeOption}>
							Remove Option
						</a>
					</div>
				</div>
			</div>
			</div>

		)

		return (
			<form className="col s12">
				<div className="row">
					<div className="input-field col s12">
						<input placeholder="Question Name" id="question_name" type="text" className="validate" />
						<label htmlFor="question_name">Question</label>
					</div>
					<div className="input-field col s12">
						{this.state.type === 'multi' ? multi : slider}
					</div>
				</div>
				<form className="row" onChange={console.log}>
					<p>
						<label>
							<input name={this.state.questionText + 'toggle'} type="radio" />
							<span>Multiple choice</span>
						</label>
					</p>
					<p>
						<label>
							<input name={this.state.questionText + 'toggle'} type="radio" />
							<span>Scalar</span>
						</label>
					</p>
				</form>
			</form>
		)
	}
}

export default QuestionBuilder