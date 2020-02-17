const express = require('express');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const glob = require('glob');
const _ = require('lodash');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
//const bcrypt = require('bcryptjs');
const fs = require('fs');

const app = express();

var whitelist = ['https://www.vanleeuwenpdb.com', 'http://www.vanleeuwenpdb.com', 'http://localhost:8080', 'http://localhost:5555', 'https://pdb-client.herokuapp.com/']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
        } else {
        callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors(corsOptions));

// app.use(cors());
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
//access
const accessCreate = require('./routes/access/create');
app.post('/access/create', passport.authenticate('jwt', { session: false }), accessCreate);
const accessDelete = require('./routes/access/delete');
app.delete('/access/delete', passport.authenticate('jwt', { session: false }), accessDelete);
const accessFindAll = require('./routes/access/findAll');
app.get('/access/findAll', passport.authenticate('jwt', { session: false }), accessFindAll);
const accessFindOne = require('./routes/access/findOne');
app.get('/access/findOne', passport.authenticate('jwt', { session: false }), accessFindOne);
const accessUpdate = require('./routes/access/update');
app.put('/access/update', passport.authenticate('jwt', { session: false }), accessUpdate);
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
//certificate
const certificateCreate = require('./routes/certificate/create');
app.post('/certificate/create', passport.authenticate('jwt', { session: false }), certificateCreate);
const certificateDelete = require('./routes/certificate/delete');
app.delete('/certificate/delete', passport.authenticate('jwt', { session: false }), certificateDelete);
const certificateFindAll = require('./routes/certificate/findAll');
app.get('/certificate/findAll', passport.authenticate('jwt', { session: false }), certificateFindAll);
const certificateFindOne = require('./routes/certificate/findOne');
app.get('/certificate/findOne', passport.authenticate('jwt', { session: false }), certificateFindOne);
const certificateUpdate = require('./routes/certificate/update');
app.put('/certificate/update', passport.authenticate('jwt', { session: false }), certificateUpdate);
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
//currency
const currencyCreate = require('./routes/currency/create');
app.post('/currency/create', passport.authenticate('jwt', { session: false }), currencyCreate);
const currencyDelete = require('./routes/currency/delete');
app.delete('/currency/delete', passport.authenticate('jwt', { session: false }), currencyDelete);
const currencyFindAll = require('./routes/currency/findAll');
app.get('/currency/findAll', passport.authenticate('jwt', { session: false }), currencyFindAll);
const currencyFindOne = require('./routes/currency/findOne');
app.get('/currency/findOne', passport.authenticate('jwt', { session: false }), currencyFindOne);
const currencyUpdate = require('./routes/currency/update');
app.put('/currency/update', passport.authenticate('jwt', { session: false }), currencyUpdate);
//doccountesr
const doccountesrCreate = require('./routes/doccountesr/create');
app.post('/doccountesr/create', passport.authenticate('jwt', { session: false }), doccountesrCreate);
const doccountesrDelete = require('./routes/doccountesr/delete');
app.delete('/doccountesr/delete', passport.authenticate('jwt', { session: false }), doccountesrDelete);
const doccountesrFindAll = require('./routes/doccountesr/findAll');
app.get('/doccountesr/findAll', passport.authenticate('jwt', { session: false }), doccountesrFindAll);
const doccountesrFindOne = require('./routes/doccountesr/findOne');
app.get('/doccountesr/findOne', passport.authenticate('jwt', { session: false }), doccountesrFindOne);
const doccountesrUpdate = require('./routes/doccountesr/update');
app.put('/doccountesr/update', passport.authenticate('jwt', { session: false }), doccountesrUpdate);
//doccountinspect
const doccountinspectCreate = require('./routes/doccountinspect/create');
app.post('/doccountinspect/create', passport.authenticate('jwt', { session: false }), doccountinspectCreate);
const doccountinspectDelete = require('./routes/doccountinspect/delete');
app.delete('/doccountinspect/delete', passport.authenticate('jwt', { session: false }), doccountinspectDelete);
const doccountinspectFindAll = require('./routes/doccountinspect/findAll');
app.get('/doccountinspect/findAll', passport.authenticate('jwt', { session: false }), doccountinspectFindAll);
const doccountinspectFindOne = require('./routes/doccountinspect/findOne');
app.get('/doccountinspect/findOne', passport.authenticate('jwt', { session: false }), doccountinspectFindOne);
const doccountinspectUpdate = require('./routes/doccountinspect/update');
app.put('/doccountinspect/update', passport.authenticate('jwt', { session: false }), doccountinspectUpdate);
//doccountinsprel
const doccountinsprelCreate = require('./routes/doccountinsprel/create');
app.post('/doccountinsprel/create', passport.authenticate('jwt', { session: false }), doccountinsprelCreate);
const doccountinsprelDelete = require('./routes/doccountinsprel/delete');
app.delete('/doccountinsprel/delete', passport.authenticate('jwt', { session: false }), doccountinsprelDelete);
const doccountinsprelFindAll = require('./routes/doccountinsprel/findAll');
app.get('/doccountinsprel/findAll', passport.authenticate('jwt', { session: false }), doccountinsprelFindAll);
const doccountinsprelFindOne = require('./routes/doccountinsprel/findOne');
app.get('/doccountinsprel/findOne', passport.authenticate('jwt', { session: false }), doccountinsprelFindOne);
const doccountinsprelUpdate = require('./routes/doccountinsprel/update');
app.put('/doccountinsprel/update', passport.authenticate('jwt', { session: false }), doccountinsprelUpdate);
//doccountnfi
const doccountnfiCreate = require('./routes/doccountnfi/create');
app.post('/doccountnfi/create', passport.authenticate('jwt', { session: false }), doccountnfiCreate);
const doccountnfiDelete = require('./routes/doccountnfi/delete');
app.delete('/doccountnfi/delete', passport.authenticate('jwt', { session: false }), doccountnfiDelete);
const doccountnfiFindAll = require('./routes/doccountnfi/findAll');
app.get('/doccountnfi/findAll', passport.authenticate('jwt', { session: false }), doccountnfiFindAll);
const doccountnfiFindOne = require('./routes/doccountnfi/findOne');
app.get('/doccountnfi/findOne', passport.authenticate('jwt', { session: false }), doccountnfiFindOne);
const doccountnfiUpdate = require('./routes/doccountnfi/update');
app.put('/doccountnfi/update', passport.authenticate('jwt', { session: false }), doccountnfiUpdate);
//doccountpf
const doccountpfCreate = require('./routes/doccountpf/create');
app.post('/doccountpf/create', passport.authenticate('jwt', { session: false }), doccountpfCreate);
const doccountpfDelete = require('./routes/doccountpf/delete');
app.delete('/doccountpf/delete', passport.authenticate('jwt', { session: false }), doccountpfDelete);
const doccountpfFindAll = require('./routes/doccountpf/findAll');
app.get('/doccountpf/findAll', passport.authenticate('jwt', { session: false }), doccountpfFindAll);
const doccountpfFindOne = require('./routes/doccountpf/findOne');
app.get('/doccountpf/findOne', passport.authenticate('jwt', { session: false }), doccountpfFindOne);
const doccountpfUpdate = require('./routes/doccountpf/update');
app.put('/doccountpf/update', passport.authenticate('jwt', { session: false }), doccountpfUpdate);
//doccountpl
const doccountplCreate = require('./routes/doccountpl/create');
app.post('/doccountpl/create', passport.authenticate('jwt', { session: false }), doccountplCreate);
const doccountplDelete = require('./routes/doccountpl/delete');
app.delete('/doccountpl/delete', passport.authenticate('jwt', { session: false }), doccountplDelete);
const doccountplFindAll = require('./routes/doccountpl/findAll');
app.get('/doccountpl/findAll', passport.authenticate('jwt', { session: false }), doccountplFindAll);
const doccountplFindOne = require('./routes/doccountpl/findOne');
app.get('/doccountpl/findOne', passport.authenticate('jwt', { session: false }), doccountplFindOne);
const doccountplUpdate = require('./routes/doccountpl/update');
app.put('/doccountpl/update', passport.authenticate('jwt', { session: false }), doccountplUpdate);
//doccountpn
const doccountpnCreate = require('./routes/doccountpn/create');
app.post('/doccountpn/create', passport.authenticate('jwt', { session: false }), doccountpnCreate);
const doccountpnDelete = require('./routes/doccountpn/delete');
app.delete('/doccountpn/delete', passport.authenticate('jwt', { session: false }), doccountpnDelete);
const doccountpnFindAll = require('./routes/doccountpn/findAll');
app.get('/doccountpn/findAll', passport.authenticate('jwt', { session: false }), doccountpnFindAll);
const doccountpnFindOne = require('./routes/doccountpn/findOne');
app.get('/doccountpn/findOne', passport.authenticate('jwt', { session: false }), doccountpnFindOne);
const doccountpnUpdate = require('./routes/doccountpn/update');
app.put('/doccountpn/update', passport.authenticate('jwt', { session: false }), doccountpnUpdate);
//doccountsi
const doccountsiCreate = require('./routes/doccountsi/create');
app.post('/doccountsi/create', passport.authenticate('jwt', { session: false }), doccountsiCreate);
const doccountsiDelete = require('./routes/doccountsi/delete');
app.delete('/doccountsi/delete', passport.authenticate('jwt', { session: false }), doccountsiDelete);
const doccountsiFindAll = require('./routes/doccountsi/findAll');
app.get('/doccountsi/findAll', passport.authenticate('jwt', { session: false }), doccountsiFindAll);
const doccountsiFindOne = require('./routes/doccountsi/findOne');
app.get('/doccountsi/findOne', passport.authenticate('jwt', { session: false }), doccountsiFindOne);
const doccountsiUpdate = require('./routes/doccountsi/update');
app.put('/doccountsi/update', passport.authenticate('jwt', { session: false }), doccountsiUpdate);
//doccountsm
const doccountsmCreate = require('./routes/doccountsm/create');
app.post('/doccountsm/create', passport.authenticate('jwt', { session: false }), doccountsmCreate);
const doccountsmDelete = require('./routes/doccountsm/delete');
app.delete('/doccountsm/delete', passport.authenticate('jwt', { session: false }), doccountsmDelete);
const doccountsmFindAll = require('./routes/doccountsm/findAll');
app.get('/doccountsm/findAll', passport.authenticate('jwt', { session: false }), doccountsmFindAll);
const doccountsmFindOne = require('./routes/doccountsm/findOne');
app.get('/doccountsm/findOne', passport.authenticate('jwt', { session: false }), doccountsmFindOne);
const doccountsmUpdate = require('./routes/doccountsm/update');
app.put('/doccountsm/update', passport.authenticate('jwt', { session: false }), doccountsmUpdate);
//docdef
const docdefCreate = require('./routes/docdef/create');
app.post('/docdef/create', passport.authenticate('jwt', { session: false }), docdefCreate);
const docdefDelete = require('./routes/docdef/delete');
app.delete('/docdef/delete', passport.authenticate('jwt', { session: false }), docdefDelete);
const docdefFindAll = require('./routes/docdef/findAll');
app.get('/docdef/findAll', passport.authenticate('jwt', { session: false }), docdefFindAll);
const docdefFindOne = require('./routes/docdef/findOne');
app.get('/docdef/findOne', passport.authenticate('jwt', { session: false }), docdefFindOne);
const docdefUpdate = require('./routes/docdef/update');
app.put('/docdef/update', passport.authenticate('jwt', { session: false }), docdefUpdate);
//docfield
const docfieldCreate = require('./routes/docfield/create');
app.post('/docfield/create', passport.authenticate('jwt', { session: false }), docfieldCreate);
const docfieldDelete = require('./routes/docfield/delete');
app.delete('/docfield/delete', passport.authenticate('jwt', { session: false }), docfieldDelete);
const docfieldFindAll = require('./routes/docfield/findAll');
app.get('/docfield/findAll', passport.authenticate('jwt', { session: false }), docfieldFindAll);
const docfieldFindOne = require('./routes/docfield/findOne');
app.get('/docfield/findOne', passport.authenticate('jwt', { session: false }), docfieldFindOne);
const docfieldUpdate = require('./routes/docfield/update');
app.put('/docfield/update', passport.authenticate('jwt', { session: false }), docfieldUpdate);
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
//doctype
const doctypeCreate = require('./routes/doctype/create');
app.post('/doctype/create', passport.authenticate('jwt', { session: false }), doctypeCreate);
const doctypeDelete = require('./routes/doctype/delete');
app.delete('/doctype/delete', passport.authenticate('jwt', { session: false }), doctypeDelete);
const doctypeFindAll = require('./routes/doctype/findAll');
app.get('/doctype/findAll', passport.authenticate('jwt', { session: false }), doctypeFindAll);
const doctypeFindOne = require('./routes/doctype/findOne');
app.get('/doctype/findOne', passport.authenticate('jwt', { session: false }), doctypeFindOne);
const doctypeUpdate = require('./routes/doctype/update');
app.put('/doctype/update', passport.authenticate('jwt', { session: false }), doctypeUpdate);
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
const projectSelection = require('./routes/project/selection');
app.get('/project/selection', passport.authenticate('jwt', { session: false }), projectSelection);
const projectUpdate = require('./routes/project/update');
app.put('/project/update', passport.authenticate('jwt', { session: false }), projectUpdate);
//screen
const screenCreate = require('./routes/screen/create');
app.post('/screen/create', passport.authenticate('jwt', { session: false }), screenCreate);
const screenDelete = require('./routes/screen/delete');
app.delete('/screen/delete', passport.authenticate('jwt', { session: false }), screenDelete);
const screenFindAll = require('./routes/screen/findAll');
app.get('/screen/findAll', passport.authenticate('jwt', { session: false }), screenFindAll);
const screenFindOne = require('./routes/screen/findOne');
app.get('/screen/findOne', passport.authenticate('jwt', { session: false }), screenFindOne);
const screenUpdate = require('./routes/screen/update');
app.put('/screen/update', passport.authenticate('jwt', { session: false }), screenUpdate);
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
const userChangePwd = require('./routes/user/changePwd');
app.put('/user/changePwd', passport.authenticate('jwt', { session: false }), userChangePwd);
const userSetAdmin = require('./routes/user/setAdmin');
app.put('/user/setAdmin', passport.authenticate('jwt', { session: false }), userSetAdmin);
const userSetSpAdmin = require('./routes/user/setSpAdmin');
app.put('/user/setSpAdmin', passport.authenticate('jwt', { session: false }), userSetSpAdmin);
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
//template
const templateDeleteFile = require('./routes/template/deleteFile');
app.delete('/template/deleteFile', passport.authenticate('jwt', { session: false }), templateDeleteFile);
const templateDeleteProject = require('./routes/template/deleteProject');
app.delete('/template/deleteProject', passport.authenticate('jwt', { session: false }), templateDeleteProject);
const templateDownload = require('./routes/template/download');
app.get('/template/download', passport.authenticate('jwt', { session: false }), templateDownload);
const templateDuplicateProject = require('./routes/template/duplicateProject');
app.post('/template/duplicateProject', passport.authenticate('jwt', { session: false }), templateDuplicateProject);
const templateFindAll = require('./routes/template/findAll');
app.get('/template/findAll', passport.authenticate('jwt', { session: false }), templateFindAll);
const templateUpload = require('./routes/template/upload');
app.post('/template/upload', passport.authenticate('jwt', { session: false }), templateUpload);


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