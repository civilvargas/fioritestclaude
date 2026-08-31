sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "../model/api", "sap/m/MessageBox"],
  function (BaseController, JSONModel, api, MessageBox) {
    "use strict";

    return BaseController.extend("axisrecovery.ui.controller.PublicacionDetalle", {
      onInit: function () {
        this.getView().setModel(
          new JSONModel({
            publicacion: {},
            comentarios: [],
            nuevoComentario: ""
          }),
          "ui"
        );
        this.getRouter().getRoute("publicacionDetalle").attachPatternMatched(this._onRouteMatched, this);
      },

      _onRouteMatched: function (oEvent) {
        this._sId = oEvent.getParameter("arguments").id;
        this._cargarPublicacion();
        this._cargarComentarios();
      },

      _cargarPublicacion: function () {
        var oModel = this.getView().getModel("ui");
        api
          .get("/comunidad/Publicaciones('" + this._sId + "')")
          .then(function (oPublicacion) {
            oModel.setProperty("/publicacion", oPublicacion);
          })
          .catch(
            function (oError) {
              this.showError(oError);
            }.bind(this)
          );
      },

      _cargarComentarios: function () {
        var oModel = this.getView().getModel("ui");
        var sFilter =
          "publicacion_ID eq '" + this._sId + "' and estadoModeracion eq 'publicado'";
        api
          .getList("/comunidad/Comentarios?$filter=" + encodeURIComponent(sFilter) + "&$orderby=createdAt asc")
          .then(function (aComentarios) {
            oModel.setProperty("/comentarios", aComentarios);
          })
          .catch(
            function (oError) {
              this.showError(oError);
            }.bind(this)
          );
      },

      onVolver: function () {
        this.navTo("comunidad");
      },

      onLike: function () {
        if (!this.requireLogin()) return;
        var oModel = this.getView().getModel("ui");
        api
          .post("/comunidad/Publicaciones('" + this._sId + "')/darLike")
          .then(function (iNuevoLikes) {
            oModel.setProperty("/publicacion/likesCount", iNuevoLikes);
          })
          .catch(
            function (oError) {
              this.showError(oError);
            }.bind(this)
          );
      },

      onComentar: function () {
        if (!this.requireLogin()) return;
        var oModel = this.getView().getModel("ui");
        var sContenido = oModel.getProperty("/nuevoComentario");
        if (!sContenido) return;
        api
          .post("/comunidad/Comentarios", { publicacion_ID: this._sId, contenido: sContenido })
          .then(
            function () {
              oModel.setProperty("/nuevoComentario", "");
              this._cargarComentarios();
            }.bind(this)
          )
          .catch(
            function (oError) {
              this.showError(oError);
            }.bind(this)
          );
      },

      onReportarPublicacion: function () {
        if (!this.requireLogin()) return;
        var sId = this._sId;
        MessageBox.confirm(this.getI18nText("comunidadReportarMotivo"), {
          onClose: function (sAction) {
            if (sAction !== MessageBox.Action.OK) return;
            api
              .post("/comunidad/Publicaciones('" + sId + "')/reportar", {
                motivo: "Reportado desde el detalle de la publicación."
              })
              .then(
                function (sMsg) {
                  this.showSuccess(sMsg);
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

      onReportarComentario: function (oEvent) {
        if (!this.requireLogin()) return;
        var oData = oEvent.getSource().getBindingContext("ui").getObject();
        MessageBox.confirm(this.getI18nText("comunidadReportarMotivo"), {
          onClose: function (sAction) {
            if (sAction !== MessageBox.Action.OK) return;
            api
              .post("/comunidad/Comentarios('" + oData.ID + "')/reportar", {
                motivo: "Reportado desde el detalle de la publicación."
              })
              .then(
                function (sMsg) {
                  this.showSuccess(sMsg);
                }.bind(this)
              )
              .catch(
                function (oError) {
                  this.showError(oError);
                }.bind(this)
              );
          }.bind(this)
        });
      }
    });
  }
);
