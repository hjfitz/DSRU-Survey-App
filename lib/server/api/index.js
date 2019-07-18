const express = require('express')
const buildRouter = require('./question-builder')
const surveyRouter = require('./survey')


const api = express.Router()

api.use('/builder', buildRouter)
api.use('/survey', surveyRouter)


module.exports = api
