//dependencies

const env = require("./environment.js");
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Doctor = require('./models/doctor')
const User = require('./models/patient')
const Appoint = require('./models/appoint')
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const request = require('request');
var favicon = require('serve-favicon');


//app
const app = express();
const server = require('http').createServer(app)
const io = require('socket.io')(server)

//Mongo connection and listen
const dbURI = env.MONGO_URI;
mongoose.connect(dbURI, {useNewUrlParser:true,useUnifiedTopology:true})
    .then((result)=> {
        console.log('Connected to DB');
        //listening
        port = process.env.PORT || 3000;
        server.listen(port, () => {
            console.log(`Express server listening on port ${port}`)
          })
    })
    .catch((err) => console.log(err));



//view engine
app.set('view engine','ejs')

//middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended:true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/',(req,res)=>{
    res.render('index')
})
app.get('/call',(req,res)=>{
  res.render('call')
})
app.get('/symptom',(req,res)=>{
  res.render('symptom')
})
app.get('/diagonistic',(req,res)=>{
  res.render('diagonisticlocator')
})
app.get('/diagonisticlocator',(req,res)=>{
  res.render('diagonisticlocator')
})
app.get('/patientsignup',(req,res)=>{
    res.render('patientsignup')
})
app.get('/doctorsignup',(req,res)=>{
    res.render('doctorsignup')
})
app.post('/patientsignup',(req,res)=>{
    const patient = new User(req.body);
     patient.save()
         .then((result)=>{
             res.redirect(`/`)
        })
        .catch((err)=>{
             console.log(err);
        });
})
app.post('/doctorsignup',(req,res)=>{
    const doctor = new Doctor(req.body);
     doctor.save()
         .then((result)=>{
             res.redirect(`/`)
        })
        .catch((err)=>{
             console.log(err);
        });
})

io.on('connection', (socket) => {
    socket.on('join', (roomId) => {
      const selectedRoom = io.sockets.adapter.rooms[roomId]
      const numberOfClients = selectedRoom ? selectedRoom.length : 0
  
      // These events are emitted only to the sender socket.
      if (numberOfClients == 0) {
        console.log(`Creating room ${roomId} and emitting room_created socket event`)
        socket.join(roomId)
        socket.emit('room_created', roomId)
      } else if (numberOfClients == 1) {
        console.log(`Joining room ${roomId} and emitting room_joined socket event`)
        socket.join(roomId)
        socket.emit('room_joined', roomId)
      } else {
        console.log(`Can't join room ${roomId}, emitting full_room socket event`)
        socket.emit('full_room', roomId)
      }
    })
  
    // These events are emitted to all the sockets connected to the same room except the sender.
    socket.on('start_call', (roomId) => {
      console.log(`Broadcasting start_call event to peers in room ${roomId}`)
      socket.broadcast.to(roomId).emit('start_call')
    })
    socket.on('webrtc_offer', (event) => {
      console.log(`Broadcasting webrtc_offer event to peers in room ${event.roomId}`)
      socket.broadcast.to(event.roomId).emit('webrtc_offer', event.sdp)
    })
    socket.on('webrtc_answer', (event) => {
      console.log(`Broadcasting webrtc_answer event to peers in room ${event.roomId}`)
      socket.broadcast.to(event.roomId).emit('webrtc_answer', event.sdp)
    })
    socket.on('webrtc_ice_candidate', (event) => {
      console.log(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`)
      socket.broadcast.to(event.roomId).emit('webrtc_ice_candidate', event)
    })
  })