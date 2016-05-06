Language CommCare
=================

Language Pack for sending messages using the commcare API.

https://confluence.dimagi.com/display/commcarepublic/Submission+API

https://bitbucket.org/javarosa/javarosa/wiki/FormSubmissionAPI

Documentation
-------------

### submit
WIP: I haven't wired up the output of an expression to the client yet. The
expression will likely look something like this:

```js
submit(
  form(...),
  fields(...)
))
```

An open rosa form submission body should look like this:
```xml
<?xml version="1.0" ?>
<data name="Patient Registration" uiVersion="1" version="9" xmlns="http://openrosa.org/formdesigner/2BCC3E88-2D0D-4C07-8D4A-6B372F3799D9" xmlns:jrm="http://dev.commcarehq.org/jr/xforms">
  <paitent_namentosh>Taylor</paitent_namentosh>
  <question2>Moruki</question2>
  <question3>Hks</question3>
  <question4>item1</question4>
  <question5>69855</question5>
  <question6>12</question6>
  <n0:meta xmlns:n0="http://openrosa.org/jr/xforms">
    <n0:deviceID>358239055789384</n0:deviceID>
    <n0:timeStart>2015-08-21T16:21:59.807+02</n0:timeStart>
    <n0:timeEnd>2015-08-21T16:22:15.987+02</n0:timeEnd>
    <n0:username>openfn</n0:username>
    <n0:userID>5fe615b3af2834cb5dca59f7466d6174</n0:userID>
    <n0:instanceID>195e79eb-d823-46fe-9e4f-59b8327d5db2</n0:instanceID>
    <n1:appVersion xmlns:n1="http://commcarehq.org/xforms">CommCare ODK, version &quot;2.22.0&quot;(370023). App v9. CommCare Version 2.22. Build 370023, built on: July-22-2015</n1:appVersion>
  </n0:meta>
</data>
```

So the JSON emitted by your expression should look like this:
```json
{
  "data": {
    "name": "Patient Registration",
    "uiVersion": "1",
    "version": "9",
    "xmlns": "http://openrosa.org/formdesigner/2BCC3E88-2D0D-4C07-8D4A-6B372F3799D9",
    "xmlns:jrm": "http://dev.commcarehq.org/jr/xforms",
    "paitent_namentosh": "Taylor",
    "question2": " Moruki",
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
```


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
