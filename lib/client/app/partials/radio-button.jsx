import React from 'react'

const RadioButton = props => (
	<p>
		<label>
			<input
				name={props.name}
				type="radio"
				className={`with-gap ${props.className}`}
				checked={props.checked}
				onClick={props.cb}
			/>
			<span>{props.label}</span>
		</label>
	</p>
)

export default RadioButton
