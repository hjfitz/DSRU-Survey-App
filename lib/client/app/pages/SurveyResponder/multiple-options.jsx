import React from 'react'

const MultipleOptions = props => (
	<div>
		{props.options.map(option => (
			<p>
				<label>
					<input type="checkbox" value={option.value} />
					<span>{option.value}</span>
				</label>
			</p>
		))}
	</div>
)

export default MultipleOptions
