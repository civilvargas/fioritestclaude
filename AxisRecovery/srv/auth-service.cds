/**
 * Servicio de autenticación simplificado para el ambiente local/test (ver srv/lib/auth.js).
 * El token devuelto por register/login debe guardarse en el cliente (localStorage) y enviarse
 * como "Authorization: Bearer <token>" en las llamadas que requieran sesión.
 */
@path: '/odata/v4/auth'
service AuthService {

  type Sesion {
    ok      : Boolean;
    mensaje : String;
    token   : String;
    usuario : {
      id     : String;
      nombre : String;
      correo : String;
      rol    : String;
    };
  }

  action register(nombre: String, correo: String, contrasena: String, deportePracticado: String) returns Sesion;
  action login(correo: String, contrasena: String) returns Sesion;
  action logout() returns { ok: Boolean };

  function me() returns {
    autenticado : Boolean;
    id          : String;
    nombre      : String;
    correo      : String;
    rol         : String;
  };
}
