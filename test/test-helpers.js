const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { log } = require('winston')

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'testuser1',
      password: 'Password123!'
    },
    {
      id: 2,
      username: 'testuser2',
      password: 'Password123!'
    },
    {
      id: 3,
      username: 'testuser3',
      password: 'Password123!'
    },
    {
      id: 4,
      username: 'testuser4',
      password: 'Password123!'
    }
  ]
}

function makeRosesArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      photo: 'photo url',
      name: 'First Test Post',
      type_name: 'English',
      color: 'Yellow',
      date: '2019-01-03T00:00:00.000Z'
    },
    {
      id: 2,
      user_id: users[1].id,
      photo: 'photo url',
      name: 'First Test Post',
      type_name: 'English',
      color: 'Yellow',
      date: '2019-01-03T00:00:00.000Z'
    },
    {
      id: 3,
      user_id: users[2].id,
      photo: 'photo url',
      name: 'First Test Post',
      type_name: 'English',
      color: 'Yellow',
      date: '2019-01-03T00:00:00.000Z'
    },
    {
      id: 4,
      user_id: users[3].id,
      photo: 'photo url',
      name: 'First Test Post',
      type_name: 'English',
      color: 'Yellow',
      date: '2019-01-03T00:00:00.000Z'
    }
  ]
}

function makeExpectedRose(rose) {
  return {
    id: rose.id,
    user_id: rose.user_id,
    photo: rose.photo,
    name: rose.name,
    type_name: rose.type_name,
    color: rose.color,
    date: rose.date,
  }
}

function makeMaliciousRose(user) {
  const maliciousRose = {
    id: 911,
    user_id: user.id,
    photo: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    name: 'Very naughty <script>alert("xss");</script>',
    type_name: user.type_name,
    color: user.color,
    date: new Date(),
  }
  const expectedRose = {
    ...makeExpectedRose(maliciousRose),
    photo: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    name: 'Very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
  }
  return {
    maliciousRose,
    expectedRose
  }
}

function makeLogsArray(roses) {
  return [
    {
      id: 1,
      rose_id: roses[0].id,
      log: 'Water',
      notes: 'test notes',
      photo: 'photo url',
      date: '2019-01-03T00:00:00.000Z'
    },
    {
      id: 2,
      rose_id: roses[1].id,
      log: 'Water',
      notes: 'test notes',
      photo: 'photo url',
      date: '2019-01-03T00:00:00.000Z'
    },
    {
      id: 3,
      rose_id: roses[2].id,
      log: 'Water',
      notes: 'test notes',
      photo: 'photo url',
      date: '2019-01-03T00:00:00.000Z'
    }
  ]
}

function makeExpectedLog(log) {
  return {
    id: log.id,
    rose_id: log.rose_id,
    log: log.log,
    notes: log.notes,
    photo: log.photo,
    date: log.date
  }
}

function makeMaliciousLog(rose) {
  const maliciousLog = {
    id: 911,
    rose_id: rose.rose_id,
    log: rose.log,
    notes: 'Very naughty <script>alert("xss");</script>',
    photo: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    date: new Date()
  }
  const expectedLog = {
    ...makeExpectedLog(maliciousLog),
    notes: 'Very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    photo: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousLog,
    expectedLog
  }
}

function makeRosesFixtures() {
  const testUsers = makeUsersArray()
  const testRoses = makeRosesArray(testUsers)
  const testLogs = makeLogsArray(testRoses)
  return { testUsers, testRoses, testLogs }
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        rose_gardn_users,
        rose_gardn_roses,
        rose_gardn_logs
      `
    )
    .then(()=>
      Promise.all([
        trx.raw(`ALTER SEQUENCE rose_gardn_roses_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE rose_gardn_users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE rose_gardn_logs_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('rose_gardn_roses_id_seq', 0)`),
        trx.raw(`SELECT setval('rose_gardn_users_id_seq', 0)`),
        trx.raw(`SELECT setval('rose_gardn_logs_id_seq', 0)`)
      ])
    )
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('rose_gardn_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('rose_gardn_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedRosesTables(db, users, roses) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('rose_gardn_roses').insert(roses)
    // update the auto sequence to match the forced values
    await trx.raw(
      `SELECT setval('rose_gardn_roses_id_seq', ?)`,
      [roses[roses.length - 1].id],
    )
  })
}

function seedLogsTables(db, roses, logs, users) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedRosesTables(trx, users, roses)
    await trx.into('rose_gardn_logs').insert(logs)
    // update the auto sequence to match the forced values
    await trx.raw(
      `SELECT setval('rose_gardn_logs_id_seq', ?)`,
      [logs[logs.length - 1].id],
    )
  })
}

function seedMaliciousRose(db, user, rose) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('rose_gardn_roses')
        .insert([rose])
    )
}

function seedMaliciousLog(db, rose, log) {
  return seedRosesTables(db, [rose])
    .then(() =>
      db
        .into('rose_gardn_logs')
        .insert([log])
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makeRosesArray,
  makeLogsArray,
  makeExpectedRose,
  makeMaliciousRose,
  makeExpectedLog,
  makeMaliciousLog,
  makeRosesFixtures,
  cleanTables,
  seedRosesTables,
  seedLogsTables,
  seedMaliciousRose,
  seedMaliciousLog,
  makeAuthHeader,
  seedUsers
}
