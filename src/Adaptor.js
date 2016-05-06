import { execute as commonExecute, expandReferences } from 'language-common';
import { post } from './Client';
import { resolve as resolveUrl } from 'url';
import parser from 'xml2json';

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
    return commonExecute(...operations)({ ...initialState, ...state })
  };

}

export function submit(formId, formData) {

  return state => {

  const wishedExpressionOutput =
  {
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
  }

  const body = parser.toXml(wishedExpressionOutput);

    // TODO: connect to the expression output.
    // const jsonBody = expandReferences(formData)(state);
    // const body = parser.toXml(jsonBody);

    const { applicationName, username, password } = state.configuration;

    const url = `https://www.commcarehq.org/a/`.concat(applicationName, '/receiver/submission/')

    console.log("Posting to url: ". concat(url));
    console.log("With body content: ".concat(body));

    return post({ url, body, username, password })
    .then((result) => {
      console.log("Success:", result);
      return { ...state, references: [ result, ...state.references ] }
    })

  }
}

export {
  field, fields, sourceValue,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
