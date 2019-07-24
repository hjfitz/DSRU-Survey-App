const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const AuthController = require('./AuthController')
const SurveyController = require('./SurveyController')


const buildRouter = express.Router()

// handle all authenticated requests
buildRouter.use(session({
	secret: AuthController.generateSecrets(),
	store: new MongoStore({url: process.env.DATABASE_URL}),
	resave: true,
	saveUninitialized: true,

}))

// listen for login requests
buildRouter.post('/login', AuthController.login)

// check to see if we're logged in
buildRouter.use(AuthController.handleRequest)

// dashboard functions
buildRouter.get('/all', SurveyController.findAllWithResponseCount)
buildRouter.delete('/:id', SurveyController.delete)
buildRouter.get('/csv/:id', SurveyController.generateCSV)

// builder functions
buildRouter.post('/new', SurveyController.createSurvey)
buildRouter.get('/edit/:id', SurveyController.find)
buildRouter.put('/edit/:id', SurveyController.editSurvey)

module.exports = buildRouter
