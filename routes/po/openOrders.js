const express = require('express');
const router = express.Router();
// const Project = require('../../models/Project');
const PO = require('../../models/Po');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    PO.find({projectId: id, vlContDelDate: {$exists: true} })
    .populate({
        path: 'subs',
        // match: { $or: [ {vlDelDateAct: { $exists: false }}, {vlDelDateAct: { $gte: new Date() }}  ]}
    })
    .exec(function (err, pos) {
        if (!pos) {
            return res.status(400).json({
                message: fault(1301).message
                //"1301": "po does not exist",
            });
        }
        else {
            let clPoNrs = pos.list('clPo');
            let ArrayPos = [];
            clPoNrs.map(clPoNr => {
                let filteredPos =  pos.filter(po => po.clPo === clPoNr);
                if (filteredPos) {
                    let minContDelDate = filteredPos.minDate('vlContDelDate');
                    if (minContDelDate) {
                        let firstElement = pos.find(firstPo => firstPo.clPo === clPoNr);
                        //array.find(object => object.hasOwnProperty('property') === false)
                        ArrayPos.push({
                            clPo: firstElement.clPo,
                            vlSo: firstElement.vlSo,
                            vlContDelDate: minContDelDate
                        }); 
                    }
                }
            })
            return res.json(ArrayPos);
        }
    });
});

module.exports = router;

Array.prototype.groupBy = function(prop) {
    return this.reduce(function(groups, item) {
      const val = item[prop]
      groups[val] = groups[val] || []
      groups[val].push(item)
      return groups
    }, {})
}

Array.prototype.minDate = function(prop) {
    return this.reduce(function ( accumulator, currentValue ) {
        if (!accumulator || currentValue[prop] < accumulator) {
            accumulator = currentValue[prop];
        }
        return accumulator;
    }, '');
}

Array.prototype.list = function(prop) {
    return this.reduce(function (accumulator, currentValue) {
        if (accumulator.indexOf(currentValue[prop]) === -1 ) {
            accumulator.push(currentValue[prop]);
        }
        return accumulator;
    }, []);
}

