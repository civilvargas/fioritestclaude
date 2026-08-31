sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel", "../model/api"], function (
  BaseController,
  JSONModel,
  api
) {
  "use strict";

  return BaseController.extend("axisrecovery.ui.controller.Comunidad", {
    onInit: function () {
      this.getView().setModel(
        new JSONModel({
          nuevoTitulo: "",
          nuevoContenido: "",
          publicaciones: []
        }),
        "ui"
      );
      this.getRouter().getRoute("comunidad").attachPatternMatched(this._cargarPublicaciones, this);
    },

    _cargarPublicaciones: function () {
      var oModel = this.getView().getModel("ui");
      api
        .getList(
          "/comunidad/Publicaciones?$filter=" +
            encodeURIComponent("estadoModeracion eq 'publicado'") +
            "&$orderby=createdAt desc"
        )
        .then(function (aPublicaciones) {
          oModel.setProperty("/publicaciones", aPublicaciones);
        })
        .catch(
          function (oError) {
            this.showError(oError);
          }.bind(this)
        );
    },

    onPublicar: function () {
      if (!this.requireLogin()) return;
      var oModel = this.getView().getModel("ui");
      var sTitulo = oModel.getProperty("/nuevoTitulo");
      var sContenido = oModel.getProperty("/nuevoContenido");
      if (!sTitulo || !sContenido) {
        this.showError({ message: "Escribe un titulo y tu experiencia antes de publicar." });
        return;
      }
      api
        .post("/comunidad/Publicaciones", { titulo: sTitulo, contenido: sContenido })
        .then(
          function () {
            oModel.setProperty("/nuevoTitulo", "");
            oModel.setProperty("/nuevoContenido", "");
            this.showSuccess("Tu publicacion fue compartida con la comunidad.");
            this._cargarPublicaciones();
          }.bind(this)
        )
        .catch(
          function (oError) {
            this.showError(oError);
          }.bind(this)
        );
    },

    onLike: function (oEvent) {
      if (!this.requireLogin()) return;
      var oContext = oEvent.getSource().getBindingContext("ui");
      var oData = oContext.getObject();
      api
        .post("/comunidad/Publicaciones('" + oData.ID + "')/darLike")
        .then(function (iNuevoLikes) {
          oContext.getModel().setProperty(oContext.getPath() + "/likesCount", iNuevoLikes);
        })
        .catch(
          function (oError) {
            this.showError(oError);
          }.bind(this)
        );
    },

    onAbrirPublicacion: function (oEvent) {
      var oData = oEvent.getSource().getBindingContext("ui").getObject();
      this.navTo("publicacionDetalle", { id: oData.ID });
    }
  });
});
