// main imports
require('dotenv').config()
const path = require('path')
const express = require('express')

// express middleware
const logger = require('morgan')('dev')
const compression = require('compression')()
const helmet = require('helmet')()
const jsonParser = require('body-parser').json()
const api = require('./api')

// app constants
const app = express()
const pub = path.join(process.cwd(), 'public')	// should be run with `yarn start`
const bld = path.join(process.cwd(), 'build')
const port = process.env.PORT || 5000 			// default to port 5000

// middleware ordering
app.use(helmet)					// secure requests
app.use(logger)					// log everything
app.use(compression)			// compress all resposnes
app.use(jsonParser) 			// enable POSTing JSON
app.use(express.static(pub))	// static file hosting. Anything in public or build will be found under "/"
app.use(express.static(bld))
app.use('/api', api)			// handle all API requests after every other middleware

// SPA setup
app.use('*', (_, res) => res.sendFile(path.join(bld, 'index.html')))

app.listen(port, () => console.log(`Webserver listening on port ${port}`))
