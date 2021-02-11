const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DocField = require('./DocField');
const FieldName = require('./FieldName');
const _ = require('lodash');

//Create Schema
const FieldSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    custom: {
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    fromTbl: {
        type: String,
        required: true
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'   
    },
    daveId: {
        type: Number,
    }
});

FieldSchema.virtual("fieldnames", {
    ref: "fieldnames",
    localField: "_id",
    foreignField: "fieldId",
    justOne: false
});

FieldSchema.virtual("docfields", {
    ref: "docfields",
    localField: "_id",
    foreignField: "fieldId",
    justOne: false
});

FieldSchema.set('toJSON', { virtuals: true });

FieldSchema.post('findOneAndDelete', function(doc, next) {
    findDocFields(doc._id).then( () => {
        findFieldNames(doc._id).then( () => next());
    });
});

function findDocFields(fieldId) {
    return new Promise(function (resolve) {
        if (!fieldId) {
            resolve();
        } else {
            DocField.find({ fieldId: fieldId }, function (err, docfields) {
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

function findFieldNames(fieldId) {
    return new Promise(function (resolve) {
        if (!fieldId) {
            resolve();
        } else {
            FieldName.find({ fieldId: fieldId }, function (err, fieldnames) {
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


module.exports = Field = mongoose.model('fields',FieldSchema);