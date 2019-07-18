const express = require('express')
const createError = require('http-errors')
const db = require('../db')

const buildRouter = express.Router()

// should be some admin api for requests here

// used to display all ongoing surveys
buildRouter.get('/all', async (req, res) => {

})


// used to edit a given survey (by mongo _id)
buildRouter.get('/edit/:id', async (req, res) => {

})

async function recursivelyCreateMongoObjects(question) {
	if (question.type === 'scalar') {
		const newQuestion = new db.questions.Scalar({
			questionText: question.questionText,
			maxVal: question.maxVal,
		})
		await newQuestion.save()
		return newQuestion
	}
	let options = []
	// if there are options, add them and attempt to resolve any mongo connections
	if (question.options.length) {
		options = await Promise.all(question.options.map(async (opt) => {
			const curOpt = {value: opt.value}
			// difficult part: we need to recur through each option under question.options
			if (opt.question) {
				curOpt.question = await recursivelyCreateMongoObjects(opt.question)
			}
			return curOpt
		}))
	}
	const newQuestion = new db.questions.Multi({
		questionText: question.questionText,
		options,
	})
	await newQuestion.save()
	return newQuestion
}

// create a new survey
buildRouter.post('/new', async (req, res) => {
	// console.log(req.body)
	const questions = await Promise.all(req.body.questions.map(recursivelyCreateMongoObjects))
	try {
		const survey = new db.Survey({
			title: req.body.title,
			questions,
		})
		await survey.save()
		res.json({id: survey._id})
	} catch (err) {
		res.send(createError(500, err))
	}
})

module.exports = buildRouter
