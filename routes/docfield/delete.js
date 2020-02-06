const express = require('express');
const router = express.Router();
const DocField = require('../../models/DocField');
const fault = require('../../utilities/Errors');

router.delete('/', async (req, res) => {
    const parsedId = JSON.parse(req.query.id);
    
    if (_.isEmpty(parsedId)) {
        return res.status(400).json({message: 'You need to pass an Id'});
    } else {
        DocField.deleteMany({_id: { $in: parsedId } }, function (err) {
            if (err) {
                return res.status(400).json({message: 'An error has occured'});
            } else {
                return res.status(200).json({message: 'Done'});
            }
        });
    }
});

module.exports = router;