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
        if (err) {
            return res.status(400).json({ message: 'An error has occured.'});
        } if (!user) {
            return res.status(400).json({ message: 'Could not retreive user to be updated.'});
        } else {
            return res.status(200).json({ message: 'User has successfully been updated.' });
        }
    });
});

module.exports = router;

//https://webapplog.com/express-js-and-mongoose-example-building-hackhall/