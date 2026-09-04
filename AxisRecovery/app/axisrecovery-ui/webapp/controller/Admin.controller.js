sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageBox", "../model/api"],
  function (BaseController, JSONModel, MessageBox, api) {
  "use strict";

  return BaseController.extend("axisrecovery.ui.controller.Admin", {
    onInit: function () {
      this.getView().setModel(
        new JSONModel({
          metrics: { usuarios: 0, publicaciones: 0, mensajesNuevos: 0 },
          publicaciones: [],
          mensajes: [],
          especialistas: [],
          especialidades: [],
          especialistaForm: this._formVacio()
        }),
        "ui"
      );
      this.getRouter().getRoute("admin").attachPatternMatched(this._onRouteMatched, this);
    },

    _formVacio: function () {
      return {
        titulo: "",
        modo: "crear",
        ID: null,
        nombreCompleto: "",
        especialidadId: "",
        institucion: "",
        telefono: "",
        correo: "",
        whatsapp: "",
        descripcion: "",
        fotoUrl: "",
        activo: true
      };
    },

    _onRouteMatched: function () {
      var oSession = this.getSessionModel().getData();
      if (oSession.rol !== "Administrador") return;
      this._cargarTodo();
    },

    _cargarTodo: function () {
      var oModel = this.getView().getModel("ui");

      api
        .get("/admin/metrics()")
        .then(function (oMetrics) {
          oModel.setProperty("/metrics", oMetrics);
        })
        .catch(function () {});

      api
        .getList("/admin/Publicaciones?$orderby=createdAt desc")
        .then(function (aPublicaciones) {
          oModel.setProperty("/publicaciones", aPublicaciones);
        })
        .catch(
          function (oError) {
            this.showError(oError);
          }.bind(this)
        );

      api
        .getList("/admin/Mensajes?$orderby=createdAt desc")
        .then(function (aMensajes) {
          oModel.setProperty("/mensajes", aMensajes);
        })
        .catch(function () {});

      this._cargarEspecialistas();
    },

    _cargarEspecialistas: function () {
      var oModel = this.getView().getModel("ui");

      Promise.all([
        api.getList("/admin/Especialistas?$orderby=nombreCompleto"),
        api.getList("/admin/Especialidades?$orderby=nombre")
      ])
        .then(
          function (aResultados) {
            var aEspecialistas = aResultados[0];
            var aEspecialidades = aResultados[1];
            var oNombrePorId = {};
            aEspecialidades.forEach(function (oEspecialidad) {
              oNombrePorId[oEspecialidad.ID] = oEspecialidad.nombre;
            });
            aEspecialistas.forEach(function (oEspecialista) {
              oEspecialista.especialidadNombre = oNombrePorId[oEspecialista.especialidad_ID] || "";
            });
            oModel.setProperty("/especialistas", aEspecialistas);
            oModel.setProperty("/especialidades", aEspecialidades);
          }
        )
        .catch(
          function (oError) {
            this.showError(oError);
          }.bind(this)
        );
    },

    formatActivo: function (bActivo) {
      return bActivo ? this.getI18nText("adminEspecialistaActivo") : this.getI18nText("adminEspecialistaInactivo");
    },

    _buscarDialog: function () {
      return this.byId("especialistaDialog");
    },

    onNuevoEspecialista: function () {
      var oModel = this.getView().getModel("ui");
      var oForm = this._formVacio();
      oForm.titulo = this.getI18nText("adminEspecialistaNuevo");
      oModel.setProperty("/especialistaForm", oForm);
      this._buscarDialog().open();
    },

    onEditarEspecialista: function (oEvent) {
      var oModel = this.getView().getModel("ui");
      var oData = oEvent.getSource().getBindingContext("ui").getObject();
      oModel.setProperty("/especialistaForm", {
        titulo: this.getI18nText("adminEspecialistaEditar"),
        modo: "editar",
        ID: oData.ID,
        nombreCompleto: oData.nombreCompleto || "",
        especialidadId: oData.especialidad_ID || "",
        institucion: oData.institucion || "",
        telefono: oData.telefono || "",
        correo: oData.correo || "",
        whatsapp: oData.whatsapp || "",
        descripcion: oData.descripcion || "",
        fotoUrl: oData.fotoUrl || "",
        activo: !!oData.activo
      });
      this._buscarDialog().open();
    },

    onCancelarEspecialistaForm: function () {
      this._buscarDialog().close();
    },

    onGuardarEspecialista: function () {
      var oModel = this.getView().getModel("ui");
      var oForm = oModel.getProperty("/especialistaForm");

      if (!oForm.nombreCompleto || !oForm.especialidadId) {
        this.showError({ message: this.getI18nText("commonErrorGenerico") });
        return;
      }

      var oBody = {
        nombreCompleto: oForm.nombreCompleto,
        especialidad_ID: oForm.especialidadId,
        institucion: oForm.institucion,
        telefono: oForm.telefono,
        correo: oForm.correo,
        whatsapp: oForm.whatsapp,
        descripcion: oForm.descripcion,
        fotoUrl: oForm.fotoUrl,
        activo: oForm.activo
      };

      var pGuardar =
        oForm.modo === "editar"
          ? api.patch("/admin/Especialistas('" + oForm.ID + "')", oBody)
          : api.post("/admin/Especialistas", oBody);

      pGuardar
        .then(
          function () {
            this._buscarDialog().close();
            this.showSuccess(this.getI18nText("adminEspecialistaGuardadoOk"));
            this._cargarEspecialistas();
          }.bind(this)
        )
        .catch(
          function (oError) {
            this.showError(oError);
          }.bind(this)
        );
    },

    onEliminarEspecialista: function (oEvent) {
      var oData = oEvent.getSource().getBindingContext("ui").getObject();
      MessageBox.confirm(this.getI18nText("adminEspecialistaConfirmarEliminar"), {
        onClose: function (sAction) {
          if (sAction !== MessageBox.Action.OK) return;
          api
            .delete("/admin/Especialistas('" + oData.ID + "')")
            .then(
              function () {
                this.showSuccess(this.getI18nText("adminEspecialistaEliminadoOk"));
                this._cargarEspecialistas();
              }.bind(this)
            )
            .catch(
              function (oError) {
                this.showError(oError);
              }.bind(this)
            );
        }.bind(this)
      });
    },

    _cambiarEstadoPublicacion: function (oEvent, sEstado) {
      var oData = oEvent.getSource().getBindingContext("ui").getObject();
      api
        .patch("/admin/Publicaciones('" + oData.ID + "')", { estadoModeracion: sEstado })
        .then(
          function () {
            this._cargarTodo();
          }.bind(this)
        )
        .catch(
          function (oError) {
            this.showError(oError);
          }.bind(this)
        );
    },

    onOcultarPublicacion: function (oEvent) {
      this._cambiarEstadoPublicacion(oEvent, "oculto");
    },

    onPublicarPublicacion: function (oEvent) {
      this._cambiarEstadoPublicacion(oEvent, "publicado");
    }
  });
});
