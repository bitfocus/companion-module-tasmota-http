const { combineRgb } = require('@companion-module/base')

const BLACK_ON_RED = {
	bgcolor: combineRgb(255, 0, 0),
	color: combineRgb(0, 0, 0),
}

module.exports = async function (self) {
	let feedbacks = {}
	for (let key in self.DATA) {
		if (key.startsWith("POWER")) {
			feedbacks[key] = {
				name: 'State of ' + key,
				type: 'boolean',
				label: 'State of ' + key,
				defaultStyle: BLACK_ON_RED,
				options: [],
				callback: (feedback) => {
					return self.DATA[key] == 'ON'
				}
			}
		}
	}

	if ('Dimmer' in self.DATA) {
		feedbacks['Dimmer'] = {
			name: 'Dimmer level',
			type: 'boolean',
			label: 'Dimmer level',
			defaultStyle: BLACK_ON_RED,
			options: [{
				id: 'level',
				type: 'number',
				label: 'Level',
				default: 100,
				min: 0,
				max: 100
			}],
			callback: (feedback) => (self.DATA.Dimmer == feedback.options.level),
		}
	}
	if ('Color' in self.DATA) {
		feedbacks['Color'] = {
			name: 'Color',
			type: 'boolean',
			label: 'Color',
			defaultStyle: BLACK_ON_RED,
			options: [
				{
					id: 'match',
					type: 'dropdown',
					label: 'Match mode',
					default: '>',
					choices: [
						{ id: '>', label: 'Starts with ...' },
						{ id: '=', label: 'Matches exactly ...' },
					]
				},
				{
					id: 'color',
					type: 'textinput',
					label: 'Color',
				},
			],
			callback: (feedback) => {
				if (feedback.options.match == '=') {
					return feedback.options.color.toUpperCase() == self.DATA.Color.toUpperCase()
				} else {
					return self.DATA.Color.toUpperCase().startsWith(feedback.options.color.toUpperCase())
				}
			},
		}
	}
	self.setFeedbackDefinitions(feedbacks)
}
