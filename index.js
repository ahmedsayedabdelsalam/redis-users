const express = require('express')
const exphbs = require('express-handlebars')
const redis = require('redis')
const path = require('path')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

// set port
const PORT = process.env.PORT || 3000

// init app
const app = express()

// init redis
const redisClient = redis.createClient()
redisClient.on('connect', () => {
  console.log('connected to redis')
})

// view eingine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// method override
app.use(methodOverride('_method'))

// search page
app.get('/', (req, res) => res.render('searchUsers'))

// search processing
app.post('/user/search', (req, res) => {
  const id = req.body.id
  redisClient.hgetall(id, (err, obj) => {
    if (!obj) {
      return res.render('searchUsers', {
        error: 'user does not exists'
      })
    } else {
      obj.id = id
      return res.render('details', {
        user: obj
      })
    }
  })
})

// add user page
app.get('/user/add', (req, res) => res.render('addUser'))

// processing add user
app.post('/user/add', function (req, res) {
  const id = req.body.id
  const first_name = req.body.first_name
  const last_name = req.body.last_name
  const email = req.body.email
  const phone = req.body.phone

  redisClient.hmset(id, [
    'first_name', first_name,
    'last_name', last_name,
    'email', email,
    'phone', phone
  ],
    (err, reply) => {
      if (err) {
        return console.log(err)
      }
      console.log(reply)
      res.redirect('/')
    }
  )
})

// processing delete user
app.delete('/user/delete/:id', (req, res) => {
  redisClient.del(req.params.id)
  res.redirect('/')
})

app.listen(PORT, () => console.log(`app listening on port ${PORT}!`))
