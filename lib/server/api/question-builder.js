const express = require('express')
const createError = require('http-errors')
const {parse} = require('json2csv')
const uniq = require('lodash/uniq')
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
	// make key-value where key is question and value is an array of answers
	const keys = []
	const keyval = responses.map((resp) => {
		console.log(resp.answers)
		const kv = resp.answers.reduce((acc, cur) => {
			acc[cur.questionText] = cur.value
			keys.push(cur.questionText)
			return acc
		}, {})
		return kv
	})
	// }).flat().map((ans) => {
	// 	console.log(ans)
	// 	keys.push(ans.questionText)
	// 	return {[ans.questionText]: ans.value}
	// 	// if (!(cur.questionText in acc)) acc[cur.questionText] = [cur.value]
	// 	// else acc[cur.questionText].push(cur.value)
	// 	// return acc
	// }).sort((a, b) => {
	// 	const aKey = Object.keys(a)[0]
	// 	const bKey = Object.keys(b)[0]
	// 	if (aKey > bKey) return 1
	// 	if (aKey < bKey) return -1
	// 	return 0
	// })
	const fields = uniq(keys)
	// console.log({keyval, fields})
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

module.exports = buildRouter
