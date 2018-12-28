const express = require('express');
const router = express.Router();
const fault = require('../../utilities/Errors')
const Role = require('../../models/Role');

router.post('/', (req, res) => {

    Role.findOne({ name: req.body.name }).then(role => {
        if (role) {
            return res.status(400).json({
                res_no: 300,
                res_message: fault(300).message
                //"400": "Role already exists",
            });
        } else {

            const newRole = new Role({
                name: req.body.name
            });

            newRole
                .save()
                .then(role => res.json(role))
                .catch(err => res.json(err));
        }
    });
});
module.exports = router;