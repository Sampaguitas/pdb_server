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

ProjectSchema.set('toJSON', { virtuals: true });


//module.exports = mongoose.model('Projects', ProjectSchema);
module.exports = Project = mongoose.model('projects', ProjectSchema);