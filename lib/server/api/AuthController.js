/* eslint-disable class-methods-use-this */
const crypto = require('crypto')
const createError = require('http-errors')
const log = require('../logger')

let pass = process.env.ADMIN_PASS

class AuthController {
	static login(req, res) {
		const {user, password} = req.body
		if (user !== process.env.ADMIN_USER) {
			res.status(400).send(createError(400, 'Unable to login due to an invalid username'))
			return
		}
		if (password !== pass) {
			res.status(400).send(createError(400, 'Unable to login due to an invalid password'))
			return
		}
		req.session.authed = true
		res.cookie('no-programa', 'cache')
		res.sendStatus(200)
	}

	static logout(req, res) {
		log.info('logging user out', {file: 'AuthController', func: 'logout'})
		if (req.session) {
			req.session.authed = false
			req.session.destroy()
		}
		res.redirect('/')
	}

	static changePass(req, res) {
		const {password} = req.body
		if (password && password.length < 7) {
			res.send(createError(400, 'Password is too short!'))
		}
		log.debug(`setting password to: "${password}"`, {file: 'AuthController', func: 'changePass'})
		pass = password
		res.send(200)
	}

	static handleRequest(req, res, next) {
		if (!req.session.authed && process.env.AUTH_ENABLED === 'true') {
			log.info('unauthed user attempting to access classified area', {file: 'AuthController', func: 'handleRequest'})
			// unsure if createError actually works here
			res.status(401).send(createError(401, 'You need to login to interact with this endpoint!'))
			return
		}
		next()
	}

	static checkAuth(req, res) {
		if (!process.env.AUTH_ENABLED === 'true' || req.session.authed) {
			res.send(200)
			return
		}
		res.send(createError(404, 'You must login first!'))
	}

	static generateSecrets() {
		return Array.from({length: 100}).map(() => crypto.randomBytes(256).toString('hex'))
	}
}

module.exports = AuthController
