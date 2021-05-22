# ROSEGARDN API

Used in conjunction with the ROSEGARDN app, this API provides the functionality for registering users and finding, creating, deleting, and editing posts.

You can also view the [live site](https://rose-gardn-app.vercel.app/) or visit the [frontend repo](https://github.com/sriphinn/rose-gardn).


## Technologies

- Node and Express
  - Authentication via JWT
  - RESTful API
- Testing
  - Supertest (integration)
  - Mocha and Chai (unit)
- Database
  - Postgres
  - Knex.js

## Production

Deployed via Heroku

## API Endpoints

### Users Router

```
- /api/users
- - GET - gets user that matches
- - POST - creates a new user
```

### Roses Router

```
- /api/roses
- - GET - gets all roses by user id
- - POST - creates a new rose

- /api/roses/:id
- - GET - gets rose by id
- - DELETE - delete rose by id
- - PATCH - edit rose by id
```
### Logs Router

```
- /api/logs/:roseId
- - GET - gets all logs by rose id
- - POST - creates a new log

- /api/logs/:roseId/:id
- - GET - gets log by id
- - DELETE - delete log by id
- - PATCH - edit log by id
```
### Auth Router

```
- /api/auth/login
- - POST - creates auth token to be stored in local storage
```
