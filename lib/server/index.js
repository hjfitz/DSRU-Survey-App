// main imports
require('dotenv').config()
const path = require('path')
const express = require('express')

// express middleware
const logger = require('morgan')('dev')
const compression = require('compression')()
const helmet = require('helmet')()
const jsonParser = require('body-parser').json()

// routers

// app constants
const app = express()
const public = path.join(process.cwd(), 'public')	// should be run with `yarn start`
const port = process.env.PORT || 5000 				// default to port 5000

// middleware ordering
app.use(helmet)			// secure requests
app.use(logger)			// log everything
app.use(compression)	// compress all resposnes
app.use(jsonParser) 	// enable POSTing JSON
app.use(express.static(public))

// router setup


// SPA setup
app.use('*', (_, res) => {
	console.log({public})
	res.sendFile(path.join(public, 'index.html'))
})

app.listen(port, () => console.log('Server listening on ' + port))