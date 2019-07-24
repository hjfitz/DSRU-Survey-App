/* eslint-disable class-methods-use-this */
const crypto = require('crypto')
const createError = require('http-errors')

class AuthController {
	static login(req, res) {
		const {user, password} = req.body
		if (user !== process.env.ADMIN_USER) {
			res.status(400).send(createError(400, 'Unable to login due to an invalid username'))
			return
		}
		if (password !== process.env.ADMIN_PASS) {
			res.status(400).send(createError(400, 'Unable to login due to an invalid password'))
			return
		}
		req.session.authed = true
		res.sendStatus(200)
	}

	static handleRequest(req, res, next) {
		if (!req.session.authed && process.env.AUTH_ENABLED === 'true') {
			// unsure if createError actually works here
			res.status(401).send(createError(401, 'You need to login to interact with this endpoint!'))
			return
		}
		next()
	}

	static generateSecrets() {
		return Array.from({length: 100}).map(() => crypto.randomBytes(256).toString('hex'))
	}
}

module.exports = AuthController
