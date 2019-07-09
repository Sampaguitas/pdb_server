const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DocCountEsr = require('./DocCountEsr');
const DocCountInspect = require('./DocCountInspect');
const DocCountInsprel = require('./DocCountInsprel');
const DocCountNfi = require('./DocCountNfi');
const DocCountPf = require('./DocCountPf');
const DocCountPl = require('./DocCountPl');
const DocCountPn = require('./DocCountPn');
const DocCountSi = require('./DocCountSi');
const DocCountSm = require('./DocCountSm');

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

// DocDefSchema.pre("save", function (next) {
//     function baseTen(number) {
//         return number.toString().length > 2 ? number : '0' + number;
//     }
//     var self = this;
//     switch(self.doctypeId){
//         case '5d1927121424114e3884ac7e': //ESR01
//             DocCountEsr.findOneAndUpdate({_id: self.projectId}, {$inc: { seq: 1} }, function(error, counter)   {
//                 if(error)
//                     return next(error);
//                 self.code = 'ESR' + baseTen(counter.seq);
//                 next();
//             });
//             break;
//         case '5d1927131424114e3884ac7f': //NFI01
//             DocCountNfi.findOneAndUpdate({_id: self.projectId}, {$inc: { seq: 1} }, function(error, counter)   {
//                 if(error)
//                     return next(error);
//                 self.code = 'NFI' + baseTen(counter.seq);
//                 next();
//             });
//             break;
//         case '5d1927131424114e3884ac80': //PL01
//             DocCountPl.findOneAndUpdate({_id: self.projectId}, {$inc: { seq: 1} }, function(error, counter)   {
//                 if(error)
//                     return next(error);
//                 self.code = 'PL' + baseTen(counter.seq);
//                 next();
//             });
//             break; 
//         case '5d1927131424114e3884ac81': //PN01
//             DocCountPn.findOneAndUpdate({_id: self.projectId}, {$inc: { seq: 1} }, function(error, counter)   {
//                 if(error)
//                     return next(error);
//                 self.code = 'PN' + baseTen(counter.seq);
//                 next();
//             });
//             break;
//         case '5d1927141424114e3884ac82': //PF01
//             DocCountPf.findOneAndUpdate({_id: self.projectId}, {$inc: { seq: 1} }, function(error, counter)   {
//                 if(error)
//                     return next(error);
//                 self.code = 'PF' + baseTen(counter.seq);
//                 next();
//             });
//             break;
//         case '5d1927141424114e3884ac83': //SI01
//             DocCountSi.findOneAndUpdate({_id: self.projectId}, {$inc: { seq: 1} }, function(error, counter)   {
//                 if(error)
//                     return next(error);
//                 self.code = 'SI' + baseTen(counter.seq);
//                 next();
//             });
//             break;
//         case '5d1927141424114e3884ac84': //SM01
//             DocCountSm.findOneAndUpdate({_id: self.projectId}, {$inc: { seq: 1} }, function(error, counter)   {
//                 if(error)
//                     return next(error);
//                 self.code = 'SM' + baseTen(counter.seq);
//                 next();
//             });
//             break;
//         case '5d1928de1424114e3884ac85': //INSPECT01
//             DocCountInspect.findOneAndUpdate({_id: self.projectId}, {$inc: { seq: 1} }, function(error, counter)   {
//                 if(error)
//                     return next(error);
//                 self.code = 'INSPECT' + baseTen(counter.seq);
//                 next();
//             });
//             break;
//         case '5d1928de1424114e3884ac86': //ESR00
//             DocCountEsr.findOneAndUpdate({_id: self.projectId}, {$inc: { seq: 1} }, function(error, counter)   {
//                 if(error)
//                     return next(error);
//                 self.code = 'ESR' + baseTen(counter.seq);
//                 next();
//             });
//             break;
//         case '5d1928df1424114e3884ac87': //INSPREL01
//             DocCountInsprel.findOneAndUpdate({_id: self.projectId}, {$inc: { seq: 1} }, function(error, counter)   {
//                 if(error)
//                     return next(error);
//                 self.code = 'INSPREL' + baseTen(counter.seq);
//                 next();
//             });
//             break;
//         default: self.code = '0';
//     }

// });

DocDefSchema.virtual("doctypes", {
    ref: "doctypeId",
    localField: "doctypeId",
    foreignField: "_id",
    justOne: true
});

DocDefSchema.virtual("name").get(function (){
    return this.description + ' (' + this.code + ')'; 
})

DocDefSchema.set('toJSON', { virtuals: true });

module.exports = DocDef = mongoose.model('docdefs',DocDefSchema);