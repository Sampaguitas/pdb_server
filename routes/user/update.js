const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const fault = require('../../utilities/Errors')

router.put('/', (req, res) => {
    var data = {};
    // var roles = [
    //     'admin',
    //     'superUser',
    //     'expediter',
    //     'inspector',
    //     'shipper',
    //     'warehouse'
    // ]

    Object.keys(req.body).forEach(function (k) {
        // if (roles.indexOf(k) > -1) {
        //     data['roles.' + k] = req.body[k];
        // } else {
            data[k] = req.body[k];
        // }
    });

    const id = req.query.id
    User.findByIdAndUpdate(id, { $set: data }, function (err, user) {
            if (!user) {
                return res.status(400).json({
                    message: fault(101).message
                    //"102": "User does not exist",
                });
            }
            else {
                return res.status(200).json({
                    message: fault(102).message
                    //"102": "User has been updated",
                });
            }
    });
});


module.exports = router;

//https://webapplog.com/express-js-and-mongoose-example-building-hackhall/