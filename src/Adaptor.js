import { execute as commonExecute, expandReferences } from 'language-common';
import { post } from './Client';
import { resolve as resolveUrl } from 'url';

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

    const jsonBody = expandReferences(formData)(state);
    const body = convertJsonToXml(jsonBody);

    const { applicationName, username, password } = state.configuration;

    const url = `https://www.commcarehq.org/a/`.concat(applicationName, '/receiver/submission/')

    console.log("POST URL:");
    console.log(url)
    console.log("POST body:");
    console.log(body)

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
