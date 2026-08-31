sap.ui.define(["./BaseController"], function (BaseController) {
  "use strict";

  return BaseController.extend("axisrecovery.ui.controller.Home", {
    onInit: function () {
      this.byId("cardRecursos").attachBrowserEvent("click", this.onGoRecursos, this);
      this.byId("cardApoyo").attachBrowserEvent("click", this.onGoApoyo, this);
      this.byId("cardEspecialistas").attachBrowserEvent("click", this.onGoEspecialistas, this);
      this.byId("cardComunidad").attachBrowserEvent("click", this.onGoComunidad, this);
      this.byId("cardSeguimiento").attachBrowserEvent("click", this.onGoSeguimiento, this);
    },
    onGoRecursos: function () {
      this.navTo("recursos", { modulo: "educativos" });
    },
    onGoApoyo: function () {
      this.navTo("recursos", { modulo: "psicologico" });
    },
    onGoEspecialistas: function () {
      this.navTo("especialistas");
    },
    onGoComunidad: function () {
      this.navTo("comunidad");
    },
    onGoSeguimiento: function () {
      this.navTo("seguimiento");
    }
  });
});
