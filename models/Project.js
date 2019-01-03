const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ProjectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    customer: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'customers'
    },
    opco: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'opcos'
    },
    currency: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'currencies'       
    },
    users: [{
        user: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'users'
        },
        roles: {
            expediter: {
                type: Boolean,
                default: false
            },
            inspector: {
                type: Boolean,
                default: false
            },
            shipper: {
                type: Boolean,
                default: false
            },
            warehouse: {
                type: Boolean,
                default: false
            }
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});



//module.exports = mongoose.model('Projects', ProjectSchema);
module.exports = Project = mongoose.model('projects', ProjectSchema);