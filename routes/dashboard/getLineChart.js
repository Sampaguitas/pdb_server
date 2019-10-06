var express = require('express');
const router = express.Router();
var chart = require('../../middleware/chart');
const moment = require('moment');

const constants = [
  {label: 'contract', color: '#ed5565'},
  {label: 'rfiExp', color: '#fbd5ac'},
  {label: 'rfiAct', color: '#f8ac59'},
  {label: 'released', color: '#23c6c8'},
  {label: 'shipExp', color: '#8cd9c9'},
  {label: 'shipAct', color: '#1ab394'},
  {label: 'delExp', color: '#8dc1e2'},
  {label: 'delAct', color: '#1c84c6'},
];

router.get('/', function (req, res) {
  
  const projectId = req.query.projectId;
  const unit = req.query.unit; //value, qty
  // const firstDate = req.query.firstDate;
  // const lastDate = req.query.lastDate;
  const period = req.query.period; //day, week, fortnight, month, quarter, 
  const clPo = req.query.clPo; 
  const clPoRev = req.query.clPoRev; 
  const lines = req.query.lines;// contract, rfiExp, rfiAct, released, shipExp, shipAct, delExp, delAct
  //firstDate, lastDate
  chart.getLine(projectId, unit, period, clPo, clPoRev, lines)
  .then(fulfilled => {
    if (!fulfilled) {
      res.status(400).json({ message: 'request returned empty responce'});
    } else {
      res.json({
        labels: fulfilled.generateLables(),
        datasets: constants.generateDatasets(fulfilled)
      });
    }
  }).catch(error => res.status(400).json({ message: 'an error has occured' }));
});

Array.prototype.generateLables = function() {
  return this.reduce(function (accumulator, currentValue) {
    accumulator.push(String(moment(currentValue.date).format('DD-MMM-YY')));
    return accumulator;
  }, [])
}

Array.prototype.generateData = function(label) {
  return this.reduce(function (accumulator, currentValue) {
    accumulator.push(parseFloat(currentValue[label]));
    return accumulator;
  }, [])
}

Array.prototype.generateDatasets = function(fulfilled) {
  return this.reduce(function (accumulator, currentValue) {
    accumulator.push({
      label: currentValue.label,
      data: fulfilled.generateData(currentValue.label),
      backgroundColor: currentValue.color,
      borderColor: currentValue.color,
      borderWidth: 1,
      fill: false
    });
    return accumulator;
  }, []);
}


module.exports = router;