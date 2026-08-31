sap.ui.define(["./BaseController"], function (BaseController) {
  "use strict";

  return BaseController.extend("axisrecovery.ui.controller.NotFound", {
    onVolver: function () {
      this.navTo("home");
    }
  });
});
