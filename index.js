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
// const customerCreate = require('./routes/customer/create');
// app.post('/customer/create', passport.authenticate('jwt', { session: false }), customerCreate);
const customerFindAll = require('./routes/customer/findAll');
app.get('/customer/findAll', passport.authenticate('jwt', { session: false }), customerFindAll);
const customerFindOne = require('./routes/customer/findOne');
app.get('/customer/findOne', passport.authenticate('jwt', { session: false }), customerFindOne);
const customerDelete = require('./routes/customer/delete');
app.delete('/customer/delete', passport.authenticate('jwt', { session: false }), customerDelete);
const customerUpdate = require('./routes/customer/update');
app.put('/customer/update', passport.authenticate('jwt', { session: false }), customerUpdate);
//opco
const opcoCreate = require('./routes/opco/create');
app.post('/opco/create', passport.authenticate('jwt', { session: false }), opcoCreate);
const opcoFindAll = require('./routes/opco/findAll');
app.get('/opco/findAll', passport.authenticate('jwt', { session: false }), opcoFindAll);
const opcoFindOne = require('./routes/opco/findOne');
app.get('/opco/findOne', passport.authenticate('jwt', { session: false }), opcoFindOne);
const opcoDelete = require('./routes/opco/delete');
app.delete('/opco/delete', passport.authenticate('jwt', { session: false }), opcoDelete);
const opcoUpdate = require('./routes/opco/update');
app.put('/opco/update', passport.authenticate('jwt', { session: false }), opcoUpdate);
//currency
const currencyCreate = require('./routes/currency/create');
app.post('/currency/create', passport.authenticate('jwt', { session: false }), currencyCreate);
const currencyFindAll = require('./routes/currency/findAll');
app.get('/currency/findAll', passport.authenticate('jwt', { session: false }), currencyFindAll);
const currencyFindOne = require('./routes/currency/findOne');
app.get('/currency/findOne', passport.authenticate('jwt', { session: false }), currencyFindOne);
const currencyDelete = require('./routes/currency/delete');
app.delete('/currency/delete', passport.authenticate('jwt', { session: false }), currencyDelete);
const currencyUpdate = require('./routes/currency/update');
app.put('/currency/update', passport.authenticate('jwt', { session: false }), currencyUpdate);
//user
const userFindAll = require('./routes/user/findAll');
app.get('/user/findAll', passport.authenticate('jwt', { session: false }), userFindAll);
const userFindOne = require('./routes/user/findOne');
app.get('/user/findOne', passport.authenticate('jwt', { session: false }), userFindOne);
const userDelete = require('./routes/user/delete');
app.delete('/user/delete', passport.authenticate('jwt', { session: false }), userDelete);
const userUpdate = require('./routes/user/update');
app.put('/user/update', passport.authenticate('jwt', { session: false }), userUpdate);

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