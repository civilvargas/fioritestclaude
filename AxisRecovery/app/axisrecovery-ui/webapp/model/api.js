sap.ui.define([], function () {
  "use strict";

  // Todas las llamadas se hacen con fetch() plano contra los servicios OData V4 de CAP.
  // Se evita el modelo declarativo sap.ui.model.odata.v4 a propósito para mantener el
  // manejo de la sesión (token en localStorage) simple y bajo nuestro control total.

  var TOKEN_KEY = "axisrecovery_token";

  function getToken() {
    try {
      return window.localStorage.getItem(TOKEN_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function setToken(sToken) {
    try {
      if (sToken) {
        window.localStorage.setItem(TOKEN_KEY, sToken);
      } else {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      // localStorage no disponible: la sesión no persistirá entre recargas.
    }
  }

  function buildHeaders(extra) {
    var headers = Object.assign(
      { "Content-Type": "application/json", "Accept": "application/json" },
      extra || {}
    );
    var token = getToken();
    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }
    return headers;
  }

  /**
   * Ejecuta una llamada HTTP contra un servicio OData V4 de CAP y devuelve el JSON de respuesta.
   * - Para funciones OData (GET) el path debe incluir los paréntesis, ej: "/auth/me()".
   * - Para acciones OData (POST) el path NO lleva paréntesis, ej: "/auth/login".
   * - Para lecturas de entidades: path = "/recursos/Recursos?$filter=...".
   */
  function call(method, path, body) {
    var url = path.indexOf("/odata/v4") === 0 ? path : "/odata/v4" + path;
    var options = {
      method: method,
      headers: buildHeaders(),
      credentials: "same-origin"
    };
    if (body !== undefined && body !== null) {
      options.body = JSON.stringify(body);
    }
    return fetch(url, options).then(function (res) {
      return res
        .json()
        .catch(function () {
          return {};
        })
        .then(function (data) {
          if (!res.ok) {
            var mensaje =
              (data && data.error && data.error.message) ||
              (data && data.message) ||
              "Ocurrió un error inesperado (" + res.status + ").";
            var error = new Error(mensaje);
            error.status = res.status;
            error.payload = data;
            throw error;
          }
          // Las acciones/funciones OData V4 de CAP devuelven el resultado directamente;
          // por robustez, si viniera envuelto en "value" (algunas configuraciones lo hacen), lo desenvolvemos.
          if (data && Object.prototype.hasOwnProperty.call(data, "value") && Object.keys(data).length <= 2) {
            return data.value;
          }
          return data;
        });
    });
  }

  function get(path) {
    return call("GET", path);
  }

  function post(path, body) {
    return call("POST", path, body || {});
  }

  function patch(path, body) {
    return call("PATCH", path, body || {});
  }

  function del(path) {
    return call("DELETE", path);
  }

  /** Lee una colección de entidades OData V4; siempre devuelve un array (aunque venga vacío o falle). */
  function getList(path) {
    return get(path).then(function (data) {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.value)) return data.value;
      return [];
    });
  }

  return {
    getToken: getToken,
    setToken: setToken,
    get: get,
    post: post,
    patch: patch,
    delete: del,
    getList: getList
  };
});
