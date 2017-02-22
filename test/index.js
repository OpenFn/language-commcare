import { expect } from 'chai';

import Adaptor from '../src';
const { execute, submit } = Adaptor;

import request from 'superagent';
import superagentMock from 'superagent-mock';
import { fixtures } from './Fixtures'

describe("execute", () => {

  it("executes each operation in sequence", (done) => {
    let state = {}
    let operations = [
      (state) => { return {counter: 1} },
      (state) => { return {counter: 2} },
      (state) => { return {counter: 3} }
    ]

    execute(...operations)(state)
    .then((finalState) => {
      expect(finalState).to.eql({ counter: 3 })
    })
    .then(done).catch(done)

  })

  it("assigns references, data to the initialState", () => {
    let state = {}

    let finalState = execute()(state)

    execute()(state)
    .then((finalState) => {
      expect(finalState).to.eql({
        references: [],
        data: null
      })
    })

  })
})

describe("submit", () => {
  let mockRequest

  before(() => {
    mockRequest = superagentMock(request, ClientFixtures)
  })

  it("submits a form and returns state", () => {
    let state = {
      configuration: {
        username: "hello",
        password: "there",
        apiUrl: 'https://play.commcare.org/demo'
      }
    };

    return execute(
      submit(fixtures.submit.requestBody)
    )(state)
    .then((state) => {
      let lastReference = state.references[0]

      // Check that the submission data made it's way to the request as a string.
      expect(lastReference.params).
        to.eql(JSON.stringify(fixtures.submit.requestBody))

    })

  })

  after(() => {
    mockRequest.unset()
  })

})
