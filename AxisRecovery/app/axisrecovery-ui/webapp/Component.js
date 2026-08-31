sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/Device", "sap/ui/model/json/JSONModel", "axisrecovery/ui/model/api"],
  function (UIComponent, Device, JSONModel, api) {
    "use strict";

    return UIComponent.extend("axisrecovery.ui.Component", {
      metadata: {
        manifest: "json"
      },

      init: function () {
        UIComponent.prototype.init.apply(this, arguments);

        // Modelo de dispositivo, útil para adaptar vistas según sea PC o móvil.
        var oDeviceModel = new JSONModel(Device);
        oDeviceModel.setDefaultBindingMode("OneWay");
        this.setModel(oDeviceModel, "device");

        // Modelo de sesión, disponible en toda la app como "session>/...".
        var oSessionModel = new JSONModel({
          cargando: true,
          autenticado: false,
          id: "",
          nombre: "",
          correo: "",
          rol: ""
        });
        this.setModel(oSessionModel, "session");
        this.refreshSession();

        this.getRouter().initialize();
      },

      /** Vuelve a consultar quién es el usuario actual (según el token guardado en localStorage). */
      refreshSession: function () {
        var oSessionModel = this.getModel("session");
        oSessionModel.setProperty("/cargando", true);
        return api
          .get("/auth/me()")
          .then(function (data) {
            oSessionModel.setData(Object.assign({ cargando: false }, data));
          })
          .catch(function () {
            oSessionModel.setData({
              cargando: false,
              autenticado: false,
              id: "",
              nombre: "",
              correo: "",
              rol: ""
            });
          });
      },

      logout: function () {
        api.setToken("");
        return this.refreshSession();
      }
    });
  }
);
