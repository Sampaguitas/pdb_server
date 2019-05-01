const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const PoSchema = new Schema({
    clPo: {
        type: String,
        default:''
    },
    clPoRev: {
        type: String,
        default:''
    },
    clPoItem: {
        type: Number,
        default: null
    },
    clCode: {
        type: String,
        default:''
    },
    qty: {
        type: Number,
        default: null
    },
    uom: {
        type: String,
        default:''
    },
    size:{
        type: String,
        default:''
    },
    sch:{
        type: String,
        default:''
    },
    description: {
        type: String,
        default:''
    },
    material: {
        type: String,
        default:''
    },
    remarks: {
        type: String,
        default:''
    },
    unitPrice: {
        type: Number,
        default: null
    },
    vlContDelDate: {
        type: Date,
        default: null
    },
    kind: {
        type: String,
        default:''
    },
    vlSo: {
        type: String,
        default:''
    },
    vlSoItem: {
        type: Number,
        default: null
    },
    vlPo: {
        type: Number,
        default: null
    },
    vlPoItem: {
        type: Number,
        default: null
    },
    supplier: {
        type: String,
        default:''
    },
    supSo: {
        type: String,
        default:''
    },
    supSoItem: {
        type: String,
        default:''
    },
    vlArtNo: {
        type: Number,
        default: null
    },
    supcontrDate: {
        type: Date,
        default: null
    },
    comments: {
        type: String,        
    },
    vlDelCondition: {
        type: String,
        default:''      
    },
    supDelCondition: {
        type: String,
        default:'' 
    },
    devRemarks: {
        type: String,
        default:''     
    },
    clDescription: {
        type: String,
        default:''      
    },
    s1: {
        type: Number,
        default: null   
    },
    s2: {
        type: Number,
        default: null    
    },
    dn1: {
        type: Number,
        default: null    
    },
    dn2: {
        type: Number,
        default: null    
    },
    vlArtNoX: {
        type: String,
        default:''  
    },
    itemX:{
        type: String,
        default:''
    },
    vlPoX: {
        type: String,
        default:''
    },
    vlPoItemX: {
        type: String,
        default:''
    },
    udfPoX1: {
        type: String,
        default:''
    },
    udfPoX2: {
        type: String,
        default:''
    },
    udfPoX3: {
        type: String,
        default:''
    },
    udfPoX4: {
        type: String,
        default:''
    },
    udfPoX5: {
        type: String,
        default:''
    },
    udfPoX6: {
        type: String,
        default:''
    },
    udfPoX7: {
        type: String,
        default:''
    },
    udfPoX8: {
        type: String,
        default:''
    },
    udfPoX9: {
        type: String,
        default:''
    },
    udfPoX10: {
        type: String,
        default:''
    },
    udfPo91: {
        type: Number,
        default: null
    },
    udfPo92: {
        type: Number,
        default: null
    },
    udfPo93: {
        type: Number,
        default: null
    },
    udfPo94: {
        type: Number,
        default: null
    },
    udfPo95: {
        type: Number,
        default: null
    },
    udfPo96: {
        type: Number,
        default: null
    },
    udfPo97: {
        type: Number,
        default: null
    },
    udfPo98: {
        type: Number,
        default: null
    },
    udfPo99: {
        type: Number,
        default: null
    },
    udfPo910: {
        type: Number,
        default: null
    },
    udfPoD1: {
        type: Date,
        default: null
    },
    udfPoD2: {
        type: Date,
        default: null
    },
    udfPoD3: {
        type: Date,
        default: null
    },
    udfPoD4: {
        type: Date,
        default: null
    },
    udfPoD5: {
        type: Date,
        default: null
    },
    udfPoD6: {
        type: Date,
        default: null
    },
    udfPoD7: {
        type: Date,
        default: null
    },
    udfPoD8: {
        type: Date,
        default: null
    },
    udfPoD9: {
        type: Date,
        default: null
    },
    udfPoD10: {
        type: Date,
        default: null
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'  
    },
    daveId: {
        type: Number,
        default: null
    }
});

module.exports = Po = mongoose.model('pos', PoSchema);