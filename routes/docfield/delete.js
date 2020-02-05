const express = require('express');
const router = express.Router();
const DocField = require('../../models/DocField');
const fault = require('../../utilities/Errors');

router.delete('/', async (req, res) => {
    const parsedId = JSON.parse(req.query.id);
    await parsedId.map(id => {
        DocField.findByIdAndRemove({_id: String(id)}, function(err, fn){
            if (fn) {
                console.log('DocField deleted');   
            }
            if(err) {
                return res.status(400).json({message: 'DocField does not exist'}); //"2601": "DocField does not exist",
            }
        });
    });
    return res.status(200).json({message: 'DocField has been deleted'}); //"2603": "DocField has been deleted",
});

module.exports = router;