const fs = require('fs')
const path = require('path')
const express = require('express')
const createError = require('http-errors')
const {parse} = require('json2csv')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const shortid = require('shortid')
const db = require('../db')

let curSecret = shortid.generate()

// set a new session secret every 3 hours
setInterval(() => {
	curSecret = shortid.generate()
	console.log('Set new session secret')
}, (3 * 60 * 60 * 1000))


const buildRouter = express.Router()

// handle all authenticated requests
buildRouter.use(session({
	secret: curSecret,
	store: new MongoStore({url: process.env.DATABASE_URL}),
}))

// listen for login requests
buildRouter.post('/login', (req, res) => {
	// not masively secure...
	const {user, password} = req.body
	if (user !== process.env.ADMIN_USER) {
		res.status(400).send(createError(400, 'Unable to login due to an invalid username'))
		return
	}
	if (password !== process.env.ADMIN_PASS) {
		res.status(400).send(createError(400, 'Unable to login due to invalid password'))
		return
	}
	req.session.authed = true
	res.sendStatus(200)
})

// check to see if we're logged in
buildRouter.use((req, res, next) => {
	if (!req.session.authed && process.env.AUTH_ENABLED === 'true') {
		// unsure if createError actually works here
		res.status(401).send(createError(401, 'You need to login to interact with this endpoint!'))
		return
	}
	next()
})

async function findSurveysAndResponseCount() {
	const all = await db.Survey.find()
	return Promise.all(all.map(async (surv) => {
		const responses = await db.Response.find({surveyID: surv._id})
		return Object.assign({count: responses.length}, JSON.parse(JSON.stringify((surv))))
	}))
}

function makeImgFromDataUrl(dataUrl) {
	console.log(dataUrl)
	const regex = /^data:.+\/(.+);base64,(.*)$/
	const matches = dataUrl.match(regex)
	const ext = matches[1]
	const data = matches[2]
	const file = Buffer.from(data, 'base64')
	const filename = `${shortid.generate()}.${ext}`
	return {filename, file}
}

function handleImageUrl(dataUrl, id) {
	console.log('oi')
	const picDir = `build/${id}/`
	const localPicDir = `${process.cwd()}/${picDir}`
	if (!fs.existsSync(localPicDir)) {
		console.log('making dir')
		fs.mkdirSync(localPicDir)
	}
	const {filename, file} = makeImgFromDataUrl(dataUrl)
	const writeTo = `${localPicDir}${filename}`
	console.log({writeTo})
	fs.writeFileSync(writeTo, file)
	return `${id}/${filename}`
}


// used to display all ongoing surveys
buildRouter.get('/all', async (req, res) => {
	const allAndResponseCount = await findSurveysAndResponseCount()
	res.json(allAndResponseCount)
})

buildRouter.get('/csv/:id', async (req, res) => {
	const surveyID = req.params.id.replace('.csv', '')
	const responses = await db.Response.find({surveyID})
	if (!responses.length) {
		res.status(404).send(createError(404))
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
	res.set('Content-Type', 'text/csv')
	res.send(parse(keyval, {fields}))
})

buildRouter.delete('/:id', async (req, res) => {
	await db.Survey.findByIdAndDelete(req.params.id)
	const allAndResponseCount = await findSurveysAndResponseCount()
	res.json(allAndResponseCount)
})


// used to edit a given survey (by mongo _id)
buildRouter.get('/edit/:id', async (req, res) => {
	const survey = await db.Survey.findById(req.params.id)
	res.json(survey)
})

async function recursivelyCreateMongoObjects(question, id) {
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
			const curOpt = {value: opt.value, helpText: opt.helpText}
			// difficult part: we need to recur through each option under question.options
			if (opt.question) {
				curOpt.question = await recursivelyCreateMongoObjects(opt.question, id)
			}
			if (opt.imgUrl) {
				console.log('going in')
				curOpt.imgPath = handleImageUrl(opt.imgUrl, id)
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
	try {
		const survey = new db.Survey({title: req.body.title})
		const questions = await Promise.all(req.body.questions.map(question => recursivelyCreateMongoObjects(question, survey._id)))
		survey.questions = questions
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
