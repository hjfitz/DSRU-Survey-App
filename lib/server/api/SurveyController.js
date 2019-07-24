const createError = require('http-errors')
const {parse} = require('json2csv')
const db = require('../db')

class SurveyController {
	static async find(req, res) {
		const surv = await db.Survey.findById(req.params.id)
			.catch(err => SurveyController(req, err, 404))
		res.json(surv)
	}

	static async delete(req, res) {
		await db.Survey.findByIdAndDelete(req.params.id)
			.catch(err => SurveyController.handleErr(res, err, 404))
		res.sendStatus(200)
	}

	static async findAll(req, res) {
		const all = await db.Survey.find()
			.catch(err => SurveyController(req, err, 500))
		res.json(all)
	}

	static async makeResponse(req, res) {
		// do some validation on answers
		//
		// save the response to the database
		const surveyResp = new db.Response({surveyID: req.params.id, answers: req.body})
		await surveyResp.save()
			.catch(err => SurveyController.handleErr(res, err))
		res.send(200)
	}

	static async findAllWithResponseCount(req, res) {
		const page = req.query.page || 1

		// make sure that an invalid request fails silently (so no error from mongo)
		if (page < 1) {
			res.json({surveys: [], count: 0})
			return
		}

		// fetch all surveys from db for a given page (size 10)
		const pagesize = 10
		const skip = (page - 1) * pagesize
		try {
			const all = await db.Survey.find({}, null, {sort: {created: -1}}).limit(pagesize).skip(skip)
			// find the number of responses per survey
			const surveys = await Promise.all(all.map(async (surv) => {
				const responses = await db.Response.find({surveyID: surv._id})
				// use OA to create a count object and clone the survey
				// mongoose objects lose any 'non-standard' properties when they are serialised
				return Object.assign({count: responses.length}, JSON.parse(JSON.stringify((surv))))
			}))
			res.send({surveys, count: surveys.length})
		} catch (err) {
			SurveyController.handleErr(res, err)
		}
	}

	/**
	 * Generate a CSV for every response to a given survey
	 * (stored in req.params.id)
	 * @param {Request} req Express request object
	 * @param {Response} res Express response object
	 */
	static async generateCSV(req, res) {
		// requests from frontend come from `/api/builder/csv/${id}.csv`
		const surveyID = req.params.id.replace('.csv', '')

		// attempt to find all responses
		const responses = await db.Response.find({surveyID})
			.catch(err => SurveyController.handleErr(res, err, 404))

		// make key-value where key is question and value is an array of answers
		const keyval = responses.map(resp =>
			/**
			 * use reduce to transform resp.answers from:
			 * [{id, questionText1, value}, {id, questionText2, value}]
			 * to
			 * [{ questionText: value: ans, questionText2: value}]
			 */
			resp.answers.reduce((acc, cur) => {
				acc[cur.questionText] = cur.value
				return acc
			}, {}))

		// because all responses should be stored in the same order
		// the row headers for the csv are the keys of any arbitrary response
		const fields = Object.keys(keyval[0] || {})

		// so chrome doesn't parse to HTML
		res.set('Content-Type', 'text/csv')
		res.send(parse(keyval, {fields}))
	}

	/**
	 * Edit a survey
	 * Fetch the survey and current responses
	 * Questions in req.body used to create new mongo questions
	 * these are then added to the survey and the survey is saved.
	 * Old questions (and subsequently their sub-questions) are then removed
	 * @param {Request} req Express request
	 * @param {Response} res Express response
	 */
	static async editSurvey(req, res) {
		const {id} = req.params
		const {questions, title} = req.body
		try {
			// `concurrently` fetch survey and responses from db
			const [survey, responses] = await Promise.all([
				db.Survey.findById(id),
				db.Response.find({surveyID: id}),
			])

			// create a ref to questions so that we can both overwrite them
			// and delete them later
			const ref = survey.questions

			// update survey
			survey.questions = await Promise.all(questions.map(SurveyController.createQuestion))
			survey.title = title

			// remove all old questions
			// todo: investigate whether subquestions need to be removed
			await Promise.all(ref.map(async (q) => {
				if (q.type === 'multi') await db.questions.Multi.findByIdAndRemove(q._id)
				await db.questions.Scalar.findByIdAndRemove(q._id)
			}))

			// save the survey
			await survey.save()
			res.sendStatus(200)
			// delete all responses.
			// Do this after informing the user that all is fine for a quicker response
			await Promise.all(responses.map(resp => db.Response.findByIdAndDelete(resp._id)))
		} catch (err) {
			SurveyController.handleErr(res, err)
		}
	}

	/**
	 * Create a survey from a request body
	 * @param {Request} req Express request
	 * @param {Response} res Express response
	 */
	static async createSurvey(req, res) {
		const {questions: rawQuestions, title} = req.body
		const questions = await Promise.all(rawQuestions.map(SurveyController.createQuestion))
			.catch(err => SurveyController.handleErr(res, err))
		const survey = new db.Survey({title, questions})
		await survey.save().catch(err => SurveyController.handleErr(res, err))
		res.json({id: survey._id})
	}

	static async createQuestion(question) {
		const {options, questionText, maxVal, type} = question

		// create a scalar question
		if (type === 'scalar') {
			const newQuestion = new db.questions.Scalar({questionText, maxVal})
			await newQuestion.save()
			return newQuestion
		}

		// not scalar? attempt to create a multiple choice question
		const multiQuestion = {questionText}
		// if there are options, add them and attempt to resolve any mongo connections
		multiQuestion.options = await Promise.all((options || []).map(async (opt) => {
			const curOpt = {value: opt.value, helpText: opt.helpText}
			if (opt.question) {
				curOpt.question = await SurveyController.createQuestion(opt.question)
			}
			return curOpt
		}))

		const newQuestion = new db.questions.Multi(multiQuestion)
		await newQuestion.save()
		return newQuestion
	}

	/**
	 * Generate an appropriate error response
	 * @param {Response} res Express response
	 * @param {string | Error} err An error to send
	 * @param {number} code HTTP Error code
	 */
	static handleErr(res, err, code = 500) {
		res.send(createError(code, err))
	}
}

module.exports = SurveyController
