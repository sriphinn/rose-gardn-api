const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Logs Endpoints', function() {
  let db

  const {
    testUsers,
    testRoses,
    testLogs
  } = helpers.makeRosesFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`GET /api/logs`, () => {
    beforeEach('insert roses', () =>
      helpers.seedRosesTables(
        db,
        testUsers,
        testRoses
      )
    )
    
    afterEach('cleanup', () => helpers.cleanTables(db))

    // context(`Given no logs`, () => {
    //   it(`responds with 200 and an empty list`, () => {
    //     return supertest(app)
    //       .get('/api/logs')
    //       .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //       .expect(200, [])
    //   })
    // })

    context ('Given there are logs in the database', () => {
      beforeEach('insert logs', () => {
        helpers.cleanTables(db)
        helpers.seedRosesTables(db, testUsers, testRoses)
        helpers.seedLogsTables(
          db,
          [],
          testLogs,
          testUsers
        )
      }
      )
    })

    // context(`Given an XSS attack log`, () => {
    //   const testLog = helpers.makeLogsArray()[1]
    //   const {
    //     maliciousLog,
    //     expectedLog
    //   } = helpers.makeMaliciousLog(testLog)

    //   beforeEach('insert malicious log', () => {
    //     helpers.cleanTables(db)
    //     return helpers.seedMaliciousLog(
    //       db,
    //       testRose,
    //       maliciousLog
    //     )
    //   })

    //   it('removes XSS attack content', () => {
    //     return supertest(app)
    //       .get('/api/logss')
    //       .set('Authorization', helpers.makeAuthHeader(testRoses[0]))   
    //       .expect(200)
    //       .expect(res => {
    //         expect(res.body[0].notes).to.eql(expectedLog.notes)
    //         expect(res.body[0].photo).to.eql(expectedLog.photo)
    //       })     
    //   })
    // })
  })

  describe(`GET /api/logs/:id`, () => {
    // context(`Given no logs`, () => {
    //   beforeEach(() => 
    //     helpers.seedRosesTables(db, testUsers, testRoses)
    //   )

    //   it(`responds with 404`, () => {
    //     const logId = 123456
    //     return supertest(app)
    //       .get(`/api/logs/${logId}`)
    //       .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //       .expect(404, { error: `Log doesn't exist`})
    //   })
    // })

    // context('Given there are logs in the database', () => {
    //   beforeEach('insert logs', () =>
    //     helpers.seedLogsTables(
    //       db,
    //       testRoses,
    //       testLogs,
    //       testUsers
    //     )
    //   )

    //   it('responds with 200 and the specified log', () => {
    //     const logId = 1
    //     const expectedLog = helpers.makeExpectedLog(
    //       testLogs[logId - 1]
    //     )
    //     return supertest(app)
    //       .get(`/api/logs/${logId}`)
    //       .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //       .expect(200, expectedLog)
    //   })
    // })

    // context(`Given an XSS attack post`, () => {
    //   const testRose = helpers.makeRosesArray()[1]
    //   const {
    //     maliciousLog,
    //     expectedLog
    //   } = helpers.makeMaliciousLog(testRose)

    //   beforeEach('insert malicious log', () => {
    //     return helpers.seedMaliciousLog(
    //       db,
    //       testRose,
    //       maliciousLog
    //     )
    //   })

    //   it('removes XSS attack photo', () => {
    //     return supertest(app)
    //       .get(`/api/roses/${maliciousLog.id}`)
    //       .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
    //       .expect(200)
    //       .expect(res => {
    //         expect(res.body.notes).to.eql(expectedLog.notes)
    //         expect(res.body.photo).to.eql(expectedLog.photo)
    //       })
    //   })
    // })
  })
})