const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ArticleSchema = new Schema({
    vlArtNo: {
        type: Number,
    },
    netWeight: {
        type: Number,
    },
    hsCode: {
        type: Number,
    },
    vlArtNoX: {
        type: String
    },
    erp: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'erps'  
    }
});

module.exports = Article = mongoose.model('articles', ArticleSchema);