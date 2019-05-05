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
//article
const articleCreate = require('./routes/article/create');
app.post('/article/create', passport.authenticate('jwt', { session: false }), articleCreate);
const articleDelete = require('./routes/article/delete');
app.delete('/article/delete', passport.authenticate('jwt', { session: false }), articleDelete);
const articleFindAll = require('./routes/article/findAll');
app.get('/article/findAll', passport.authenticate('jwt', { session: false }), articleFindAll);
const articleFindOne = require('./routes/article/findOne');
app.get('/article/findOne', passport.authenticate('jwt', { session: false }), articleFindOne);
const articleUpdate = require('./routes/article/update');
app.put('/article/update', passport.authenticate('jwt', { session: false }), articleUpdate);
//collipack
const collipackCreate = require('./routes/collipack/create');
app.post('/collipack/create', passport.authenticate('jwt', { session: false }), collipackCreate);
const collipackDelete = require('./routes/collipack/delete');
app.delete('/collipack/delete', passport.authenticate('jwt', { session: false }), collipackDelete);
const collipackFindAll = require('./routes/collipack/findAll');
app.get('/collipack/findAll', passport.authenticate('jwt', { session: false }), collipackFindAll);
const collipackFindOne = require('./routes/collipack/findOne');
app.get('/collipack/findOne', passport.authenticate('jwt', { session: false }), collipackFindOne);
const collipackUpdate = require('./routes/collipack/update');
app.put('/collipack/update', passport.authenticate('jwt', { session: false }), collipackUpdate);
//collitype
const collitypeCreate = require('./routes/collitype/create');
app.post('/collitype/create', passport.authenticate('jwt', { session: false }), collitypeCreate);
const collitypeDelete = require('./routes/collitype/delete');
app.delete('/collitype/delete', passport.authenticate('jwt', { session: false }), collitypeDelete);
const collitypeFindAll = require('./routes/collitype/findAll');
app.get('/collitype/findAll', passport.authenticate('jwt', { session: false }), collitypeFindAll);
const collitypeFindOne = require('./routes/collitype/findOne');
app.get('/collitype/findOne', passport.authenticate('jwt', { session: false }), collitypeFindOne);
const collitypeUpdate = require('./routes/collitype/update');
app.put('/collitype/update', passport.authenticate('jwt', { session: false }), collitypeUpdate);
//counter
const counterCreate = require('./routes/counter/create');
app.post('/counter/create', passport.authenticate('jwt', { session: false }), counterCreate);
const counterDelete = require('./routes/counter/delete');
app.delete('/counter/delete', passport.authenticate('jwt', { session: false }), counterDelete);
const counterFindAll = require('./routes/counter/findAll');
app.get('/counter/findAll', passport.authenticate('jwt', { session: false }), counterFindAll);
const counterFindOne = require('./routes/counter/findOne');
app.get('/counter/findOne', passport.authenticate('jwt', { session: false }), counterFindOne);
const counterUpdate = require('./routes/counter/update');
app.put('/counter/update', passport.authenticate('jwt', { session: false }), counterUpdate);
//docdefinition
const docdefinitionCreate = require('./routes/docdefinition/create');
app.post('/docdefinition/create', passport.authenticate('jwt', { session: false }), docdefinitionCreate);
const docdefinitionDelete = require('./routes/docdefinition/delete');
app.delete('/docdefinition/delete', passport.authenticate('jwt', { session: false }), docdefinitionDelete);
const docdefinitionFindAll = require('./routes/docdefinition/findAll');
app.get('/docdefinition/findAll', passport.authenticate('jwt', { session: false }), docdefinitionFindAll);
const docdefinitionFindOne = require('./routes/docdefinition/findOne');
app.get('/docdefinition/findOne', passport.authenticate('jwt', { session: false }), docdefinitionFindOne);
const docdefinitionUpdate = require('./routes/docdefinition/update');
app.put('/docdefinition/update', passport.authenticate('jwt', { session: false }), docdefinitionUpdate);
//docflow
const docflowCreate = require('./routes/docflow/create');
app.post('/docflow/create', passport.authenticate('jwt', { session: false }), docflowCreate);
const docflowDelete = require('./routes/docflow/delete');
app.delete('/docflow/delete', passport.authenticate('jwt', { session: false }), docflowDelete);
const docflowFindAll = require('./routes/docflow/findAll');
app.get('/docflow/findAll', passport.authenticate('jwt', { session: false }), docflowFindAll);
const docflowFindOne = require('./routes/docflow/findOne');
app.get('/docflow/findOne', passport.authenticate('jwt', { session: false }), docflowFindOne);
const docflowUpdate = require('./routes/docflow/update');
app.put('/docflow/update', passport.authenticate('jwt', { session: false }), docflowUpdate);
//erp
const erpCreate = require('./routes/erp/create');
app.post('/erp/create', passport.authenticate('jwt', { session: false }), erpCreate);
const erpDelete = require('./routes/erp/delete');
app.delete('/erp/delete', passport.authenticate('jwt', { session: false }), erpDelete);
const erpFindAll = require('./routes/erp/findAll');
app.get('/erp/findAll', passport.authenticate('jwt', { session: false }), erpFindAll);
const erpFindOne = require('./routes/erp/findOne');
app.get('/erp/findOne', passport.authenticate('jwt', { session: false }), erpFindOne);
const erpUpdate = require('./routes/erp/update');
app.put('/erp/update', passport.authenticate('jwt', { session: false }), erpUpdate);
//field
const fieldCreate = require('./routes/field/create');
app.post('/field/create', passport.authenticate('jwt', { session: false }), fieldCreate);
const fieldDelete = require('./routes/field/delete');
app.delete('/field/delete', passport.authenticate('jwt', { session: false }), fieldDelete);
const fieldFindAll = require('./routes/field/findAll');
app.get('/field/findAll', passport.authenticate('jwt', { session: false }), fieldFindAll);
const fieldFindOne = require('./routes/field/findOne');
app.get('/field/findOne', passport.authenticate('jwt', { session: false }), fieldFindOne);
const fieldUpdate = require('./routes/field/update');
app.put('/field/update', passport.authenticate('jwt', { session: false }), fieldUpdate);
//fieldname
const fieldnameCreate = require('./routes/fieldname/create');
app.post('/fieldname/create', passport.authenticate('jwt', { session: false }), fieldnameCreate);
const fieldnameDelete = require('./routes/fieldname/delete');
app.delete('/fieldname/delete', passport.authenticate('jwt', { session: false }), fieldnameDelete);
const fieldnameFindAll = require('./routes/fieldname/findAll');
app.get('/fieldname/findAll', passport.authenticate('jwt', { session: false }), fieldnameFindAll);
const fieldnameFindOne = require('./routes/fieldname/findOne');
app.get('/fieldname/findOne', passport.authenticate('jwt', { session: false }), fieldnameFindOne);
const fieldnameUpdate = require('./routes/fieldname/update');
app.put('/fieldname/update', passport.authenticate('jwt', { session: false }), fieldnameUpdate);
//locale
const localeCreate = require('./routes/locale/create');
app.post('/locale/create', passport.authenticate('jwt', { session: false }), localeCreate);
const localeDelete = require('./routes/locale/delete');
app.delete('/locale/delete', passport.authenticate('jwt', { session: false }), localeDelete);
const localeFindAll = require('./routes/locale/findAll');
app.get('/locale/findAll', passport.authenticate('jwt', { session: false }), localeFindAll);
const localeFindOne = require('./routes/locale/findOne');
app.get('/locale/findOne', passport.authenticate('jwt', { session: false }), localeFindOne);
const localeUpdate = require('./routes/locale/update');
app.put('/locale/update', passport.authenticate('jwt', { session: false }), localeUpdate);
//opco
const opcoCreate = require('./routes/opco/create');
app.post('/opco/create', passport.authenticate('jwt', { session: false }), opcoCreate);
const opcoDelete = require('./routes/opco/delete');
app.delete('/opco/delete', passport.authenticate('jwt', { session: false }), opcoDelete);
const opcoFindAll = require('./routes/opco/findAll');
app.get('/opco/findAll', passport.authenticate('jwt', { session: false }), opcoFindAll);
const opcoFindOne = require('./routes/opco/findOne');
app.get('/opco/findOne', passport.authenticate('jwt', { session: false }), opcoFindOne);
const opcoUpdate = require('./routes/opco/update');
app.put('/opco/update', passport.authenticate('jwt', { session: false }), opcoUpdate);
//packitem
const packitemCreate = require('./routes/packitem/create');
app.post('/packitem/create', passport.authenticate('jwt', { session: false }), packitemCreate);
const packitemDelete = require('./routes/packitem/delete');
app.delete('/packitem/delete', passport.authenticate('jwt', { session: false }), packitemDelete);
const packitemFindAll = require('./routes/packitem/findAll');
app.get('/packitem/findAll', passport.authenticate('jwt', { session: false }), packitemFindAll);
const packitemFindOne = require('./routes/packitem/findOne');
app.get('/packitem/findOne', passport.authenticate('jwt', { session: false }), packitemFindOne);
const packitemUpdate = require('./routes/packitem/update');
app.put('/packitem/update', passport.authenticate('jwt', { session: false }), packitemUpdate);
//po
const poCreate = require('./routes/po/create');
app.post('/po/create', passport.authenticate('jwt', { session: false }), poCreate);
const poDelete = require('./routes/po/delete');
app.delete('/po/delete', passport.authenticate('jwt', { session: false }), poDelete);
const poFindAll = require('./routes/po/findAll');
app.get('/po/findAll', passport.authenticate('jwt', { session: false }), poFindAll);
const poFindOne = require('./routes/po/findOne');
app.get('/po/findOne', passport.authenticate('jwt', { session: false }), poFindOne);
const poUpdate = require('./routes/po/update');
app.put('/po/update', passport.authenticate('jwt', { session: false }), poUpdate);
//project
const projectCreate = require('./routes/project/create');
app.post('/project/create', passport.authenticate('jwt', { session: false }), projectCreate);
const projectDelete = require('./routes/project/delete');
app.delete('/project/delete', passport.authenticate('jwt', { session: false }), projectDelete);
const projectFindAll = require('./routes/project/findAll');
app.get('/project/findAll', passport.authenticate('jwt', { session: false }), projectFindAll);
const projectFindOne = require('./routes/project/findOne');
app.get('/project/findOne', passport.authenticate('jwt', { session: false }), projectFindOne);
const projectUpdate = require('./routes/project/update');
app.put('/project/update', passport.authenticate('jwt', { session: false }), projectUpdate);
//sub
const subCreate = require('./routes/sub/create');
app.post('/sub/create', passport.authenticate('jwt', { session: false }), subCreate);
const subDelete = require('./routes/sub/delete');
app.delete('/sub/delete', passport.authenticate('jwt', { session: false }), subDelete);
const subFindAll = require('./routes/sub/findAll');
app.get('/sub/findAll', passport.authenticate('jwt', { session: false }), subFindAll);
const subFindOne = require('./routes/sub/findOne');
app.get('/sub/findOne', passport.authenticate('jwt', { session: false }), subFindOne);
const subUpdate = require('./routes/sub/update');
app.put('/sub/update', passport.authenticate('jwt', { session: false }), subUpdate);
//supplier
const supplierCreate = require('./routes/supplier/create');
app.post('/supplier/create', passport.authenticate('jwt', { session: false }), supplierCreate);
const supplierDelete = require('./routes/supplier/delete');
app.delete('/supplier/delete', passport.authenticate('jwt', { session: false }), supplierDelete);
const supplierFindAll = require('./routes/supplier/findAll');
app.get('/supplier/findAll', passport.authenticate('jwt', { session: false }), supplierFindAll);
const supplierFindOne = require('./routes/supplier/findOne');
app.get('/supplier/findOne', passport.authenticate('jwt', { session: false }), supplierFindOne);
const supplierUpdate = require('./routes/supplier/update');
app.put('/supplier/update', passport.authenticate('jwt', { session: false }), supplierUpdate);
//user
const userDelete = require('./routes/user/delete');
app.delete('/user/delete', passport.authenticate('jwt', { session: false }), userDelete);
const userFindAll = require('./routes/user/findAll');
app.get('/user/findAll', passport.authenticate('jwt', { session: false }), userFindAll);
const userFindOne = require('./routes/user/findOne');
app.get('/user/findOne', passport.authenticate('jwt', { session: false }), userFindOne);
const userRegister = require('./routes/user/register');
app.post('/user/register', passport.authenticate('jwt', { session: false }), userRegister);
const userUpdate = require('./routes/user/update');
app.put('/user/update', passport.authenticate('jwt', { session: false }), userUpdate);
//usersetting
const usersettingCreate = require('./routes/usersetting/create');
app.post('/usersetting/create', passport.authenticate('jwt', { session: false }), usersettingCreate);
const usersettingDelete = require('./routes/usersetting/delete');
app.delete('/usersetting/delete', passport.authenticate('jwt', { session: false }), usersettingDelete);
const usersettingFindAll = require('./routes/usersetting/findAll');
app.get('/usersetting/findAll', passport.authenticate('jwt', { session: false }), usersettingFindAll);
const usersettingFindOne = require('./routes/usersetting/findOne');
app.get('/usersetting/findOne', passport.authenticate('jwt', { session: false }), usersettingFindOne);
const usersettingUpdate = require('./routes/usersetting/update');
app.put('/usersetting/update', passport.authenticate('jwt', { session: false }), usersettingUpdate);

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