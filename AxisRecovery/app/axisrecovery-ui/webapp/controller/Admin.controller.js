sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel", "../model/api"], function (
  BaseController,
  JSONModel,
  api
) {
  "use strict";

  return BaseController.extend("axisrecovery.ui.controller.Admin", {
    onInit: function () {
      this.getView().setModel(
        new JSONModel({
          metrics: { usuarios: 0, publicaciones: 0, mensajesNuevos: 0 },
          publicaciones: [],
          mensajes: []
        }),
        "ui"
      );
      this.getRouter().getRoute("admin").attachPatternMatched(this._onRouteMatched, this);
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
