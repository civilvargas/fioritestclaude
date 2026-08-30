namespace mantenedor;

type EstadoUsuario : String(15) enum {
	Activo   = 'Activo';
	NoActivo = 'No activo';
};

entity Usuarios {
	key ID              : Integer   @cds.autoincrement;
	    Nombre          : String(30) not null;
	    Apellido        : String(30) not null;
	    Rut             : String(30) not null;
	    Edad            : Integer   @assert.range: [0, 999];
	    FechaNacimiento : Date;
	    Estado          : EstadoUsuario default 'Activo';
}
