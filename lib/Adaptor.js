"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.submit = submit;
exports.fetchReportData = fetchReportData;
Object.defineProperty(exports, "dataPath", {
  enumerable: true,
  get: function () {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, "dataValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, "each", {
  enumerable: true,
  get: function () {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, "field", {
  enumerable: true,
  get: function () {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, "fields", {
  enumerable: true,
  get: function () {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, "http", {
  enumerable: true,
  get: function () {
    return _languageCommon.http;
  }
});
Object.defineProperty(exports, "lastReferenceValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, "merge", {
  enumerable: true,
  get: function () {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, "sourceValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.sourceValue;
  }
});

var _languageCommon = require("@openfn/language-common");

var _superagent = _interopRequireDefault(require("superagent"));

var _url = require("url");

var _js2xmlparser = _interopRequireDefault(require("js2xmlparser"));

var _languageHttp = _interopRequireDefault(require("language-http"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @module Adaptor */

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
function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  };
  return state => {
    state.configuration.authType = 'basic';
    state.configuration.baseUrl = 'https://www.commcarehq.org/a/'.concat(state.configuration.applicationName);
    return (0, _languageCommon.execute)(...operations)({ ...initialState,
      ...state
    });
  };
}
/**
 * Performs a post request
 * @example
 *  clientPost(formData)
 * @function
 * @param {Object} formData - Form Data with auth params and body
 * @returns {State}
 */


function clientPost({
  url,
  body,
  username,
  password
}) {
  return new Promise((resolve, reject) => {
    _superagent.default.post(url).auth(username, password).set('Content-Type', 'application/xml').send(body).end((error, res) => {
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
 * @constructor
 * @param {Object} formData - Object including form data.
 * @returns {Operation}
 */


function submit(formData) {
  return state => {
    const jsonBody = (0, _languageCommon.expandReferences)(formData)(state);
    const body = (0, _js2xmlparser.default)('data', jsonBody);
    const {
      // this should be called project URL.
      // it is what lives after www.commcarehq.org/a/...
      applicationName,
      username,
      password,
      appId,
      hostUrl
    } = state.configuration;
    const url = (hostUrl || 'https://www.commcarehq.org').concat('/a/', applicationName, '/receiver/', appId, '/');
    console.log('Posting to url: '.concat(url));
    console.log('Raw JSON body: '.concat(JSON.stringify(jsonBody)));
    console.log('X-form submission: '.concat(body));
    return clientPost({
      url,
      body,
      username,
      password
    }).then(response => {
      console.log(`Server repsonded with a ${response.status}:`);
      console.log(response);
      return { ...state,
        references: [response, ...state.references]
      };
    });
  };
}
/**
 * Make a GET request to CommCare's Reports Api
 * and POST the response to somewhere else.
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
  const {
    get,
    post
  } = _languageHttp.default;
  return get(`api/v0.5/configurablereportdata/${reportId}/`, {
    query: function (state) {
      console.log('getting from url: '.concat(state.configuration.baseUrl, `/api/v0.5/configurablereportdata/${reportId}/`));
      console.log('with params: '.concat(params));
      return params;
    },
    callback: function (state) {
      var reportData = state.response.body;
      return post(postUrl, {
        body: reportData
      })(state).then(function (state) {
        delete state.response;
        console.log('fetchReportData succeeded.');
        console.log('Posted to: '.concat(postUrl));
        return state;
      });
    }
  });
}
