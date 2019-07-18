const express = require('express')
const buildRouter = require('./question-builder')


const api = express.Router()

api.use('/builder', buildRouter)


module.exports = api
