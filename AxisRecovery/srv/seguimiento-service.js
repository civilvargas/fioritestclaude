const { requireAuth } = require('./lib/auth')

module.exports = function () {

  this.before('CREATE', 'MisRegistros', (req) => {
    const auth = requireAuth(req)
    if (!auth.userId) return
    req.data.usuario_ID = auth.userId
    if (!req.data.fecha) {
      req.data.fecha = new Date().toISOString().slice(0, 10)
    }
  })

  // Lectura totalmente controlada a mano: solo se devuelven los registros del usuario autenticado,
  // ordenados del más reciente al más antiguo.
  this.on('READ', 'MisRegistros', async (req) => {
    const auth = requireAuth(req)
    if (!auth.userId) return []
    return SELECT.from(req.target).where({ usuario_ID: auth.userId }).orderBy('fecha desc')
  })

  this.before(['UPDATE', 'DELETE'], 'MisRegistros', async (req) => {
    const auth = requireAuth(req)
    if (!auth.userId) return
    const row = await SELECT.one.from(req.subject)
    if (!row) return req.reject(404, 'Registro no encontrado.')
    if (row.usuario_ID !== auth.userId) {
      return req.reject(403, 'No puedes modificar registros de otro usuario.')
    }
  })
}
