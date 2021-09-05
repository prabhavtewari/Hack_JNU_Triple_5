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
const{ requireAuth, checkUser ,requireDoc,checkDoc} = require('./middleware/authMiddleware') 


//app
const app = express();
const server = require('http').createServer(app)
const io = require('socket.io')(server)

//Mongo connection and listen
const dbURI = env.MONGO_URI;
var secret = env.SECRET;
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

//login errors
    const handleErrors = (err) => {
      console.log(err.message, err.code);
      let errors = { uname: '', password: '' };
    
      // incorrect uname
      if (err.message === 'incorrect username') {
        errors.uname = 'That username is not registered';
      }
    
      // incorrect password
      if (err.message === 'incorrect password') {
        errors.password = 'That password is incorrect';
      }
    
      // validation errors
      if (err.message.includes('user validation failed')) {
        // console.log(err);
        Object.values(err.errors).forEach(({ properties }) => {
          // console.log(val);
          // console.log(properties);
          errors[properties.path] = properties.message;
        });
      }
  }
  
  const createToken = (id) => {
      return jwt.sign({ id }, secret);
    };


//view engine
app.set('view engine','ejs')

//middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended:true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});
app.get('*', checkUser);
app.get('*', checkDoc);

app.get('/',(req,res)=>{
    res.render('index')
})
app.get('/call/:id',(req,res)=>{
  let apid = req.params.id;
  res.render('call',{apid:apid})
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
app.get('/psignup',(req,res)=>{
    res.render('patientsignup')
})
app.get('/homediagnosis',(req,res)=>{
    res.render('homediagnosis')
})
app.get('/doctorsignup',(req,res)=>{
    res.render('doctorsignup')
})
app.get('/dsignup',(req,res)=>{
    res.render('doctorsignup')
})
app.get('/userlogin',(req,res)=>{
  res.render('userlogin')
})
app.get('/plogin',(req,res)=>{
  res.render('userlogin')
})
app.get('/doctorlogin',(req,res)=>{
  res.render('doctorlogin')
})
app.get('/dlogin',(req,res)=>{
  res.render('doctorlogin')
})
app.get('/userlogout',(req,res)=>{
  res.cookie('user', '', { maxAge: 1 });
  res.render('/')
})
app.get('/doctorlogout',(req,res)=>{
  res.cookie('doc', '', { maxAge: 1 });
  res.render('/')
})
app.post('/userlogin',async (req,res)=>{
  const { email, password } = req.body;

try {
  const user = await User.login(email, password);
  const token = createToken(user._id);
  res.cookie('user', token, { httpOnly: true});
  res.status(200).json({ user: user._id });
} 
catch (err) {
  const errors = handleErrors(err);
  res.status(400).json({ errors });
}

})

app.post('/doctorlogin',async (req,res)=>{
  const { email, password } = req.body;

try {
  const doc = await Doctor.login(email, password);
  const token = createToken(doc._id);
  res.cookie('doc', token, { httpOnly: true});
  res.status(200).json({ doc: doc._id });
} 
catch (err) {
  const errors = handleErrors(err);
  res.status(400).json({ errors });
}
})

app.get('/pharmacylocator',(req,res)=>{
    res.render('pharmalocator')
})
app.get('/onlinepharma',(req,res)=>{
    res.render('onlinepharma')
})
app.get('/homepharmacy',(req,res)=>{
    res.render('onlinepharma')
})
app.get('/bookappointment',requireAuth,async (req,res)=>{
  await Doctor.find()
    .then((result)=>{
      res.render('bookappointment',{doctors:result})
    })
    .catch((err)=>{
      console.log(err);
  });
})
app.get('/viewappointment',requireAuth,async (req,res)=>{
  await Appoint.find()
    .then((result)=>{
      res.render('viewappointment',{appoint:result})
    })
    .catch((err)=>{
      console.log(err);
  });
})
app.get('/docappointment',requireDoc,async (req,res)=>{
  await Appoint.find()
    .then((result)=>{
      res.render('docappointment',{appoint:result})
    })
    .catch((err)=>{
      console.log(err);
  });
})
app.get('/accept/:id',requireDoc,async (req,res)=>{
  let apid = req.params.id;
  await Appoint.findByIdAndUpdate(apid,{status:"call"})
    .then((result)=>{
      res.redirect('/docappointment')
    })
    .catch((err)=>{
      console.log(err);
  });
})
app.get('/test/:id',async (req,res)=>{
  let apid = req.params.id;
  await Appoint.findById(apid)
    .then(async (result)=>{
      if(result.status=="call")await Appoint.findByIdAndUpdate(apid,{status:"test"})
      .then((result)=>{
        res.redirect('back')
      })
      .catch((err)=>{
        console.log(err);
    });
    else{
      res.redirect('back')
    }
    })
    .catch((err)=>{
      console.log(err);
  }); 
})
app.post('/add-test',async (req,res)=>{
  let apid = req.body.apid;
  let tests = req.body.test;
  console.log(tests,apid);
  await Appoint.findByIdAndUpdate(apid,{tests:tests,status:"med"})
    .then((result)=>{
      res.redirect('/docappointment')
    })
    .catch((err)=>{
      console.log(err);
  });
})
app.post('/add-med',async (req,res)=>{
  let apid = req.body.apid;
  let meds = req.body.med;
  await Appoint.findByIdAndUpdate(apid,{meds:meds,status:"completed"})
    .then((result)=>{
      res.redirect('/docappointment')
    })
    .catch((err)=>{
      console.log(err);
  });
})
app.post('/bookappointment',async (req,res)=>{
  const appoint = new Appoint(req.body);
  await Doctor.findById(appoint.docid)
    .then((result)=>{
      appoint.docname = result.name;
      appoint.save()
         .then((result)=>{
             res.redirect(`/viewappointment`)
        })
        .catch((err)=>{
             console.log(err);
        });

    })
    .catch((err)=>{
      console.log(err);
  });
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