import request from 'superagent'

export function post({ url, body, username, password }) {
  return new Promise((resolve, reject) => {
    request.post(url)
    .auth(username, password)
    /* OpenRosa standards say to use multipart/form-data,
       .set('Content-Type', 'multipart/form-data')
    but CommCare says that they'll take XML as the body of a post... */
    .set('Content-Type', 'appliaction/xml')
    .send(body)
    .end((error, res) => {
      if (!!error || !res.ok) {
        reject( error )
      }

      resolve( res )
    })

  })
}
