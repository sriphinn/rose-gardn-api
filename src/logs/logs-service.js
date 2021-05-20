const xss = require('xss')

const LogsService = {
  getAllLogs(db, rose_id) {
    return db
      .from('rose_gardn_logs')
      .select('*').where({ rose_id })
  },

  getById(db, rose_id, log_id) {
    return LogsService.getAllLogs(db, rose_id)
      .where('id', log_id)
      .first()
  },

  serializeLog(log) {
    return {
      id: log.id,
      rose_id: log.rose_id,
      log: xss(log.log),
      notes: xss(log.notes),
      date: xss(log.date)
    }
  },

  insertLog(db, newLog) {
    return db
      .insert(newLog)
      .into('rose_gardn_logs')
      .returning('*')
      .then(([log]) => log)
  },

  deleteLog(db, id) {
    return db.from('rose_gardn_logs')
      .where({ id })
      .delete()
  },

  updateLog(db, id, newLogFields) {
    return db.from('rose_gardn_logs')
      .where({ id })
      .update(newLogFields)
  }
}

module.exports = LogsService