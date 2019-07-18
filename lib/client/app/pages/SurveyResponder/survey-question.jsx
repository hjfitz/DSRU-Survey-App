import React from 'react'

class MultiGroup extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			options: props.options,
			selected: 0,
		}
		this.setSelected = this.setSelected.bind(this)
	}

	setSelected(num) {
		return () => this.setState({selected: num})
	}

	render() {
		return this.state.options.map((option, idx) => {
			console.log(option)
			const isSelected = idx === this.state.selected
			return (
				<>
					<p onClick={this.setSelected(idx)}>
						<label>
							<input name="group1" type="radio" checked={idx === this.state.selected} value={option.value} />
							<span>{option.value}</span>
						</label>
					</p>
					{isSelected && option.question ? <Question {...option.question} idx={idx} /> : ''}
				</>
			)
		})
	}
}

class Question extends React.Component {
	render() {
		console.log(this.props)
		let inner = ''
		if (this.props.type === 'Multi') {
			console.log(this.props.options)
			// inner = this.props.options.map(option => <MultiChoice {...option} />)
			inner = <MultiGroup options={this.props.options} />
		} else if (this.props.type === 'Scalar') {
			inner = (
				<form action="#">
					<p className="range-field">
						<input type="range" id="test5" min="1" max={this.props.maxVal} className="browser-default" />
					</p>
				</form>
			)
		}

		return (
			<section className="row">
				<div className="col s12">
					<div className="card">
						<div className="card-content">
							<span className="card-title">{this.props.idx + 1}) {this.props.questionText}</span>
							{inner}
						</div>
					</div>
				</div>
			</section>
		)
	}
}

export default Question
