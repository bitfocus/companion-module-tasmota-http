module.exports = async function (self) {
	self.state = await self.runCommand('State')
	if (self.DATA.Power != undefined) {
		/* Device delivers power consumption metrics */
		const status = await self.runCommand('Status 8')
		if (status.StatusSNS != undefined && status.StatusSNS.ENERGY != undefined) {
			Object.assign(self.state, status.StatusSNS.ENERGY)
		}
	}
	for (let key in self.DATA) {
		self.DATA[key] = self.state[key]
	}
	self.setVariableValues(self.DATA)
	self.checkFeedbacks()
}
