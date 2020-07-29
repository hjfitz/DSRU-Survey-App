const mongoose = require('mongoose')

const db = mongoose.connection

let numRetries = 0
let maxRetries = 10

const handleError = () => {
	console.error('unable to connect due to an error')
	const shouldReconnect = numRetries <= maxRetries 
	numRetries += 1
	console.error(`Retry count: ${numRetries}/${maxRetries}. Attempting to reconnect: ${shouldReconnect}`)
	setTimeout(() => connect(), 5e3)
}

const connect = () => mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true}).catch(handleError)
connect()

db.once('open', () => console.log('Mongo connection established'))

const Response = mongoose.model('SurveyResponse', {
	surveyID: String,
	timeSubmitted: {type: Date, default: Date.now},
	required: {type: Boolean, default: false},
	answers: [{
		questionText: String,
		questionID: String,
		value: String,
	}],
})

// multiple choice
const Multi = mongoose.model('Multi', {
	questionText: String,
	required: {type: Boolean, default: true},
	options: [{
		value: String,
		helpText: String,
		imagePath: String,
		// use mixed to refer to either Multi or Scalar
		imgPath: String,
		question: mongoose.Schema.Types.Mixed,
	}],
	type: {type: String, default: 'multi'},
})

const Options = mongoose.model('Options', {
	questionText: String,
	required: {type: Boolean, default: true},
	options: [{
		value: String,
		helpText: String,
	}],
	type: {type: String, default: 'options'},
})

// On a scale of 1 - X, how do you feel?
const Scalar = mongoose.model('Scalar', {
	questionText: String,
	maxVal: {type: Number, default: 10},
	type: {type: String, default: 'scalar'},
})

// open text. give me all of your information
const OpenText = mongoose.model('Open', {
	questionText: String,
	required: Boolean,
	type: {type: String, default: 'open'},
})

// questionnaire
const Survey = mongoose.model('Survey', {
	title: String,
	introText: String, // for a card with some info (parsed from markdown)
	created: {type: Date, default: Date.now},
	questions: [mongoose.Schema.Types.Mixed],
})

module.exports = {
	Survey,
	Response,
	questions: {
		Multi,
		Scalar,
		OpenText,
		Options,
	},
	db,
}
