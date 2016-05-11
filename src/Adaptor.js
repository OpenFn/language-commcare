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

export function submit(formData) {

  return state => {

    const jsonBody = { "data": expandReferences(formData)(state) };
    const body = parser.toXml(jsonBody);

    const { applicationName, username, password } = state.configuration;

    const url = `https://www.commcarehq.org/a/`.concat(applicationName, '/receiver/submission/')

    console.log("posting to url: ". concat(url));
    console.log("raw JSON body: ".concat(jsonBody));
    console.log("x-form submission: ".concat(body));

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
