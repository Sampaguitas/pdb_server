const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const User = require('../../models/User');
const fault = require('../../utilities/Errors');
const _ =require('lodash');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const user = req.user;
    
    User.findById(user._id)
    .populate({
        path:'opco',
        select: 'regionId'
    })
    .then(foundUser=>{
        Project.find(data)
        .sort({
            number: 'asc'
        })
        .populate([
            {
                path: 'erp', 
                select: 'name'
            },
            {
                path: 'accesses',
                populate: {
                    path: 'user'
                }
            },
            {
                path: 'opco',
                select: ('regionId name')
            }
        ])
        .exec(function (err, projects) {
            if (!!err || !projects) {
                return res.status(400).json({ message: 'We could not find any Projects'});
            } else {
                return res.status(200).json(projects.reduce(function(acc, cur) {
                    if (_.isEqual(cur.number, 999999) || !!foundUser.isSuperAdmin) {
                        acc.push(cur);
                    } else if (!!foundUser.isAdmin && _.isEqual(String(foundUser.opco.regionId), String(cur.opco.regionId))) {
                        acc.push(cur);
                    } else {
                        let found = cur.accesses.find(access => _.isEqual(String(access.userId), String(foundUser._id)));
                        if (!_.isUndefined(found) && (!!found.isExpediting || !!found.isInspection || !!found.isShipping || !!found.isWarehouse || !!found.isConfiguration)) {
                            acc.push(cur);
                        }
                    }
                    return acc;
                }, []));
            }
        });
    }).catch(err => res.status(400).json({ message: 'An error has occured'}));
});

module.exports = router;
