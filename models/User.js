const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const UserSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    isSuperAdmin: {
        type: Boolean,
        default: false  
    },
    opcoId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'opcos'
    },
    daveId: {
        type: Number,
    }
});

UserSchema.virtual("opco", {
    ref: "opcos",
    localField: "opcoId",
    foreignField: "_id",
    justOne: true
});

UserSchema.set('toJSON', { virtuals: true });

// UserSchema.pre("findOneAndUpdate", function (next) {
//     var self = this;
//     User.find({name: self.name}, function(err, user) {
//         if(err) {
//             next(new Error(err));
//         } else if(user) {
//             console.log('user already exist');
//             next(new Error('user already exist'));
//         } else {
//             next();
//         }
//     });
// });

//module.exports = mongoose.model('users', UserSchema);
module.exports= User = mongoose.model('users', UserSchema);


