import React from 'react'

const Modal = props => (
	<div ref={props.inRef} id="modal1" className="modal">
		<div className="modal-content">
			<h4>{props.header}</h4>
			<p>{props.text}</p>
		</div>
		<div className="modal-footer">
			<a href="#!" className="modal-close waves-effect waves-green btn-flat">Agree</a>
		</div>
	</div>
)

export default Modal
