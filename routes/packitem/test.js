const express = require('express');
const router = express.Router();
const PackItem = require('../../models/PackItem');

router.get('/', (req, res) => {
    PackItem.aggregate([
        {
          '$lookup': {
            'from': 'subs', 
            'localField': 'subId', 
            'foreignField': '_id', 
            'as': 'subs'
          }
        }, {
          '$project': {
            'sub': {
              '$arrayElemAt': [
                '$subs', 0
              ]
            }
          }
        }, {
          '$project': { '_id': 1, 'poId': '$sub.poId','projectId': '$sub.projectId' }
        }
    ], function (err, docs) {
        if (!!err || !docs) {
            res.status(400).json(err)
        } else {
          PackItem.bulkWrite([
              ...docs.reduce(function(acc, cur) {
                  acc.push({ 'updateOne': {  'filter': { '_id': cur._id }, 'update': { '$set': { 'poId': cur.poId, 'projectId': cur.projectId } } } });
                  return acc;
              }, [])
          ], {
              'ordered': false
          }).then(doc => {
            if (!!doc.result) {
                res.status(200).json({"res": doc.result});
            } else {
              res.status(400).json({"err": "something happend"});
            }
        });
        }
    });
});

module.exports = router;