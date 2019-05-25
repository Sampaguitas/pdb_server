const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const User = require('../../models/User');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    User.findOne({ email }, { password:1 , userName:1, name: 1, email: 1, isAdmin:1, isSuperAdmin: 1, opcoId:1 })
    .populate({
        path:'opco', 
        populate: {
            path: 'region'
        }
    })
    .populate({
        path:'opco',
        populate: {
            path: 'locale'
        }
    })
    .then(user => {
        if (!user) {
            return res.status(404).json({
                message: fault(1601).message
                //"1601": "User does not exist",
            });
        }
        
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {                        
                const payload = { 
                    id: user.id,
                    userName: user.userName,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    isSuperAdmin: user.isSuperAdmin,
                    opcoId: user.opcoId,
                    opco: user.opco.name,
                    regionId: user.opco.regionId,
                    region: user.opco.region.name,
                    localeId: user.opco.localeId,
                    locale: user.opco.locale.name
                };
                jwt.sign(
                    payload,
                    keys.secret,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token,
                            id: payload.id,
                            userName: payload.userName,
                            name: payload.name,
                            email: payload.email,
                            isAdmin: payload.isAdmin,
                            isSuperAdmin: payload.isSuperAdmin,
                            opcoId: payload.opcoId,
                            opco: payload.opco,
                            regionId: payload.regionId,
                            region: payload.region,
                            localeId: payload.localeId,
                            locale: payload.locale
                        });
                    }
                );
            } else {
                return res.status(400).json({
                    message: fault(1605).message
                    //"1605": "Password does not match",
                });
            }
        });
    });
});

module.exports = router;