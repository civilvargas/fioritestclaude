namespace axisrecovery.db;

using { cuid, managed } from '@sap/cds/common';

/**
 * Usuario registrado del sitio (deportista o administrador).
 * La contraseña nunca se guarda en texto plano: ver srv/lib/auth.js (bcryptjs).
 */
entity Usuario : cuid, managed {
  nombre            : String(120)  not null;
  correo            : String(150)  not null;
  contrasenaHash    : String(255)  not null;
  rol               : String(20)   default 'Deportista'; // Deportista | Administrador
  deportePracticado : String(80);
  biografia         : String(500);
  activo            : Boolean      default true;

  publicaciones     : Association to many PublicacionComunidad on publicaciones.usuario = $self;
  comentarios       : Association to many Comentario           on comentarios.usuario   = $self;
  seguimientos      : Association to many RegistroSeguimiento  on seguimientos.usuario  = $self;
}

/** Categoría de recurso: agrupa tanto "Recursos educativos" como "Apoyo psicológico" (campo modulo). */
entity CategoriaRecurso : cuid {
  nombre    : String(80) not null;
  modulo    : String(30) not null; // recursos_educativos | apoyo_psicologico
  orden     : Integer    default 0;

  recursos  : Association to many RecursoEducativo on recursos.categoria = $self;
}

entity RecursoEducativo : cuid, managed {
  titulo           : String(200)  not null;
  tipo             : String(20)   not null; // video | guia | infografia | articulo
  categoria        : Association to CategoriaRecurso;
  urlContenido     : String(500);
  imagenUrl        : String(300);
  descripcion      : String(1000);
  autor            : String(120);
  destacado        : Boolean      default false;
  publicado        : Boolean      default true;
  fechaPublicacion : Date;
}

entity Especialidad : cuid {
  nombre        : String(80) not null; // Kinesiología | Psicología deportiva | Medicina deportiva / Traumatología | Nutrición deportiva
  especialistas : Association to many Especialista on especialistas.especialidad = $self;
}

entity Especialista : cuid, managed {
  nombreCompleto : String(150) not null;
  especialidad   : Association to Especialidad not null;
  institucion    : String(150);
  telefono       : String(30);
  correo         : String(150);
  whatsapp       : String(30);
  descripcion    : String(500);
  fotoUrl        : String(300);
  activo         : Boolean default true;
}

entity PublicacionComunidad : cuid, managed {
  usuario          : Association to Usuario not null;
  titulo           : String(150)  not null;
  contenido        : String(3000) not null;
  categoria        : String(60);   // manejo_emocional | vuelta_a_competir | prevencion_recaidas | otro
  likesCount       : Integer      default 0;
  estadoModeracion : String(20)   default 'publicado'; // pendiente | publicado | oculto

  comentarios      : Association to many Comentario on comentarios.publicacion = $self;
}

entity Comentario : cuid, managed {
  publicacion      : Association to PublicacionComunidad not null;
  usuario          : Association to Usuario not null;
  contenido        : String(1000) not null;
  estadoModeracion : String(20)   default 'publicado'; // publicado | oculto
}

entity ReporteModeracion : cuid, managed {
  usuario      : Association to Usuario not null;
  publicacion  : Association to PublicacionComunidad;
  comentario   : Association to Comentario;
  motivo       : String(300);
  estado       : String(20) default 'abierto'; // abierto | revisado | descartado
}

/** Registro privado de seguimiento del propio usuario (escala Likert 1-5, igual que el instrumento del ABP). */
entity RegistroSeguimiento : cuid, managed {
  usuario           : Association to Usuario not null;
  fecha             : Date    not null;
  nivelAnimo        : Integer not null; // 1 a 5
  nivelDolor        : Integer;          // 1 a 5
  etapaRecuperacion : String(20);       // diagnostico | tratamiento | rehabilitacion | alta
  notaLibre         : String(500);
}

entity MensajeContacto : cuid, managed {
  usuario        : Association to Usuario;      // opcional (puede ser anónimo)
  especialista   : Association to Especialista; // opcional
  nombre         : String(120) not null;
  correo         : String(150) not null;
  mensaje        : String(1000) not null;
  canalPreferido : String(20); // whatsapp | correo | red_social
  estado         : String(20) default 'nuevo'; // nuevo | atendido
}
