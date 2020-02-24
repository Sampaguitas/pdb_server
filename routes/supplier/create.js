const express = require('express');
const router = express.Router();
const Supplier = require('../../models/Supplier');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    if (!req.body.hasOwnProperty('projectId')){
        return res.status(400).json({message: 'You need to provide a valid projectId'});
    } else {
        console.log('req.body:', req.body);
        // const newSupplier = new Supplier(req.body);
        //     newSupplier
        //         .save()
        //         .then(supplier => res.json(supplier))
        //         .catch(err => res.json(err));
    }
            

});
module.exports = router;


            //     {
            //     name: req.body.name,
            //     registeredName: req.body.registeredName,
            //     contact: req.body.contact,
            //     position: req.body.position,
            //     tel: req.body.tel,
            //     fax: req.body.fax,
            //     mail: req.body.mail,
            //     address: req.body.address,
            //     city: req.body.city,
            //     country: req.body.country,
            //     udfSpX1: req.body.udfSpX1,
            //     udfSpX2: req.body.udfSpX2,
            //     udfSpX3: req.body.udfSpX3,
            //     udfSpX4: req.body.udfSpX4,
            //     udfSpX5: req.body.udfSpX5,
            //     udfSpX6: req.body.udfSpX6,
            //     udfSpX7: req.body.udfSpX7,
            //     udfSpX8: req.body.udfSpX8,
            //     udfSpX9: req.body.udfSpX9,
            //     udfSpX10: req.body.udfSpX10,
            //     udfSp91: req.body.udfSp91,
            //     udfSp92: req.body.udfSp92,
            //     udfSp93: req.body.udfSp93,
            //     udfSp94: req.body.udfSp94,
            //     udfSp95: req.body.udfSp95,
            //     udfSp96: req.body.udfSp96,
            //     udfSp97: req.body.udfSp97,
            //     udfSp98: req.body.udfSp98,
            //     udfSp99: req.body.udfSp99,
            //     udfSp910: req.body.udfSp910,
            //     udfSpD1: req.body.udfSpD1,
            //     udfSpD2: req.body.udfSpD2,
            //     udfSpD3: req.body.udfSpD3,
            //     udfSpD4: req.body.udfSpD4,
            //     udfSpD5: req.body.udfSpD5,
            //     udfSpD6: req.body.udfSpD6,
            //     udfSpD7: req.body.udfSpD7,
            //     udfSpD8: req.body.udfSpD8,
            //     udfSpD9: req.body.udfSpD9,
            //     udfSpD10: req.body.udfSpD10,
            //     projectId: req.body.projectId,
            //     daveId: req.body.daveId, 
            // }
            // );