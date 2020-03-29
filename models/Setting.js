const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const SettingSchema = new Schema({
    params: {    
        filter: [
            {
                _id: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: 'fieldnames',
                    required: true
                },
                value: {
                    type: String,
                    required: true
                },
                isEqual: {
                    type: Boolean,
                    required: true
                }
            }
        ],
        display:[
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'fieldnames',
                required: true
            }
        ]
    },
    screenId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'screens',
        required: true
    },
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users',
        required: true
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects',
        required: true  
    },
});

module.exports = Setting = mongoose.model('settings',SettingSchema);