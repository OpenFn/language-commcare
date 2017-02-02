import request from 'superagent'

export function post({ url, body, username, password }) {
  return new Promise((resolve, reject) => {
    request.post(url)
    .auth(username, password)
    .set('Content-Type', 'application/xml')
    .send(body)
    .end((error, res) => {
      if (!!error || !res.ok) {
        reject( error )
      }

      resolve( res )
    })

  })
}
