const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DocField = require('./DocField');
const Project = require('./Project');
const s3bucket = require('../middleware/s3bucket');
const _ = require('lodash');


//Create Schema
const DocDefSchema = new Schema({
    // _id: {
    //     type: mongoose.SchemaTypes.ObjectId,
    // },
    code: {
        type: String,
        required: true
    },
    location: {
        type: String,
    },
    field: {
        type: String,
    },
    description: {
        type: String,
    },
    row1: {
        type: Number,
    },
    col1: {
        type: Number,
    },
    grid: {
        type: Boolean,
        default: false,
    },
    worksheet1: {
        type: String,
    },
    worksheet2: {
        type: String,
    },
    row2: {
        type: Number,
    },
    col2: {
        type: Number,
    },
    doctypeId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'doctypes'
    },
    projectId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'     
    },
    daveId: {
        type: Number,
    }
});

DocDefSchema.virtual("doctypes", {
    ref: "doctypeId",
    localField: "doctypeId",
    foreignField: "_id",
    justOne: true
});

DocDefSchema.virtual("docfields", {
    ref: "docfields",
    localField: "_id",
    foreignField: "docdefId",
    justOne: false
});

DocDefSchema.virtual("project", {
    ref: "projects",
    localField: "projectId",
    foreignField: "_id",
    justOne: true
});



DocDefSchema.virtual("name").get(function (){
    return this.description + ' (' + this.code + ')'; 
})

DocDefSchema.set('toJSON', { virtuals: true });

DocDefSchema.post('findOneAndDelete', function(doc, next) {
    
    let docdefId = doc._id;
    let fileName = doc.field;
    let projectId = doc.projectId;

    findDocFields(docdefId).then( () => {
        deleteFile(fileName, projectId).then( () => next());
    });
});

function deleteFile(fileName, projectId) {
    return new Promise(function(resolve) {
        Project.findById(projectId, function (err, project) {
            if (err) {
                resolve();
            } else {
                s3bucket.deleteFile(fileName, String(project.number))
                .then( () => resolve());
            }
        })
    });
}

function findDocFields(docdefId) {
    return new Promise(function (resolve) {
        if (!docdefId) {
            resolve();
        } else {
            DocField.find({ docdefId: docdefId }, function (err, docfields) {
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

module.exports = DocDef = mongoose.model('docdefs',DocDefSchema);