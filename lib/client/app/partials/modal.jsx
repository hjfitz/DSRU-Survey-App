import React from 'react'
import marked from 'marked'

const renderer = new marked.Renderer()

renderer.list = (body, ordered) => (ordered
	? `<ol class="browser-default">${body}</ol>`
	: `<ul class="browser-default">${body}</ul>`)

const Modal = props => (
	<div ref={props.inRef} id="modal1" className="modal">
		<div className="modal-content" dangerouslySetInnerHTML={{__html: marked(props.text, {renderer})}} />
		<div className="modal-footer">
			<a href="#!" className="modal-close waves-effect waves-green btn-flat">Close</a>
		</div>
	</div>
)

export default Modal
