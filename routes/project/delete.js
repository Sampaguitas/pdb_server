const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Access = require('../../models/Access');
const Supplier = require('../../models/Supplier');
const Field = require('../../models/Field');
const FieldName = require('../../models/FieldName');
const DocDef = require('../../models/DocDef');
const DocField = require('../../models/DocField');

const DocCountEsr = require('../../models/DocCountEsr');
const DocCountInspect = require('../../models/DocCountInspect');
const DocCountInsprel = require('../../models/DocCountInsprel');
const DocCountNfi = require('../../models/DocCountNfi');
const DocCountPf = require('../../models/DocCountPf');
const DocCountPl = require('../../models/DocCountPl');
const DocCountPn = require('../../models/DocCountPn');
const DocCountSi = require('../../models/DocCountSi');
const DocCountSm = require('../../models/DocCountSm');

const fault = require('../../utilities/Errors');
const fs = require('fs');
var path = require('path');
var s3bucket = require('../../middleware/s3bucket');

router.delete('/', (req, res) => {
    const id = req.query.id

    Project.findByIdAndRemove(id, function (err, project) {
        if (err) {
            return res.status(400).json({
                message: err
                //"1301": "An error occured",
            });
        } else if (!project) {
            return res.status(400).json({
                message: fault(1301).message
                //"1301": "Project does not exist",
            });
        } else {
            Access.find({ projectId: id }).then(acss => {
                acss.forEach(acs => {
                    Access.findByIdAndRemove(acs._id, function(err, a) {
                        if (!a) {
                            console.log('access does not exist');
                        } else {
                            console.log('access has been deleted');
                        }
                    });
                });
                Supplier.find({ projectId: id }).then(spls => {
                    spls.forEach(spl => {
                        Supplier.findByIdAndRemove(spl._id, function(err, s) {
                            if (!s) {
                                console.log('supplier does not exist');
                            } else {
                                console.log('supplier has been deleted');
                            }
                        });
                    });
                    Field.find({ projectId: id }).then(flds => {
                        flds.forEach(fld => {
                            Field.findByIdAndRemove(fld._id, function(err, fi) {
                                if (!fi) {
                                    console.log('field does not exist');
                                } else {
                                    console.log('field has been deleted');
                                }
                            });
                        });
                        FieldName.find({ projectId: id }).then(fldNs => {
                            fldNs.forEach(fldN => {
                                FieldName.findByIdAndRemove(fldN._id, function(err, fn) {
                                    if (!fn) {
                                        console.log('fieldName does not exist');
                                    } else {
                                        console.log('fieldName has been deleted');
                                    }
                                });
                            });
                            DocDef.find({ projectId: id }).then(ddfs => {
                                ddfs.forEach(ddf => {
                                    DocDef.findByIdAndRemove(ddf._id, function(err, dd) {
                                        if (!dd) {
                                            console.log('DocDef does not exist');
                                        } else {
                                            console.log('DocDef has been deleted');
                                        }
                                    });
                                });
                                DocField.find({ projectId: id }).then(dfls => {
                                    dfls.forEach(dfl => {
                                        DocField.findByIdAndRemove(dfl._id, function(err, df) {
                                            if (!df) {
                                                console.log('DocField does not exist');
                                            } else {
                                                console.log('DocField has been deleted');
                                            }
                                        });
                                    });
                                    DocCountEsr.find({_id: id}).then(oldDocCountEsrs => {
                                        oldDocCountEsrs.forEach(oldDocCountEsr => {
                                            DocCountEsr.findByIdAndRemove(oldDocCountEsr._id), function(err, dcesr) {
                                                if(!dcesr) {
                                                    console.log('DocCountEsr does not exist');
                                                } else {
                                                    console.log('DocCountEsr has been deleted');
                                                }
                                            } 
                                        });
                                        DocCountInspect.find({_id: id}).then(oldDocCountInspects => {
                                            oldDocCountInspects.forEach(oldDocCountInspect => {
                                                DocCountInspect.findByIdAndRemove(oldDocCountInspect._id), function(err, dcesr) {
                                                    if(!dcesr) {
                                                        console.log('DocCountInspect does not exist');
                                                    } else {
                                                        console.log('DocCountInspect has been deleted');
                                                    }
                                                } 
                                            });
                                            DocCountInsprel.find({_id: id}).then(oldDocCountInsprels => {
                                                oldDocCountInsprels.forEach(oldDocCountInsprel => {
                                                    DocCountInsprel.findByIdAndRemove(oldDocCountInsprel._id), function(err, dcesr) {
                                                        if(!dcesr) {
                                                            console.log('DocCountInsprel does not exist');
                                                        } else {
                                                            console.log('DocCountInsprel has been deleted');
                                                        }
                                                    } 
                                                });
                                                DocCountNfi.find({_id: id}).then(oldDocCountNfis => {
                                                    oldDocCountNfis.forEach(oldDocCountNfi => {
                                                        DocCountNfi.findByIdAndRemove(oldDocCountNfi._id), function(err, dcesr) {
                                                            if(!dcesr) {
                                                                console.log('DocCountNfi does not exist');
                                                            } else {
                                                                console.log('DocCountNfi has been deleted');
                                                            }
                                                        } 
                                                    });
                                                    DocCountPf.find({_id: id}).then(oldDocCountPfs => {
                                                        oldDocCountPfs.forEach(oldDocCountPf => {
                                                            DocCountPf.findByIdAndRemove(oldDocCountPf._id), function(err, dcesr) {
                                                                if(!dcesr) {
                                                                    console.log('DocCountPf does not exist');
                                                                } else {
                                                                    console.log('DocCountPf has been deleted');
                                                                }
                                                            } 
                                                        });
                                                        DocCountPl.find({_id: id}).then(oldDocCountPls => {
                                                            oldDocCountPls.forEach(oldDocCountPl => {
                                                                DocCountPl.findByIdAndRemove(oldDocCountPl._id), function(err, dcesr) {
                                                                    if(!dcesr) {
                                                                        console.log('DocCountPl does not exist');
                                                                    } else {
                                                                        console.log('DocCountPl has been deleted');
                                                                    }
                                                                } 
                                                            });
                                                            DocCountPn.find({_id: id}).then(oldDocCountPns => {
                                                                oldDocCountPns.forEach(oldDocCountPn => {
                                                                    DocCountPn.findByIdAndRemove(oldDocCountPn._id), function(err, dcesr) {
                                                                        if(!dcesr) {
                                                                            console.log('DocCountPn does not exist');
                                                                        } else {
                                                                            console.log('DocCountPn has been deleted');
                                                                        }
                                                                    } 
                                                                });
                                                                DocCountSi.find({_id: id}).then(oldDocCountSis => {
                                                                    oldDocCountSis.forEach(oldDocCountSi => {
                                                                        DocCountSi.findByIdAndRemove(oldDocCountSi._id), function(err, dcesr) {
                                                                            if(!dcesr) {
                                                                                console.log('DocCountSi does not exist');
                                                                            } else {
                                                                                console.log('DocCountSi has been deleted');
                                                                            }
                                                                        } 
                                                                    });
                                                                    DocCountSm.find({_id: id}).then(oldDocCountSms => {
                                                                        oldDocCountSms.forEach(oldDocCountSm => {
                                                                            DocCountSm.findByIdAndRemove(oldDocCountSm._id), function(err, dcesr) {
                                                                                if(!dcesr) {
                                                                                    console.log('DocCountSm does not exist');
                                                                                } else {
                                                                                    console.log('DocCountSm has been deleted');
                                                                                }
                                                                            } 
                                                                        });
                                                                        s3bucket.deleteProject(String(project.number))
                                                                        .then( () => res.status(200).json({ message: fault(1303).message })) //"1303": "Project has been deleted",
                                                                        .catch(error => res.status(400).json({ message: error}));
                                                                    }).catch(err => res.status(400).json({ message: err}));                        
                                                                }).catch(err => res.status(400).json({ message: err}));                    
                                                            }).catch(err => res.status(400).json({ message: err}));                
                                                        }).catch(err => res.status(400).json({ message: err}));            
                                                    }).catch(err => res.status(400).json({ message: err}));         
                                                }).catch(err => res.status(400).json({ message: err}));    
                                            }).catch(err => res.status(400).json({ message: err}));
                                        }).catch(err => res.status(400).json({ message: err}));                                        
                                    }).catch(err => res.status(400).json({ message: err}));
                                }).catch(err => res.status(400).json({ message: err}));
                            }).catch(err => res.status(400).json({ message: err}));
                        }).catch(err => res.status(400).json({ message: err}));
                    }).catch(err => res.status(400).json({ message: err}));
                }).catch(err => res.status(400).json({ message: err}));
            }).catch(err => res.status(400).json({ message: err})); 
        }
    });
});

module.exports = router;