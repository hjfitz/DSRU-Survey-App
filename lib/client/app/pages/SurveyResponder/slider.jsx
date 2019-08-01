import React, {useEffect} from 'react'
import shortID from 'shortid'
import M from 'materialize-css'

function Slider(props) {
	const id = shortID.generate()
	useEffect(() => {
		const slider = document.getElementById(id)
		M.Slider.init(slider)
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
