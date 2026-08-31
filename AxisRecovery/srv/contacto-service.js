const { getAuth, requireAdmin } = require('./lib/auth')

module.exports = function () {

  this.before('CREATE', (req) => {
    const auth = getAuth(req)
    if (auth.userId) {
      req.data.usuario_ID = auth.userId
    }
    req.data.estado = 'nuevo'
  })

  // El listado de mensajes de contacto es privado: solo el administrador puede leerlos aquí.
  // (El propio remitente no necesita releer su mensaje: el frontend solo confirma el envío.)
  this.before('READ', (req) => {
    requireAdmin(req)
  })
}
