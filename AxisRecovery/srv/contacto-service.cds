using { axisrecovery.db as db } from '../db/schema';

/** Contacto rápido: cualquier visitante puede enviar un mensaje; solo el administrador puede leerlos (ver AdminService). */
@path: '/odata/v4/contacto'
service ContactoService {

  entity Mensajes as projection on db.MensajeContacto {
    ID,
    usuario,
    especialista,
    nombre,
    correo,
    mensaje,
    canalPreferido,
    createdAt
  };
}
