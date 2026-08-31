sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel", "../model/api"], function (
  BaseController,
  JSONModel,
  api
) {
  "use strict";

  return BaseController.extend("axisrecovery.ui.controller.Especialistas", {
    onInit: function () {
      this.getView().setModel(
        new JSONModel({
          especialidadFiltro: "",
          especialidadOpciones: [],
          especialistas: []
        }),
        "ui"
      );
      this._cargarEspecialidades();
      this._cargarEspecialistas("");
    },

    _cargarEspecialidades: function () {
      var oModel = this.getView().getModel("ui");
      api
        .getList("/especialistas/Especialidades")
        .then(
          function (aEspecialidades) {
            var aOpciones = [{ key: "", text: this.getI18nText("especialistasFiltroTodos") }];
            aEspecialidades.forEach(function (oEsp) {
              aOpciones.push({ key: oEsp.ID, text: oEsp.nombre });
            });
            oModel.setProperty("/especialidadOpciones", aOpciones);
          }.bind(this)
        )
        .catch(function () {});
    },

    _cargarEspecialistas: function (sEspecialidadId) {
      var oModel = this.getView().getModel("ui");
      var sPath = "/especialistas/Especialistas";
      if (sEspecialidadId) {
        sPath += "?$filter=" + encodeURIComponent("especialidad_ID eq '" + sEspecialidadId + "'");
      }
      api
        .getList(sPath)
        .then(function (aEspecialistas) {
          oModel.setProperty("/especialistas", aEspecialistas);
        })
        .catch(
          function (oError) {
            this.showError(oError);
          }.bind(this)
        );
    },

    onFiltrar: function () {
      var oModel = this.getView().getModel("ui");
      this._cargarEspecialistas(oModel.getProperty("/especialidadFiltro"));
    },

    _getContextData: function (oEvent) {
      return oEvent.getSource().getBindingContext("ui").getObject();
    },

    onWhatsapp: function (oEvent) {
      var oData = this._getContextData(oEvent);
      var sNumero = (oData.whatsapp || "").replace(/[^0-9]/g, "");
      window.open("https://wa.me/" + sNumero, "_blank");
    },

    onCorreo: function (oEvent) {
      var oData = this._getContextData(oEvent);
      window.open("mailto:" + oData.correo, "_blank");
    },

    onTelefono: function (oEvent) {
      var oData = this._getContextData(oEvent);
      window.open("tel:" + oData.telefono, "_blank");
    }
  });
});
