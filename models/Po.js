const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const PoSchema = new Schema({
    clPo: {
        type: String, //2
    },
    clPoRev: {
        type: String, //2
    },
    clPoItem: {
        type: Number, //2
    },
    clCode: {
        type: String, //2
    },
    qty: {
        type: Number,
    },
    uom: {
        type: String,
    },
    size:{
        type: String,
    },
    sch:{
        type: String,
    },
    description: {
        type: String,
    },
    material: {
        type: String, 
    },
    remarks: {
        type: String,
    },
    unitPrice: {
        type: Number,
    },
    vlContDelDate: {
        type: Date,
    },
    kind: {
        type: String,
    },
    vlSo: {
        type: String, //1
    },
    vlSoItem: {
        type: Number, //1
    },
    vlPo: {
        type: Number,
    },
    vlPoItem: {
        type: Number,
    },
    supplier: {
        type: String,
    },
    supSo: {
        type: String,
    },
    supSoItem: {
        type: String,
    },
    vlArtNo: {
        type: Number,
    },
    supContrDate: {
        type: Date,
    },
    comments: {
        type: String,        
    },
    vlDelCondition: {
        type: String,      
    },
    supDelCondition: {
        type: String, 
    },
    devRemarks: {
        type: String,     
    },
    clDescription: {
        type: String,      
    },
    s1: {
        type: Number,   
    },
    s2: {
        type: Number,    
    },
    dn1: {
        type: Number,    
    },
    dn2: {
        type: Number,    
    },
    vlArtNoX: {
        type: String,  
    },
    itemX:{
        type: String,
    },
    vlPoX: {
        type: String,
    },
    vlPoItemX: {
        type: String,
    },
    udfPoX1: {
        type: String,
    },
    udfPoX2: {
        type: String,
    },
    udfPoX3: {
        type: String,
    },
    udfPoX4: {
        type: String,
    },
    udfPoX5: {
        type: String,
    },
    udfPoX6: {
        type: String,
    },
    udfPoX7: {
        type: String,
    },
    udfPoX8: {
        type: String,
    },
    udfPoX9: {
        type: String,
    },
    udfPoX10: {
        type: String,
    },
    udfPo91: {
        type: Number,
    },
    udfPo92: {
        type: Number,
    },
    udfPo93: {
        type: Number,
    },
    udfPo94: {
        type: Number,
    },
    udfPo95: {
        type: Number,
    },
    udfPo96: {
        type: Number,
    },
    udfPo97: {
        type: Number,
    },
    udfPo98: {
        type: Number,
    },
    udfPo99: {
        type: Number,
    },
    udfPo910: {
        type: Number,
    },
    udfPoD1: {
        type: Date,
    },
    udfPoD2: {
        type: Date,
    },
    udfPoD3: {
        type: Date,
    },
    udfPoD4: {
        type: Date,
    },
    udfPoD5: {
        type: Date,
    },
    udfPoD6: {
        type: Date,
    },
    udfPoD7: {
        type: Date,
    },
    udfPoD8: {
        type: Date,
    },
    udfPoD9: {
        type: Date,
    },
    udfPoD10: {
        type: Date,
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'  
    },
    daveId: {
        type: Number,
    }
});

PoSchema.virtual("transactions", {
    ref: "transactions",
    localField: "_id",
    foreignField: "poId",
    justOne: false
});


PoSchema.virtual("subs", {
    ref: "subs",
    localField: "_id",
    foreignField: "poId",
    justOne: false
});

PoSchema.virtual("heats", {
    ref: "heats",
    localField: "_id",
    foreignField: "poId",
    justOne: false
});

PoSchema.set('toJSON', { virtuals: true });

module.exports = Po = mongoose.model('pos', PoSchema);