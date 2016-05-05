import request from 'superagent'

export function post({ url, body, authToken, apiVersion, action }) {
  return new Promise((resolve, reject) => {
    request.post(url)
    .type('form')
    .query({
      "commcare_ACTION": action,
      "commcare_OUTPUT_FORMAT": "JSON",
      "commcare_ERROR_FORMAT": "JSON",
      "authtoken": authToken,
      "commcare_API_VERSION": apiVersion
    })
    .send(body)
    .end((error, res) => {
      if (!!error || !res.ok) {
        reject( error )
      }

      resolve( res )
    })

  })
}
