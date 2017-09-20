'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.each = exports.sourceValue = exports.fields = exports.field = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /** @module Adaptor */

exports.execute = execute;
exports.submit = submit;
exports.fetchReportData = fetchReportData;

var _languageCommon = require('language-common');

Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, 'each', {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, 'merge', {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, 'dataPath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, 'dataValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, 'lastReferenceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _url = require('url');

var _js2xmlparser = require('js2xmlparser');

var _js2xmlparser2 = _interopRequireDefault(_js2xmlparser);

var _languageHttp = require('language-http');

var _languageHttp2 = _interopRequireDefault(_languageHttp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for commcare.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @function
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
function execute() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };

  return function (state) {
    state.configuration.authType = 'basic';
    state.configuration.baseUrl = "https://www.commcarehq.org/a/".concat(state.configuration.applicationName);
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
  };
}

/**
 * Performs a post request
 * @example
 *  clientPost(formData)
 * @function
 * @param {Object} _ref - referencse
 * @returns {State}
 */
function clientPost(_ref) {
  var url = _ref.url,
      body = _ref.body,
      username = _ref.username,
      password = _ref.password;

  return new Promise(function (resolve, reject) {
    _superagent2.default.post(url).auth(username, password).set('Content-Type', 'application/xml').send(body).end(function (error, res) {
      if (!!error || !res.ok) {
        reject(error);
      }
      resolve(res);
    });
  });
}

/**
 * Submit form data
 * @public
 * @example
 *  submit(
 *    fields(
 *      field("@", function(state) {
 *        return {
 *          "xmlns": "http://openrosa.org/formdesigner/form-id-here"
 *        };
 *      }),
 *      field("question1", dataValue("answer1")),
 *      field("question2", "Some answer here.")
 *    )
 *  )
 * @function
 * @param {Object} formData - Object including form data.
 * @returns {Operation}
 */
function submit(formData) {

  return function (state) {

    var jsonBody = (0, _languageCommon.expandReferences)(formData)(state);
    var body = (0, _js2xmlparser2.default)("data", jsonBody);

    var _state$configuration = state.configuration,
        applicationName = _state$configuration.applicationName,
        username = _state$configuration.username,
        password = _state$configuration.password,
        appId = _state$configuration.appId,
        hostUrl = _state$configuration.hostUrl;


    var url = (hostUrl || "https://www.commcarehq.org").concat('/a/', applicationName, '/receiver/', appId, '/');

    console.log("Posting to url: ".concat(url));
    console.log("Raw JSON body: ".concat(JSON.stringify(jsonBody)));
    console.log("X-form submission: ".concat(body));

    return clientPost({
      url: url,
      body: body,
      username: username,
      password: password
    }).then(function (response) {
      console.log('Server repsonded with a ' + response.status + ':');
      console.log(response);
      return _extends({}, state, {
        references: [response].concat(_toConsumableArray(state.references))
      });
    });
  };
}

/**
 * Make a GET request to CommCare's Reports Api
 * and POST the response it somewhere else
 * @public
 * @example
 *  fetchReportData(reportId, params, postUrl)
 * @constructor
 * @param {String} reportId - API name of the report.
 * @param {Object} params - Query params, incl: limit, offset, and custom report filters.
 * @param {String} postUrl - Url to which the response object will be posted.
 * @returns {Operation}
 */
function fetchReportData(reportId, params, postUrl) {
  var get = _languageHttp2.default.get,
      post = _languageHttp2.default.post;


  return get('api/v0.5/configurablereportdata/' + reportId + '/', {
    query: function query(state) {
      console.log("getting from url: ".concat(state.configuration.baseUrl, '/api/v0.5/configurablereportdata/' + reportId + '/'));
      console.log("with params: ".concat(params));
      return params;
    },
    callback: function callback(state) {
      var reportData = state.response.body;
      return post(postUrl, {
        body: reportData
      })(state).then(function (state) {
        delete state.response;
        console.log("fetchReportData succeeded.");
        console.log("Posted to: ".concat(postUrl));
        return state;
      });
    }
  });
}
