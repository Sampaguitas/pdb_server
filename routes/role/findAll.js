const express = require('express');
const router = express.Router();
const Role = require('../../models/Role');
const fault = require('../../utilities/Errors')
const keys = require('../../config/keys');


router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Role.find(data, function (err, Role) {
        if (!Role) {
            return res.status(400).json({
                res_no: 404,
                res_message: fault(404).message
                //"404": "No Role match",
            });
        }
        else {
            return res.json(Role);
        }
    });
});


module.exports = router;