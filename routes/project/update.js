const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Access = require('../../models/Access');

const _ =require('lodash');

function hasRoles(user) {
        return user.isExpediting || user.isInspection || user.isShipping || user.isWarehouse || user.isConfiguration;
}

router.put('/', (req, res) => {

    const projectId = req.query.id;
    const newUsers = req.body.projectUsers;

    let myPromises = [];
    let rejections = [];
    let nRejected = 0;
    let nAdded = 0;
    let nEdited = 0;
    let nRemoved = 0;

    Project.findByIdAndUpdate(projectId, { $set:
        {
            name: req.body.name,
            enableInspection: req.body.enableInspection,
            enableShipping: req.body.enableShipping,
            enableWarehouse: req.body.enableWarehouse,
            erpId: req.body.erpId,
            currencyId: req.body.currencyId,
            opcoId: req.body.opcoId,
        } 
    })
    .then(function (project) {
        if (!project) {
            return res.status(400).json({
                message: 'Could not update the project.',
                rejections: rejections,
                nRejected: nRejected,
                nAdded: nAdded,
                nEdited: nEdited,
                nRemoved: nRemoved,
            });
        }
        else {
            Access.find({projectId: projectId})
            .then(async function (existingUsers) {
                // (async function() {
                    newUsers.map(function (newUser) {
                        let thatUser = existingUsers.find(element => element.userId == newUser.userId);
                        myPromises.push(upsert(newUser, thatUser, projectId));
                    });

                    await Promise.all(myPromises).then(resPromises => {
                        resPromises.map(r => {
                            if (r.isRejected) {
                                rejections.push({_id: r._id, reason: r.reason});
                                nRejected++;
                            } else if (r.isAdded) {
                                nAdded++;
                            } else if (r.isEdited) {
                                nEdited++;
                            } else {
                                nRemoved++;
                            }
                        }); //end parse resPromises
                        return res.status(200).json({
                            message: 'Project has been updated',
                            rejections: rejections,
                            nRejected: nRejected,
                            nAdded: nAdded,
                            nEdited: nEdited,
                            nRemoved: nRemoved,
                        });
                    })
                    .catch(() => {
                        return res.status(400).json({
                            message: 'An error has occured while updating user accesses',
                            rejections: rejections,
                            nRejected: nRejected,
                            nAdded: nAdded,
                            nEdited: nEdited,
                            nRemoved: nRemoved,
                        });
                    });
                // });
            })
            .catch(() => {
                return res.status(400).json({
                    message: 'An error has occured while trying to retrive users',
                    rejections: rejections,
                    nRejected: nRejected,
                    nAdded: nAdded,
                    nEdited: nEdited,
                    nRemoved: nRemoved,
                });
            });
            // return res.status(200).json({message: 'Project has been updated'});
        }
    })
    .catch(function () {
        return res.status(400).json({
            message: 'An error has occured while updating the project.',
            rejections: rejections,
            nRejected: nRejected,
            nAdded: nAdded,
            nEdited: nEdited,
            nRemoved: nRemoved,
        });
    });
});

function upsert(newUser, thatUser, projectId) {
    // console.log('upsert');
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(thatUser)){
            if (!hasRoles(newUser)) {
                Access.findByIdAndRemove(thatUser._id)
                .then(function (access){
                    if(!access) {
                        resolve({
                            _id: newUser._id,
                            isAdded: false,
                            isEdited: false,
                            isRemoved: false,
                            isRejected: true,
                            reason: 'Access could not be removed: id not found'
                        });
                    } else {
                        resolve({
                            _id: newUser._id,
                            isAdded: false,
                            isEdited: false,
                            isRemoved: true,
                            isRejected: false,
                            reason: ''
                        });
                    }
                })
                .catch(function (err) {
                    resolve({
                        _id: newUser._id,
                        isAdded: false,
                        isEdited: false,
                        isRemoved: false,
                        isRejected: true,
                        reason: 'Access could not be removed: an error has occured'
                    });
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
                { 
                    'new': true 
                })
                .then(function (access) {
                    if(!access) {
                        resolve({
                            _id: newUser._id,
                            isAdded: false,
                            isEdited: false,
                            isRemoved: false,
                            isRejected: true,
                            reason: 'Access could not be updated: id not found'
                        });
                    } else {
                        resolve({
                            _id: newUser._id,
                            isAdded: false,
                            isEdited: true,
                            isRemoved: false,
                            isRejected: false,
                            reason: ''
                        });
                    }
                })
                .catch(function (err) {
                    resolve({
                        _id: newUser._id,
                        isAdded: false,
                        isEdited: false,
                        isRemoved: false,
                        isRejected: true,
                        reason: 'Access could not be updated: an error has occured'
                    });
                });
            }
        } else if (hasRoles(newUser)) {
            const newAccess = new Access({
                isExpediting: newUser.isExpediting,
                isInspection: newUser.isInspection,
                isShipping: newUser.isShipping,
                isWarehouse: newUser.isWarehouse,
                isConfiguration: newUser.isConfiguration,
                projectId: projectId,
                userId: newUser.userId      
            });
            newAccess
            .save()
            .then(function (access) {
                if (!access) {
                    resolve({
                        _id: newUser._id,
                        isAdded: false,
                        isEdited: false,
                        isRemoved: false,
                        isRejected: true,
                        reason: 'Access could not be added: an error has occured'
                    });
                } else {
                    resolve({
                        _id: newUser._id,
                        isAdded: true,
                        isEdited: false,
                        isRemoved: false,
                        isRejected: false,
                        reason: ''
                    });
                }
            })
            .catch(function (err) {
                resolve({
                    _id: newUser._id,
                    isAdded: false,
                    isEdited: false,
                    isRemoved: false,
                    isRejected: true,
                    reason: 'Access could not be added: an error has occured'
                });
            });
        } else {
            resolve({
                _id: newUser._id,
                isAdded: false,
                isEdited: false,
                isRemoved: false,
                isRejected: false,
                reason: ''
            });
        }
    });
}

module.exports = router;





                        // if (thatUser){
                        //     if (!hasRoles(newUser)) {
                        //         Access.findByIdAndRemove(thatUser._id, function (err, user){
                        //             if(!user) {
                        //                 console.log('user does not exisit');
                        //             } else {
                        //                 console.log('%s has been deleted', user._id); 
                        //             }
                        //         });
                        //     } else {
                        //         Access.findByIdAndUpdate(thatUser._id, { 
                        //             $set: {
                        //                 isExpediting: newUser.isExpediting,
                        //                 isInspection: newUser.isInspection,
                        //                 isShipping: newUser.isShipping,
                        //                 isWarehouse: newUser.isWarehouse,
                        //                 isConfiguration: newUser.isConfiguration,
                        //             } 
                        //         },
                        //         { 'new': true }, function (err, user) {
                        //             if(!user) {
                        //                console.log('user does not exist'); 
                        //             } else {
                        //                 console.log('%s has been updated', user._id);
                        //             }
                        //         });
                        //     }
                        // } else if (hasRoles(newUser)) {
                        //     const newAccess = new Access({
                        //         isExpediting: newUser.isExpediting,
                        //         isInspection: newUser.isInspection,
                        //         isShipping: newUser.isShipping,
                        //         isWarehouse: newUser.isWarehouse,
                        //         isConfiguration: newUser.isConfiguration,
                        //         projectId: id,
                        //         userId: newUser.userId      
                        //     });
                        //     newAccess
                        //     .save()
                        //     .then(user => console.log('%s has been created', user._id));
                        // }