const express = require('express');
const mongoose = require('mongoose');
const glob = require('glob');
const _ =require('lodash');
const bodyParser = require('body-parser');
const app = express();
const passport = require('passport');
const cors = require('cors');
//const bcrypt = require('bcryptjs');
const fs = require('fs');


app.use(cors());

//bodyParser middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


//Passport config file
app.use(passport.initialize());
require('./models/index');
require('./config/passport')(passport);

//DB config
const db = require('./config/keys').mongoURI;

//Connect to MongoDB
mongoose
.connect(db,{useNewUrlParser:true})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Protected Routes
//customer
const customerCreate = require('./routes/customer/create');
app.get('/customer/findAll', passport.authenticate('jwt', { session: false }), customerFindAll);
const customerFindAll = require('./routes/customer/findAll');
app.get('/customer/findAll', passport.authenticate('jwt', { session: false }), customerFindAll);
const customerFindOne = require('./routes/customer/findOne');
app.get('/customer/findOne', passport.authenticate('jwt', { session: false }), customerFindOne);
const customerDelete = require('./routes/customer/delete');
app.get('/customer/delete', passport.authenticate('jwt', { session: false }), customerDelete);
const customerUpdate = require('./routes/customer/update');
app.get('/customer/update', passport.authenticate('jwt', { session: false }), customerUpdate);
//opco
const opcoCreate = require('./routes/opco/create');
app.get('/opco/findAll', passport.authenticate('jwt', { session: false }), opcoFindAll);
const opcoFindAll = require('./routes/opco/findAll');
app.get('/opco/findAll', passport.authenticate('jwt', { session: false }), opcoFindAll);
const opcoFindOne = require('./routes/opco/findOne');
app.get('/opco/findOne', passport.authenticate('jwt', { session: false }), opcoFindOne);
const opcoDelete = require('./routes/opco/delete');
app.get('/opco/delete', passport.authenticate('jwt', { session: false }), opcoDelete);
const opcoUpdate = require('./routes/opco/update');
app.get('/opco/update', passport.authenticate('jwt', { session: false }), opcoUpdate);
//role
const roleCreate = require('./routes/role/create');
app.get('/role/findAll', passport.authenticate('jwt', { session: false }), roleFindAll);
const roleFindAll = require('./routes/role/findAll');
app.get('/role/findAll', passport.authenticate('jwt', { session: false }), roleFindAll);
const roleFindOne = require('./routes/role/findOne');
app.get('/role/findOne', passport.authenticate('jwt', { session: false }), roleFindOne);
const roleDelete = require('./routes/role/delete');
app.get('/role/delete', passport.authenticate('jwt', { session: false }), roleDelete);
const roleUpdate = require('./routes/role/update');
app.get('/role/update', passport.authenticate('jwt', { session: false }), roleUpdate);
//user
const userFindAll = require('./routes/user/findAll');
app.get('/user/findAll', passport.authenticate('jwt', { session: false }), userFindAll);
const userFindOne = require('./routes/user/findOne');
app.get('/user/findOne', passport.authenticate('jwt', { session: false }), userFindOne);
const userDelete = require('./routes/user/delete');
app.get('/user/delete', passport.authenticate('jwt', { session: false }), userDelete);
const userUpdate = require('./routes/user/update');
app.get('/user/update', passport.authenticate('jwt', { session: false }), userUpdate);




// Listen on port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on ${port}`));

// Compile all routers   
var routeFolders = [],     
routePaths = "./routes"   
glob.sync('**/*', { cwd: routePaths }).forEach(route => {     
    var _isFolder = !_.endsWith(route, '.js')     
    route = '/' + route.replace(/\.[^/.]+$/, '')     
    if (!_.endsWith(route, 'index')) {       
        var _router = require(routePaths + route)       
        app.use(route, _router)       
        if (_isFolder) routeFolders.push(route)     }   })   
        routeFolders.forEach(route => {     var _pathDeindex = routePaths + route + '/deindex.js'     
        if (fs.existsSync(_pathDeindex))       
        app.use(route, require(_pathDeindex))   
    })