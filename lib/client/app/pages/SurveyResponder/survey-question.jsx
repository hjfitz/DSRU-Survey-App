import React from 'react'

import MultiOptions from './multiple-options'
import MultiGroup from './multiple-choice'
import Open from './open'
import Slider from './slider'


const Question = (props) => {
	let inner = ''
	const questionType = props.type.toLowerCase()
	if (questionType === 'multi') inner = <MultiGroup {...props} />
	else if (questionType === 'scalar') inner = <Slider {...props} />
	else if (questionType === 'open') inner = <Open {...props} />
	else if (questionType === 'options') inner = <MultiOptions {...props} />

	// do something with prev text for title. idx only works at top leve

	return (
		<section className="card">
			<div className="card-content">
				<span className="card-title">
					<p>{props.idx + 1}) {props.questionText}</p>
					{props.required ? <p className="required-text">Required</p> : ''}
				</span>
				<div
					data-question-id={props._id}
					data-question-name={props.questionText}
					data-question-type={questionType}
					data-required={props.required}
					className="row"
				>
					<div className="col s12">
						{inner}
					</div>
				</div>
			</div>
		</section>

	)
}


export default Question
