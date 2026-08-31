using { axisrecovery.db as db } from '../db/schema';

/** Directorio público de especialistas (kinesiólogos, psicólogos deportivos, médicos, nutricionistas). */
@path: '/odata/v4/especialistas'
service EspecialistasService {

  @readonly
  entity Especialistas as projection on db.Especialista {
    ID,
    nombreCompleto,
    especialidad,
    especialidad.nombre as especialidadNombre,
    institucion,
    telefono,
    correo,
    whatsapp,
    descripcion,
    fotoUrl
  } where activo = true;

  @readonly
  entity Especialidades as projection on db.Especialidad;
}
