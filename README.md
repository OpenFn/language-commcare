Language CommCare
=================

Language Pack for sending messages using the commcare API.

https://confluence.dimagi.com/display/commcarepublic/Submission+API

https://bitbucket.org/javarosa/javarosa/wiki/FormSubmissionAPI

Documentation
-------------

### submit
wip!

```js
submit("formId", fields(
  field("Subject", dataValue("formId")),
  field("Status", "Closed")
))
```


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
