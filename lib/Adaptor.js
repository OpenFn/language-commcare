'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.each = exports.sourceValue = exports.fields = exports.field = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var _Client = require('./Client');

var _url = require('url');

var _js2xmlparser = require('js2xmlparser');

var _js2xmlparser2 = _interopRequireDefault(_js2xmlparser);

var _languageHttp = require('language-http');

var _languageHttp2 = _interopRequireDefault(_languageHttp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var get = _languageHttp2.default.get;
var post = _languageHttp2.default.post;

/** @module Adaptor */

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for commcare.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
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

function submit(formData) {

  return function (state) {

    var jsonBody = (0, _languageCommon.expandReferences)(formData)(state);
    var body = (0, _js2xmlparser2.default)("data", jsonBody);

    var _state$configuration = state.configuration;
    var applicationName = _state$configuration.applicationName;
    var username = _state$configuration.username;
    var password = _state$configuration.password;
    var appId = _state$configuration.appId;


    var url = 'https://www.commcarehq.org/a/'.concat(applicationName, '/receiver/', appId, '/');

    console.log("Posting to url: ".concat(url));
    console.log("Raw JSON body: ".concat(JSON.stringify(jsonBody)));
    console.log("X-form submission: ".concat(body));

    return (0, _Client.cPost)({
      url: url,
      body: body,
      username: username,
      password: password
    }).then(function (result) {
      console.log("Success:", result);
      return _extends({}, state, {
        references: [result].concat(_toConsumableArray(state.references))
      });
    });
  };
}

/**
 * Make a GET request and POST it somewhere else
 * @example
 * execute(
 *   fetchReportData(reportId, postUrl)
 * )(state)
 * @constructor
 * @param {object} params - data to make the fetch
 * @returns {Operation}
 */
function fetchReportData(reportId, params, postUrl) {

  return get('api/v0.5/configurablereportdata/' + reportId + '/', {
    query: function query(state) {
      console.log("getting from url: ".concat(state.configuration.baseUrl, '/api/v0.5/configurablereportdata/' + reportId + '/'));
      console.log("with params: ".concat(params));
      return params;
    },
    callback: function callback(state) {
      // Pick submissions out in order to avoid `post` overwriting `response`.
      var submissions = [state.response.body];
      // return submissions
      return submissions.reduce(function (acc, item) {
        return acc.then(post(postUrl, {
          body: item
        }));
      }, Promise.resolve(state)).then(function (state) {
        delete state.response;
        console.log("fetchSubmissions succeeded.");
        return state;
      });
    }
  });
}
