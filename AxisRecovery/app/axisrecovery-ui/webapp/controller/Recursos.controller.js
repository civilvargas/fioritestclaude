sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel", "../model/api"], function (
  BaseController,
  JSONModel,
  api
) {
  "use strict";

  return BaseController.extend("axisrecovery.ui.controller.Recursos", {
    onInit: function () {
      this.getView().setModel(
        new JSONModel({
          modulo: "educativos",
          titulo: "",
          esApoyo: false,
          categoriaFiltro: "",
          categoriaOpciones: [],
          recursos: []
        }),
        "ui"
      );
      this.getRouter().getRoute("recursos").attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function (oEvent) {
      var sModulo = oEvent.getParameter("arguments").modulo === "psicologico" ? "psicologico" : "educativos";
      var sModuloCds = sModulo === "psicologico" ? "apoyo_psicologico" : "recursos_educativos";
      var oModel = this.getView().getModel("ui");

      oModel.setProperty("/modulo", sModulo);
      oModel.setProperty("/moduloCds", sModuloCds);
      oModel.setProperty("/esApoyo", sModulo === "psicologico");
      oModel.setProperty(
        "/titulo",
        sModulo === "psicologico" ? this.getI18nText("recursosTitleApoyo") : this.getI18nText("recursosTitleEducativos")
      );
      oModel.setProperty("/iconoModulo", sModulo === "psicologico" ? "img/icon-apoyo.png" : "img/icon-recursos.png");
      oModel.setProperty("/categoriaFiltro", "");

      this._cargarCategorias(sModuloCds);
      this._cargarRecursos(sModuloCds, "");
    },

    _cargarCategorias: function (sModuloCds) {
      var oModel = this.getView().getModel("ui");
      api
        .getList("/recursos/Categorias?$filter=" + encodeURIComponent("modulo eq '" + sModuloCds + "'"))
        .then(
          function (aCategorias) {
            var aOpciones = [{ key: "", text: this.getI18nText("recursosFiltroTodos") }];
            aCategorias.forEach(function (oCat) {
              aOpciones.push({ key: oCat.ID, text: oCat.nombre });
            });
            oModel.setProperty("/categoriaOpciones", aOpciones);
          }.bind(this)
        )
        .catch(function () {
          // Silencioso: si falla el filtro de categorías, igual se muestran los recursos.
        });
    },

    _cargarRecursos: function (sModuloCds, sCategoriaId) {
      var oModel = this.getView().getModel("ui");
      var sFilter = "categoriaModulo eq '" + sModuloCds + "'";
      if (sCategoriaId) {
        sFilter += " and categoria_ID eq '" + sCategoriaId + "'";
      }
      api
        .getList("/recursos/Recursos?$filter=" + encodeURIComponent(sFilter))
        .then(function (aRecursos) {
          oModel.setProperty("/recursos", aRecursos);
        })
        .catch(
          function (oError) {
            this.showError(oError);
          }.bind(this)
        );
    },

    onFiltrar: function () {
      var oModel = this.getView().getModel("ui");
      this._cargarRecursos(oModel.getProperty("/moduloCds"), oModel.getProperty("/categoriaFiltro"));
    },

    onVerEspecialistas: function () {
      this.navTo("especialistas");
    },

    onAbrirRecurso: function (oEvent) {
      var oContexto = oEvent.getSource().getBindingContext("ui");
      var sUrl = oContexto && oContexto.getProperty("urlContenido");
      if (sUrl) {
        window.open(sUrl, "_blank", "noopener");
      }
    },

    formatTipoIcon: function (sTipo) {
      var oIcons = {
        video: "img/icon-tipo-video.png",
        guia: "img/icon-tipo-guia.png",
        infografia: "img/icon-tipo-infografia.png",
        articulo: "img/icon-tipo-articulo.png"
      };
      return oIcons[sTipo] || "img/icon-tipo-articulo.png";
    }
  });
});
