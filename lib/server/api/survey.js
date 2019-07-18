const express = require('express')
const createError = require('http-errors')
const db = require('../db')

const surveyRouter = express.Router()


// get all questions
surveyRouter.get('/:id', async (req, res) => {
	try {
		const survey = await db.Survey.findById(req.params.id)
		// console.log(survey.questions[0].options[1].question)
		// const parsed = survey.toJson
		res.json(survey)
	} catch (err) {
		console.log(err)
		res.send(createError(404, err))
	}
})

// listen for all responses
surveyRouter.post('/:id', async (req, res) => {

})

module.exports = surveyRouter
