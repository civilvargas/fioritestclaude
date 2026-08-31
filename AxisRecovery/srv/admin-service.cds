using { axisrecovery.db as db } from '../db/schema';

/**
 * Panel de administración: gestión de catálogo, moderación de comunidad y mensajes de contacto.
 * TODO el servicio requiere rol Administrador (aplicado en srv/admin-service.js).
 */
@path: '/odata/v4/admin'
service AdminService {

  entity Recursos       as projection on db.RecursoEducativo;
  entity Categorias     as projection on db.CategoriaRecurso;
  entity Especialistas  as projection on db.Especialista;
  entity Especialidades as projection on db.Especialidad;
  entity Publicaciones  as projection on db.PublicacionComunidad;
  entity Comentarios    as projection on db.Comentario;
  entity Reportes       as projection on db.ReporteModeracion;
  entity Mensajes       as projection on db.MensajeContacto;

  @readonly
  entity Usuarios as projection on db.Usuario {
    ID, nombre, correo, rol, deportePracticado, activo, createdAt
  };

  function metrics() returns {
    usuarios       : Integer;
    publicaciones  : Integer;
    mensajesNuevos : Integer;
  };
}
