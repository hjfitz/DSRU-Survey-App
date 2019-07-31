import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import M from 'materialize-css'

import Modal from './modal'
import {fetchJSON} from '../util'

const getPassField = () => document.getElementById('new_password')

async function setPassword() {
	const {value: password} = getPassField()
	if (password.length < 7) {
		M.toast({html: 'Password is too short! Must be 7 characters or more'})
		return
	}
	console.log(password)
	const resp = await fetchJSON('/api/builder/change-pass', {password}, 'post')
	console.log(resp)
}

function checkAndSet(ev) {
	if (ev.key === 'Enter') setPassword()
}

function showPassword() {
	const pass = getPassField()
	pass.type = 'text'
}

function hidePassword() {
	const pass = getPassField()
	pass.type = 'password'
}

const modal = (
	<Modal id="admin-controls" cbText="Set" cb={setPassword} text="Change Password">
		<div className="col s12">
			<div className="input-field">
				<input id="new_password" type="password" className="validate" onKeyUp={checkAndSet} />
				<i onMouseDown={showPassword} onMouseUp={hidePassword} className="material-icons reveal-password grey-text text-lighten-1 cp">remove_red_eye</i>
				<label htmlFor="new_password">New Password</label>
			</div>
		</div>
	</Modal>
)

function Fab(props) {
	const [showModal, setModalStatus] = useState(false)
	useEffect(() => {
		const fab = document.querySelector('.fab')
		const tips = document.querySelectorAll('.tooltipped')
		M.FloatingActionButton.init(fab)
		M.Tooltip.init(tips)
		const md = document.getElementById('admin-controls')
		const inst = M.Modal.getInstance(md) || M.Modal.init(md)
		if (showModal) {
			inst.open()
			setModalStatus(false)
		}
	})
	return (
		<>
			<div ref={props.inRef} className="fixed-action-btn fab">
				<a className="btn-floating btn-large red">
					<i className="large material-icons">mode_edit</i>
				</a>
				<ul>
					<li>
						<Link
							to="/builder"
							className="btn-floating tooltipped green"
							data-position="left"
							data-tooltip="Create a survey"
						>
							<i className="material-icons">mode_edit</i>
						</Link>
					</li>
					<li>
						<Link
							to="/dash"
							className="btn-floating tooltipped red"
							data-position="left"
							data-tooltip="Dashboard"
						><i className="material-icons">insert_chart</i>
						</Link>
					</li>
					<li onClick={() => setModalStatus(!showModal)}>
						<a
							className="btn-floating tooltipped yellow darken-1"
							data-position="left"
							data-tooltip="Change the admin password"
						><i className="material-icons">vpn_key</i>
						</a>
					</li>
				</ul>
			</div>
			{modal}
		</>
	)
}

export default Fab
