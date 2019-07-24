const express = require('express')
const SurveyController = require('./SurveyController')

const surveyRouter = express.Router()


// get all questions
surveyRouter.get('/:id', SurveyController.find)

// listen for all responses
surveyRouter.post('/:id', SurveyController.makeResponse)

module.exports = surveyRouter
