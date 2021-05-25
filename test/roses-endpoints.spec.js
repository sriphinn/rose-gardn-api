const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Roses Endpoints', function() {
  let db

  const {
    testUsers,
    testRoses
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

  describe(`GET /api/roses`, () => {
    beforeEach('insert users', () =>
      helpers.seedUsers(
        db,
        testUsers
      )
    )
    
    afterEach('cleanup', () => helpers.cleanTables(db))

    context(`Given no roses`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/roses')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [])
      })
    })

    context ('Given there are roses in the database', () => {
      beforeEach('insert roses', () => {
        helpers.cleanTables(db)
        helpers.seedUsers(db, testUsers)
        helpers.seedRosesTables(
          db,
          [],
          testRoses
        )
      }
      )
    })

    // context(`Given an XSS attack rose`, () => {
    //   const testUser = helpers.makeUsersArray()[1]
    //   const {
    //     maliciousRose,
    //     expectedRose
    //   } = helpers.makeMaliciousRose(testUser)

    //   beforeEach('insert malicious rose', () => {
    //     helpers.cleanTables(db)
    //     return helpers.seedMaliciousRose(
    //       db,
    //       testUser,
    //       maliciousRose
    //     )
    //   })

    //   it('removes XSS attack content', () => {
    //     return supertest(app)
    //       .get('/api/roses')
    //       .set('Authorization', helpers.makeAuthHeader(testUsers[0]))   
    //       .expect(200)
    //       .expect(res => {
    //         expect(res.body[0].name).to.eql(expectedRose.name)
    //         expect(res.body[0].photo).to.eql(expectedRose.photo)
    //       })     
    //   })
    // })
  })

  describe(`GET /api/roses/:id`, () => {
    context(`Given no roses`, () => {
      beforeEach(() => 
        helpers.seedUsers(db, testUsers)
      )

      it(`responds with 404`, () => {
        const roseId = 123456
        return supertest(app)
          .get(`/api/roses/${roseId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Rose doesn't exist`})
      })
    })

    context('Given there are roses in the database', () => {
      beforeEach('insert roses', () =>
        helpers.seedRosesTables(
          db,
          testUsers,
          testRoses,
        )
      )

      it('responds with 200 and the specified rose', () => {
        const roseId = 1
        const expectedRose = helpers.makeExpectedRose(
          testRoses[roseId - 1]
        )
        return supertest(app)
          .get(`/api/roses/${roseId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedRose)
      })
    })

    context(`Given an XSS attack post`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousRose,
        expectedRose
      } = helpers.makeMaliciousRose(testUser)

      beforeEach('insert malicious rose', () => {
        return helpers.seedMaliciousRose(
          db,
          testUser,
          maliciousRose
        )
      })

      it('removes XSS attack photo', () => {
        return supertest(app)
          .get(`/api/roses/${maliciousRose.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql(expectedRose.name)
            expect(res.body.photo).to.eql(expectedRose.photo)
          })
      })
    })
  })
})