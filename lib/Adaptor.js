"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.submitXls = submitXls;
exports.submit = submit;
exports.fetchReportData = fetchReportData;
Object.defineProperty(exports, "alterState", {
  enumerable: true,
  get: function () {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, "arrayToString", {
  enumerable: true,
  get: function () {
    return _languageCommon.arrayToString;
  }
});
Object.defineProperty(exports, "combine", {
  enumerable: true,
  get: function () {
    return _languageCommon.combine;
  }
});
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

var _formData = _interopRequireDefault(require("form-data"));

var _axios = _interopRequireDefault(require("axios"));

var _url = require("url");

var _js2xmlparser = _interopRequireDefault(require("js2xmlparser"));

var _languageHttp = _interopRequireDefault(require("language-http"));

var _xlsx = _interopRequireDefault(require("xlsx"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @module Adaptor */
// import request from 'request';

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
 * Convert form data to xls then submit.
 * @public
 * @example
 * submitXls([name, phone],
 *    [
 *      {name: 'Mamadou', phone: '000000'},
 *    ]
 * )
 * @constructor
 * @param {Object} keys - Array of headers.
 * @param {Object} formData - Object including form data.
 * @returns {Operation}
 */


function submitXls(keys, formData) {
  return state => {
    let wb = _xlsx.default.utils.book_new();

    let ws = _xlsx.default.utils.json_to_sheet(formData);

    var ws_name = 'SheetJS';

    _xlsx.default.utils.book_append_sheet(wb, ws, ws_name); // generate buffer


    var buf = _xlsx.default.write(wb, {
      type: 'buffer',
      bookType: 'biff5'
    }); // xlsx.writeFile(wb, 'out.xls');


    console.log(buf);
    const {
      applicationName,
      hostUrl,
      username,
      password
    } = state.configuration;
    const url = (hostUrl || 'https://www.commcarehq.org:443').concat('/a/', applicationName, '/importer/excel/bulk_upload_api/');
    let data = new _formData.default();
    var CRLF = '\r\n';
    var options = {
      header: CRLF + '--' + data.getBoundary() + CRLF + 'X-Custom-Header: 123' + CRLF + CRLF,
      knownLength: 1
    };
    data.append('file', buf, options); // data.append('file', fs.createReadStream('./out.xls'));

    data.append('case_type', 'student');
    data.append('search_field', 'external_id');
    data.append('create_new_cases', 'on');
    console.log('Posting to url: '.concat(url)); // https://requestbin.com/r/en84a5jxju98o/1oyrsf7BKC9rOeoxWNTVlqmUVH1 --> look here at the headers.
    // console.log(form);

    return _languageCommon.http.post({
      url,
      // 'https://www.commcarehq.org:443/a/empleando-futuros-pilot/importer/excel/bulk_upload_api/',
      // url: 'https://en84a5jxju98o.x.pipedream.net/from-adaptor',
      data: data,
      // auth: { username, password },
      headers: {
        Authorization: 'Basic YWxla3NhQG9wZW5mbi5vcmc6ZGF0YUAyMDE5',
        ...data.getHeaders()
      }
    })(state).then(res => {
      console.log('success', res);
    }).catch(err => {
      console.log('there is an error', err);
    });
    /*  const headers = form.getHeaders();
    console.log('headers', headers);
     const formData = {
      // Pass data via Buffers
      file: buf,
      case_type: 'student',
      search_field: 'external_id',
      create_new_cases: 'on',
    }; */
    // https://www.npmjs.com/package/request#multipartform-data-multipart-form-uploads
    // return new Promise((resolve, reject) => {
    //   console.log('Posting to url: '.concat(url));
    //   request.post(
    //     {
    //       url: 'https://www.commcarehq.org:443/a/empleando-futuros-pilot/importer/excel/bulk_upload_api/',
    //       method: "POST",
    //       formData: formData,
    //       auth: {
    //         'user': username,
    //         'pass': password,
    //       },
    //       // followAllRedirects: true
    //     },
    //     function optionalCallback(err, httpResponse, body) {
    //       if (err) {
    //         reject(err);
    //       }
    //       // console.log(httpResponse);
    //       console.log('Upload successful!  Server responded with code:', httpResponse.statusCode);
    //       console.log('Upload successful!  Server responded with method:', httpResponse.request.method);
    //       console.log('Upload successful!  Server responded with href:', httpResponse.request.href);
    //       console.log('Upload successful!  Server responded with:', body);
    //       resolve(state);
    //     }
    //   );
    // })
    // form.pipe(request)
    // return request.on('response', function(res) {
    //   console.log(res);
    // });

    /*  return axios
      .post(
        url,
        { form },
        {
          headers: {
            ...form.getHeaders(),
            authorization: 'Basic YWxla3NhQG9wZW5mbi5vcmc6ZGF0YUAyMDE5',
          },
        }
      )
      .then(res => {
        console.log(`success`);
        return res;
      })
      .catch(err => {
        console.log('error', err);
        console.log('bad headers', err.config.headers);
        throw 'oops';
      }); */
  };
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
