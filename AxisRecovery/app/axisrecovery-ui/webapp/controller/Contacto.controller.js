sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel", "../model/api"], function (
  BaseController,
  JSONModel,
  api
) {
  "use strict";

  return BaseController.extend("axisrecovery.ui.controller.Contacto", {
    onInit: function () {
      this.getView().setModel(
        new JSONModel({
          nombre: "",
          correo: "",
          mensaje: "",
          canalPreferido: "whatsapp"
        }),
        "ui"
      );
    },

    onEnviar: function () {
      var oModel = this.getView().getModel("ui");
      var oData = oModel.getData();
      if (!oData.nombre || !oData.correo || !oData.mensaje) {
        this.showError({ message: "Completa nombre, correo y mensaje." });
        return;
      }
      api
        .post("/contacto/Mensajes", {
          nombre: oData.nombre,
          correo: oData.correo,
          mensaje: oData.mensaje,
          canalPreferido: oData.canalPreferido
        })
        .then(
          function () {
            this.showSuccess(this.getI18nText("contactoEnviado"));
            oModel.setProperty("/mensaje", "");
          }.bind(this)
        )
        .catch(
          function (oError) {
            this.showError(oError);
          }.bind(this)
        );
    },

    onAbrirWhatsapp: function () {
      window.open("https://wa.me/56955551005", "_blank");
    }
  });
});
