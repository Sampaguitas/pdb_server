const express = require('express');
const router = express.Router();
const Sub = require('../../models/Sub');


router.get('/', (req, res) => {
    Sub.aggregate([
        {
          '$lookup': {
            'from': 'pos', 
            'localField': 'poId', 
            'foreignField': '_id', 
            'as': 'pos'
          }
        }, {
          '$project': {
            'po': {
              '$arrayElemAt': [
                '$pos', 0
              ]
            }
          }
        }, {
          '$project': { '_id': 1, 'projectId': '$po.projectId' }
        }
    ], function (err, docs) {
        if (!!err || !docs) {
            res.status(400).json(err)
        } else {
            try {
                Sub.bulkWrite([
                    ...docs.reduce(function(acc, cur) {
                        acc.push({ 'updateOne': {  'filter': { '_id': cur._id }, 'update': { '$set': { 'projectId': cur.projectId } } } });
                        return acc;
                    }, [])
                ], {
                    'ordered': false
                });
            } catch(e) {
                res.status(200).json(e);
            }
            
        }
    });
});

module.exports = router;