import React from 'react'
import marked from 'marked'


const renderer = new marked.Renderer({gfm: true})

renderer.list = (body, ordered) => (ordered
	? `<ol class="browser-default">${body}</ol>`
	: `<ul class="browser-default">${body}</ul>`)


const Markdown = ({content}) => <div dangerouslySetInnerHTML={{__html: marked(content, {renderer})}} />

export default Markdown
