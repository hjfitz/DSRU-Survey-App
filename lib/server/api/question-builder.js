const express = require('express')
const createError = require('http-errors')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const db = require('../db')
const AuthController = require('./AuthController')
const SurveyController = require('./SurveyController')


const buildRouter = express.Router()

// handle all authenticated requests
buildRouter.use(session({
	secret: AuthController.generateSecrets(),
	store: new MongoStore({url: process.env.DATABASE_URL}),
}))

// listen for login requests
buildRouter.post('/login', (req, res) => AuthController.login(req, res))

// check to see if we're logged in
buildRouter.use((req, res, next) => AuthController.handleRequest(req, res, next))

// used to display all ongoing surveys
buildRouter.get('/all', async (req, res) => {
	SurveyController.findAllWithResponseCount(req, res)
})

buildRouter.get('/csv/:id', async (req, res) => {
	SurveyController.generateCSV(req, res)
})

buildRouter.delete('/:id', async (req, res) => {
	SurveyController.delete(req, res)
})

// used to edit a given survey (by mongo _id)
buildRouter.get('/edit/:id', async (req, res) => {
	SurveyController.find(req, res)
})


// create a new survey
buildRouter.post('/new', async (req, res) => {
	SurveyController.createSurvey(req, res)
})

buildRouter.put('/edit/:id', async (req, res) => {
	SurveyController.editSurvey(req, res)
})

module.exports = buildRouter
