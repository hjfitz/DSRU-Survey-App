import React from 'react'
import Markdown from './markdown'

const Modal = props => (
	<div ref={props.inRef} id={props.id} className="modal">
		<div className="modal-content">
			<Markdown content={props.text || ''} />
			{props.children}
		</div>
		<div className="modal-footer">
			{props.cbText ? <a href="#!" className="modal-close waves-effect waves-green btn-flat" onClick={props.cb}>{props.cbText}</a> : ''}
			<a href="#!" className="modal-close waves-effect waves-green btn-flat">Close </a>
		</div>
	</div>
)

export default Modal
