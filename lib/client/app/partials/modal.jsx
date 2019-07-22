import React from 'react'
import marked from 'marked'

const Modal = props => (
	<div ref={props.inRef} id="modal1" className="modal">
		<div className="modal-content">
			<h4>{props.header}</h4>
			<section dangerouslySetInnerHTML={{__html: marked(props.text)}} />
		</div>
		<div className="modal-footer">
			<a href="#!" className="modal-close waves-effect waves-green btn-flat">Close</a>
		</div>
	</div>
)

export default Modal
