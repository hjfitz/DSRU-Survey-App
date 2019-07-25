const mongoose = require('mongoose')

const db = mongoose.connection

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => console.log('Mongo connection established'))

const Response = mongoose.model('SurveyResponse', {
	surveyID: String,
	timeSubmitted: {type: Date, default: Date.now},
	required: {type: Boolean, default: false},
	answers: [{
		questionText: String,
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
		question: mongoose.Schema.Types.Mixed,
	}],
	type: {type: String, default: 'multi'},
})

// On a scale of 1 - X, how do you feel?
const Scalar = mongoose.model('Scalar', {
	questionText: String,
	maxVal: {type: Number, default: 10},
	type: {type: String, default: 'scalar'},
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
	},
	db,
}
