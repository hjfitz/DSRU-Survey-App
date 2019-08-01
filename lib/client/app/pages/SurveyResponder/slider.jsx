import React, {useEffect} from 'react'
import M from 'materialize-css'
import {generate} from 'shortid'

function Slider(props) {
	const id = generate()
	useEffect(() => {
		const inp = document.getElementById(id)
		M.Range.init(inp)
	})
	return (
		<p className="range-field">
			<input
				id={id}
				type="range"
				min="1"
				max={props.maxVal}
				data-question-name={props.questionText}
				data-question-id={props._id}
			/>
		</p>
	)
}

export default Slider
