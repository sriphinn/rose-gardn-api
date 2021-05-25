const xss = require('xss')

const RosesService = {
  getAllRoses(db, user_id) {
    return db
      .from('rose_gardn_roses')
      .select('*').where({ user_id })
  },

  getById(db, id, user_id) {
    return RosesService.getAllRoses(db, user_id)
      .where('id', id)
      .first()
  },

  serializeRose(rose) {
    return {
      id: rose.id,
      user_id: rose.user_id,
      name: xss(rose.name),
      photo: xss(rose.photo),
      type_name: xss(rose.type_name),
      color: xss(rose.color),
      date: new Date(rose.date)
    }
  },

  insertRose(db, newRose) {
    return db
      .insert(newRose)
      .into('rose_gardn_roses')
      .returning('*')
      .then(([rose]) => rose)
  },

  deleteRose(db, id) {
    return db.from('rose_gardn_roses')
      .where({ id })
      .delete()
  },

  updateRose(db, id, newRoseFields) {
    return db.from('rose_gardn_roses')
      .where({ id })
      .update(newRoseFields)
  }
}

module.exports = RosesService