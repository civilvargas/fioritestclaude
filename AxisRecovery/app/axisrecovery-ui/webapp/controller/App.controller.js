sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("axisrecovery.ui.controller.App", {
    onInit: function () {},

    _navTo: function (sRoute, oParams) {
      this.getOwnerComponent().getRouter().navTo(sRoute, oParams);
    },

    onNavHome: function () {
      this._navTo("home");
    },
    onNavRecursos: function () {
      this._navTo("recursos", { modulo: "educativos" });
    },
    onNavApoyo: function () {
      this._navTo("recursos", { modulo: "psicologico" });
    },
    onNavEspecialistas: function () {
      this._navTo("especialistas");
    },
    onNavComunidad: function () {
      this._navTo("comunidad");
    },
    onNavSeguimiento: function () {
      this._navTo("seguimiento");
    },
    onNavContacto: function () {
      this._navTo("contacto");
    },
    onNavAdmin: function () {
      this._navTo("admin");
    },
    onNavLogin: function () {
      this._navTo("login");
    },
    onLogout: function () {
      this.getOwnerComponent()
        .logout()
        .then(
          function () {
            this._navTo("home");
          }.bind(this)
        );
    }
  });
});
