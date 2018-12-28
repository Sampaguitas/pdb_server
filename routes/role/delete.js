const express = require('express');
const router = express.Router();
const Role = require('../../models/Role');
const fault = require('../../utilities/Errors')


router.delete('/', (req, res) => {
    const id = req.query.id
    Role.findByIdAndRemove(id, function (err, role) {
        if (!role) {
            return res.status(400).json({
                res_no: 401,
                res_message: fault(401).message
                //"401": "Role does not exist",
            });
        }
        else {
            return res.status(200).json({
                res_no: 103,
                res_message: fault(103).message,
                //"403": "Role has been deleted",
            });
        }
    });
});

module.exports = router;