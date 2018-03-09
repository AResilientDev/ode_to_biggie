const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db
//connects database to app and says where it will be served.
//the green is the plugged in username and password chosen spefically for that database on mlab.com
//app=express, using it to set up server on port 3000
MongoClient.connect('mongodb://demo:demo@ds125146.mlab.com:25146/savage', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(process.env.PORT || 3000, () => {
    console.log('listening on 3000')
  })
})

//tell epxress im using ejs
//writes the endpoints already through the templates
//sets them all up with one line of code
//could've been any other template langauge generated by npm
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))
//from this point up express set up your server for you.
//express aint necessary

//get read request, everytime the page loads
//db is holding the database we got from mongo
//now find the messages collections
//find all messages and spit out as toArray message objects
//result is the array of message objects
//then render ya template(ejs) and pass in the array of objects
//the template builds the users li's and paste them back on the page
app.get('/', (req, res) => {
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {messages: result})
  })
})
//create
//body-parser allows you to pull from the form
app.post('/messages', (req, res) => {
  db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown: 0, }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})
//update
//
app.put('/thumbUp', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp + 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})
  app.put('/thumbDown', (req, res) => {
    db.collection('messages')
    .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
      $set: {
        thumbDown:req.body.thumbDown + 1
      }
    }, {
      sort: {_id: -1},
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
  })
//delete
//blue texts are methods uploaded by the mongo database
app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})