import React from 'react'

const OpenQuestion = props => (
	<div className="input-field">
		<textarea
			id={`open-question-${props._id}`}
			className="materialize-textarea"
			data-length={480}
			data-question-id={props._id}
		/>
		<label htmlFor={`open-question-${props._id}`}>Response</label>
	</div>
)

export default OpenQuestion
