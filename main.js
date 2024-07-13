const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const UpdatePresetDefinitions = require('./presets')
const PollVariables = require('./poll')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.state = {}
		this.configUpdated(config)
	}

	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
		if (this.config.host == '' || this.config.host == undefined) {
			this.updateStatus(InstanceStatus.BadConfig, 'Host address not configured')
			return
		}
		if (this.config.port == '' || this.config.port == undefined) {
			this.updateStatus(InstanceStatus.BadConfig, 'Port number not configured')
			return
		}
		this.config.port = parseInt(this.config.port)
		if (isNaN(this.config.port)) {
			this.updateStatus(InstanceStatus.BadConfig, 'Port number is not a number')
			return
		}

		this.updateStatus(InstanceStatus.Connecting)

		var state = await this.runCommand('State')
		if (state.POWER != undefined || state.POWER1 != undefined) {
			this.state = state
			this.updateStatus(InstanceStatus.Ok)
		} else {
			this.log('error', JSON.stringify(state))
			this.updateStatus(
				InstanceStatus.BadConfig,
				'Device has no POWER state, only power controlling devices (e.g. sockets, light bulbs) are supported'
			)
		}

		this.updateVariableDefinitions() // export variable definitions
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updatePresetDefinitions()
		this.initPolling()
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 8,
				default: '80',
				regex: Regex.PORT,
			},
			{
				type: 'textinput',
				id: 'user',
				label: 'User name (optional)',
				width: 8,
				default: 'admin',
			},
			{
				type: 'textinput',
				id: 'password',
				label: 'Password (optional)',
				width: 8,
			},
			{
				type: 'number',
				id: 'pollinterval',
				label: 'Poll interval',
				width: 8,
				default: 500,
				min: 200,
			},
		]
	}

	initPolling() {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
		}

		let pollinterval = 500
		if (this.config != undefined && this.config.pollinterval != undefined) {
			pollinterval = this.config.pollinterval
		}

		this.pollTimer = setInterval(async () => {
			PollVariables(this)
		}, pollinterval)
	}

	async runCommand(command) {
		let auth = ''
		if (this.config.password != '') {
			auth = `user=${this.config.user}&password=${this.config.password}&`
		}
		try {
			const response = await fetch(
				`http://${this.config.host}:${this.config.port}/cm?${auth}cmnd=${encodeURIComponent(command)}`
			)
			const result = await response.json()
			if (result.WARNING != undefined) {
				this.updateStatus(InstanceStatus.ConnectionFailure, result.WARNING)
			} else {
				this.updateStatus(InstanceStatus.Ok)
			}
			return result
		} catch (error) {
			this.log('error', JSON.stringify(error))
			this.updateStatus(InstanceStatus.ConnectionFailure, error.cause.code)
			return { error: error }
		}
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updatePresetDefinitions() {
		UpdatePresetDefinitions(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
