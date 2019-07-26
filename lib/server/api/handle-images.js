const fs = require('fs')
const shortid = require('shortid')

function makeImgFromDataUrl(dataUrl) {
	const regex = /^data:.+\/(.+);base64,(.*)$/
	const matches = dataUrl.match(regex)
	const ext = matches[1]
	const data = matches[2]
	const file = Buffer.from(data, 'base64')
	const filename = `${shortid.generate()}.${ext}`
	return {filename, file}
}

function handleImageUrl(dataUrl, id) {
	// where the image is going to be saved relative to the server
	const relativeDir = `/survey-content/${id}/`
	console.log({id})

	// create an absolute url to the dir and make it on the filesystem
	const absoluteDir = `${process.cwd()}/public${relativeDir}`
	if (!fs.existsSync(absoluteDir)) {
		console.log('Creating dir: ', absoluteDir)
		fs.mkdirSync(absoluteDir)
	}
	const {filename, file} = makeImgFromDataUrl(dataUrl)
	const writeTo = absoluteDir + filename
	console.log('Writing to:', {writeTo})
	console.log({relativeDir, absoluteDir, writeTo})
	fs.writeFileSync(writeTo, file)
	return relativeDir + filename
}

module.exports = handleImageUrl
