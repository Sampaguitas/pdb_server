const express = require('express');
const router = express.Router();
const FieldName = require('../../models/FieldName');
const fault = require('../../utilities/Errors');
const _ = require('lodash');

router.delete('/', async (req, res) => {
    //req.query.id: [%225d186291760cd9328dfa4ccd%22,%225d186290760cd9328dfa4c5f%22]
    //parsedId: ["5d186291760cd9328dfa4ccd","5d186290760cd9328dfa4c5f"]
    const parsedId = JSON.parse(req.query.id);
    
    if (_.isEmpty(parsedId)) {
        return res.status(400).json({message: 'You need to pass an Id.'});
    } else {
        FieldName.deleteMany({_id: { $in: parsedId } }, function (err) {
            if (err) {
                return res.status(400).json({message: 'An error has occured.'});
            } else {
                return res.status(200).json({message: 'Done'});
            }
        });
    }


});


module.exports = router;


