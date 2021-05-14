const express = require('express')
const RosesService = require('./roses-service')
const { requireAuth } = require('../middleware/jwt-auth')
const logger = require('../logger')

const rosesRouter = express.Router()
const jsonBodyParser = express.json()


rosesRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    RosesService.getAllRoses(req.app.get('db'), req.user.id)
      .then(roses => {
        res.json(roses.map(RosesService.serializeRose))
      })
      .catch(next)
  })

  .post(jsonBodyParser, (req, res, next) => {
    const { name, type, color, date } = req.body

    for (const field of ['name', 'type', 'color', 'date'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })
    const newRose = { user_id: req.user.id, name, type, color, date }
    return RosesService.insertRose(
      req.app.get('db'),
      newRose
    )
      .then(rose => {
        res
          .status(201)
          .json(RosesService.serializeRose(rose))
      })
      .catch(next)
  })

rosesRouter
  .route('/:id')
  .all(requireAuth)
  // .all(checkRoseExists)
  .all((req, res, next) => {
    const { id } = req.params;
    // console.log('user.id', req.user.id)
    RosesService.getById(req.app.get('db'), id, req.user.id)
      .then(rose => {
        if (!rose) {
          logger.error(`Rose with id ${id} not found.`);
          return res
            .status(404)
            .json({ error: "Rose doesn't exist" });
        }
        res.rose = rose
        next()
      })
      .catch(next)
  })

  .get((req, res) => {
    res.json(RosesService.serializeRose(res.rose));
  })

  .delete((req, res, next) => {
    const { id } = req.params;
    const knexInstance = req.app.get('db')
    RosesService.deleteRose(knexInstance, id)
      .then(rose => {
        if (!rose) {
          logger.error(`Rose with id ${id} not found.`);
          return res
            .status(404)
            .json({ message: "Rose doesn't exist." });
        }
        logger.info(`Rose with id ${id} deleted.`);
        res
          .status(204)
          .end();
      })
      .catch(next)
  })

  .patch(jsonBodyParser, (req, res, next) => {
    const { name, type, color, date } = req.body
    const roseToUpdate = { name, type, color, date }
    
    const numberOfValues = Object.values(roseToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: `Request body must contain either 'name', 'type', 'color' or 'date'`
      })
    }

    RosesService.updateRose(
      req.app.get('db'),
      req.params.id,
      roseToUpdate
    )
      .then(numRowsAffected => {
        res.json({...roseToUpdate, id:req.params.id})
      })
      .catch(next)
  })

/* async/await syntax for promises */
async function checkRoseExists(req, res, next) {
      try {
        const rose = await RosesService.getById(
          req.app.get('db'),
          req.params.rose_id
        )

        if (!rose)
          return res.status(404).json({
            error: `Rose doesn't exist`
          })

        res.rose = rose
        next()
      } catch (error) {
        next(error)
      }
    }

module.exports = rosesRouter