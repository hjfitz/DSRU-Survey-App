import React from 'react'
import format from 'date-fns/format'

import {fetchJSON} from '../../util'
import Question from './survey-question'

class SurveyResponder extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			questions: [],
			title: 'Loading',
		}
	}

	async componentDidMount() {
		const {id} = this.props.match.params
		const url = `/api/survey/${id}`
		const resp = await fetchJSON(url)
		if (resp.ok) {
			const survey = await resp.json()
			console.log(survey)
			this.setState(survey)
		}
	}

	render() {
		return (
			<>
				<h1>{this.state.title}</h1>
				{this.state.questions.map((question, idx) => <Question {...question} idx={idx} />)}
			</>
		)
	}
}

export default SurveyResponder
