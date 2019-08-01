const createError = require('http-errors')
const {parse} = require('json2csv')
const uniq = require('lodash/uniq')
const flattenDeep = require('lodash/flattenDeep')
const handleImageUrl = require('../util/handle-images')
const db = require('../../db')
const log = require('../../logger')

class SurveyController {
	static async find(req, res) {
		const surv = await db.Survey.findById(req.params.id)
			.catch(err => SurveyController(req, err, 404))
		if (!surv) {
			res.status(404).send(createError(404, 'unable to find your survey'))
		} else {
			res.json(surv)
		}
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
		// save the response to the database
		const surveyResp = new db.Response({surveyID: req.params.id, answers: req.body})
		await surveyResp.save()
			.catch(err => SurveyController.handleErr(res, err))
		res.sendStatus(200)
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
			const count = await db.Survey.countDocuments()
			res.send({surveys, count})
		} catch (err) {
			SurveyController.handleErr(res, err)
		}
	}

	// requests from frontend come from `/api/builder/csv/${id}.csv`
	static async createCSV(surveyID, field, value, res) {
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
				acc[cur[field]] = cur[value]
				return acc
			}, {}))
		const fields = uniq(responses.map(resp => resp.answers.map(an => an.questionID)).flat())
		const csv = parse(keyval, {fields})
		res.setHeader('content-type', 'text/csv')
		res.send(csv)
	}

	/**
	 * Map a question ID to the parent
	 * todo: do we need to map all parent questions? foo (bar (qux))
	 * @param {object} question a mongo object
	 * @param {string} prev the previous question title
	 * @return {Array<Array>} questions and their sub-questions
	 */
	static mapIDtoParent(question, prev = '') {
		const text = prev ? `${question.questionText} ${prev ? `(${prev})` : ''}` : question.questionText
		const ds = {id: question._id, question: text}
		const subquestions = (question.options || [])
			.filter(opt => opt.question)
			.map(opt => SurveyController.mapIDtoParent(opt.question, question.questionText))
		return [ds, ...subquestions]
	}

	/**
	 * Generate a mapping of question IDs to their question text
	 * @param {Request} req
	 * @param {Response} res
	 */
	static async generateMapping(req, res) {
		// first, get the survey
		const id = req.params.id.replace('.csv', '')
		const survey = await db.Survey.findById(id)

		if (!survey) {
			SurveyController.handleErr(res, 'Not Found', 404)
			return
		}

		// second, map questoins in to recursive getter
		const resp = flattenDeep(survey.questions.map(qu => SurveyController.mapIDtoParent(qu)))
			.reduce((acc, cur) => {
				acc[cur.id] = cur.question
				return acc
			}, {})

		// third, generate the csv
		const fields = Object.keys(resp)
		const csv = parse(resp, {fields})

		// fourth, send the response
		res.setHeader('content-type', 'text/csv')
		res.send(csv)
	}

	static generateResults(req, res) {
		const id = req.params.id.replace('.csv', '')
		SurveyController.createCSV(id, 'questionID', 'value', res)
	}

	static async recursivelyDeleteQuestions(question) {
		console.log({id: question._id})
		if (question.type === 'options') return db.questions.Options.findByIdAndDelete({_id: question._id})
		if (question.type === 'open') return db.questions.OpenText.findByIdAndDelete(question._id)
		if (question.type === 'scalar') return db.questions.Scalar.findByIdAndDelete(question._id)
		// means that type === multi
		// go do sub-questions first then come back and delete the multi
		await Promise.all((question.options || []).filter(opt => opt.question).map(SurveyController.recursivelyDeleteQuestions))
		return db.questions.Multi.findByIdAndDelete(question._id)
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
		const meta = {file: 'SurveyController', func: 'editSurvey'}
		const {id} = req.params
		const {questions, title, introText} = req.body
		log.info(`attempting to edit ${title} (${id})`)
		try {
			// `concurrently` fetch survey and responses from db
			log.debug('fetching survey and responses from db', meta)
			const [survey, responses] = await Promise.all([
				db.Survey.findById(id),
				db.Response.find({surveyID: id}),
			])

			// create a ref to questions so that we can both overwrite them
			// and delete them later
			const ref = survey.questions

			survey.questions = []
			await survey.save()

			log.info(`Creating new questions for "${title}" (${id})`, meta)
			// update survey
			survey.questions = await Promise.all(questions.map(
				qu => SurveyController.createQuestion(qu, survey._id),
			))
			survey.title = title
			survey.introText = introText

			// remove all old questions
			// todo: investigate whether subquestions need to be removed
			log.debug('deleting old questions', meta)
			await Promise.all(ref.map(SurveyController.recursivelyDeleteQuestions))

			// save the survey
			await survey.save()
			res.sendStatus(200)
			// delete all responses.
			// Do this after informing the user that all is fine for a quicker response
			Promise.all(responses.map(resp => db.Response.findByIdAndDelete(resp._id)))
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
		const {questions: rawQuestions, title, introText} = req.body
		try {
			const survey = new db.Survey({title, introText})
			const questions = await Promise.all(rawQuestions.map(
				raw => SurveyController.createQuestion(raw, survey._id),
			))
			survey.questions = questions
			await survey.save()
			res.json({id: survey._id})
		} catch (err) {
			SurveyController.handleErr(res, err, 500)
		}
	}

	static async createQuestion(question, id) {
		const meta = {file: 'SurveyController', func: 'createQuestion'}
		const {options, questionText, maxVal, type, required} = question
		log.debug(`Creating question "${questionText}" with type "${type}"`, meta)

		// create a scalar question
		if (type === 'scalar') {
			const newQuestion = new db.questions.Scalar({questionText, maxVal, required})
			await newQuestion.save()
			return newQuestion
		}

		if (type === 'open') {
			const newQuestion = new db.questions.OpenText({questionText, required})
			await newQuestion.save()
			return newQuestion
		}

		if (type === 'options') {
			// todo: change from optio
			const newQuestion = new db.questions.Options({questionText, options})
			await newQuestion.save()
			return newQuestion
		}

		// not scalar? attempt to create a multiple choice question
		const multiQuestion = {questionText, required}
		// if there are options, add them and attempt to resolve any mongo connections
		multiQuestion.options = await Promise.all((options || []).map(async (opt) => {
			const curOpt = {value: opt.value, helpText: opt.helpText}
			if (opt.question) {
				log.debug('Creating sub-question... recurring.', meta)
				curOpt.question = await SurveyController.createQuestion(opt.question, id)
			}

			if (opt.imgUrl) {
				log.debug('Handling image', meta)
				if (opt.imgUrl.match(/\/(.*)\.(jpg|png|jpeg)/)) {
					log.debug('no image changes made', meta)
					curOpt.imgPath = opt.imgUrl
				} else {
					log.debug('creating new image', meta)
					try {
						curOpt.imgPath = handleImageUrl(opt.imgUrl, id)
						console.log(curOpt.imgPath)
					} catch (err) {
						console.log(err)
					}
				}
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
		log.error(`error: ${err}; code: ${code}`, {file: 'SurveyController', func: 'handleErr'})
		res.send(createError(code, err))
	}
}

module.exports = SurveyController
