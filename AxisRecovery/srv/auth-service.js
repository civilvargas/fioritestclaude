const cds = require('@sap/cds')
const { hashPassword, verifyPassword, signToken, getAuth } = require('./lib/auth')

module.exports = function () {
  const { Usuario } = cds.entities('axisrecovery.db')

  this.on('register', async (req) => {
    const nombre = (req.data.nombre || '').trim()
    const correo = (req.data.correo || '').trim().toLowerCase()
    const contrasena = req.data.contrasena || ''
    const deportePracticado = req.data.deportePracticado || ''

    if (!nombre || !correo || !contrasena) {
      return { ok: false, mensaje: 'Nombre, correo y contraseña son obligatorios.', token: '', usuario: null }
    }
    if (contrasena.length < 8) {
      return { ok: false, mensaje: 'La contraseña debe tener al menos 8 caracteres.', token: '', usuario: null }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return { ok: false, mensaje: 'Ingresa un correo válido.', token: '', usuario: null }
    }

    const existente = await SELECT.one.from(Usuario).where({ correo })
    if (existente) {
      return { ok: false, mensaje: 'Ya existe una cuenta con este correo. Intenta iniciar sesión.', token: '', usuario: null }
    }

    await INSERT.into(Usuario).entries({
      nombre,
      correo,
      contrasenaHash: hashPassword(contrasena),
      rol: 'Deportista',
      deportePracticado,
      activo: true
    })

    const usuario = await SELECT.one.from(Usuario).where({ correo })
    const token = signToken(usuario)

    return {
      ok: true,
      mensaje: 'Cuenta creada correctamente.',
      token,
      usuario: { id: usuario.ID, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }
    }
  })

  this.on('login', async (req) => {
    const correo = (req.data.correo || '').trim().toLowerCase()
    const contrasena = req.data.contrasena || ''

    const usuario = await SELECT.one.from(Usuario).where({ correo })
    if (!usuario || !usuario.activo || !verifyPassword(contrasena, usuario.contrasenaHash)) {
      return { ok: false, mensaje: 'Correo o contraseña incorrectos.', token: '', usuario: null }
    }

    const token = signToken(usuario)
    return {
      ok: true,
      mensaje: 'Sesión iniciada.',
      token,
      usuario: { id: usuario.ID, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }
    }
  })

  this.on('logout', async () => {
    // El token es autocontenido (JWT); "cerrar sesión" simplemente significa que el frontend
    // debe descartar el token guardado en localStorage. No hay estado que limpiar en el servidor.
    return { ok: true }
  })

  this.on('me', async (req) => {
    const auth = getAuth(req)
    if (!auth.userId) {
      return { autenticado: false, id: '', nombre: '', correo: '', rol: '' }
    }
    const usuario = await SELECT.one.from(Usuario).where({ ID: auth.userId })
    if (!usuario || !usuario.activo) {
      return { autenticado: false, id: '', nombre: '', correo: '', rol: '' }
    }
    return { autenticado: true, id: usuario.ID, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }
  })
}
