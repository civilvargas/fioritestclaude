const cds = require('@sap/cds')

module.exports = cds.service.impl(async function () {
	const { Usuarios } = this.entities

	this.before('CREATE', Usuarios, async (req) => {
		if (req.data.ID == null) {
			const max = await SELECT.one.from(Usuarios).columns('max(ID) as maxID')
			req.data.ID = (max?.maxID || 0) + 1
		}
	})
})
