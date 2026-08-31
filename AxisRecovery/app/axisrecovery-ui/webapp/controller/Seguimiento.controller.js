sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel", "../model/api"], function (
  BaseController,
  JSONModel,
  api
) {
  "use strict";

  return BaseController.extend("axisrecovery.ui.controller.Seguimiento", {
    onInit: function () {
      this.getView().setModel(
        new JSONModel({
          nivelAnimo: 3,
          nivelDolor: 3,
          etapaRecuperacion: "diagnostico",
          notaLibre: "",
          historial: []
        }),
        "ui"
      );
      this.getRouter().getRoute("seguimiento").attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function () {
      if (!this.requireLogin()) return;
      this._cargarHistorial();
    },

    _cargarHistorial: function () {
      var oModel = this.getView().getModel("ui");
      api
        .getList("/seguimiento/MisRegistros")
        .then(function (aHistorial) {
          oModel.setProperty("/historial", aHistorial);
        })
        .catch(
          function (oError) {
            this.showError(oError);
          }.bind(this)
        );
    },

    onGuardar: function () {
      if (!this.requireLogin()) return;
      var oModel = this.getView().getModel("ui");
      var oData = oModel.getData();
      api
        .post("/seguimiento/MisRegistros", {
          nivelAnimo: oData.nivelAnimo,
          nivelDolor: oData.nivelDolor,
          etapaRecuperacion: oData.etapaRecuperacion,
          notaLibre: oData.notaLibre
        })
        .then(
          function () {
            oModel.setProperty("/notaLibre", "");
            this.showSuccess("Registro guardado.");
            this._cargarHistorial();
          }.bind(this)
        )
        .catch(
          function (oError) {
            this.showError(oError);
          }.bind(this)
        );
    }
  });
});
