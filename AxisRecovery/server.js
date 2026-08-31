// server.js
//
// Punto de arranque personalizado de SAP CAP:
//  1. Registra el middleware de autenticación (lee "Authorization: Bearer <token>").
//  2. Sirve la app SAPUI5 (app/axisrecovery-ui/webapp) directamente en la raíz "/",
//     para que abrir el sitio sea simplemente http://localhost:4004/
//
// Los servicios OData siguen disponibles bajo /odata/v4/... (ver cada *-service.cds).

const cds = require('@sap/cds')
const path = require('path')
const express = require('express')
const { authenticate } = require('./srv/lib/auth')

cds.on('bootstrap', (app) => {
  app.use(authenticate)
  app.use('/', express.static(path.join(__dirname, 'app/axisrecovery-ui/webapp')))
})

module.exports = cds.server
