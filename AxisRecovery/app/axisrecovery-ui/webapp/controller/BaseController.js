sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/m/MessageBox"],
  function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("axisrecovery.ui.controller.BaseController", {
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },

      getSessionModel: function () {
        return this.getOwnerComponent().getModel("session");
      },

      getI18nText: function (sKey, aArgs) {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
      },

      navTo: function (sRoute, oParams) {
        this.getRouter().navTo(sRoute, oParams);
      },

      /** Muestra un mensaje de error corto, extrayendo el texto desde un error de model/api.js. */
      showError: function (oError) {
        var sMsg = (oError && oError.message) || this.getI18nText("commonErrorGenerico");
        MessageBox.error(sMsg);
      },

      showSuccess: function (sMsg) {
        MessageToast.show(sMsg);
      },

      /** Si el usuario no está autenticado, lo manda a la pantalla de login y devuelve false. */
      requireLogin: function () {
        var oSession = this.getSessionModel().getData();
        if (!oSession.autenticado) {
          this.navTo("login");
          return false;
        }
        return true;
      }
    });
  }
);
