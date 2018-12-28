const express = require('express');
const router = express.Router();
const Role = require('../../models/Role');
const fault = require('../../utilities/Errors')

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    Role.findByIdAndUpdate(id, { $set: data }, function (err, role) {
        if (!role) {
            return res.status(400).json({
                res_no: 401,
                res_message: fault(401).message
                //"401": "Role does not exist",
            });
        }
        else {
            return res.status(200).json({
                res_no: 102,
                res_message: fault(102).message
                //"402": "Role has been updated",
            });
        }
    });
});


module.exports = router;

//https://webapplog.com/express-js-and-mongoose-example-building-hackhall/