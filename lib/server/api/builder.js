const buildRouter = require('express').Router()
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const AuthController = require('./controllers/AuthController')
const SurveyController = require('./controllers/SurveyController')

// handle all authenticated requests
buildRouter.use(session({
	secret: AuthController.generateSecrets(),
	store: new MongoStore({url: process.env.DATABASE_URL}),
	resave: true,
	saveUninitialized: true,
}))

// listen for login requests
buildRouter.post('/login', AuthController.login)
buildRouter.get('/logout', AuthController.logout)

// check to see if we're logged in
buildRouter.use(AuthController.handleRequest)

buildRouter.post('/change-pass', AuthController.changePass)

buildRouter.get('/checkauth', AuthController.checkAuth)

// dashboard functions
buildRouter.get('/all', SurveyController.findAllWithResponseCount)
buildRouter.delete('/:id', SurveyController.delete)
buildRouter.get('/csv/:id', SurveyController.generateResults)
buildRouter.get('/csv/mapping/:id', SurveyController.generateMapping)

// builder functions
buildRouter.post('/new', SurveyController.createSurvey)
buildRouter.get('/edit/:id', SurveyController.find)
buildRouter.put('/edit/:id', SurveyController.editSurvey)

module.exports = buildRouter
