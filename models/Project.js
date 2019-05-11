const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./Counter');

//Create Schema
const ProjectSchema = new Schema({
    // _id: {
    //     type: mongoose.SchemaTypes.ObjectId,
    // },
    number: {
        type: Number,
    },
    name: {
        type: String,
        required: true
    },
    erpId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'erps',
        required: true
    },
    localeId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'locales',
        required: true
    },
    opcoId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'opcos',
        required: true
    },
    daveId: {
        type: Number,
    },
    users: [{
        user: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'users'
        },
        roles: {
            expediting: {
                type: Boolean,
                default: false
            },
            inspection: {
                type: Boolean,
                default: false
            },
            shipping: {
                type: Boolean,
                default: false
            },
            warehouse: {
                type: Boolean,
                default: false
            },
            configuration: {
                type: Boolean,
                default: false
            }
        }
    }]
});

ProjectSchema.pre("save", function (next) {
    var self = this;
    Counter.findOneAndUpdate({_id: 'projectNumber'}, {$inc: { seq: 1} }, function(error, counter)   {
        if(error)
            return next(error);
        self.number = counter.seq;
        next();
    });
});

ProjectSchema.virtual("pos", {
    ref: "pos",
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

ProjectSchema.set('toJSON', { virtuals: true });


//module.exports = mongoose.model('Projects', ProjectSchema);
module.exports = Project = mongoose.model('projects', ProjectSchema);