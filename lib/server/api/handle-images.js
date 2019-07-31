const fs = require('fs')
const shortid = require('shortid')
const path = require('path')
const log = require('../logger')

function makeImgFromDataUrl(dataUrl) {
	const regex = /^data:.+\/(.+);base64,(.*)$/
	const matches = dataUrl.match(regex)
	const ext = matches[1]
	const data = matches[2]
	log.silly('Attempting to parse B64 image', {file: 'handle-images', fund: 'makeImgFromDataUrl'})
	const file = Buffer.from(data, 'base64')
	const filename = `${shortid.generate()}.${ext}`
	return {filename, file}
}

function handleImageUrl(dataUrl, id) {
	const meta = {file: 'handle-images', func: 'handleImageUrl'}
	// where the image is going to be saved relative to the server
	// must cast ID to string, as it's an object from mongo
	const relativeDir = path.join('/survey-content/', `${id}`)
	log.debug(`relative dir: ${relativeDir}`, meta)

	// create an absolute url to the dir and make it on the filesystem
	// const absoluteDir = `${process.cwd()}/public${relativeDir}`
	const absDir = path.join(process.cwd(), 'public', relativeDir)
	log.debug(`absolute dir: ${absDir}`, meta)
	if (!fs.existsSync(absDir)) {
		log.info(`Creating dir "${absDir}" for survey images: `, meta)
		fs.mkdirSync(absDir)
	}
	const {filename, file} = makeImgFromDataUrl(dataUrl)
	const writeTo = path.join(absDir, filename)
	log.info(`Writing new image (${filename}) to ${writeTo}`, meta)
	fs.writeFileSync(writeTo, file)
	const relLocation = path.join(relativeDir, filename)
	log.debug(`Image saved to "${relLocation}`, meta)
	return relLocation
}

// on load, make the survey-content dir so that handleImageUrl doesn't fail
// this isn't pushed to git as it would require uploading all images and sub-dirs
void (function makeImageDir() {
	const meta = {file: 'handle-images', func: 'makeImageDir'}
	const absDir = path.join(process.cwd(), 'public', 'survey-content')
	if (!fs.existsSync(absDir)) {
		log.info(`attempting to create ${absDir}`, meta)
		fs.mkdirSync(absDir)
		log.info('successfully created dir')
	}
}())

module.exports = handleImageUrl
