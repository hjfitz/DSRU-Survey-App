const express = require('express')
const rateLimit = require('express-rate-limit')
const MongoStore = require('rate-limit-mongo')


const SurveyController = require('./controllers/SurveyController')

const surveyRouter = express.Router()

const limiter = rateLimit({
	store: new MongoStore({uri: process.env.DATABASE_URL}),
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 75, // limit each IP to 100 requests per windowMs
})

surveyRouter.use(limiter)


// get all questions
surveyRouter.get('/:id', SurveyController.find)

// listen for all responses
surveyRouter.post('/:id', SurveyController.makeResponse)

module.exports = surveyRouter
