// ==============
// |   ANYBIN   |          Created by Porter
// ==============          April 2023                 v0.1


// =========== Requires =========== //
const { QuickDB } =   require("quick.db");
const express =       require('express');
const passport =      require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session =       require('express-session');
const bodyParser =    require('body-parser');
const path =          require('path');
const favicon =       require('serve-favicon');
const multer =        require('multer');


// =========== Express App =========== //
require('dotenv').config();
const e_app = express();
e_app.set('view engine', 'ejs');
e_app.get('/dashboardhack', function(_req, res) {
    res.render("dashboard",{
    })
});
e_app.use(favicon(path.join(__dirname, 'public', 'favicon.png')))
e_app.use(session({
  secret: 'mysecretkey',
  resave: true,
  saveUninitialized: true
}));
e_app.use(passport.initialize());
e_app.use(passport.session());


// =========== Storage and DB =========== //
const db = new QuickDB();
const jsonParser = bodyParser.json();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'fileserve/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
  }
});
const upload = multer({ storage: storage });


// =========== API =========== //
// GETS
e_app.get('/api/user', async function(req, res) {
  let obj = await db.get( "user." + req.user.id );
  res.send(obj);
});
e_app.get('/api/bin', async function(req, res) {
  let bin = await db.get("bin." + req.query.binid);
  res.send(bin);
});
// e_app.get('/api/item', async function(req, res) {
//   let obj = await db.get( "item/" + req.query.itemid );
//   res.send(obj);
// });

e_app.post('/api/bin', jsonParser, async function(req, res) {
  console.log("CREATING BIN");
  let userbins = await db.get("user." + req.user.id + ".bins" );
  const binid = makeid(12);
  userbins.push(binid);

  const newBin = {
    name: "New Bin",
    description: "Brand new bin!",
    id: binid,
    items: [],
    col: 5,
    row: 4
  };
  
  await db.set("bin." + binid, newBin);
  await db.set  ("user." + req.user.id + ".bins", userbins);
  
  res.send(binid);
});
// e_app.post('/api/item', jsonParser, async function(req, res) {
//   await db.set("item/" + req.body.itemid, req.body.value);
//   res.send("success!");
// });

e_app.post('/api/image', upload.single('image'), (req, res) => {
  res.send(req.file.filename);
});


// =========== Auth =========== //

var urlencodedParser = bodyParser.urlencoded({ extended: false })
e_app.use(urlencodedParser);

// Passport setup
passport.use(new LocalStrategy(
  async function(username, password, done) {
    console.log("CREATING USER")
    // Check if user exists in database
    const userId = await db.has("user.default");
    if (!userId) {
      // Create default user if it doesn't exist
      const newUser = {
        name: "default",
        password: "password123",
        id: 1
      };
      await db.set("user.default", newUser);
    }

    // Retrieve user from database
    const users = await db.get("user");
    const user = Object.values(users).find(user => user.name === username && user.password === password);

    if (user) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Incorrect username or password.' });
    }
  }
));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(async function(id, done) {
  const users = await db.get("user");
  const user = Object.values(users).find(u => u.id === id);
  done(null, user);
});

// Set up routes
e_app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.render("dashboard",{
    })
  } else {
    res.render("home")
  }
  
});
e_app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
});
e_app.post('/login', function(req, res, next) {
  console.log('REQUESTED LOGIN');
  next();
}, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/'
}));
e_app.post('/register', urlencodedParser, async function(req, res) {
  console.log("REQUESTED REGISTER")
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // Check if username already exists
  // Check if user exists in database
  const userId = await db.has("user.default");
  if (!userId) {
    // Create default user if it doesn't exist
    const newUser = {
      name: "default",
      password: "password123",
      id: 1
    };
    await db.set("user.default", newUser);
  }

  // Retrieve user from database
  const users = await db.get("user");
  const userExists = Object.values(users).find(u => u.username === username);
  if (userExists) {
    return res.send('Username already taken');
  }

  // Check if password and confirm password match
  if (password !== confirmPassword) {
    return res.send('Passwords do not match');
  }

  // Create new user object
  const newUserId = makeid(10)
  const newUser = {
    name: username,
    password: password,
    bins: [],
    id: newUserId
  };
  
  await db.set("user." + newUserId, newUser);
  console.log("REGISTERING USER")

  // Redirect to login page
  res.redirect('/');
});

// =========== Start the app =========== //
e_app.use(express.static(__dirname + '/public'));
e_app.use(express.static(__dirname + '/fileserve'));
e_app.listen(process.env.PORT || 4320, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, e_app.settings.env);
});

// =========== Util Functions =========== //
function makeid(n) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < n; i++ ) {
  result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}