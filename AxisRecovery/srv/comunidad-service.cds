using { axisrecovery.db as db } from '../db/schema';

/**
 * Comunidad de apoyo: testimonios y comentarios.
 * Lectura pública; publicar/comentar/dar-like/reportar requiere sesión (ver srv/comunidad-service.js).
 * El listado público debe consultarse con $filter=estadoModeracion eq 'publicado'
 * (el administrador puede ocultar contenido vía AdminService sin borrarlo).
 */
@path: '/odata/v4/comunidad'
service ComunidadService {

  entity Publicaciones as projection on db.PublicacionComunidad {
    ID,
    usuario,
    usuario.nombre as autorNombre,
    titulo,
    contenido,
    categoria,
    likesCount,
    estadoModeracion,
    createdAt
  } actions {
    action darLike() returns Integer;
    action reportar(motivo : String) returns String;
  };

  entity Comentarios as projection on db.Comentario {
    ID,
    publicacion,
    usuario,
    usuario.nombre as autorNombre,
    contenido,
    estadoModeracion,
    createdAt
  } actions {
    action reportar(motivo : String) returns String;
  };
}
