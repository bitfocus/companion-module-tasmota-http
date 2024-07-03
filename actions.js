module.exports = function (self) {
	function processResponse(response) {
		let update = false
		for (let key in response) {
			if (self.DATA[key] != undefined) {
				self.DATA[key] = response[key]
				update = true
			}
		}
		if (update) {
			self.setVariableValues(self.DATA)
			self.checkFeedbacks()
		}
	}

	let power_device_choices = [ { id: '0', label: 'All Devices' }, ]
	for (let key in self.DATA) {
		if (key.startsWith("POWER")) {
			const device = key.substring(5)
			power_device_choices.push( { id:  device , label: 'Power ' + device }, )
		}
	}

	let actions = {
		raw_command: {
			name: 'Raw Command',
			options: [
				{
					id: 'command',
					type: 'textinput',
					label: 'Command',
				},
			],
			callback: async (event) => {
				self.log("info", await self.runCommand(event.options.command))
			},
		},
		power: {
			name: "Power",
			options: [
				{
					id: 'device',
					type: 'dropdown',
					label: 'Device',
					default: '1',
					choices: power_device_choices,
				},
				{
					id: 'state',
					type: 'dropdown',
					label: 'Command',
					default: 'TOGGLE',
					choices: [
						{ id: 'ON', label: 'ON'},
						{ id: 'OF', label: 'OFF'},
						{ id: 'TOGGLE', label: 'TOGGLE'},												
					]
				}
			],
			callback: async (event) => {
				let response = await self.runCommand(`Power${event.options.device} ${event.options.state}`)
				processResponse(response)
			}
		}
	}
	if (self.state.Color !== undefined) {
		actions['color'] = {
			name: 'Color',
			options: [
				{
					id: 'device',
					type: 'dropdown',
					label: 'Device',
					default: '1',
					choices: [
 						{id: '1', label: 'Set color'},
 						{id: '2', label: 'Set color adjusted to current Dimmer value'},
 						{id: '3', label: 'Set clock seconds hand color (Scheme 5 only)'},
 						{id: '4', label: 'Set clock minutes hand color (Scheme 5 only)'},
 						{id: '5', label: 'Set clock hour hand color (Scheme 5 only)'},
 						{id: '6', label: 'Set clock hour marker color'},
					]
				},
				{
					id: 'color',
					type: 'textinput',
					label: 'Color (e.g. #RRGGBB or rrr,ggg,bbb)',
					regex: '/^([0-9]+|[0-9=]+,[0-9=]+,[0-9=]+|#[cC][0-9]{3}|#[0-9a-fA-F=]{6}|#[0-9a-fA-F=]{8}|#[0-9a-fA-F=]{6}[cC][0-9=]*|[+-])$/'
				}
			],
			callback: async (event) => {
				let response = await self.runCommand(`Color${event.options.device} ${event.options.color}`)
				processResponse(response)
			}
		}
		actions['ct'] = {
			name: 'Color Temperature',
			options: [
				{
					id: 'command',
					type: 'dropdown',
					label: 'Command',
					default: '+',
					choices: [
						{id: '+', label: 'Increase color temperature by 10'},
						{id: '-', label: 'Decrease color temperature by 10'},
						{id: 'X', label: 'Set color temperature value'},
					]
				},
				{
					id: 'color',
					type: 'number',
					label: 'Color Temperature (153-500)',
					min: 153,
					max: 500,
					default: 153,
					isVisible: (options) => options.command == 'X',
				}
			],
			callback: async (event) => {
				let response
				if (event.options.command == 'X') {
					response = await self.runCommand(`ct ${event.options.color}`)
				} else {
					response = await self.runCommand(`ct ${event.options.command}`)
				}
				processResponse(response)
			}
		}
		actions['dimmer'] = {
			name: 'Dimmer',
			options: [
				{
					id: 'command',
					type: 'dropdown',
					label: 'Command',
					default: '+',
					choices: [
						{id: '+', label: 'Increase dimmer by 10'},
						{id: '-', label: 'Decrease dimmer by 10'},
						{id: '<', label: 'Decrease dimmer to 1'},
						{id: '>', label: 'Increase dimmer to 100'},												
						{id: 'X', label: 'Set dimmer value'},
					]
				},
				{
					id: 'value',
					type: 'number',
					label: 'Dimmer value (0-100)',
					min: 0,
					max: 100,
					default: 50,
					isVisible: (options) => options.command == 'X',
				}
			],
			callback: async (event) => {
				let response
				if (event.options.command == 'X') {
					response = await self.runCommand(`Dimmer ${event.options.value}`)
				} else {
					response = await self.runCommand(`ct ${event.options.command}`)
				}
				processResponse(response)
			}
		}

		actions['fade'] = {
			name: 'Fade',
			options: [{
				id: 'param',
				type: 'dropdown',
				label: 'Action',
				default: '0',
				choices: [
					{id: '0', label: 'Disable'},
					{id: '1', label: 'Enable'},
				]
			}],
			callback: async (event) => {
				let response = await self.runCommand(`Fade ${event.options.param}`)
				processResponse(response)
			}
		}

		actions['speed'] = {
			name: 'Fade Speed',
			options: [{
				id: 'value',
				type: 'number',
				label: 'Speed (1 fast - 40 slow)',
				min: 1,
				max: 40,
				default: 1,
			}],
			callback: async (event) => {
				let response = await self.runCommand(`Speed ${event.options.value}`)
				processResponse(response)
			}
		}

		actions['scheme'] = {
			name: 'Light effect scheme',
			options: [{
				id: 'scheme',
				type: 'dropdown',
				label: 'Scheme ID',
				default: '0',
				tooltip: 'For the meaning of IDs 5 to 16, see https://tasmota.github.io/docs/Commands/#light',
				choices: [
					{id: '+', label: 'Next scheme'},
					{id: '-', label: 'Previous scheme'},
					{id: '0', label: '0 - Single color for LED'},
					{id: '1', label: '1 - Start wake up sequence'},
					{id: '2', label: '2 - Cycle up through colors using "Fade speed" setting'},
					{id: '3', label: '3 - Cycle down through colors using "Fade speed" setting'},
					{id: '4', label: '4 - Random Cycle through colors using "Fade speed" and "Fade" settings'},
					{id: '5', label: '5'},
					{id: '6', label: '6'},
					{id: '7', label: '7'},
					{id: '8', label: '8'},
					{id: '9', label: '9'},
					{id: '10', label: '10'},
					{id: '11', label: '11'},
					{id: '12', label: '12'},
					{id: '13', label: '13'},
					{id: '14', label: '14'},
					{id: '15', label: '15'},
					{id: '16', label: '16'},
				],	
			}],
			callback: async (event) => {
				let response = await self.runCommand(`Scheme ${event.options.scheme}`)
				console.log("Scheme", response)
				processResponse(response)
			}
		}
	}

	self.setActionDefinitions(actions)
}
