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
            // populate: {
            //     path: 'locale'
            // },
            // populate: {
            //     path: 'region',
            // }
    })
    .then(foundUser=>{
        Project.find(data)
        .sort({
            number: 'asc'
        })
        .populate({
            path: 'erp', 
            select: 'name'
        })
        .populate({
            path: 'accesses',
            populate: {
                path: 'user'
            }
        })
        .populate({
            path: 'opco',
            select: ('regionId','name')
            // populate: {
            //     path: 'locale'
            // },
            // populate: {
            //     path: 'region'
            // }
        })
        .exec(function (err, projects) {
            if (!projects) {
                return res.status(400).json({
                    message: fault(1304).message
                    //"1304": "No Project match",
                });
            }
            else {
                if (foundUser.isSuperAdmin) {
                    return res.json(projects);
                } else if (foundUser.isAdmin) {
                    var userProjects = []
                    projects.forEach(function(project) {
                        if(project.number === 999999){
                            userProjects.push(project);
                        } else if (_.isEqual(foundUser.opco.regionId, project.opco.regionId)) {
                            userProjects.push(project);
                        } else {
                            project.accesses.forEach(function(access) {
                                if (_.isEqual(foundUser._id,access.userId)){
                                    userProjects.push(project);
                                }
                            });
                        }
                    });
                    return res.json(userProjects);
                } else {
                    var userProjects = []
                    projects.forEach(function(project) {
                        if(project.number === 999999){
                            userProjects.push(project); 
                        } else {
                            project.accesses.forEach(function(access) {
                                if (_.isEqual(foundUser._id,access.userId)){
                                    userProjects.push(project);
                                }
                            });
                        }
                    });
                    return res.json(userProjects);
                }
            }
        });
    });
});

module.exports = router;