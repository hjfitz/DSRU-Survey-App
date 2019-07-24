const express = require('express')
const SurveyController = require('./SurveyController')

const surveyRouter = express.Router()


// get all questions
surveyRouter.get('/:id', async (req, res) => {
	SurveyController.find(req, res)
})

// listen for all responses
surveyRouter.post('/:id', async (req, res) => {
	SurveyController.makeResponse(req, res)
})

module.exports = surveyRouter
