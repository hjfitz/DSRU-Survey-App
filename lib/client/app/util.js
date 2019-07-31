import M from 'materialize-css'

export function fetchJSON(endpoint, payload, method = 'GET') {
	method = method.toUpperCase()
	return fetch(endpoint, {
		method,
		headers: {
			'content-type': 'application/json',
			accept: 'application/json',
		},
		body: JSON.stringify(payload),
		credentials: 'include',
	})
}

export function fetchWithProgress(url, body, method = 'POST') {
	return new Promise((res, rej) => {
		const xhr = new XMLHttpRequest()
		xhr.upload.onprogress = ev => M.toast({html: `Loading... ${ev.loaded / ev.total * 100}%`})
		xhr.open(method, url)
		xhr.setRequestHeader('content-type', 'application/json')
		xhr.setRequestHeader('accept', 'application/json')
		xhr.send(JSON.stringify(body))
		xhr.addEventListener('load', res)
		xhr.addEventListener('error', rej)
	})
}

export const noop = () => {}
