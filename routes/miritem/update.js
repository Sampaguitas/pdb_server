const express = require('express');
const router = express.Router();
const MirItem = require('../../models/MirItem');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = decodeURI(req.query.id);

    if (data.hasOwnProperty('lineNr')) {
        if (!data.lineNr || data.lineNr <= 0) {
            return res.status(400).json({ message: 'Line Number cannot be empty' });
        } else {
            isUnique(data.lineNr, id)
            .then( () => {
                updateMirItem(id, data).then(result => {
                    return res.status(result.isRejected ? 400 : 200).json({ message: result.message })
                });
            })
            .catch( () => {
                return res.status(400).json({ message: 'Could not verify that Line Number is unique' });
            });
        }
    } else if (data.hasOwnProperty('qtyRequired')) {
        if (!data.qtyRequired || data.qtyRequired <= 0) {
            return res.status(400).json({ message: 'Qty Required cannot be empty' });
        } else {
            updateMirItem(id, data).then(result => {
                return res.status(result.isRejected ? 400 : 200).json({ message: result.message })
            });
        }
    } else {
        updateMirItem(id, data).then(result => {
            return res.status(result.isRejected ? 400 : 200).json({ message: result.message })
        });
    }
});

module.exports = router;

function isUnique(lineNr, id) {
    return new Promise(function(resolve, reject) {
        MirItem.findById(id, function (err, miritem) {
            if (err || !miritem) {
                reject();
            } else {
                MirItem.findOne({mirId: miritem.mirId, lineNr: lineNr}, function (error, found) {
                    if (error || !!found) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
}

function updateMirItem(id, data) {
    return new Promise(function(resolve) {
        MirItem.findByIdAndUpdate(id, { $set: data }, function (err, miritem) {
            if (err) {
                resolve({
                    isRejected: true,
                    message: 'An error has occured.'
                });
            } else if (!miritem) {
                resolve({
                    isRejected: true,
                    message: 'Could not find MirItem to be updated.'
                });
            } else {
                resolve({
                    isRejected: false,
                    message: 'MirItem Successfully updated.'
                });
            }
        });
    });
}