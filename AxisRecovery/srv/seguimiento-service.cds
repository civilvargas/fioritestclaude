using { axisrecovery.db as db } from '../db/schema';

/**
 * Seguimiento personal — estrictamente privado: cada usuario solo ve y crea sus propios registros
 * (aplicado en srv/seguimiento-service.js, ya que la autenticación CDS está en modo "dummy" en local).
 */
@path: '/odata/v4/seguimiento'
service SeguimientoService {

  entity MisRegistros as projection on db.RegistroSeguimiento {
    ID,
    usuario,
    fecha,
    nivelAnimo,
    nivelDolor,
    etapaRecuperacion,
    notaLibre,
    createdAt
  };
}
