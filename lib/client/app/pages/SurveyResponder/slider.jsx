import React from 'react'

const Slider = props => (
	<p className="range-field">
		<input
			type="range"
			min="1"
			max={props.maxVal}
			data-question-name={props.questionText}
			data-question-id={props._id}
		/>
	</p>
)

export default Slider
