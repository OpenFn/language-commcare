'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.sourceValue = exports.fields = exports.field = undefined;
exports.execute = execute;
exports.submit = submit;

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

var _xml2json = require('xml2json');

var _xml2json2 = _interopRequireDefault(_xml2json);

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
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
  };
}

function submit(formId, formData) {

  return function (state) {

    var wishedExpressionOutput = {
      "data": {
        "name": "Patient Registration",
        "uiVersion": "1",
        "version": "9",
        "xmlns": "http://openrosa.org/formdesigner/2BCC3E88-2D0D-4C07-8D4A-6B372F3799D9",
        "xmlns:jrm": "http://dev.commcarehq.org/jr/xforms",
        "paitent_namentosh": "Tayla Moruki",
        "question2": "Make this work!",
        "question3": "Hks",
        "question4": "item1",
        "question5": "69855",
        "question6": "12",
        "n0:meta": {
          "xmlns:n0": "http://openrosa.org/jr/xforms",
          "n0:deviceID": "358239055789384",
          "n0:timeStart": "2015-08-21T16:21:59.807+02",
          "n0:timeEnd": "2015-08-21T16:22:15.987+02",
          "n0:username": "openfn",
          "n0:userID": "5fe615b3af2834cb5dca59f7466d6174",
          "n0:instanceID": "195e79eb-d823-46fe-9e4f-59b8327d5db2",
          "n1:appVersion": {
            "xmlns:n1": "http://commcarehq.org/xforms",
            "$t": "CommCare ODK, version \"2.22.0\"(370023). App v9. CommCare Version 2.22. Build 370023, built on: July-22-2015"
          }
        }
      }
    };

    var body = _xml2json2.default.toXml(wishedExpressionOutput);

    // TODO: connect to the expression output.
    // const jsonBody = expandReferences(formData)(state);
    // const body = parser.toXml(jsonBody);

    var _state$configuration = state.configuration;
    var applicationName = _state$configuration.applicationName;
    var username = _state$configuration.username;
    var password = _state$configuration.password;


    var url = 'https://www.commcarehq.org/a/'.concat(applicationName, '/receiver/submission/');

    console.log("Posting to url: ".concat(url));
    console.log("With body content: ".concat(body));

    return (0, _Client.post)({ url: url, body: body, username: username, password: password }).then(function (result) {
      console.log("Success:", result);
      return _extends({}, state, { references: [result].concat(_toConsumableArray(state.references)) });
    });
  };
}
