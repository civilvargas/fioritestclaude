sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("mantenedorDatosUsuario.controller.App", {
		onCreate: function () {
			var oTable = this.byId("usuariosTable");
			var oBinding = oTable.getBinding("items");
			var oContext = oBinding.create({
				Nombre: "",
				Apellido: "",
				Rut: "",
				Edad: null,
				FechaNacimiento: null,
				Estado: "Activo"
			});

			oTable.getItems().some(function (oItem) {
				if (oItem.getBindingContext() === oContext) {
					oItem.getCells()[1].focus();
					return true;
				}
				return false;
			});
		},

		onDelete: function (oEvent) {
			var oContext = oEvent.getParameter("listItem").getBindingContext();

			MessageBox.confirm("¿Eliminar este usuario?", {
				onClose: function (sAction) {
					if (sAction === MessageBox.Action.OK) {
						oContext.delete().then(function () {
							MessageToast.show("Usuario eliminado");
						}, function (oError) {
							MessageBox.error(oError.message || "No se pudo eliminar el usuario");
						});
					}
				}
			});
		}
	});
});
