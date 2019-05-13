const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Po = require('../../models/Po');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    Po.aggregate(
        [
            {
                $group:
                {
                    _id: { day: { $dayOfYear: "$vlContDelDate" }, year: { $year: "$vlContDelDate" } },
                    contractual: { $sum: { $multiply: [ "$qty", "$unitPrice" ] } },
                    count: { $sum: 1 }
                }
            }
        ]
    ).exec(function(err, data){
        if (err) {
            console.log(err)
        }
        return res.json(data);
    })
});

module.exports = router;