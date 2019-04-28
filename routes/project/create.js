const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    Project.findOne({ name: req.body.name }).then(project => {
        if (project) {
            return res.status(400).json({
                message: fault(1300).message
                //"1300": "Project already exists",
            });
        } else {
            const newProject = new Project({
                number:req.body.number,
                name: req.body.name,
                erp: req.body.erp,
                locale: req.body.locale,
                opco: req.body.opco,
                users: req.body.users,
            });
            newProject
                .save()
                .then(project => { 
                    res.json(project);

                    // const newField1 = new newField({
                    //     name: 'netWeight',
                    //     custom: 'Net Weight',
                    //     type: 'Number',
                    //     fromTbl: 'articles',
                    //     project: project._id,
                    // });
                    // newField1
                    // .save()
                    // .then(field => res.json(field))
                    // .catch(err => res.json(err));
                    
                    // const newField2 = new newField({
                    //     name: 'hsCode',
                    //     custom: 'HS Code',
                    //     type: 'Number',
                    //     fromTbl: 'articles',
                    //     project: project._id,
                    // });
                    // newField2
                    // .save()
                    // .then(field => res.json(field))
                    // .catch(err => res.json(err));


                })
                .catch(err => res.json(err));
        }
    });
});

module.exports = router;