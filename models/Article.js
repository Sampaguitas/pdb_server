const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ArticleSchema = new Schema({
    erp: {
        type: String,
        required: true
    },    
    vlArtNo: {
        type: Number,
    },
    vlArtNoX: {
        type: String
    },
    netWeight: {
        type: Number,
    },
    hsCode: {
        type: Number,
    },
    daveId: {
        type: Number,
    }
});

module.exports = Article = mongoose.model('articles', ArticleSchema);