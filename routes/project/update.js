const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const fault = require('../../utilities/Errors');
const Access = require('../../models/Access');

const _ =require('lodash');

// function projectUsers(users) {
//     return users.filter(function(user) {
//         return user.isExpediting || user.isInspection || user.isShipping || user.isWarehouse || user.isConfiguration;
//     });
// }

router.put('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
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
                        if (!newUser.isExpediting && !newUser.isInspection && !newUser.isShipping && !newUser.isWarehouse && !newUser.isConfiguration) {
                            //if no roles then delete existing user from Access
                            console.log('%s exists but has no roles: will be deleted', newUser.name);

                        } else {
                            //if role then update exisitng user from Access Table
                            console.log('%s exisit and has some roles: will be updated', newUser.name);
                        }

                    } else if (newUser.isExpediting || newUser.isInspection || newUser.isShipping || newUser.isWarehouse || newUser.isConfiguration) {
                        //if no existing user in Access table then create one
                        console.log('%s does not exist and has some roles: will be created', newUser.name);
                    }
                });
            });
            //console.log(req.body.projectUsers);
            return res.status(200).json({
                message: fault(1302).message
                //"1302": "Project has been updated",
            });
        }
    });
});

module.exports = router;
