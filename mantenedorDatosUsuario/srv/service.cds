using { mantenedor as db } from '../db/schema';

service UsuarioService {
	entity Usuarios as projection on db.Usuarios;
}
