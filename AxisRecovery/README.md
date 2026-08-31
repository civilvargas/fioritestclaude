# AxisRecovery

Plataforma digital de orientación y acompañamiento para deportistas escolares lesionados
(Colegio Almondale Lomas). Backend **SAP CAP** (Node.js) + **SQLite** local / **SAP HANA Cloud**
a futuro, frontend **SAPUI5 freestyle**, responsivo (PC y móvil).

Este proyecto fue generado a partir de la documentación del vault de Obsidian
`Denisse Proyecto/Obsidian/ProyectoDenisse/AxisRecovery` (alcance, modelo de datos, guía de
estilo y propuesta de pantallas).

## 1. Requisitos previos

- **Node.js 18 o superior** (recomendado: la versión LTS más reciente) — [nodejs.org](https://nodejs.org)
- **Visual Studio Code** (ya lo tienes instalado)
- Conexión a internet la primera vez, para descargar las dependencias (`npm install`)

Para comprobar que Node está instalado, abre una terminal y ejecuta:

```bash
node -v
npm -v
```

## 2. Primer arranque

1. Abre la carpeta `AxisRecovery` en VS Code (`Archivo > Abrir carpeta...`).
2. Abre una terminal integrada en VS Code (`Terminal > Nueva Terminal`).
3. Instala las dependencias:

   ```bash
   npm install
   ```

   Esto descarga SAP CAP (`@sap/cds`, `@sap/cds-dk`), el driver de SQLite (`@cap-js/sqlite`),
   `express`, `jsonwebtoken` y `bcryptjs`. Puede tardar uno o dos minutos.

4. Levanta el servidor:

   ```bash
   npm start
   ```

   (Es un alias de `cds watch`, que además recarga automáticamente si editas archivos).

5. En el primer arranque, `cds` crea y llena la base de datos SQLite (`db/axisrecovery.sqlite`)
   con los datos de prueba (especialistas, recursos, categorías, usuarios demo, etc.).

6. Abre el navegador en:

   ```
   http://localhost:4004/
   ```

   Ahí se sirve directamente la app SAPUI5 (index.html). Los servicios OData quedan disponibles
   bajo `http://localhost:4004/odata/v4/...` (por ejemplo `http://localhost:4004/odata/v4/recursos/Recursos`).

7. Para ver la vista **móvil**, usa las herramientas de desarrollador del navegador
   (F12 → icono de "Toggle device toolbar" / vista responsiva) o simplemente reduce el ancho
   de la ventana: la barra de navegación superior colapsa automáticamente los botones que no caben
   en un menú "más" (comportamiento de `sap.m.OverflowToolbar`).

## 3. Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@axisrecovery.cl` | `Admin1234!` |
| Deportista (demo) | `demo@axisrecovery.cl` | `Demo1234!` |
| Deportista (demo 2) | `valentina.demo@axisrecovery.cl` | `Valentina1234!` |

También puedes registrar una cuenta nueva desde el propio sitio (**Iniciar sesión → Crear cuenta**).

El usuario Administrador puede entrar a **Administración** (botón en la barra superior) para ver
métricas, moderar publicaciones de la comunidad (ocultar/republicar) y revisar los mensajes de
contacto recibidos.

## 4. Estructura del proyecto

```
AxisRecovery/
├── db/
│   ├── schema.cds          # Modelo de datos (Usuario, RecursoEducativo, Especialista, etc.)
│   └── data/                # Datos de prueba (CSV) — especialistas, recursos, usuarios demo...
├── srv/
│   ├── recursos-service.cds/js       # Recursos educativos + Apoyo psicológico (lectura pública)
│   ├── especialistas-service.cds     # Directorio de especialistas (lectura pública)
│   ├── comunidad-service.cds/js      # Publicaciones, comentarios, likes, reportes
│   ├── seguimiento-service.cds/js    # Registro personal de bienestar (privado)
│   ├── contacto-service.cds/js       # Formulario de contacto rápido
│   ├── auth-service.cds/js           # Registro / login / sesión (JWT)
│   ├── admin-service.cds/js          # Panel de administración (solo rol Administrador)
│   └── lib/auth.js                   # Hash de contraseñas + JWT + helpers de autorización
├── app/axisrecovery-ui/webapp/       # App SAPUI5 freestyle (responsive)
│   ├── view/ + controller/           # Home, Login, Recursos, Especialistas, Comunidad,
│   │                                   PublicacionDetalle, Seguimiento, Contacto, Admin
│   ├── model/api.js                  # Cliente HTTP hacia los servicios OData V4
│   └── css/style.css                 # Paleta de colores de AxisRecovery
├── server.js                         # Middleware de autenticación + sirve la app en "/"
└── package.json
```

## 5. Cómo funciona la autenticación (importante)

Para simplificar el desarrollo local, este proyecto **no** usa todavía SAP XSUAA (el mecanismo
de identidad de producción en SAP BTP). En su lugar:

- `AuthService.register` / `AuthService.login` verifican la contraseña (con `bcryptjs`) y devuelven
  un **token JWT**.
- El frontend guarda ese token en `localStorage` del navegador y lo envía como
  `Authorization: Bearer <token>` en cada llamada que requiere sesión.
- Un middleware en `server.js` (ver `srv/lib/auth.js`) valida ese token y expone la identidad del
  usuario a los servicios.
- Cada servicio (`comunidad-service.js`, `seguimiento-service.js`, `admin-service.js`, etc.)
  **verifica a mano** quién puede hacer qué (por ejemplo, "solo el dueño de una publicación puede
  editarla", "solo un Administrador puede moderar").

Cuando este proyecto se lleve a producción en SAP BTP (perfil `production` en `package.json`,
ya configurado para apuntar a `hana-cloud` + `xsuaa`), este mecanismo debería reemplazarse por
XSUAA/SAP Identity Authentication Service, migrando las reglas de negocio a anotaciones
`@requires` / `@restrict` — tal como se documentó en el vault de Obsidian
(`Arquitectura > Seguridad-y-Autenticacion.md`).

## 6. De SQLite a SAP HANA Cloud (a futuro)

El modelo de datos (`db/schema.cds`) y los servicios son los mismos en ambos ambientes — es la
base del **SAP Cloud Application Programming Model (CAP)**. Para pasar a producción:

```bash
cds deploy --to hana-cloud --profile production
```

(requiere tener aprovisionada una instancia de SAP HANA Cloud en un subaccount de SAP BTP y el
CLI de Cloud Foundry configurado). Ver la nota `Estrategia-Base-Datos.md` del vault de Obsidian
para el detalle completo.

## 7. Limitaciones conocidas de este MVP (simplificaciones deliberadas)

Para que el proyecto sea manejable en esta primera versión funcional, se simplificaron
algunos puntos respecto a la documentación completa. Quedan identificados aquí para una
siguiente iteración:

- **Etiquetas libres (tags)** en recursos educativos: están documentadas en el modelo de datos
  original pero no se implementaron en esta versión (se filtra solo por categoría).
- **Panel de administración**: permite moderar comunidad, ver métricas y mensajes de contacto,
  pero **no** incluye todavía formularios para crear/editar recursos o especialistas desde la UI
  (por ahora se gestionan editando `db/data/*.csv` y reiniciando, o directamente en la base de
  datos). Los servicios OData (`AdminService.Recursos`, `AdminService.Especialistas`) ya están
  listos para conectarles una pantalla de administración cuando se necesite.
- **Moderación de comunidad**: las publicaciones se publican automáticamente (`estadoModeracion =
  'publicado'`); el administrador puede ocultarlas después. El filtro "solo publicado" en el
  listado público se aplica en el frontend (vía `$filter`), no como una regla forzada también en
  el servidor — suficiente para un proyecto escolar, pero conviene reforzarlo antes de un uso
  más amplio.
- **Reportar contenido** usa un motivo genérico (no hay todavía un cuadro de texto para explicar
  el motivo del reporte).

Ninguna de estas limitaciones impide usar el sitio de principio a fin (registro, comunidad,
seguimiento, especialistas, contacto, administración básica); son extensiones naturales para una
siguiente iteración.

## 8. Solución de problemas

- **`npm install` falla o se congela**: revisa tu conexión a internet. Si estás en una red
  corporativa/escolar con proxy, puede que necesites configurar el proxy de npm
  (`npm config set proxy ...`).
- **El puerto 4004 ya está en uso**: cierra el proceso anterior (`Ctrl+C` en la terminal donde
  corría) o cambia el puerto con `cds watch --port 4005`.
- **La página se ve en blanco**: revisa la consola del navegador (F12). El proyecto carga SAPUI5
  desde `https://sdk.openui5.org` (necesita internet); si tu red bloquea ese dominio, avísanos
  para dejar una copia local de la librería.
- **Quiero borrar todos los datos de prueba y empezar de cero**: cierra el servidor y borra el
  archivo `db/axisrecovery.sqlite` (y `axisrecovery.sqlite-journal` si existe); al volver a
  ejecutar `npm start`, CAP lo recrea desde `db/schema.cds` + `db/data/*.csv`.
