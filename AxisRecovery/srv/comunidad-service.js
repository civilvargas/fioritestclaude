const cds = require('@sap/cds')
const { requireAuth } = require('./lib/auth')

module.exports = function () {
  const { ReporteModeracion } = cds.entities('axisrecovery.db')

  // ---- Publicaciones ----

  this.before('CREATE', 'Publicaciones', (req) => {
    const auth = requireAuth(req)
    if (!auth.userId) return
    req.data.usuario_ID = auth.userId
    req.data.estadoModeracion = 'publicado'
    req.data.likesCount = 0
  })

  this.before(['UPDATE', 'DELETE'], 'Publicaciones', async (req) => {
    const auth = requireAuth(req)
    if (!auth.userId) return
    const pub = await SELECT.one.from(req.subject)
    if (!pub) return req.reject(404, 'Publicación no encontrada.')
    if (pub.usuario_ID !== auth.userId && auth.role !== 'Administrador') {
      return req.reject(403, 'Solo puedes editar o eliminar tus propias publicaciones.')
    }
  })

  this.on('darLike', 'Publicaciones', async (req) => {
    const pub = await SELECT.one.from(req.subject)
    if (!pub) return req.reject(404, 'Publicación no encontrada.')
    const nuevoLikes = (pub.likesCount || 0) + 1
    await UPDATE(req.subject).with({ likesCount: nuevoLikes })
    return nuevoLikes
  })

  this.on('reportar', 'Publicaciones', async (req) => {
    const auth = requireAuth(req)
    if (!auth.userId) return
    const pub = await SELECT.one.from(req.subject)
    if (!pub) return req.reject(404, 'Publicación no encontrada.')
    await INSERT.into(ReporteModeracion).entries({
      usuario_ID: auth.userId,
      publicacion_ID: pub.ID,
      motivo: req.data.motivo || '',
      estado: 'abierto'
    })
    return 'Gracias, tu reporte fue enviado para revisión.'
  })

  // ---- Comentarios ----

  this.before('CREATE', 'Comentarios', (req) => {
    const auth = requireAuth(req)
    if (!auth.userId) return
    req.data.usuario_ID = auth.userId
    req.data.estadoModeracion = 'publicado'
  })

  this.before(['UPDATE', 'DELETE'], 'Comentarios', async (req) => {
    const auth = requireAuth(req)
    if (!auth.userId) return
    const com = await SELECT.one.from(req.subject)
    if (!com) return req.reject(404, 'Comentario no encontrado.')
    if (com.usuario_ID !== auth.userId && auth.role !== 'Administrador') {
      return req.reject(403, 'Solo puedes editar o eliminar tus propios comentarios.')
    }
  })

  this.on('reportar', 'Comentarios', async (req) => {
    const auth = requireAuth(req)
    if (!auth.userId) return
    const com = await SELECT.one.from(req.subject)
    if (!com) return req.reject(404, 'Comentario no encontrado.')
    await INSERT.into(ReporteModeracion).entries({
      usuario_ID: auth.userId,
      comentario_ID: com.ID,
      motivo: req.data.motivo || '',
      estado: 'abierto'
    })
    return 'Gracias, tu reporte fue enviado para revisión.'
  })
}
