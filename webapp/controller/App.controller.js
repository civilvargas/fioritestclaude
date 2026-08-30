sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/BusyIndicator"
], function (Controller, BusyIndicator) {
	"use strict";

	return Controller.extend("firstproject.controller.App", {
		onShowBusy: function () {
			BusyIndicator.show(0);

			setTimeout(function () {
				BusyIndicator.hide();
			}, 3000);
		}
	});
});
