const express = require('express')
const createError = require('http-errors')
const {parse} = require('json2csv')
const db = require('../db')

const buildRouter = express.Router()

// should be some admin api for requests here

// used to display all ongoing surveys
buildRouter.get('/all', async (req, res) => {
	const all = await db.Survey.find()
	const allAndResponseCount = await Promise.all(all.map(async (surv) => {
		const responses = await db.Response.find({surveyID: surv._id})
		return Object.assign({count: responses.length}, JSON.parse(JSON.stringify((surv))))
	}))
	res.json(allAndResponseCount)
})

buildRouter.get('/csv/:id', async (req, res) => {
	const surveyID = req.params.id.replace('.csv', '')
	const responses = await db.Response.find({surveyID})
	if (!responses.length) {
		res.send(createError(404))
		return
	}
	// make key-value where key is question and value is an array of answers
	const keys = []
	const keyval = responses.map(resp => resp.answers.reduce((acc, cur) => {
		acc[cur.questionText] = cur.value
		keys.push(cur.questionText)
		return acc
	}, {}))
	const fields = Object.keys(keyval[0] || {})

	// so chrome doesn't parse to HTML
	res.set('Content-Type', 'text/plain')
	res.send(parse(keyval, {fields}))
})

buildRouter.delete('/:id', async (req, res) => {
	await db.Survey.findByIdAndDelete(req.params.id)
	const surveysRemaining = await db.Survey.find()
	res.json(surveysRemaining)
})


// used to edit a given survey (by mongo _id)
buildRouter.get('/edit/:id', async (req, res) => {
	const survey = await db.Survey.findById(req.params.id)
	res.json(survey)
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

buildRouter.put('/edit/:id', async (req, res) => {
	const [survey, responses] = await Promise.all([
		db.Survey.findById(req.params.id),
		db.Response.find({surveyID: req.params.id}),
	])
	if (!survey) {
		res.send(createError(404))
		return
	}

	const ref = survey.questions
	survey.questions = await Promise.all(req.body.questions.map(recursivelyCreateMongoObjects))
	survey.title = req.body.title
	await Promise.all(ref.map(async (q) => {
		console.log(q)
		if (q.type === 'multi') await db.questions.Multi.findByIdAndRemove(q._id)
		await db.questions.Scalar.findByIdAndRemove(q._id)
	}))
	await survey.save()
	console.log(survey)
	// delete current responses
	await Promise.all(responses.map(resp => db.Response.findByIdAndDelete(resp._id)))
	res.sendStatus(200)
})

module.exports = buildRouter
