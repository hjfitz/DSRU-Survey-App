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
	console.log(req.body)
	try {
		const surveyResp = new db.Response({
			surveyID: req.params.id,
			answers: req.body,
		})

		console.log(surveyResp)

		await surveyResp.save()
		res.send(200)
	} catch (err) {
		console.log(err)
		res.send(createError(500, err))
	}
})

module.exports = surveyRouter
