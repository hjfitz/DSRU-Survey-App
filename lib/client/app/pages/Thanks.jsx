import React from 'react'

const Thanks = () => {
	const params = new URLSearchParams(window.location.search)
	let completed = 'the survey'
	console.log(params)
	if (params.has('title')) {
		completed = decodeURIComponent(params.get('title'))
	}
	return (
		<div className="row">
			<div className="col s12">
				<div className="card">
					<div className="card-content">
						<h3>Thank you for completing &quot;{completed}&quot;</h3>
						<p>Please note that this survey is completely anonymous and collects no personal data about yourself or your device. </p>
						<p>Cookies are <strong>not</strong> used throughout the website.</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Thanks
