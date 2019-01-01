const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ProjectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    costumer: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'customers'
    },
    date: {
        type: Date,
        default: Date.now
    }
});



//module.exports = mongoose.model('Projects', ProjectSchema);
module.exports = Project = mongoose.model('projects', ProjectSchema);