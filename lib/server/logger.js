const {createLogger, format, transports} = require('winston')

const {combine, printf, colorize} = format

const level = process.env.LOG_LEVEL || 'silly'

console.log('[logger] Beginning with level:', {level})

// format the logger so that it prints the level in colour
// adds a timestamp
const logFormat = combine(
	colorize(),
	printf(info => `[${info.level}]: ${info.message} (in ${info.file}@${info.func})`),
)

// normal logs to another
// and post to stdout
const logger = createLogger({
	level,
	format: logFormat,
	transports: [
		new transports.Console(),
	],
})

module.exports = logger
