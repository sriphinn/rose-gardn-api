const knex = require('knex')
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')
const { expect } = require('chai')

describe('Users Endpoints', function() {
  let db

  const { testUsers } = helpers.makeRosesFixtures()
  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  describe(`POST /api/users`, () => {
    context(`User Validation`, () => {
      before('insert users', () =>
      helpers.seedUsers(
        db,
        testUsers
      )
    )
    
    const requiredFields = [ 'username', 'password' ]

    requiredFields.forEach(field => {
      const registerAttemptBody = {
        username: 'test username',
        password: 'test password',
      }

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete registerAttemptBody[field]

        return supertest(app)
          .post('/api/users')
          .send(registerAttemptBody)
          .expect(400, { error: `Missing '${field}' in request body` })
      })
    })

    it(`responds 400 'Password must be longer than 8 characters' when empty password`, () => {
      const userShortPassword = {
        username: 'test username',
        password: '1234567'
      }
      return supertest(app)
        .post('/api/users')
        .send(userShortPassword)
        .expect(400, { error: `Password must be longer than 8 characters` })
    })

    it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
      const userLongPassword = {
        username: 'test username',
        password: '*'.repeat(73)
      }
      return supertest(app)
        .post('/api/users')
        .send(userLongPassword)
        .expect(400, { error: `Password must be less than 72 characters` })
    })

    it(`responds 400 error when password starts with spaces`, () => {
      const userPasswordStartsSpaces = {
        username: 'test username',
        password: ' Test1234!'
      }
      return supertest(app)
        .post('/api/users')
        .send(userPasswordStartsSpaces)
        .expect(400, { error: `Password must not start or end with empty spaces`})
    })

    it(`responds 400 error when password isn't complex enough`, () => {
      const userPasswordNotComplex = {
        username: 'test username',
        password: '11AAaabb'
      }
      return supertest(app)
        .post('/api/users')
        .send(userPasswordNotComplex)
        .expect(400, { error: `Password must contain one upper case, lower case, number and special character`})
    })
    
    it(`responds 400 'Username already registered' when email isn't unique`, () => {
      const duplicateUser = {
        ...testUser
      }
      return supertest(app)
        .post('/api/users')
        .send(duplicateUser)
        .expect(400, { error: 'Username already registered'})
    })
  })

  context(`Happy path`, () => {
    it(`responds 201, serialized user, storing bcryped password`, () => {
      const newUser = {
        username: 'test username',
        password: 'Password123!'
      }
      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.username).to.eql(newUser.username)
          expect(res.body).to.not.have.property('password')
          expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
        })
        .expect(res =>
          db
            .from('rose_gardn_users')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.username).to.eql(newUser.username)
              return bcrypt.compare(newUser.password, row.password)
            })
            .then(compareMatch => {
              expect(compareMatch).to.be.true
            })
        )
    })
  })
  })
})