export function fetchJSON(endpoint, payload, method='GET') {
	method = method.toUpperCase()
	return fetch(endpoint, {
		method,
		headers: {
			'content-type': 'application/json',
			'accept': 'application/json'
		},
		body: JSON.stringify(payload)
	})
}