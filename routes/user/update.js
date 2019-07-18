const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = req.query.id
    User.findOneAndUpdate({_id: id }, { $set: data }, function (err, user) {
            if (!user) {
                return res.status(400).json({
                    message: fault(1601).message
                    //"1601": "User does not exist",
                });
            }
            else {
                return res.status(200).json({
                    message: fault(1602).message
                    //"1602": "User has been updated",
                });
            }
    });
});

module.exports = router;

//https://webapplog.com/express-js-and-mongoose-example-building-hackhall/