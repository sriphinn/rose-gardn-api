const express = require('express')
const LogsService = require('./logs-service')
const { requireAuth } = require('../middleware/jwt-auth')
const logger = require('../logger')

const logsRouter = express.Router()
const jsonBodyParser = express.json()


logsRouter
  .route('/:roseId')
  .all(requireAuth)
  .get((req, res, next) => {
    LogsService.getAllLogs(req.app.get('db'), req.params.roseId)
      .then(logs => {
        res.json(logs.map(LogsService.serializeLog))
      })
      .catch(next)
  })

  .post(jsonBodyParser, (req, res, next) => {
    const { log, notes, date } = req.body

    for (const field of ['log', 'date'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })
    const newLog = { rose_id: req.params.roseId, log, notes, date }
    return LogsService.insertLog(
      req.app.get('db'),
      newLog
    )
      .then(log => {
        res
          .status(201)
          .json(LogsService.serializeLog(log))
      })
      .catch(next)
  })

logsRouter
  .route('/:roseId/:id')
  .all(requireAuth)
  // .all(checkLogExists)
  .all((req, res, next) => {
    const { roseId, id } = req.params;
    LogsService.getById(req.app.get('db'), roseId, id)
      .then(log => {
        if (!log) {
          logger.error(`Log with id ${id} not found.`);
          return res
            .status(404)
            .json({ error: "Log doesn't exist" });
        }
        res.log = log
        next()
      })
      .catch(next)
  })

  .get((req, res) => {
    res.json(LogsService.serializeLog(res.log));
  })

  .delete((req, res, next) => {
    const { id } = req.params;
    const knexInstance = req.app.get('db')
    LogsService.deleteLog(knexInstance, id)
      .then(log => {
        if (!log) {
          logger.error(`Log with id ${id} not found.`);
          return res
            .status(404)
            .json({ message: "Log doesn't exist." });
        }
        logger.info(`Log with id ${id} deleted.`);
        res
          .status(204)
          .end();
      })
      .catch(next)
  })

  .patch(jsonBodyParser, (req, res, next) => {
    const { log, notes, date } = req.body
    const logToUpdate = { log, notes, date }
    
    const numberOfValues = Object.values(logToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: `Request body must contain either 'title' or 'content'`
      })
    }

    LogsService.updateLog(
      req.app.get('db'),
      req.params.id,
      logToUpdate
    )
      .then(numRowsAffected => {
        res.json({...logToUpdate, id:req.params.id})
      })
      .catch(next)
  })

/* async/await syntax for promises */
async function checkLogExists(req, res, next) {
      try {
        const log = await LogsService.getById(
          req.app.get('db'),
          req.params.log_id
        )

        if (!log)
          return res.status(404).json({
            error: `Log doesn't exist`
          })

        res.log = log
        next()
      } catch (error) {
        next(error)
      }
    }

module.exports = logsRouter