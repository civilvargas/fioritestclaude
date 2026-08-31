using { axisrecovery.db as db } from '../db/schema';

/**
 * Servicio público de solo lectura para "Recursos educativos" y "Apoyo psicológico".
 * Ambas pantallas del sitio consumen esta MISMA entidad, filtrando por categoria_modulo
 * ('recursos_educativos' | 'apoyo_psicologico') — ver 0030 Datos/Modelo-de-Datos.md.
 */
@path: '/odata/v4/recursos'
service RecursosService {

  @readonly
  entity Recursos as projection on db.RecursoEducativo {
    ID,
    titulo,
    tipo,
    categoria,
    categoria.nombre as categoriaNombre,
    categoria.modulo as categoriaModulo,
    urlContenido,
    imagenUrl,
    descripcion,
    autor,
    destacado,
    fechaPublicacion
  } where publicado = true;

  @readonly
  entity Categorias as projection on db.CategoriaRecurso;
}
