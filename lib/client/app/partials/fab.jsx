import React from 'react'

const Fab = props => (
	<div ref={props.inRef} className="fixed-action-btn">
		<a className="btn-floating btn-large red">
			<i className="large material-icons">mode_edit</i>
		</a>
		<ul>
			<li>
				<a
					className="btn-floating tooltipped red"
					data-position="left"
					data-tooltip="Create a survey"
				><i className="material-icons">insert_chart</i>
				</a>
			</li>
			<li onClick={props.callback}>
				<a
					className="btn-floating tooltipped yellow darken-1"
					data-position="left"
					data-tooltip="Change the admin password"
				><i className="material-icons">format_quote</i>
				</a>
			</li>
		</ul>
	</div>

)

export default Fab
