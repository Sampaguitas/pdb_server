const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Project.findById(id)
    // .populate({
    //     path: 'accesses',
    //     populate: {
    //         path: 'user'
    //     }
    // })
    .populate({
        path: 'pos',
        populate: {
            path: 'subs',
            populate: {
                path: 'certificates'
            }
        }
    })
    // .populate('collitypes')
    // .populate('erp')
    // .populate('suppliers')
    // .populate('fields')
    .populate({
        path: 'fieldnames',
        populate: {
            path: 'fields', 
            //select:'custom'
        }
    })
    // .populate('docdefs')
    .populate({
        path: 'docfields',
        populate: {
            path:'fields',
            select: 'custom'
        }
    })
    .exec(function (err, project) {
            if (!project) {
                return res.status(400).json({
                    message: fault(1301).message
                    //"1301": "Project does not exist",
                });
            }
            else {
                return res.json(project);
            }
        });
});

module.exports = router;