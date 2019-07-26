function fetchMulti(elem, id) {
	// get all checkboxes and find the selected one.
	const checkboxes = elem.querySelectorAll(`input[data-question-id="${id}"]`)
	const [selectedCheck] = [...checkboxes].filter(box => box.checked)
	if (selectedCheck) return selectedCheck.value
	return false
}

function doInvalid(elem) {
	elem.classList.add('invalid-response')
	return false
}

export default function recurAndGetQuestions(question, prev = '') {
	const {questionText, _id: id} = question

	const elem = document.querySelector(`div[data-question-id="${id}"]`)
	const ret = {questionText: `${prev + questionText} (id: ${id})`, value: 'No response'}

	const ds = [ret]

	if (!elem) ret.value = 'Not found on form'

	if (elem) {
	// multi choice
		// find parent elem
		const isRequired = elem.dataset.required === 'true'
		const parent = elem.parentElement.parentElement
		parent.classList.remove('invalid-response')

		if (elem.dataset.questionType === 'multi') {
			const val = fetchMulti(elem, id)
			if (!val) return doInvalid(parent)
			ret.value = val
			// scalar - find the scalar input and pick it's value
		} else if (elem.dataset.questionType === 'scalar') {
			const inp = elem.querySelector(`input[data-question-id="${id}"]`)
			ret.value = inp.value || 'Not found on form'
		} else if (elem.dataset.questionType === 'open') {
			const inp = elem.querySelector(`textarea[data-question-id="${id}"]`)
			ret.value = inp.value || 'Not found on form'
			if (!inp.value && isRequired) return doInvalid(parent)
		}
	}
	// if there are options, recur through their questions after picking the parent questions
	const subQuestions = (question.options || [])
		.filter(option => option.question)
		.map(({question: q, value}) => recurAndGetQuestions(q, `${questionText} (${value}) > `))
	ds.push(...subQuestions)

	return ds
}
