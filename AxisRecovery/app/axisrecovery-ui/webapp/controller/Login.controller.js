sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel", "../model/api"], function (
  BaseController,
  JSONModel,
  api
) {
  "use strict";

  return BaseController.extend("axisrecovery.ui.controller.Login", {
    onInit: function () {
      this._resetModel();
    },

    _resetModel: function () {
      this.getView().setModel(
        new JSONModel({
          mode: "login",
          loginCorreo: "",
          loginContrasena: "",
          regNombre: "",
          regCorreo: "",
          regDeporte: "",
          regContrasena: "",
          regContrasenaConfirmar: "",
          cargando: false
        }),
        "ui"
      );
    },

    onModeSelect: function (oEvent) {
      this.getView().getModel("ui").setProperty("/mode", oEvent.getParameter("key"));
    },

    onLogin: function () {
      var oModel = this.getView().getModel("ui");
      var oData = oModel.getData();
      oModel.setProperty("/cargando", true);

      api
        .post("/auth/login", { correo: oData.loginCorreo, contrasena: oData.loginContrasena })
        .then(
          function (res) {
            oModel.setProperty("/cargando", false);
            if (!res.ok) {
              this.showError({ message: res.mensaje });
              return;
            }
            api.setToken(res.token);
            this.getOwnerComponent()
              .refreshSession()
              .then(
                function () {
                  this.showSuccess(res.mensaje);
                  this._resetModel();
                  this.navTo("home");
                }.bind(this)
              );
          }.bind(this)
        )
        .catch(
          function (oError) {
            oModel.setProperty("/cargando", false);
            this.showError(oError);
          }.bind(this)
        );
    },

    onRegister: function () {
      var oModel = this.getView().getModel("ui");
      var oData = oModel.getData();

      if (oData.regContrasena !== oData.regContrasenaConfirmar) {
        this.showError({ message: this.getI18nText("loginErrorPasswordsNoCoinciden") });
        return;
      }

      oModel.setProperty("/cargando", true);
      api
        .post("/auth/register", {
          nombre: oData.regNombre,
          correo: oData.regCorreo,
          contrasena: oData.regContrasena,
          deportePracticado: oData.regDeporte
        })
        .then(
          function (res) {
            oModel.setProperty("/cargando", false);
            if (!res.ok) {
              this.showError({ message: res.mensaje });
              return;
            }
            api.setToken(res.token);
            this.getOwnerComponent()
              .refreshSession()
              .then(
                function () {
                  this.showSuccess(res.mensaje);
                  this._resetModel();
                  this.navTo("home");
                }.bind(this)
              );
          }.bind(this)
        )
        .catch(
          function (oError) {
            oModel.setProperty("/cargando", false);
            this.showError(oError);
          }.bind(this)
        );
    }
  });
});
