// srv/lib/auth.js
//
// Autenticación simplificada para el ambiente de desarrollo/test (SQLite).
//
// Por qué está hecho así:
// En package.json, "cds.requires.auth.kind" está en "dummy" (modo de desarrollo de SAP CAP),
// lo que hace que CAP autentique automáticamente cada request como un usuario "privilegiado"
// y NO aplique restricciones de rol por sí mismo. Esto es intencional: nos permite tener
// registro/login propios (con contraseña + JWT) sin depender de la infraestructura de
// identidad de SAP BTP (XSUAA) mientras estamos en local/test.
//
// El cliente (SAPUI5) guarda el token JWT que devuelve AuthService.register/login en
// localStorage y lo reenvía como header "Authorization: Bearer <token>" en cada llamada
// que requiera sesión (publicar en comunidad, seguimiento personal, panel admin, etc.).
//
// La autorización REAL para este build local se aplica a mano en cada servicio
// (ver srv/*.js), usando las funciones de este archivo para saber quién hace la petición.
//
// En producción (perfil "production" en package.json) esto se reemplaza por XSUAA/IAS,
// y las mismas reglas de negocio deberían migrarse a anotaciones @requires/@restrict,
// tal como se documentó en el vault de Obsidian (Arquitectura > Seguridad-y-Autenticacion.md).

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// Secreto de firma del JWT. En un ambiente real esto debe venir de una variable de entorno.
const JWT_SECRET = process.env.AXISRECOVERY_JWT_SECRET || 'axisrecovery-dev-secret-cambiar-en-produccion'
const TOKEN_TTL = '7d'

function hashPassword(plainText) {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(plainText, salt)
}

function verifyPassword(plainText, hash) {
  return bcrypt.compareSync(plainText, hash)
}

function signToken(usuario) {
  return jwt.sign(
    { sub: usuario.ID, correo: usuario.correo, nombre: usuario.nombre, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  )
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (e) {
    return null
  }
}

/**
 * Middleware de Express (registrado en server.js vía cds.on('bootstrap', ...)).
 * Lee el JWT desde el header "Authorization: Bearer <token>" y, si es válido,
 * agrega cabeceras internas (x-ar-userid / x-ar-role / x-ar-nombre) que los
 * manejadores de servicio pueden leer de forma simple y estable con req.headers.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    const token = header.substring('Bearer '.length)
    const payload = verifyToken(token)
    if (payload) {
      req.headers['x-ar-userid'] = payload.sub
      req.headers['x-ar-role'] = payload.rol
      req.headers['x-ar-nombre'] = encodeURIComponent(payload.nombre || '')
    }
  }
  next()
}

/**
 * Helper para usar dentro de los manejadores de servicio CAP (req es un cds.Request).
 * Devuelve { userId, role, nombre } o valores nulos si no hay sesión.
 */
function getAuth(req) {
  const headers = req.headers || {}
  const userId = headers['x-ar-userid'] || null
  const role = headers['x-ar-role'] || null
  const nombre = headers['x-ar-nombre'] ? decodeURIComponent(headers['x-ar-nombre']) : null
  return { userId, role, nombre }
}

function requireAuth(req) {
  const auth = getAuth(req)
  if (!auth.userId) {
    req.reject(401, 'Debes iniciar sesión para realizar esta acción.')
  }
  return auth
}

function requireAdmin(req) {
  const auth = getAuth(req)
  if (!auth.userId || auth.role !== 'Administrador') {
    req.reject(403, 'Esta acción requiere permisos de administrador.')
  }
  return auth
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  authenticate,
  getAuth,
  requireAuth,
  requireAdmin
}
