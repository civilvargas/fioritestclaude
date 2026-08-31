const cds = require('@sap/cds')
const { requireAdmin } = require('./lib/auth')

module.exports = function () {
  const { Usuario, PublicacionComunidad, MensajeContacto } = cds.entities('axisrecovery.db')

  // Cualquier operación en cualquier entidad de este servicio requiere rol Administrador.
  this.before('*', (req) => {
    requireAdmin(req)
  })

  this.on('metrics', async () => {
    const usuarios = await SELECT.from(Usuario)
    const publicaciones = await SELECT.from(PublicacionComunidad)
    const mensajesNuevos = await SELECT.from(MensajeContacto).where({ estado: 'nuevo' })
    return {
      usuarios: usuarios.length,
      publicaciones: publicaciones.length,
      mensajesNuevos: mensajesNuevos.length
    }
  })
}
