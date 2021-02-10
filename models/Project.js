const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./Counter');
const Access = require('./Access');
const Certificate = require('./Certificate');
const ColliPack = require('./ColliPack');
const ColliType = require('./ColliType');
const DocCountEsr = require('./DocCountEsr');
const DocCountInspect = require('./DocCountInspect');
const DocCountInsprel = require('./DocCountInsprel');
const DocCountNfi = require('./DocCountNfi');
const DocCountPf = require('./DocCountPf');
const DocCountPl = require('./DocCountPl');
const DocCountPn = require('./DocCountPn');
const DocCountPt = require('./DocCountPt');
const DocCountSh = require('./DocCountSh');
const DocCountSi = require('./DocCountSi');
const DocCountSm = require('./DocCountSm');
const DocCountWhPl = require('./DocCountWhPl');
const DocCountWhPn = require('./DocCountWhPn');
const DocCountWhSi = require('./DocCountWhSi');
const DocCountWhSm = require('./DocCountWhSm');
const DocDef = require('./DocDef');
const DocField = require('./DocField');
const Field = require('./Field');
const FieldName = require('./FieldName');
const HeatLoc = require('./HeatLoc');
const HeatPick = require('./HeatPick');
const Mir = require('./Mir');
const PickTicket = require('./PickTicket');
const Po = require('./Po');
const Setting = require('./Setting');
const Supplier = require('./Supplier');
const Transaction = require('./Transaction');
const Warehouse = require('./Warehouse');
const s3bucket = require('../middleware/s3bucket');
const _ = require('lodash');

//Create Schema
const ProjectSchema = new Schema({
    _id: {
        type: mongoose.SchemaTypes.ObjectId,
    },
    number: {
        type: Number,
    },
    name: {
        type: String,
        required: true
    },
    enableInspection: {
        type: Boolean
    },
    enableShipping: {
        type: Boolean
    },
    enableWarehouse: {
        type: Boolean
    },
    cifName: {
        type: String,
    },
    erpId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'erps',
        required: true
    },
    currencyId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'currencies',
    },
    opcoId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'opcos',
        required: true
    },
    daveId: {
        type: Number,
    },
});

ProjectSchema.virtual("accesses", {
    ref: "accesses",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("pos", {
    ref: "pos",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("collipacks", {
    ref: "collipacks",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("whcollipacks", {
    ref: "whcollipacks",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("collitypes", {
    ref: "collitypes",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("erp", {
    ref: "erps",
    localField: "erpId",
    foreignField: "_id",
    justOne: true
});

ProjectSchema.virtual("opco", {
    ref: "opcos",
    localField: "opcoId",
    foreignField: "_id",
    justOne: true
});

ProjectSchema.virtual("currency", {
    ref: "currencies",
    localField: "currencyId",
    foreignField: "_id",
    justOne: true
});

ProjectSchema.virtual("docdefs", {
    ref: "docdefs",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("docfields", {
    ref: "docfields",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("suppliers", {
    ref: "suppliers",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("fields", {
    ref: "fields",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("fieldnames", {
    ref: "fieldnames",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("settings", {
    ref: "settings",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("suppliers", {
    ref: "suppliers",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("transactions", {
    ref: "transactions",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("mirs", {
    ref: "mirs",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("picktickets", {
    ref: "picktickets",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.set('toJSON', { virtuals: true });

ProjectSchema.pre("save", function (next) {
    var self = this;
    Counter.findOneAndUpdate({_id: 'projectNumber'}, {$inc: { seq: 1} }, function(error, counter)   {
        if(error)
            return next(error);
        self.number = counter.seq;
        next();
    });
});

ProjectSchema.post('save', function(doc) {
    console.log('%s has been saved', doc._id);
});

ProjectSchema.post('findOneAndDelete', function(doc, next) {
    
    let projectId = doc._id;
    let projectNr = String(doc.number);

    findAccesses(projectId).then( () => {
        findCertificates(projectId).then( () => {
            findColliPacks(projectId).then( () => {
                findColliTypes(projectId).then( () => {
                    findDocCountEsrs(projectId).then( () => {
                        findDocCountInspects(projectId).then( () => {
                            findDocCountInsprels(projectId).then( () => {
                                findDocCountNfis(projectId).then( () => {
                                    findDocCountPfs(projectId).then( () => {
                                        findDocCountPls(projectId).then( () => {
                                            findDocCountPns(projectId).then( () => {
                                                findDocCountPts(projectId).then( () => {
                                                    findDocCountShs(projectId).then( () => {
                                                        findDocCountSis(projectId).then( () => {
                                                            findDocCountSms(projectId).then( () => {
                                                                findDocCountWhPls(projectId).then( () => {
                                                                    findDocCountWhPns(projectId).then( () => {
                                                                        findDocCountWhSis(projectId).then( () => {
                                                                            findDocCountWhSms(projectId).then( () => {
                                                                                findDocDefs(projectId).then( () => {
                                                                                    findDocFields(projectId).then( () => {
                                                                                        findFields(projectId).then( () => {
                                                                                            findFieldNames(projectId).then( () => {
                                                                                                findHeatLocs(projectId).then( () => {
                                                                                                    findHeatPicks(projectId).then( () => {
                                                                                                        findMirs(projectId).then( () => {
                                                                                                            findPickTickets(projectId).then( () => {
                                                                                                                findPos(projectId).then( () => {
                                                                                                                    findSettings(projectId).then( () => {
                                                                                                                        findSuppliers(projectId).then( () => {
                                                                                                                            findTransactions(projectId).then( () => {
                                                                                                                                findWarehouse(projectId).then( () => {
                                                                                                                                    s3bucket.deleteProject(projectNr).then( () => next());
                                                                                                                                });
                                                                                                                            });
                                                                                                                        });
                                                                                                                    });
                                                                                                                });
                                                                                                            });
                                                                                                        });
                                                                                                    });
                                                                                                });
                                                                                            });
                                                                                        });
                                                                                    });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

function findAccesses(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            Access.find({ projectId: projectId }, function (err, accesses) {
                if (err || _.isEmpty(accesses)) {
                    resolve();
                } else {
                    let myPromises = [];
                    accesses.map(access => myPromises.push(deleteAccess(access._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteAccess(accessId) {
    return new Promise(function(resolve) {
        if (!accessId) {
            resolve();
        } else {
            Access.findByIdAndDelete(accessId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findCertificates(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            Certificate.find({ projectId: projectId }, function (err, certificates) {
                if (err || _.isEmpty(certificates)) {
                    resolve();
                } else {
                    let myPromises = [];
                    certificates.map(certificate => myPromises.push(deleteCertificate(certificate._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteCertificate(certificateId) {
    return new Promise(function(resolve) {
        if (!certificateId) {
            resolve();
        } else {
            Certificate.findByIdAndDelete(certificateId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findColliPacks(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            ColliPack.find({ projectId: projectId }, function (err, collipacks) {
                if (err || _.isEmpty(collipacks)) {
                    resolve();
                } else {
                    let myPromises = [];
                    collipacks.map(collipack => myPromises.push(deleteColliPack(collipack._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteColliPack(collipackId) {
    return new Promise(function(resolve) {
        if (!collipackId) {
            resolve();
        } else {
            ColliPack.findByIdAndDelete(collipackId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findColliTypes(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            ColliType.find({ projectId: projectId }, function (err, collitypes) {
                if (err || _.isEmpty(collitypes)) {
                    resolve();
                } else {
                    let myPromises = [];
                    collitypes.map(collitype => myPromises.push(deleteColliType(collitype._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteColliType(collitypeId) {
    return new Promise(function(resolve) {
        if (!collitypeId) {
            resolve();
        } else {
            ColliType.findByIdAndDelete(collitypeId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountEsrs(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountEsr.find({ _id: projectId }, function (err, doccountesrs) {
                if (err || _.isEmpty(doccountesrs)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountesrs.map(doccountesr => myPromises.push(deleteDocCountEsr(doccountesr._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountEsr(doccountesrId) {
    return new Promise(function(resolve) {
        if (!doccountesrId) {
            resolve();
        } else {
            DocCountEsr.findByIdAndDelete(doccountesrId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountInspects(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountInspect.find({ _id: projectId }, function (err, doccountinspects) {
                if (err || _.isEmpty(doccountinspects)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountinspects.map(doccountinspect => myPromises.push(deleteDocCountInspect(doccountinspect._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountInspect(doccountinspectId) {
    return new Promise(function(resolve) {
        if (!doccountinspectId) {
            resolve();
        } else {
            DocCountInspect.findByIdAndDelete(doccountinspectId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountInsprels(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountInsprel.find({ _id: projectId }, function (err, doccountinsprels) {
                if (err || _.isEmpty(doccountinsprels)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountinsprels.map(doccountinsprel => myPromises.push(deleteDocCountInsprel(doccountinsprel._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountInsprel(doccountinsprelId) {
    return new Promise(function(resolve) {
        if (!doccountinsprelId) {
            resolve();
        } else {
            DocCountInsprel.findByIdAndDelete(doccountinsprelId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountNfis(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountNfi.find({ _id: projectId }, function (err, doccountnfis) {
                if (err || _.isEmpty(doccountnfis)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountnfis.map(doccountnfi => myPromises.push(deleteDocCountNfi(doccountnfi._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountNfi(doccountnfiId) {
    return new Promise(function(resolve) {
        if (!doccountnfiId) {
            resolve();
        } else {
            DocCountNfi.findByIdAndDelete(doccountnfiId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountPfs(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountPf.find({ _id: projectId }, function (err, doccountpfs) {
                if (err || _.isEmpty(doccountpfs)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountpfs.map(doccountpf => myPromises.push(deleteDocCountPf(doccountpf._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountPf(doccountpfId) {
    return new Promise(function(resolve) {
        if (!doccountpfId) {
            resolve();
        } else {
            DocCountPf.findByIdAndDelete(doccountpfId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountPls(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountPl.find({ _id: projectId }, function (err, doccountpls) {
                if (err || _.isEmpty(doccountpls)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountpls.map(doccountpl => myPromises.push(deleteDocCountPl(doccountpl._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountPl(doccountplId) {
    return new Promise(function(resolve) {
        if (!doccountplId) {
            resolve();
        } else {
            DocCountPl.findByIdAndDelete(doccountplId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountPns(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountPn.find({ _id: projectId }, function (err, doccountpns) {
                if (err || _.isEmpty(doccountpns)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountpns.map(doccountpn => myPromises.push(deleteDocCountPn(doccountpn._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountPn(doccountpnId) {
    return new Promise(function(resolve) {
        if (!doccountpnId) {
            resolve();
        } else {
            DocCountPn.ffindByIdAndDelete(doccountpnId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountPts(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountPt.find({ _id: projectId }, function (err, doccountpts) {
                if (err || _.isEmpty(doccountpts)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountpts.map(doccountpt => myPromises.push(deleteDocCountPt(doccountpt._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountPt(doccountptId) {
    return new Promise(function(resolve) {
        if (!doccountptId) {
            resolve();
        } else {
            DocCountPt.ffindByIdAndDelete(doccountptId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountShs(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountSh.find({ _id: projectId }, function (err, doccountshs) {
                if (err || _.isEmpty(doccountshs)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountshs.map(doccountsh => myPromises.push(deleteDocCountSh(doccountsh._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountSh(doccountshId) {
    return new Promise(function(resolve) {
        if (!doccountshId) {
            resolve();
        } else {
            DocCountSh.ffindByIdAndDelete(doccountshId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountSis(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountSi.find({ _id: projectId }, function (err, doccountsis) {
                if (err || _.isEmpty(doccountsis)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountsis.map(doccountsi => myPromises.push(deleteDocCountSi(doccountsi._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountSi(doccountsiId) {
    return new Promise(function(resolve) {
        if (!doccountsiId) {
            resolve();
        } else {
            DocCountSi.findByIdAndDelete(doccountsiId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountSms(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountSm.find({ _id: projectId }, function (err, doccountsms) {
                if (err || _.isEmpty(doccountsms)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountsms.map(doccountsm => myPromises.push(deleteDocCountSm(doccountsm._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountSm(doccountsmId) {
    return new Promise(function(resolve) {
        if (!doccountsmId) {
            resolve();
        } else {
            DocCountSm.findByIdAndDelete(doccountsmId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountWhPls(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountWhPl.find({ _id: projectId }, function (err, doccountwhpls) {
                if (err || _.isEmpty(doccountwhpls)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountwhpls.map(doccountwhpl => myPromises.push(deleteDocCountWhPl(doccountwhpl._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountWhPl(doccountwhplId) {
    return new Promise(function(resolve) {
        if (!doccountwhplId) {
            resolve();
        } else {
            DocCountWhPl.findByIdAndDelete(doccountwhplId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountWhPns(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountWhPn.find({ _id: projectId }, function (err, doccountwhpns) {
                if (err || _.isEmpty(doccountwhpns)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountwhpns.map(doccountwhpn => myPromises.push(deleteDocCountWhPn(doccountwhpn._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountWhPn(doccountwhpnId) {
    return new Promise(function(resolve) {
        if (!doccountwhpnId) {
            resolve();
        } else {
            DocCountWhPn.findByIdAndDelete(doccountwhpnId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountWhSis(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountWhSi.find({ _id: projectId }, function (err, doccountwhsis) {
                if (err || _.isEmpty(doccountwhsis)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountwhsis.map(doccountwhsi => myPromises.push(deleteDocCountWhSi(doccountwhsi._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountWhSi(doccountwhsiId) {
    return new Promise(function(resolve) {
        if (!doccountwhsiId) {
            resolve();
        } else {
            DocCountWhSi.findByIdAndDelete(doccountwhsiId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocCountWhSms(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocCountWhSm.find({ _id: projectId }, function (err, doccountwhsms) {
                if (err || _.isEmpty(doccountwhsms)) {
                    resolve();
                } else {
                    let myPromises = [];
                    doccountwhsms.map(doccountwhsm => myPromises.push(deleteDocCountWhSm(doccountwhsm._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocCountWhSm(doccountwhsmId) {
    return new Promise(function(resolve) {
        if (!doccountwhsmId) {
            resolve();
        } else {
            DocCountWhSm.findByIdAndDelete(doccountwhsmId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocDefs(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            require('./DocDef').find({ projectId: projectId }, function (err, docdefs) {
                if (err || _.isEmpty(docdefs)) {
                    resolve();
                } else {
                    let myPromises = [];
                    docdefs.map(docdef => myPromises.push(deleteDocDef(docdef._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocDef(docdefId) {
    return new Promise(function(resolve) {
        if (!docdefId) {
            resolve();
        } else {
            require('./DocDef').findByIdAndDelete(docdefId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findDocFields(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            DocField.find({ projectId: projectId }, function (err, docfields) {
                if (err || _.isEmpty(docfields)) {
                    resolve();
                } else {
                    let myPromises = [];
                    docfields.map(docfield => myPromises.push(deleteDocField(docfield._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteDocField(docfieldId) {
    return new Promise(function(resolve) {
        if (!docfieldId) {
            resolve();
        } else {
            DocField.findByIdAndDelete(docfieldId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findFields(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            Field.find({ projectId: projectId }, function (err, fields) {
                if (err || _.isEmpty(fields)) {
                    resolve();
                } else {
                    let myPromises = [];
                    fields.map(field => myPromises.push(deleteField(field._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteField(fieldId) {
    return new Promise(function(resolve) {
        if (!fieldId) {
            resolve();
        } else {
            Field.findByIdAndDelete(fieldId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findFieldNames(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            FieldName.find({ projectId: projectId }, function (err, fieldnames) {
                if (err || _.isEmpty(fieldnames)) {
                    resolve();
                } else {
                    let myPromises = [];
                    fieldnames.map(fieldname => myPromises.push(deleteFieldName(fieldname._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteFieldName(fieldnameId) {
    return new Promise(function(resolve) {
        if (!fieldnameId) {
            resolve();
        } else {
            FieldName.findByIdAndDelete(fieldnameId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findHeatLocs(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            HeatLoc.find({ projectId: projectId }, function (err, heatlocs) {
                if (err || _.isEmpty(heatlocs)) {
                    resolve();
                } else {
                    let myPromises = [];
                    heatlocs.map(heatloc => myPromises.push(deleteHeatLoc(heatloc._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteHeatLoc(heatlocId) {
    return new Promise(function(resolve) {
        if (!heatlocId) {
            resolve();
        } else {
            HeatLoc.findByIdAndDelete(heatlocId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findHeatPicks(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            HeatPick.find({ projectId: projectId }, function (err, heatpicks) {
                if (err || _.isEmpty(heatpicks)) {
                    resolve();
                } else {
                    let myPromises = [];
                    heatpicks.map(heatpick => myPromises.push(deleteHeatPick(heatpick._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteHeatPick(heatpickId) {
    return new Promise(function(resolve) {
        if (!heatpickId) {
            resolve();
        } else {
            HeatPick.findByIdAndDelete(heatpickId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findMirs(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            Mir.find({ projectId: projectId }, function (err, mirs) {
                if (err || _.isEmpty(mirs)) {
                    resolve();
                } else {
                    let myPromises = [];
                    mirs.map(mir => myPromises.push(deleteMirs(mir._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteMirs(mirId) {
    return new Promise(function(resolve) {
        if (!mirId) {
            resolve();
        } else {
            Mir.findByIdAndDelete(mirId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findPickTickets(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            PickTicket.find({ projectId: projectId }, function (err, picktickets) {
                if (err || _.isEmpty(picktickets)) {
                    resolve();
                } else {
                    let myPromises = [];
                    picktickets.map(pickticket => myPromises.push(deletePickTickets(pickticket._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deletePickTickets(pickticketId) {
    return new Promise(function(resolve) {
        if (!pickticketId) {
            resolve();
        } else {
            PickTicket.findByIdAndDelete(pickticketId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findPos(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            Po.find({ projectId: projectId }, function (err, pos) {
                if (err || _.isEmpty(pos)) {
                    resolve();
                } else {
                    let myPromises = [];
                    pos.map(po => myPromises.push(deletePo(po._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deletePo(poId) {
    return new Promise(function(resolve) {
        if (!poId) {
            resolve();
        } else {
            Po.findByIdAndDelete(poId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findSettings(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            Setting.find({ projectId: projectId }, function (err, settings) {
                if (err || _.isEmpty(settings)) {
                    resolve();
                } else {
                    let myPromises = [];
                    settings.map(setting => myPromises.push(deleteSetting(setting._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteSetting(settingId) {
    return new Promise(function(resolve) {
        if (!settingId) {
            resolve();
        } else {
            Setting.findByIdAndDelete(settingId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findSuppliers(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            Supplier.find({ projectId: projectId }, function (err, suppliers) {
                if (err || _.isEmpty(suppliers)) {
                    resolve();
                } else {
                    let myPromises = [];
                    suppliers.map(supplier => myPromises.push(deleteSupplier(supplier._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteSupplier(supplierId) {
    return new Promise(function(resolve) {
        if (!supplierId) {
            resolve();
        } else {
            Supplier.findByIdAndDelete(supplierId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findTransactions(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            Transaction.find({ projectId: projectId }, function (err, transactions) {
                if (err || _.isEmpty(transactions)) {
                    resolve();
                } else {
                    let myPromises = [];
                    transactions.map(transaction => myPromises.push(deleteTransaction(transaction._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteTransaction(transactionId) {
    return new Promise(function(resolve) {
        if (!transactionId) {
            resolve();
        } else {
            Transaction.findByIdAndDelete(transactionId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

function findWarehouse(projectId) {
    return new Promise(function (resolve) {
        if (!projectId) {
            resolve();
        } else {
            Warehouse.find({ projectId: projectId }, function (err, warehouses) {
                if (err || _.isEmpty(warehouses)) {
                    resolve();
                } else {
                    let myPromises = [];
                    warehouses.map(warehouse => myPromises.push(deleteWarehouse(warehouse._id)));
                    Promise.all(myPromises).then( () => resolve());
                }
            });
        }
    });
}

function deleteWarehouse(warehouseId) {
    return new Promise(function(resolve) {
        if (!warehouseId) {
            resolve();
        } else {
            Warehouse.findByIdAndDelete(warehouseId, function (err) {
                if (err) {
                    resolve();
                } else {
                    resolve();
                }
            });
        }
    });
}

//module.exports = mongoose.model('Projects', ProjectSchema);
module.exports = Project = mongoose.model('projects', ProjectSchema);