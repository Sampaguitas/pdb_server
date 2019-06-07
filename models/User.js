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

// UserSchema.pre("findByIdAndUpdate", function (next) {
//     console.log('toto');
//     var self = this;
//     User.find({ name: self.name}, function(error, user)   {
//         if(error)
//             return next(error);
//         if (!user) {
//             next();
//         } else {
//             console.log ('user already exists');
//             next(new Error("User exists!"));
//         }
//     });
// });

//module.exports = mongoose.model('users', UserSchema);
module.exports= User = mongoose.model('users', UserSchema);


