import React from 'react'
import {Redirect} from 'react-router-dom'
import M from 'materialize-css'

import {fetchJSON} from '../util'

class Login extends React.Component {
	constructor(props) {
		super(props)
		this.state = {redir: false}
		this.user = React.createRef()
		this.pass = React.createRef()
		this.login = this.login.bind(this)
		this.focusPass = this.focusPass.bind(this)
		this.passLogin = this.passLogin.bind(this)
	}

	focusPass(ev) {
		if (ev.key === 'Enter') this.pass.current.focus()
	}

	passLogin(ev) {
		if (ev.key === 'Enter') this.login()
	}

	async login() {
		const {value: user} = this.user.current
		const {value: password} = this.pass.current
		const resp = await fetchJSON('/api/builder/login', {user, password}, 'POST')
		if (resp.ok) {
			this.setState({redir: true})
		} else {
			const {message} = await resp.json()
			M.toast({html: message})
		}
	}

	render() {
		if (this.state.redir) {
			const urlParams = new URLSearchParams(window.location.search)
			if (urlParams.has('prev')) return <Redirect to={decodeURIComponent(urlParams.get('prev'))} />
			return <Redirect to="/dash" />
		}
		return (
			<div className="row">
				<div className="col m8 s12 push-m2">
					<div className="card">
						<div className="card-content">
							<span className="card-title">Login</span>
							<div className="row">
								<div className="row">
									<div className="input-field col m6 push-m3 s12">
										<input id="user_name" type="text" className="validate" ref={this.user} onKeyUp={this.focusPass} />
										<label htmlFor="user_name">Username</label>
									</div>
								</div>
								<div className="row">

									<div className="input-field col m6 push-m3 s12">
										<input id="password" type="password" className="validate" ref={this.pass} onKeyUp={this.passLogin} />
										<label htmlFor="password">Password</label>
									</div>
								</div>
							</div>
							<div className="row">
								<a className="waves-effect waves-light btn col m6 push-m3 s12" onClick={this.login}>
									<i className="material-icons left">person_pin</i>Login
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default Login
