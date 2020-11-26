const express = require('express');
const router = express.Router();
const Supplier = require('../../models/Supplier');

router.post('/', (req, res) => {
    if (!req.body.hasOwnProperty('projectId')){
        return res.status(400).json({message: 'You need to provide a valid projectId'});
    } else {
        const newSupplier = new Supplier(req.body);
            newSupplier
                .save()
                .then(supplier => res.json(supplier))
                .catch(err => res.status(400).json({message: 'An error has occured'}));
    }
            

});
module.exports = router;