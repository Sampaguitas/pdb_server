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
 
// var whitelist = ['http://localhost:8080', 'http://localhost:5555', 'https://pdb-client.herokuapp.com']
// var corsOptions = {
//     origin: function (origin, callback) {
//         if (whitelist.indexOf(origin) !== -1) {
//         callback(null, true)
//         } else {
//         callback(new Error('Not allowed by CORS'))
//         }
//     }
// }

// app.use(cors(corsOptions));
app.use(cors());

//bodyParser middleware
// app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
// app.use(bodyParser.json({ limit: '10mb' }));

app
.use(bodyParser.urlencoded({extended:false}))
.use(bodyParser.json());

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
app.use('/access/create', passport.authenticate('jwt', { session: false }), require('./routes/access/create'));
app.use('/access/delete', passport.authenticate('jwt', { session: false }), require('./routes/access/delete'));
app.use('/access/findAll', passport.authenticate('jwt', { session: false }), require('./routes/access/findAll'));
app.use('/access/findOne', passport.authenticate('jwt', { session: false }), require('./routes/access/findOne'));
app.use('/access/update', passport.authenticate('jwt', { session: false }), require('./routes/access/update'));
//area X
app.use('/area/create', passport.authenticate('jwt', { session: false }), require('./routes/area/create'));
app.use('/area/delete', passport.authenticate('jwt', { session: false }), require('./routes/area/delete'));
app.use('/area/findAll', passport.authenticate('jwt', { session: false }), require('./routes/area/findAll'));
app.use('/area/update', passport.authenticate('jwt', { session: false }), require('./routes/area/update'));
//article X
app.use('/article/create', passport.authenticate('jwt', { session: false }), require('./routes/article/create'));
app.use('/article/delete', passport.authenticate('jwt', { session: false }), require('./routes/article/delete'));
app.use('/article/findAll', passport.authenticate('jwt', { session: false }), require('./routes/article/findAll'));
app.use('/article/findOne', passport.authenticate('jwt', { session: false }), require('./routes/article/findOne'));
app.use('/article/update', passport.authenticate('jwt', { session: false }), require('./routes/article/update'));
//certificate X
app.use('/certificate/create', passport.authenticate('jwt', { session: false }), require('./routes/certificate/create'));
app.use('/certificate/delete', passport.authenticate('jwt', { session: false }), require('./routes/certificate/delete'));
app.use('/certificate/deleteCif', passport.authenticate('jwt', { session: false }), require('./routes/certificate/deleteCif'));
app.use('/certificate/downloadCif', passport.authenticate('jwt', { session: false }), require('./routes/certificate/downloadCif'));
app.use('/certificate/downloadHeat', passport.authenticate('jwt', { session: false }), require('./routes/certificate/downloadHeat'));
app.use('/certificate/findAll', passport.authenticate('jwt', { session: false }), require('./routes/certificate/findAll'));
app.use('/certificate/findOne', passport.authenticate('jwt', { session: false }), require('./routes/certificate/findOne'));
app.use('/certificate/update', passport.authenticate('jwt', { session: false }), require('./routes/certificate/update'));
app.use('/certificate/uploadCif', passport.authenticate('jwt', { session: false }), require('./routes/certificate/uploadCif'));
//chart X
app.use('/chart/download', passport.authenticate('jwt', { session: false }), require('./routes/chart/download'));
//collipack X
app.use('/collipack/create', passport.authenticate('jwt', { session: false }), require('./routes/collipack/create'));
app.use('/collipack/delete', passport.authenticate('jwt', { session: false }), require('./routes/collipack/delete'));
app.use('/collipack/findAll', passport.authenticate('jwt', { session: false }), require('./routes/collipack/findAll'));
app.use('/collipack/findOne', passport.authenticate('jwt', { session: false }), require('./routes/collipack/findOne'));
app.use('/collipack/update', passport.authenticate('jwt', { session: false }), require('./routes/collipack/update'));
//collitype X
app.use('/collitype/create', passport.authenticate('jwt', { session: false }), require('./routes/collitype/create'));
app.use('/collitype/delete', passport.authenticate('jwt', { session: false }), require('./routes/collitype/delete'));
app.use('/collitype/findAll', passport.authenticate('jwt', { session: false }), require('./routes/collitype/findAll'));
app.use('/collitype/findOne', passport.authenticate('jwt', { session: false }), require('./routes/collitype/findOne'));
app.use('/collitype/update', passport.authenticate('jwt', { session: false }), require('./routes/collitype/update'));
//counter X
app.use('/counter/create', passport.authenticate('jwt', { session: false }), require('./routes/counter/create'));
app.use('/counter/delete', passport.authenticate('jwt', { session: false }), require('./routes/counter/delete'));
app.use('/counter/findAll', passport.authenticate('jwt', { session: false }), require('./routes/counter/findAll'));
app.use('/counter/findOne', passport.authenticate('jwt', { session: false }), require('./routes/counter/findOne'));
app.use('/counter/update', passport.authenticate('jwt', { session: false }), require('./routes/counter/update'));
//currency X
app.use('/currency/create', passport.authenticate('jwt', { session: false }), require('./routes/currency/create'));
app.use('/currency/delete', passport.authenticate('jwt', { session: false }), require('./routes/currency/delete'));
app.use('/currency/findAll', passport.authenticate('jwt', { session: false }), require('./routes/currency/findAll'));
app.use('/currency/findOne', passport.authenticate('jwt', { session: false }), require('./routes/currency/findOne'));
app.use('/currency/update', passport.authenticate('jwt', { session: false }), require('./routes/currency/update'));
//doccountesr X
app.use('/doccountesr/create', passport.authenticate('jwt', { session: false }), require('./routes/doccountesr/create'));
app.use('/doccountesr/delete', passport.authenticate('jwt', { session: false }), require('./routes/doccountesr/delete'));
app.use('/doccountesr/findAll', passport.authenticate('jwt', { session: false }), require('./routes/doccountesr/findAll'));
app.use('/doccountesr/findOne', passport.authenticate('jwt', { session: false }), require('./routes/doccountesr/findOne'));
app.use('/doccountesr/update', passport.authenticate('jwt', { session: false }), require('./routes/doccountesr/update'));
//doccountinspect X
app.use('/doccountinspect/create', passport.authenticate('jwt', { session: false }), require('./routes/doccountinspect/create'));
app.use('/doccountinspect/delete', passport.authenticate('jwt', { session: false }), require('./routes/doccountinspect/delete'));
app.use('/doccountinspect/findAll', passport.authenticate('jwt', { session: false }), require('./routes/doccountinspect/findAll'));
app.use('/doccountinspect/findOne', passport.authenticate('jwt', { session: false }), require('./routes/doccountinspect/findOne'));
app.use('/doccountinspect/update', passport.authenticate('jwt', { session: false }), require('./routes/doccountinspect/update'));
//doccountinsprel X
app.use('/doccountinsprel/create', passport.authenticate('jwt', { session: false }), require('./routes/doccountinsprel/create'));
app.use('/doccountinsprel/delete', passport.authenticate('jwt', { session: false }), require('./routes/doccountinsprel/delete'));
app.use('/doccountinsprel/findAll', passport.authenticate('jwt', { session: false }), require('./routes/doccountinsprel/findAll'));
app.use('/doccountinsprel/findOne', passport.authenticate('jwt', { session: false }), require('./routes/doccountinsprel/findOne'));
app.use('/doccountinsprel/update', passport.authenticate('jwt', { session: false }), require('./routes/doccountinsprel/update'));
//doccountnfi X
app.use('/doccountnfi/create', passport.authenticate('jwt', { session: false }), require('./routes/doccountnfi/create'));
app.use('/doccountnfi/delete', passport.authenticate('jwt', { session: false }), require('./routes/doccountnfi/delete'));
app.use('/doccountnfi/findAll', passport.authenticate('jwt', { session: false }), require('./routes/doccountnfi/findAll'));
app.use('/doccountnfi/findOne', passport.authenticate('jwt', { session: false }), require('./routes/doccountnfi/findOne'));
app.use('/doccountnfi/update', passport.authenticate('jwt', { session: false }), require('./routes/doccountnfi/update'));
//doccountpf X
app.use('/doccountpf/create', passport.authenticate('jwt', { session: false }), require('./routes/doccountpf/create'));
app.use('/doccountpf/delete', passport.authenticate('jwt', { session: false }), require('./routes/doccountpf/delete'));
app.use('/doccountpf/findAll', passport.authenticate('jwt', { session: false }), require('./routes/doccountpf/findAll'));
app.use('/doccountpf/findOne', passport.authenticate('jwt', { session: false }), require('./routes/doccountpf/findOne'));
app.use('/doccountpf/update', passport.authenticate('jwt', { session: false }), require('./routes/doccountpf/update'));
//doccountpl X
app.use('/doccountpl/create', passport.authenticate('jwt', { session: false }), require('./routes/doccountpl/create'));
app.use('/doccountpl/delete', passport.authenticate('jwt', { session: false }), require('./routes/doccountpl/delete'));
app.use('/doccountpl/findAll', passport.authenticate('jwt', { session: false }), require('./routes/doccountpl/findAll'));
app.use('/doccountpl/findOne', passport.authenticate('jwt', { session: false }), require('./routes/doccountpl/findOne'));
app.use('/doccountpl/update', passport.authenticate('jwt', { session: false }), require('./routes/doccountpl/update'));
//doccountpn X
app.use('/doccountpn/create', passport.authenticate('jwt', { session: false }), require('./routes/doccountpn/create'));
app.use('/doccountpn/delete', passport.authenticate('jwt', { session: false }), require('./routes/doccountpn/delete'));
app.use('/doccountpn/findAll', passport.authenticate('jwt', { session: false }), require('./routes/doccountpn/findAll'));
app.use('/doccountpn/findOne', passport.authenticate('jwt', { session: false }), require('./routes/doccountpn/findOne'));
app.use('/doccountpn/update', passport.authenticate('jwt', { session: false }), require('./routes/doccountpn/update'));
//doccountpt X
app.use('/doccountpt/create', passport.authenticate('jwt', { session: false }), require('./routes/doccountpt/create'));
app.use('/doccountpt/delete', passport.authenticate('jwt', { session: false }), require('./routes/doccountpt/delete'));
app.use('/doccountpt/findAll', passport.authenticate('jwt', { session: false }), require('./routes/doccountpt/findAll'));
app.use('/doccountpt/findOne', passport.authenticate('jwt', { session: false }), require('./routes/doccountpt/findOne'));
app.use('/doccountpt/update', passport.authenticate('jwt', { session: false }), require('./routes/doccountpt/update'));
//doccountsh X
app.use('/doccountsh/create', passport.authenticate('jwt', { session: false }), require('./routes/doccountsh/create'));
app.use('/doccountsh/delete', passport.authenticate('jwt', { session: false }), require('./routes/doccountsh/delete'));
app.use('/doccountsh/findAll', passport.authenticate('jwt', { session: false }), require('./routes/doccountsh/findAll'));
app.use('/doccountsh/findOne', passport.authenticate('jwt', { session: false }), require('./routes/doccountsh/findOne'));
app.use('/doccountsh/update', passport.authenticate('jwt', { session: false }), require('./routes/doccountsh/update'));
//doccountsi X
app.use('/doccountsi/create', passport.authenticate('jwt', { session: false }), require('./routes/doccountsi/create'));
app.use('/doccountsi/delete', passport.authenticate('jwt', { session: false }), require('./routes/doccountsi/delete'));
app.use('/doccountsi/findAll', passport.authenticate('jwt', { session: false }), require('./routes/doccountsi/findAll'));
app.use('/doccountsi/findOne', passport.authenticate('jwt', { session: false }), require('./routes/doccountsi/findOne'));
app.use('/doccountsi/update', passport.authenticate('jwt', { session: false }), require('./routes/doccountsi/update'));
//doccountsm X
app.use('/doccountsm/create', passport.authenticate('jwt', { session: false }), require('./routes/doccountsm/create'));
app.use('/doccountsm/delete', passport.authenticate('jwt', { session: false }), require('./routes/doccountsm/delete'));
app.use('/doccountsm/findAll', passport.authenticate('jwt', { session: false }), require('./routes/doccountsm/findAll'));
app.use('/doccountsm/findOne', passport.authenticate('jwt', { session: false }), require('./routes/doccountsm/findOne'));
app.use('/doccountsm/update', passport.authenticate('jwt', { session: false }), require('./routes/doccountsm/update'));
//docdef X
app.use('/docdef/create', passport.authenticate('jwt', { session: false }), require('./routes/docdef/create'));
app.use('/docdef/delete', passport.authenticate('jwt', { session: false }), require('./routes/docdef/delete'));
app.use('/docdef/findAll', passport.authenticate('jwt', { session: false }), require('./routes/docdef/findAll'));
app.use('/docdef/findOne', passport.authenticate('jwt', { session: false }), require('./routes/docdef/findOne'));
app.use('/docdef/update', passport.authenticate('jwt', { session: false }), require('./routes/docdef/update'));
//docfield X
app.use('/docfield/create', passport.authenticate('jwt', { session: false }), require('./routes/docfield/create'));
app.use('/docfield/delete', passport.authenticate('jwt', { session: false }), require('./routes/docfield/delete'));
app.use('/docfield/findAll', passport.authenticate('jwt', { session: false }), require('./routes/docfield/findAll'));
app.use('/docfield/findOne', passport.authenticate('jwt', { session: false }), require('./routes/docfield/findOne'));
app.use('/docfield/update', passport.authenticate('jwt', { session: false }), require('./routes/docfield/update'));
//docflow X
app.use('/docflow/create', passport.authenticate('jwt', { session: false }), require('./routes/docflow/create'));
app.use('/docflow/delete', passport.authenticate('jwt', { session: false }), require('./routes/docflow/delete'));
app.use('/docflow/findAll', passport.authenticate('jwt', { session: false }), require('./routes/docflow/findAll'));
app.use('/docflow/findOne', passport.authenticate('jwt', { session: false }), require('./routes/docflow/findOne'));
app.use('/docflow/update', passport.authenticate('jwt', { session: false }), require('./routes/docflow/update'));
//doctype X
app.use('/doctype/create', passport.authenticate('jwt', { session: false }), require('./routes/doctype/create'));
app.use('/doctype/delete', passport.authenticate('jwt', { session: false }), require('./routes/doctype/delete'));
app.use('/doctype/findAll', passport.authenticate('jwt', { session: false }), require('./routes/doctype/findAll'));
app.use('/doctype/findOne', passport.authenticate('jwt', { session: false }), require('./routes/doctype/findOne'));
app.use('/doctype/update', passport.authenticate('jwt', { session: false }), require('./routes/doctype/update'));
//duf X
app.use('/duf/download', passport.authenticate('jwt', { session: false }), require('./routes/duf/download'));
app.use('/duf/downloadGr', passport.authenticate('jwt', { session: false }), require('./routes/duf/downloadGr'));
app.use('/duf/upload', passport.authenticate('jwt', { session: false }), require('./routes/duf/upload'));
app.use('/duf/uploadGr', passport.authenticate('jwt', { session: false }), require('./routes/duf/uploadGr'));
//erp X
app.use('/erp/create', passport.authenticate('jwt', { session: false }), require('./routes/erp/create'));
app.use('/erp/delete', passport.authenticate('jwt', { session: false }), require('./routes/erp/delete'));
app.use('/erp/findAll', passport.authenticate('jwt', { session: false }), require('./routes/erp/findAll'));
app.use('/erp/findOne', passport.authenticate('jwt', { session: false }), require('./routes/erp/findOne'));
app.use('/erp/update', passport.authenticate('jwt', { session: false }), require('./routes/erp/update'));
//extract X
app.use('/extract/download', passport.authenticate('jwt', { session: false }), require('./routes/extract/download'));
app.use('/extract/downloadExp', passport.authenticate('jwt', { session: false }), require('./routes/extract/downloadExp'));
app.use('/extract/downloadInspCert', passport.authenticate('jwt', { session: false }), require('./routes/extract/downloadInspCert'));
app.use('/extract/downloadInspRel', passport.authenticate('jwt', { session: false }), require('./routes/extract/downloadInspRel'));
app.use('/extract/downloadMir', passport.authenticate('jwt', { session: false }), require('./routes/extract/downloadMir'));
app.use('/extract/downloadMirSplit', passport.authenticate('jwt', { session: false }), require('./routes/extract/downloadMirSplit'));
app.use('/extract/downloadStockMana', passport.authenticate('jwt', { session: false }), require('./routes/extract/downloadStockMana'));
app.use('/extract/downloadTransDocs', passport.authenticate('jwt', { session: false }), require('./routes/extract/downloadTransDocs'));
app.use('/extract/downloadWhPackDetails', passport.authenticate('jwt', { session: false }), require('./routes/extract/downloadWhPackDetails'));
app.use('/extract/downloadWhTransDocs', passport.authenticate('jwt', { session: false }), require('./routes/extract/downloadWhTransDocs'));
app.use('/extract/downloadPackDetails', passport.authenticate('jwt', { session: false }), require('./routes/extract/downloadPackDetails'));
app.use('/extract/downloadPickItem', passport.authenticate('jwt', { session: false }), require('./routes/extract/downloadPickItem'));
app.use('/extract/downloadPickTicket', passport.authenticate('jwt', { session: false }), require('./routes/extract/downloadPickTicket'));
app.use('/extract/setCollitype', passport.authenticate('jwt', { session: false }), require('./routes/extract/setCollitype'));
app.use('/extract/setWeight', passport.authenticate('jwt', { session: false }), require('./routes/extract/setWeight'));
app.use('/extract/setWhCollitype', passport.authenticate('jwt', { session: false }), require('./routes/extract/setWhCollitype'));
app.use('/extract/setWhWeight', passport.authenticate('jwt', { session: false }), require('./routes/extract/setWhWeight'));
app.use('/extract/update', passport.authenticate('jwt', { session: false }), require('./routes/extract/update'));
app.use('/extract/upload', passport.authenticate('jwt', { session: false }), require('./routes/extract/upload'));
app.use('/extract/uploadExp', passport.authenticate('jwt', { session: false }), require('./routes/extract/uploadExp'));
app.use('/extract/uploadMir', passport.authenticate('jwt', { session: false }), require('./routes/extract/uploadMir'));
app.use('/extract/uploadMirSplit', passport.authenticate('jwt', { session: false }), require('./routes/extract/uploadMirSplit'));
app.use('/extract/uploadInspRel', passport.authenticate('jwt', { session: false }), require('./routes/extract/uploadInspRel'));
app.use('/extract/uploadPackDetails', passport.authenticate('jwt', { session: false }), require('./routes/extract/uploadPackDetails'));
app.use('/extract/uploadPickItem', passport.authenticate('jwt', { session: false }), require('./routes/extract/uploadPickItem'));
app.use('/extract/uploadPickTicket', passport.authenticate('jwt', { session: false }), require('./routes/extract/uploadPickTicket'));
app.use('/extract/uploadTransDocs', passport.authenticate('jwt', { session: false }), require('./routes/extract/uploadTransDocs'));
app.use('/extract/uploadWhPackDetails', passport.authenticate('jwt', { session: false }), require('./routes/extract/uploadWhPackDetails'));
app.use('/extract/uploadWhTransDocs', passport.authenticate('jwt', { session: false }), require('./routes/extract/uploadWhTransDocs'));
//field X uploadWhTransDocs
app.use('/field/create', passport.authenticate('jwt', { session: false }), require('./routes/field/create'));
app.use('/field/delete', passport.authenticate('jwt', { session: false }), require('./routes/field/delete'));
app.use('/field/findAll', passport.authenticate('jwt', { session: false }), require('./routes/field/findAll'));
app.use('/field/findOne', passport.authenticate('jwt', { session: false }), require('./routes/field/findOne'));
app.use('/field/update', passport.authenticate('jwt', { session: false }), require('./routes/field/update'));
//fieldname X
app.use('/fieldname/create', passport.authenticate('jwt', { session: false }), require('./routes/fieldname/create'));
app.use('/fieldname/delete', passport.authenticate('jwt', { session: false }), require('./routes/fieldname/delete'));
app.use('/fieldname/findAll', passport.authenticate('jwt', { session: false }), require('./routes/fieldname/findAll'));
app.use('/fieldname/findOne', passport.authenticate('jwt', { session: false }), require('./routes/fieldname/findOne'));
app.use('/fieldname/update', passport.authenticate('jwt', { session: false }), require('./routes/fieldname/update'));
//heat X
app.use('/heat/create', passport.authenticate('jwt', { session: false }), require('./routes/heat/create'));
app.use('/heat/delete', passport.authenticate('jwt', { session: false }), require('./routes/heat/delete'));
app.use('/heat/findAll', passport.authenticate('jwt', { session: false }), require('./routes/heat/findAll'));
app.use('/heat/findOne', passport.authenticate('jwt', { session: false }), require('./routes/heat/findOne'));
app.use('/heat/update', passport.authenticate('jwt', { session: false }), require('./routes/heat/update'));
//heatloc X
app.use('/heatloc/create', passport.authenticate('jwt', { session: false }), require('./routes/heatloc/create'));
app.use('/heatloc/delete', passport.authenticate('jwt', { session: false }), require('./routes/heatloc/delete'));
app.use('/heatloc/findAll', passport.authenticate('jwt', { session: false }), require('./routes/heatloc/findAll'));
app.use('/heatloc/update', passport.authenticate('jwt', { session: false }), require('./routes/heatloc/update'));
//heatPick X
app.use('/heatpick/create', passport.authenticate('jwt', { session: false }), require('./routes/heatpick/create'));
app.use('/heatpick/delete', passport.authenticate('jwt', { session: false }), require('./routes/heatpick/delete'));
app.use('/heatpick/findAll', passport.authenticate('jwt', { session: false }), require('./routes/heatpick/findAll'));
app.use('/heatpick/update', passport.authenticate('jwt', { session: false }), require('./routes/heatpick/update'));
//locale X
app.use('/locale/create', passport.authenticate('jwt', { session: false }), require('./routes/locale/create'));
app.use('/locale/delete', passport.authenticate('jwt', { session: false }), require('./routes/locale/delete'));
app.use('/locale/findAll', passport.authenticate('jwt', { session: false }), require('./routes/locale/findAll'));
app.use('/locale/findOne', passport.authenticate('jwt', { session: false }), require('./routes/locale/findOne'));
app.use('/locale/update', passport.authenticate('jwt', { session: false }), require('./routes/locale/update'));
//location X
app.use('/location/create', passport.authenticate('jwt', { session: false }), require('./routes/location/create'));
app.use('/location/download', passport.authenticate('jwt', { session: false }), require('./routes/location/download'));
app.use('/location/delete', passport.authenticate('jwt', { session: false }), require('./routes/location/delete'));
app.use('/location/findAll', passport.authenticate('jwt', { session: false }), require('./routes/location/findAll'));
app.use('/location/update', passport.authenticate('jwt', { session: false }), require('./routes/location/update'));
app.use('/location/upload', passport.authenticate('jwt', { session: false }), require('./routes/location/upload'));
//mir X
app.use('/mir/create', passport.authenticate('jwt', { session: false }), require('./routes/mir/create'));
app.use('/mir/delete', passport.authenticate('jwt', { session: false }), require('./routes/mir/delete'));
app.use('/mir/findAll', passport.authenticate('jwt', { session: false }), require('./routes/mir/findAll'));
app.use('/mir/update', passport.authenticate('jwt', { session: false }), require('./routes/mir/update'));
//miritem X
app.use('/miritem/create', passport.authenticate('jwt', { session: false }), require('./routes/miritem/create'));
app.use('/miritem/delete', passport.authenticate('jwt', { session: false }), require('./routes/miritem/delete'));
app.use('/miritem/findAll', passport.authenticate('jwt', { session: false }), require('./routes/miritem/findAll'));
app.use('/miritem/update', passport.authenticate('jwt', { session: false }), require('./routes/miritem/update'));
//opco X
app.use('/opco/create', passport.authenticate('jwt', { session: false }), require('./routes/opco/create'));
app.use('/opco/delete', passport.authenticate('jwt', { session: false }), require('./routes/opco/delete'));
app.use('/opco/findAll', passport.authenticate('jwt', { session: false }), require('./routes/opco/findAll'));
app.use('/opco/findOne', passport.authenticate('jwt', { session: false }), require('./routes/opco/findOne'));
app.use('/opco/update', passport.authenticate('jwt', { session: false }), require('./routes/opco/update'));
//packitem X
app.use('/packitem/create', passport.authenticate('jwt', { session: false }), require('./routes/packitem/create'));
app.use('/packitem/delete', passport.authenticate('jwt', { session: false }), require('./routes/packitem/delete'));
app.use('/packitem/findAll', passport.authenticate('jwt', { session: false }), require('./routes/packitem/findAll'));
app.use('/packitem/findOne', passport.authenticate('jwt', { session: false }), require('./routes/packitem/findOne'));
app.use('/packitem/update', passport.authenticate('jwt', { session: false }), require('./routes/packitem/update'));
//pickitem X
app.use('/pickitem/delete', passport.authenticate('jwt', { session: false }), require('./routes/pickitem/delete'));
app.use('/pickitem/update', passport.authenticate('jwt', { session: false }), require('./routes/pickitem/update'));
//pickticket X
app.use('/pickticket/close', passport.authenticate('jwt', { session: false }), require('./routes/pickticket/close'));
app.use('/pickticket/create', passport.authenticate('jwt', { session: false }), require('./routes/pickticket/create'));
app.use('/pickticket/delete', passport.authenticate('jwt', { session: false }), require('./routes/pickticket/delete'));
app.use('/pickticket/findAll', passport.authenticate('jwt', { session: false }), require('./routes/pickticket/findAll'));
app.use('/pickticket/open', passport.authenticate('jwt', { session: false }), require('./routes/pickticket/open'));
app.use('/pickticket/update', passport.authenticate('jwt', { session: false }), require('./routes/pickticket/update'));
//po X
app.use('/po/create', passport.authenticate('jwt', { session: false }), require('./routes/po/create'));
app.use('/po/delete', passport.authenticate('jwt', { session: false }), require('./routes/po/delete'));
app.use('/po/findAll', passport.authenticate('jwt', { session: false }), require('./routes/po/findAll'));
app.use('/po/findOne', passport.authenticate('jwt', { session: false }), require('./routes/po/findOne'));
app.use('/po/getRevisions', passport.authenticate('jwt', { session: false }), require('./routes/po/getRevisions'));
app.use('/po/openOrders', passport.authenticate('jwt', { session: false }), require('./routes/po/openOrders'));
app.use('/po/update', passport.authenticate('jwt', { session: false }), require('./routes/po/update'));
//project X
app.use('/project/cleanup', passport.authenticate('jwt', { session: false }), require('./routes/project/cleanup'));
app.use('/project/create', passport.authenticate('jwt', { session: false }), require('./routes/project/create'));
app.use('/project/delete', passport.authenticate('jwt', { session: false }), require('./routes/project/delete'));
app.use('/project/findAll', passport.authenticate('jwt', { session: false }), require('./routes/project/findAll'));
app.use('/project/findOne', passport.authenticate('jwt', { session: false }), require('./routes/project/findOne'));
app.use('/project/report', passport.authenticate('jwt', { session: false }), require('./routes/project/report'));
app.use('/project/selection', passport.authenticate('jwt', { session: false }), require('./routes/project/selection'));
app.use('/project/update', passport.authenticate('jwt', { session: false }), require('./routes/project/update'));
app.use('/project/updateCifName', passport.authenticate('jwt', { session: false }), require('./routes/project/updateCifName'));
//region X
app.use('/region/create', passport.authenticate('jwt', { session: false }), require('./routes/region/create'));
app.use('/region/delete', passport.authenticate('jwt', { session: false }), require('./routes/region/delete'));
app.use('/region/findAll', passport.authenticate('jwt', { session: false }), require('./routes/region/findAll'));
app.use('/region/findOne', passport.authenticate('jwt', { session: false }), require('./routes/region/findOne'));
app.use('/region/update', passport.authenticate('jwt', { session: false }), require('./routes/region/update'));
//screen X
app.use('/screen/create', passport.authenticate('jwt', { session: false }), require('./routes/screen/create'));
app.use('/screen/delete', passport.authenticate('jwt', { session: false }), require('./routes/screen/delete'));
app.use('/screen/findAll', passport.authenticate('jwt', { session: false }), require('./routes/screen/findAll'));
app.use('/screen/findOne', passport.authenticate('jwt', { session: false }), require('./routes/screen/findOne'));
app.use('/screen/update', passport.authenticate('jwt', { session: false }), require('./routes/screen/update'));
//setting X
app.use('/setting/findAll', passport.authenticate('jwt', { session: false }), require('./routes/setting/findAll'));
app.use('/setting/upsert', passport.authenticate('jwt', { session: false }), require('./routes/setting/upsert'));
//split X
app.use('/split/packitem', passport.authenticate('jwt', { session: false }), require('./routes/split/packitem'));
app.use('/split/sub', passport.authenticate('jwt', { session: false }), require('./routes/split/sub'));
app.use('/split/whpackitem', passport.authenticate('jwt', { session: false }), require('./routes/split/whpackitem'));
//sub X
app.use('/sub/create', passport.authenticate('jwt', { session: false }), require('./routes/sub/create'));
app.use('/sub/delete', passport.authenticate('jwt', { session: false }), require('./routes/sub/delete'));
app.use('/sub/findAll', passport.authenticate('jwt', { session: false }), require('./routes/sub/findAll'));
app.use('/sub/findOne', passport.authenticate('jwt', { session: false }), require('./routes/sub/findOne'));
app.use('/sub/update', passport.authenticate('jwt', { session: false }), require('./routes/sub/update'));
//supplier X
app.use('/supplier/create', passport.authenticate('jwt', { session: false }), require('./routes/supplier/create'));
app.use('/supplier/delete', passport.authenticate('jwt', { session: false }), require('./routes/supplier/delete'));
app.use('/supplier/findAll', passport.authenticate('jwt', { session: false }), require('./routes/supplier/findAll'));
app.use('/supplier/findOne', passport.authenticate('jwt', { session: false }), require('./routes/supplier/findOne'));
app.use('/supplier/update', passport.authenticate('jwt', { session: false }), require('./routes/supplier/update'));
//template X
app.use('/template/deleteFile', passport.authenticate('jwt', { session: false }), require('./routes/template/deleteFile'));
app.use('/template/deleteProject', passport.authenticate('jwt', { session: false }), require('./routes/template/deleteProject'));
app.use('/template/download', passport.authenticate('jwt', { session: false }), require('./routes/template/download'));
app.use('/template/duplicateProject', passport.authenticate('jwt', { session: false }), require('./routes/template/duplicateProject'));
app.use('/template/findAll', passport.authenticate('jwt', { session: false }), require('./routes/template/findAll'));
app.use('/template/generate', passport.authenticate('jwt', { session: false }), require('./routes/template/generate'));
app.use('/template/generateEsr', passport.authenticate('jwt', { session: false }), require('./routes/template/generateEsr'));
app.use('/template/generateNfi', passport.authenticate('jwt', { session: false }), require('./routes/template/generateNfi'));
app.use('/template/generatePl', passport.authenticate('jwt', { session: false }), require('./routes/template/generatePl'));
app.use('/template/generatePn', passport.authenticate('jwt', { session: false }), require('./routes/template/generatePn'));
app.use('/template/generatePt', passport.authenticate('jwt', { session: false }), require('./routes/template/generatePt'));
app.use('/template/generateSh', passport.authenticate('jwt', { session: false }), require('./routes/template/generateSh'));
app.use('/template/generateSi', passport.authenticate('jwt', { session: false }), require('./routes/template/generateSi'));
app.use('/template/generateSm', passport.authenticate('jwt', { session: false }), require('./routes/template/generateSm'));
app.use('/template/generateWhPl', passport.authenticate('jwt', { session: false }), require('./routes/template/generateWhPl'));
app.use('/template/generateWhPn', passport.authenticate('jwt', { session: false }), require('./routes/template/generateWhPn'));
app.use('/template/generateWhSi', passport.authenticate('jwt', { session: false }), require('./routes/template/generateWhSi'));
app.use('/template/generateWhSm', passport.authenticate('jwt', { session: false }), require('./routes/template/generateWhSm'));
app.use('/template/preview', passport.authenticate('jwt', { session: false }), require('./routes/template/preview'));
app.use('/template/upload', passport.authenticate('jwt', { session: false }), require('./routes/template/upload'));
//transaction X
app.use('/transaction/correction', passport.authenticate('jwt', { session: false }), require('./routes/transaction/correction'));
app.use('/transaction/delete', passport.authenticate('jwt', { session: false }), require('./routes/transaction/delete'));
app.use('/transaction/findAll', passport.authenticate('jwt', { session: false }), require('./routes/transaction/findAll'));
app.use('/transaction/goodsReceiptNfi', passport.authenticate('jwt', { session: false }), require('./routes/transaction/goodsReceiptNfi'));
app.use('/transaction/goodsReceiptPl', passport.authenticate('jwt', { session: false }), require('./routes/transaction/goodsReceiptPl'));
app.use('/transaction/goodsReceiptPo', passport.authenticate('jwt', { session: false }), require('./routes/transaction/goodsReceiptPo'));
app.use('/transaction/goodsReceiptRet', passport.authenticate('jwt', { session: false }), require('./routes/transaction/goodsReceiptRet'));
app.use('/transaction/transfer', passport.authenticate('jwt', { session: false }), require('./routes/transaction/transfer'));
//user X
app.use('/user/changePwd', passport.authenticate('jwt', { session: false }), require('./routes/user/changePwd'));
app.use('/user/delete', passport.authenticate('jwt', { session: false }), require('./routes/user/delete'));
app.use('/user/findAll', passport.authenticate('jwt', { session: false }), require('./routes/user/findAll'));
app.use('/user/findOne', passport.authenticate('jwt', { session: false }), require('./routes/user/findOne'));
app.use('/user/register', passport.authenticate('jwt', { session: false }), require('./routes/user/register'));
//---------open routes---------------
app.use('/user/login', require('./routes/user/login'));
app.use('/user/requestPwd', require('./routes/user/requestPwd'));
app.use('/user/resetPwd', require('./routes/user/resetPwd'));
//---------------------------------
app.use('/user/setAdmin', passport.authenticate('jwt', { session: false }), require('./routes/user/setAdmin'));
app.use('/user/setSpAdmin', passport.authenticate('jwt', { session: false }), require('./routes/user/setSpAdmin'));
app.use('/user/update', passport.authenticate('jwt', { session: false }), require('./routes/user/update'));
//warehouse X
app.use('/warehouse/create', passport.authenticate('jwt', { session: false }), require('./routes/warehouse/create'));
app.use('/warehouse/delete', passport.authenticate('jwt', { session: false }), require('./routes/warehouse/delete'));
app.use('/warehouse/findAll', passport.authenticate('jwt', { session: false }), require('./routes/warehouse/findAll'));
app.use('/warehouse/update', passport.authenticate('jwt', { session: false }), require('./routes/warehouse/update'));
//whcollipack X
app.use('/whcollipack/create', passport.authenticate('jwt', { session: false }), require('./routes/whcollipack/create'));
app.use('/whcollipack/delete', passport.authenticate('jwt', { session: false }), require('./routes/whcollipack/delete'));
app.use('/whcollipack/findAll', passport.authenticate('jwt', { session: false }), require('./routes/whcollipack/findAll'));
app.use('/whcollipack/findOne', passport.authenticate('jwt', { session: false }), require('./routes/whcollipack/findOne'));
app.use('/whcollipack/update', passport.authenticate('jwt', { session: false }), require('./routes/whcollipack/update'));
//whpackitem X
app.use('/whpackitem/create', passport.authenticate('jwt', { session: false }), require('./routes/whpackitem/create'));
app.use('/whpackitem/delete', passport.authenticate('jwt', { session: false }), require('./routes/whpackitem/delete'));
app.use('/whpackitem/findAll', passport.authenticate('jwt', { session: false }), require('./routes/whpackitem/findAll'));
app.use('/whpackitem/findOne', passport.authenticate('jwt', { session: false }), require('./routes/whpackitem/findOne'));
app.use('/whpackitem/update', passport.authenticate('jwt', { session: false }), require('./routes/whpackitem/update'));

// Listen on port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on ${port}`));
