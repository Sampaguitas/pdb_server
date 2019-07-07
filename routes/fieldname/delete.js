const express = require('express');
const router = express.Router();
const FieldName = require('../../models/FieldName');
const fault = require('../../utilities/Errors');

router.delete('/', async (req, res) => {
    //req.query.id: [%225d186291760cd9328dfa4ccd%22,%225d186290760cd9328dfa4c5f%22]
    const parsedId = JSON.parse(req.query.id);
    //parsedId: ["5d186291760cd9328dfa4ccd","5d186290760cd9328dfa4c5f"]
    await parsedId.map(id => {
        FieldName.findByIdAndRemove({_id: String(id)}, function(err, fn){
            if (fn) {
                console.log('FieldName deleted');
            }
            if (err) {
                return res.status(400).json({message: fault(0801).message});
            }
        });
    });
    return res.status(200).json({message: fault(0803).message});
});

module.exports = router;


