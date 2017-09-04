import { execute as commonExecute, expandReferences } from 'language-common';
import request from 'superagent';
import { resolve as resolveUrl } from 'url';
import js2xmlparser from 'js2xmlparser';
import Adaptor from 'language-http';
const { get, post } = Adaptor;

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
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  }

  return state => {
    state.configuration.authType = 'basic';
    state.configuration.baseUrl = "https://www.commcarehq.org/a/".concat(state.configuration.applicationName)
    return commonExecute(...operations)({...initialState,
      ...state
    })
  };

}

function clientPost({ url, body, username, password }) {
  return new Promise((resolve, reject) => {
    request.post(url)
    .auth(username, password)
    .set('Content-Type', 'application/xml')
    .send(body)
    .end((error, res) => {
      if (!!error || !res.ok) {
        reject(error)
      }
      resolve(res)
    })

  })
}

export function submit(formData) {

  return state => {

    const jsonBody = expandReferences(formData)(state);
    const body = js2xmlparser("data", jsonBody);

    const {
      // this should be called project URL.
      // it is what lives after www.commcarehq.org/a/...
      applicationName,
      username,
      password,
      appId,
      hostUrl
    } = state.configuration;

    const url = (hostUrl || "https://www.commcarehq.org").concat('/a/', applicationName, '/receiver/', appId, '/');

    console.log("Posting to url: ".concat(url));
    console.log("Raw JSON body: ".concat(JSON.stringify(jsonBody)));
    console.log("X-form submission: ".concat(body));

    return clientPost({
      url,
      body,
      username,
      password
    })
    .then((response) => {
      console.log(`Server repsonded with a ${response.status}:`);
      console.log(repsonse);
      return {...state,
        references: [response, ...state.references]
      }
    });

  }
}

/**
 * Make a GET request to CommCare's Reports Api
 * and POST the response it somewhere else
 * @example
 * execute(
 *   fetchReportData(reportId, params, postUrl)
 * )(state)
 * @constructor
 * @param {String} reportId - API name of the report.
 * @param {Object} params - Query params, incl: limit, offset, and custom report filters.
 * @param {String} postUrl - Url to which the response object will be posted.
 * @returns {Operation}
 */
export function fetchReportData(reportId, params, postUrl) {

  return get(`api/v0.5/configurablereportdata/${ reportId }/`, {
    query: function(state) {
      console.log("getting from url: ".concat(state.configuration.baseUrl, `/api/v0.5/configurablereportdata/${ reportId }/`))
      console.log("with params: ".concat(params))
      return params
    },
    callback: function(state) {
      var reportData = state.response.body;
      return post(postUrl, {
          body: reportData
        })(state)
        .then(function(state) {
          delete state.response
          console.log("fetchReportData succeeded.")
          console.log("Posted to: ".concat(postUrl))
          return state;
        })
    }
  })
}

export {
  field,
  fields,
  sourceValue,
  each,
  merge,
  dataPath,
  dataValue,
  lastReferenceValue
}
from 'language-common';
