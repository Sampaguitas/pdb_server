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
//'https://www.vanleeuwenpdb.com', 'http://www.vanleeuwenpdb.com', 
var whitelist = ['http://localhost:8080', 'http://localhost:5555', 'https://pdb-client.herokuapp.com']
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
.connect(db,{useNewUrlParser:true, useUnifiedTopology: true})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Protected Routes
//access X
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
//area X
const areaCreate = require('./routes/area/create');
app.post('/area/create', passport.authenticate('jwt', { session: false }), areaCreate);
const areaDelete = require('./routes/area/delete');
app.delete('/area/delete', passport.authenticate('jwt', { session: false }), areaDelete);
const areaFindAll = require('./routes/area/findAll');
app.get('/area/findAll', passport.authenticate('jwt', { session: false }), areaFindAll);
const areaUpdate = require('./routes/area/update');
app.put('/area/update', passport.authenticate('jwt', { session: false }), areaUpdate);
//article X
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
//certificate X
const certificateCreate = require('./routes/certificate/create');
app.post('/certificate/create', passport.authenticate('jwt', { session: false }), certificateCreate);
const certificateDelete = require('./routes/certificate/delete');
app.delete('/certificate/delete', passport.authenticate('jwt', { session: false }), certificateDelete);
const certificateDeleteCif = require('./routes/certificate/deleteCif');
app.delete('/certificate/deleteCif', passport.authenticate('jwt', { session: false }), certificateDeleteCif);
const certificateDownloadCif = require('./routes/certificate/downloadCif');
app.get('/certificate/downloadCif', passport.authenticate('jwt', { session: false }), certificateDownloadCif);
const certificateDownloadHeat = require('./routes/certificate/downloadHeat');
app.get('/certificate/downloadHeat', passport.authenticate('jwt', { session: false }), certificateDownloadHeat);
const certificateFindAll = require('./routes/certificate/findAll');
app.get('/certificate/findAll', passport.authenticate('jwt', { session: false }), certificateFindAll);
const certificateFindOne = require('./routes/certificate/findOne');
app.get('/certificate/findOne', passport.authenticate('jwt', { session: false }), certificateFindOne);
const certificateUpdate = require('./routes/certificate/update');
app.put('/certificate/update', passport.authenticate('jwt', { session: false }), certificateUpdate);
const certificateUploadCif = require('./routes/certificate/uploadCif');
app.post('/certificate/uploadCif', passport.authenticate('jwt', { session: false }), certificateUploadCif);
//chart X
const chartDownload = require('./routes/chart/download');
app.get('/chart/download', passport.authenticate('jwt', { session: false }), chartDownload);
//collipack X
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
//collitype X
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
//counter X
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
//currency X
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
//doccountesr X
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
//doccountinspect X
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
//doccountinsprel X
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
//doccountnfi X
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
//doccountpf X
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
//doccountpl X
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
//doccountpn X
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
//doccountpt X
const doccountptCreate = require('./routes/doccountpt/create');
app.post('/doccountpt/create', passport.authenticate('jwt', { session: false }), doccountptCreate);
const doccountptDelete = require('./routes/doccountpt/delete');
app.delete('/doccountpt/delete', passport.authenticate('jwt', { session: false }), doccountptDelete);
const doccountptFindAll = require('./routes/doccountpt/findAll');
app.get('/doccountpt/findAll', passport.authenticate('jwt', { session: false }), doccountptFindAll);
const doccountptFindOne = require('./routes/doccountpt/findOne');
app.get('/doccountpt/findOne', passport.authenticate('jwt', { session: false }), doccountptFindOne);
const doccountptUpdate = require('./routes/doccountpt/update');
app.put('/doccountpt/update', passport.authenticate('jwt', { session: false }), doccountptUpdate);
//doccountsh X
const doccountshCreate = require('./routes/doccountsh/create');
app.post('/doccountsh/create', passport.authenticate('jwt', { session: false }), doccountshCreate);
const doccountshDelete = require('./routes/doccountsh/delete');
app.delete('/doccountsh/delete', passport.authenticate('jwt', { session: false }), doccountshDelete);
const doccountshFindAll = require('./routes/doccountsh/findAll');
app.get('/doccountsh/findAll', passport.authenticate('jwt', { session: false }), doccountshFindAll);
const doccountshFindOne = require('./routes/doccountsh/findOne');
app.get('/doccountsh/findOne', passport.authenticate('jwt', { session: false }), doccountshFindOne);
const doccountshUpdate = require('./routes/doccountsh/update');
app.put('/doccountsh/update', passport.authenticate('jwt', { session: false }), doccountshUpdate);
//doccountsi X
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
//doccountsm X
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
//docdef X
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
//docfield X
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
//docflow X
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
//doctype X
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
//duf X
const dufDownload = require('./routes/duf/download');
app.get('/duf/download', passport.authenticate('jwt', { session: false }), dufDownload);
const dufDownloadGr = require('./routes/duf/downloadGr');
app.get('/duf/downloadGr', passport.authenticate('jwt', { session: false }), dufDownloadGr);
const dufUpload = require('./routes/duf/upload');
app.post('/duf/upload', passport.authenticate('jwt', { session: false }), dufUpload);
const dufUploadGr = require('./routes/duf/uploadGr');
app.post('/duf/uploadGr', passport.authenticate('jwt', { session: false }), dufUploadGr);
//erp X
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
//extract X
const extractDownload = require('./routes/extract/download');
app.post('/extract/download', passport.authenticate('jwt', { session: false }), extractDownload);
const extractDownloadExp = require('./routes/extract/downloadExp');
app.post('/extract/downloadExp', passport.authenticate('jwt', { session: false }), extractDownloadExp);
const extractDownloadInspCert = require('./routes/extract/downloadInspCert');
app.post('/extract/downloadInspCert', passport.authenticate('jwt', { session: false }), extractDownloadInspCert);
const extractDownloadInspRel = require('./routes/extract/downloadInspRel');
app.post('/extract/downloadInspRel', passport.authenticate('jwt', { session: false }), extractDownloadInspRel);
const extractDownloadMir = require('./routes/extract/downloadMir');
app.post('/extract/downloadMir', passport.authenticate('jwt', { session: false }), extractDownloadMir);
const extractDownloadMirSplit = require('./routes/extract/downloadMirSplit');
app.post('/extract/downloadMirSplit', passport.authenticate('jwt', { session: false }), extractDownloadMirSplit);
const extractDownloadStockMana = require('./routes/extract/downloadStockMana');
app.post('/extract/downloadStockMana', passport.authenticate('jwt', { session: false }), extractDownloadStockMana);
const extractDownloadTransDocs = require('./routes/extract/downloadTransDocs');
app.post('/extract/downloadTransDocs', passport.authenticate('jwt', { session: false }), extractDownloadTransDocs);
const extractDownloadPackDetails = require('./routes/extract/downloadPackDetails');
app.post('/extract/downloadPackDetails', passport.authenticate('jwt', { session: false }), extractDownloadPackDetails);
const extractSetCollitype = require('./routes/extract/setCollitype');
app.put('/extract/setCollitype', passport.authenticate('jwt', { session: false }), extractSetCollitype);
const extractSetWeight = require('./routes/extract/setWeight');
app.put('/extract/setWeight', passport.authenticate('jwt', { session: false }), extractSetWeight);
const extractSetWhCollitype = require('./routes/extract/setWhCollitype');
app.put('/extract/setWhCollitype', passport.authenticate('jwt', { session: false }), extractSetWhCollitype);
const extractSetWhWeight = require('./routes/extract/setWhWeight');
app.put('/extract/setWhWeight', passport.authenticate('jwt', { session: false }), extractSetWhWeight);
const extractUpdate = require('./routes/extract/update');
app.put('/extract/update', passport.authenticate('jwt', { session: false }), extractUpdate);
const extractUpload = require('./routes/extract/upload');
app.post('/extract/upload', passport.authenticate('jwt', { session: false }), extractUpload);
const extractUploadExp = require('./routes/extract/uploadExp');
app.post('/extract/uploadExp', passport.authenticate('jwt', { session: false }), extractUploadExp);
const extractUploadMirSplit = require('./routes/extract/uploadMirSplit');
app.post('/extract/uploadMirSplit', passport.authenticate('jwt', { session: false }), extractUploadMirSplit);
const extractUploadInspRel = require('./routes/extract/uploadInspRel');
app.post('/extract/uploadInspRel', passport.authenticate('jwt', { session: false }), extractUploadInspRel);
const extractUploadPackDetails = require('./routes/extract/uploadPackDetails');
app.post('/extract/uploadPackDetails', passport.authenticate('jwt', { session: false }), extractUploadPackDetails);
const extractUploadTransDocs = require('./routes/extract/uploadTransDocs');
app.post('/extract/uploadTransDocs', passport.authenticate('jwt', { session: false }), extractUploadTransDocs);
//field X downloadMir
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
//fieldname X
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
//heat X
const heatCreate = require('./routes/heat/create');
app.post('/heat/create', passport.authenticate('jwt', { session: false }), heatCreate);
const heatDelete = require('./routes/heat/delete');
app.delete('/heat/delete', passport.authenticate('jwt', { session: false }), heatDelete);
const heatFindAll = require('./routes/heat/findAll');
app.get('/heat/findAll', passport.authenticate('jwt', { session: false }), heatFindAll);
const heatFindOne = require('./routes/heat/findOne');
app.get('/heat/findOne', passport.authenticate('jwt', { session: false }), heatFindOne);
const heatUpdate = require('./routes/heat/update');
app.put('/heat/update', passport.authenticate('jwt', { session: false }), heatUpdate);
//heatloc X
const heatlocCreate = require('./routes/heatloc/create');
app.post('/heatloc/create', passport.authenticate('jwt', { session: false }), heatlocCreate);
const heatlocDelete = require('./routes/heatloc/delete');
app.delete('/heatloc/delete', passport.authenticate('jwt', { session: false }), heatlocDelete);
const heatlocFindAll = require('./routes/heatloc/findAll');
app.get('/heatloc/findAll', passport.authenticate('jwt', { session: false }), heatlocFindAll);
const heatlocUpdate = require('./routes/heatloc/update');
app.put('/heatloc/update', passport.authenticate('jwt', { session: false }), heatlocUpdate);
//heatPick X
const heatpickCreate = require('./routes/heatpick/create');
app.post('/heatpick/create', passport.authenticate('jwt', { session: false }), heatpickCreate);
const heatpickDelete = require('./routes/heatpick/delete');
app.delete('/heatpick/delete', passport.authenticate('jwt', { session: false }), heatpickDelete);
const heatpickFindAll = require('./routes/heatpick/findAll');
app.get('/heatpick/findAll', passport.authenticate('jwt', { session: false }), heatpickFindAll);
const heatpickUpdate = require('./routes/heatpick/update');
app.put('/heatpick/update', passport.authenticate('jwt', { session: false }), heatpickUpdate);
//locale X
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
//location X
const locationCreate = require('./routes/location/create');
app.post('/location/create', passport.authenticate('jwt', { session: false }), locationCreate);
const locationDownload = require('./routes/location/download');
app.get('/location/download', passport.authenticate('jwt', { session: false }), locationDownload);
const locationDelete = require('./routes/location/delete');
app.delete('/location/delete', passport.authenticate('jwt', { session: false }), locationDelete);
const locationFindAll = require('./routes/location/findAll');
app.get('/location/findAll', passport.authenticate('jwt', { session: false }), locationFindAll);
const locationUpdate = require('./routes/location/update');
app.put('/location/update', passport.authenticate('jwt', { session: false }), locationUpdate);
const locationUpload = require('./routes/location/upload');
app.post('/location/upload', passport.authenticate('jwt', { session: false }), locationUpload);
//mir X
const mirCreate = require('./routes/mir/create');
app.post('/mir/create', passport.authenticate('jwt', { session: false }), mirCreate);
const mirDelete = require('./routes/mir/delete');
app.delete('/mir/delete', passport.authenticate('jwt', { session: false }), mirDelete);
const mirFindAll = require('./routes/mir/findAll');
app.get('/mir/findAll', passport.authenticate('jwt', { session: false }), mirFindAll);
const mirUpdate = require('./routes/mir/update');
app.put('/mir/update', passport.authenticate('jwt', { session: false }), mirUpdate);
//miritem X
const miritemCreate = require('./routes/miritem/create');
app.post('/miritem/create', passport.authenticate('jwt', { session: false }), miritemCreate);
const miritemDelete = require('./routes/miritem/delete');
app.delete('/miritem/delete', passport.authenticate('jwt', { session: false }), miritemDelete);
const miritemFindAll = require('./routes/miritem/findAll');
app.get('/miritem/findAll', passport.authenticate('jwt', { session: false }), miritemFindAll);
const miritemUpdate = require('./routes/miritem/update');
app.put('/miritem/update', passport.authenticate('jwt', { session: false }), miritemUpdate);
//opco X
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
//packitem X
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
//pickitem X
const pickitemDelete = require('./routes/pickitem/delete');
app.delete('/pickitem/delete', passport.authenticate('jwt', { session: false }), pickitemDelete);
const pickitemUpdate = require('./routes/pickitem/update');
app.put('/pickitem/update', passport.authenticate('jwt', { session: false }), pickitemUpdate);
//pickticket X
const pickticketClose = require('./routes/pickticket/close');
app.put('/pickticket/close', passport.authenticate('jwt', { session: false }), pickticketClose);
const pickticketCreate = require('./routes/pickticket/create');
app.post('/pickticket/create', passport.authenticate('jwt', { session: false }), pickticketCreate);
const pickticketDelete = require('./routes/pickticket/delete');
app.delete('/pickticket/delete', passport.authenticate('jwt', { session: false }), pickticketDelete);
const pickticketFindAll = require('./routes/pickticket/findAll');
app.get('/pickticket/findAll', passport.authenticate('jwt', { session: false }), pickticketFindAll);
const pickticketOpen = require('./routes/pickticket/open');
app.put('/pickticket/open', passport.authenticate('jwt', { session: false }), pickticketOpen);
const pickticketUpdate = require('./routes/pickticket/update');
app.put('/pickticket/update', passport.authenticate('jwt', { session: false }), pickticketUpdate);
//po X
const poCreate = require('./routes/po/create');
app.post('/po/create', passport.authenticate('jwt', { session: false }), poCreate);
const poDelete = require('./routes/po/delete');
app.delete('/po/delete', passport.authenticate('jwt', { session: false }), poDelete);
const poFindAll = require('./routes/po/findAll');
app.get('/po/findAll', passport.authenticate('jwt', { session: false }), poFindAll);
const poFindOne = require('./routes/po/findOne');
app.get('/po/findOne', passport.authenticate('jwt', { session: false }), poFindOne);
const poGetRevisions = require('./routes/po/getRevisions');
app.get('/po/getRevisions', passport.authenticate('jwt', { session: false }), poGetRevisions);
const poOpenOrders = require('./routes/po/openOrders');
app.get('/po/openOrders', passport.authenticate('jwt', { session: false }), poOpenOrders);
const poUpdate = require('./routes/po/update');
app.put('/po/update', passport.authenticate('jwt', { session: false }), poUpdate);
//project X
const projectCleanup = require('./routes/project/cleanup');
app.post('/project/cleanup', passport.authenticate('jwt', { session: false }), projectCleanup);
const projectCreate = require('./routes/project/create');
app.post('/project/create', passport.authenticate('jwt', { session: false }), projectCreate);
const projectDelete = require('./routes/project/delete');
app.delete('/project/delete', passport.authenticate('jwt', { session: false }), projectDelete);
const projectFindAll = require('./routes/project/findAll');
app.get('/project/findAll', passport.authenticate('jwt', { session: false }), projectFindAll);
const projectFindOne = require('./routes/project/findOne');
app.get('/project/findOne', passport.authenticate('jwt', { session: false }), projectFindOne);
const projectReport = require('./routes/project/report');
app.get('/project/report', passport.authenticate('jwt', { session: false }), projectReport);
const projectSelection = require('./routes/project/selection');
app.get('/project/selection', passport.authenticate('jwt', { session: false }), projectSelection);
const projectUpdate = require('./routes/project/update');
app.put('/project/update', passport.authenticate('jwt', { session: false }), projectUpdate);
const projectUpdateCifName = require('./routes/project/updateCifName');
app.put('/project/updateCifName', passport.authenticate('jwt', { session: false }), projectUpdateCifName);
//region X
const regionCreate = require('./routes/region/create');
app.post('/region/create', passport.authenticate('jwt', { session: false }), regionCreate);
const regionDelete = require('./routes/region/delete');
app.delete('/region/delete', passport.authenticate('jwt', { session: false }), regionDelete);
const regionFindAll = require('./routes/region/findAll');
app.get('/region/findAll', passport.authenticate('jwt', { session: false }), regionFindAll);
const regionFindOne = require('./routes/region/findOne');
app.get('/region/findOne', passport.authenticate('jwt', { session: false }), regionFindOne);
const regionUpdate = require('./routes/region/update');
app.put('/region/update', passport.authenticate('jwt', { session: false }), regionUpdate);
//screen X
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
//setting X
const settingFindAll = require('./routes/setting/findAll');
app.get('/setting/findAll', passport.authenticate('jwt', { session: false }), settingFindAll);
const settingUpsert = require('./routes/setting/upsert');
app.put('/setting/upsert', passport.authenticate('jwt', { session: false }), settingUpsert);
//split X
const splitPackitem = require('./routes/split/packitem');
app.put('/split/packitem', passport.authenticate('jwt', { session: false }), splitPackitem);
const splitSub = require('./routes/split/sub');
app.put('/split/sub', passport.authenticate('jwt', { session: false }), splitSub);
const splitWhPackitem = require('./routes/split/whpackitem');
app.put('/split/whpackitem', passport.authenticate('jwt', { session: false }), splitWhPackitem);
//sub X
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
//supplier X
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
//template X
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
const templateGenerate = require('./routes/template/generate');
app.get('/template/generate', passport.authenticate('jwt', { session: false }), templateGenerate);
const templateGenerateEsr = require('./routes/template/generateEsr');
app.post('/template/generateEsr', passport.authenticate('jwt', { session: false }), templateGenerateEsr);
const templateGenerateNfi = require('./routes/template/generateNfi');
app.get('/template/generateNfi', passport.authenticate('jwt', { session: false }), templateGenerateNfi);
const templateGeneratePl = require('./routes/template/generatePl');
app.get('/template/generatePl', passport.authenticate('jwt', { session: false }), templateGeneratePl);
const templateGeneratePn = require('./routes/template/generatePn');
app.get('/template/generatePn', passport.authenticate('jwt', { session: false }), templateGeneratePn);
const templateGeneratePt = require('./routes/template/generatePt');
app.post('/template/generatePt', passport.authenticate('jwt', { session: false }), templateGeneratePt);
const templateGenerateSh = require('./routes/template/generateSh');
app.post('/template/generateSh', passport.authenticate('jwt', { session: false }), templateGenerateSh);
const templateGenerateSi = require('./routes/template/generateSi');
app.get('/template/generateSi', passport.authenticate('jwt', { session: false }), templateGenerateSi);
const templateGenerateSm = require('./routes/template/generateSm');
app.get('/template/generateSm', passport.authenticate('jwt', { session: false }), templateGenerateSm);
const templateGenerateWhPl = require('./routes/template/generateWhPl');
app.get('/template/generateWhPl', passport.authenticate('jwt', { session: false }), templateGenerateWhPl);
const templateGenerateWhPn = require('./routes/template/generateWhPn');
app.get('/template/generateWhPn', passport.authenticate('jwt', { session: false }), templateGenerateWhPn);
const templateGenerateWhSi = require('./routes/template/generateWhSi');
app.get('/template/generateWhSi', passport.authenticate('jwt', { session: false }), templateGenerateWhSi);
const templateGenerateWhSm = require('./routes/template/generateWhSm');
app.get('/template/generateWhSm', passport.authenticate('jwt', { session: false }), templateGenerateWhSm);
const templatePreview = require('./routes/template/preview');
app.get('/template/preview', passport.authenticate('jwt', { session: false }), templatePreview);
const templateUpload = require('./routes/template/upload');
app.post('/template/upload', passport.authenticate('jwt', { session: false }), templateUpload);
//transaction X
const transactionCorrection = require('./routes/transaction/correction');
app.post('/transaction/correction', passport.authenticate('jwt', { session: false }), transactionCorrection);
const transactionDelete = require('./routes/transaction/delete');
app.delete('/transaction/delete', passport.authenticate('jwt', { session: false }), transactionDelete);
const transactionFindAll = require('./routes/transaction/findAll');
app.get('/transaction/findAll', passport.authenticate('jwt', { session: false }), transactionFindAll);
const transactionGoodsReceiptNfi = require('./routes/transaction/goodsReceiptNfi');
app.post('/transaction/goodsReceiptNfi', passport.authenticate('jwt', { session: false }), transactionGoodsReceiptNfi);
const transactionGoodsReceiptPl = require('./routes/transaction/goodsReceiptPl');
app.post('/transaction/goodsReceiptPl', passport.authenticate('jwt', { session: false }), transactionGoodsReceiptPl);
const transactionGoodsReceiptPo = require('./routes/transaction/goodsReceiptPo');
app.post('/transaction/goodsReceiptPo', passport.authenticate('jwt', { session: false }), transactionGoodsReceiptPo);
const transactionGoodsReceiptRet = require('./routes/transaction/goodsReceiptRet');
app.post('/transaction/goodsReceiptRet', passport.authenticate('jwt', { session: false }), transactionGoodsReceiptRet);
const transactionTransfer = require('./routes/transaction/transfer');
app.post('/transaction/transfer', passport.authenticate('jwt', { session: false }), transactionTransfer);
//user X
const userChangePwd = require('./routes/user/changePwd');
app.put('/user/changePwd', passport.authenticate('jwt', { session: false }), userChangePwd);
const userDelete = require('./routes/user/delete');
app.delete('/user/delete', passport.authenticate('jwt', { session: false }), userDelete);
const userFindAll = require('./routes/user/findAll');
app.get('/user/findAll', passport.authenticate('jwt', { session: false }), userFindAll);
const userFindOne = require('./routes/user/findOne');
app.get('/user/findOne', passport.authenticate('jwt', { session: false }), userFindOne);
const userRegister = require('./routes/user/register');
app.post('/user/register', passport.authenticate('jwt', { session: false }), userRegister);
//open -> login
//open -> requestPwd
//open -> resetPwd
const userSetAdmin = require('./routes/user/setAdmin');
app.put('/user/setAdmin', passport.authenticate('jwt', { session: false }), userSetAdmin);
const userSetSpAdmin = require('./routes/user/setSpAdmin');
app.put('/user/setSpAdmin', passport.authenticate('jwt', { session: false }), userSetSpAdmin);
const userUpdate = require('./routes/user/update');
app.put('/user/update', passport.authenticate('jwt', { session: false }), userUpdate);
//warehouse X
const warehouseCreate = require('./routes/warehouse/create');
app.post('/warehouse/create', passport.authenticate('jwt', { session: false }), warehouseCreate);
const warehouseDelete = require('./routes/warehouse/delete');
app.delete('/warehouse/delete', passport.authenticate('jwt', { session: false }), warehouseDelete);
const warehouseFindAll = require('./routes/warehouse/findAll');
app.get('/warehouse/findAll', passport.authenticate('jwt', { session: false }), warehouseFindAll);
const warehouseUpdate = require('./routes/warehouse/update');
app.put('/warehouse/update', passport.authenticate('jwt', { session: false }), warehouseUpdate);
//whcollipack X
const whcollipackCreate = require('./routes/whcollipack/create');
app.post('/whcollipack/create', passport.authenticate('jwt', { session: false }), whcollipackCreate);
const whcollipackDelete = require('./routes/whcollipack/delete');
app.delete('/whcollipack/delete', passport.authenticate('jwt', { session: false }), whcollipackDelete);
const whcollipackFindAll = require('./routes/whcollipack/findAll');
app.get('/whcollipack/findAll', passport.authenticate('jwt', { session: false }), whcollipackFindAll);
const whcollipackFindOne = require('./routes/whcollipack/findOne');
app.get('/whcollipack/findOne', passport.authenticate('jwt', { session: false }), whcollipackFindOne);
const whcollipackUpdate = require('./routes/whcollipack/update');
app.put('/whcollipack/update', passport.authenticate('jwt', { session: false }), whcollipackUpdate);
//whpackitem X
const whpackitemCreate = require('./routes/whpackitem/create');
app.post('/whpackitem/create', passport.authenticate('jwt', { session: false }), whpackitemCreate);
const whpackitemDelete = require('./routes/whpackitem/delete');
app.delete('/whpackitem/delete', passport.authenticate('jwt', { session: false }), whpackitemDelete);
const whpackitemFindAll = require('./routes/whpackitem/findAll');
app.get('/whpackitem/findAll', passport.authenticate('jwt', { session: false }), whpackitemFindAll);
const whpackitemFindOne = require('./routes/whpackitem/findOne');
app.get('/whpackitem/findOne', passport.authenticate('jwt', { session: false }), whpackitemFindOne);
const whpackitemUpdate = require('./routes/whpackitem/update');
app.put('/whpackitem/update', passport.authenticate('jwt', { session: false }), whpackitemUpdate);



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