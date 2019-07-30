import React from 'react'

const Slider = props => (
	<>
	Maximum value:
		<div className="input-field inline slider-input">
			<input type="number" name="max-val" id="max-val" value={props.maxVal} onChange={props.cb} />
		</div>
	</>
)

export default Slider
