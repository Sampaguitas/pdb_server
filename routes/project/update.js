const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const fault = require('../../utilities/Errors');
const Access = require('../../models/Access');

const _ =require('lodash');

function hasRoles(user) {
        return user.isExpediting || user.isInspection || user.isShipping || user.isWarehouse || user.isConfiguration;
}

router.put('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });
    const id = req.query.id;
    const newUsers = req.body.projectUsers
    Project.findByIdAndUpdate(id, { $set: data }, function (err, project) {
        if (!project) {
            return res.status(400).json({
                message: fault(1301).message
                //"1301": "Project does not exist",
            });
        }
        else {
            Access.find({projectId: id}, function(err, existingUsers) {
                newUsers.map(newUser => {
                    let thatUser = existingUsers.find(existingUser => existingUser.userId == newUser.userId);
                    if (thatUser){
                        if (!hasRoles(newUser)) {
                            Access.findByIdAndRemove(thatUser._id, function (err, user){
                                if(!user) {
                                    console.log('user does not exisit');
                                } else {
                                    console.log('%s has been deleted', user._id); 
                                }
                            });
                        } else {
                            Access.findByIdAndUpdate(thatUser._id, { 
                                $set: {
                                    isExpediting: newUser.isExpediting,
                                    isInspection: newUser.isInspection,
                                    isShipping: newUser.isShipping,
                                    isWarehouse: newUser.isWarehouse,
                                    isConfiguration: newUser.isConfiguration,
                                } 
                            },
                            { 'new': true }, function (err, user) {
                                if(!user) {
                                   console.log('user does not exist'); 
                                } else {
                                    console.log('%s has been updated', user._id);
                                }
                            });
                        }
                    } else if (hasRoles(newUser)) {
                        const newAccess = new Access({
                            isExpediting: newUser.isExpediting,
                            isInspection: newUser.isInspection,
                            isShipping: newUser.isShipping,
                            isWarehouse: newUser.isWarehouse,
                            isConfiguration: newUser.isConfiguration,
                            projectId: id,
                            userId: newUser.userId      
                        });
                        newAccess
                        .save()
                        .then(user => console.log('%s has been created', user._id));
                    }
                });
            });
            return res.status(200).json({
                message: fault(1302).message
                //"1302": "Project has been updated",
            });
        }
    });
});

module.exports = router;
