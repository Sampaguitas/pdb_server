const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const fault = require('../../utilities/Errors')
const keys = require('../../config/keys');


router.get('/', (req, res) => {
    var data = {};
    console.log(JSON.stringify(req.user, null, 4));
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

User.find(data, function (err, user) {
        if (!user) {
            return res.status(400).json({
                message: fault(104).message
                    //"104": "No user match",
                });
        }
        else {
            return res.json(user);
        }
    });
});


module.exports = router;