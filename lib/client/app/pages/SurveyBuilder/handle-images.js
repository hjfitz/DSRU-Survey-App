export function imgToB64(file) {
	return new Promise((res, rej) => {
		const reader = new FileReader()
		reader.addEventListener('load', () => res({dataUrl: reader.result, type: file.type}), false)
		reader.addEventListener('error', rej)
		reader.readAsDataURL(file)
		console.log(file)
	})
}

export function resizeImg({dataUrl, type}) {
	const img = new Image()
	img.src = dataUrl
	return new Promise((res, rej) => {
		img.onerror = rej
		img.onload = async () => {
			const {width, height} = img
			const canvas = document.createElement('canvas')
			const ctx = canvas.getContext('2d')
			// scale to 1000 if the image is larger
			if (width > 1000) {
				const scalingFactor = width / 1000
				const newWidth = width / scalingFactor
				const newHeight = height / scalingFactor
				canvas.height = newHeight
				canvas.width = newWidth
				ctx.drawImage(img, 0, 0, newWidth, newHeight)
				const newDataUrl = canvas.toDataURL(type)
				res(newDataUrl)
			} else {
				res(dataUrl)
			}
		}
	})
}
