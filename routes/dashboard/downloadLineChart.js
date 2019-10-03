var express = require('express');
const router = express.Router();
var chart = require('../../middleware/chart');
var XLSXChart = require ("xlsx-chart");
const moment = require('moment');

router.get('/', function (req, res) {
  
  const projectId = req.query.projectId;
  const unit = req.query.unit; //value, qty
  const firstDate = req.query.firstDate;
  const lastDate = req.query.lastDate;
  const period = req.query.period; //day, week, fortnight, month, quarter, 
  const clPos = req.query.clPos; 
  const clPoRevs = req.query.clPoRevs; 
  const lines = req.query.lines; //// contract, rfiExp, rfiAct, released, shipExp, shipAct, delExp, delAct
  
  chart.getLine(projectId, unit, firstDate, lastDate, period, clPos, clPoRevs, lines)
  .then(fulfilled => {
    if (!fulfilled) {
      res.status(400).json({ message: 'request returned empty responce'});
    } else {

      var xlsxChart = new XLSXChart ();
      var opts = {
          file: 'chart.xlsx',
          chart: 'line',
          titles: generateTitles(lines),
          fields: fulfilled.generateFields(),
          data: generateData(lines, fulfilled)
      }

      xlsxChart.generate(opts, function(err, data) {
        res.set ({
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': 'attachment; filename=chart.xlsx',
          'Content-Length': data.length
        });
        res.status(200).send(data);
      });

    }
  })
  .catch(function() {
    res.status(400).json({ message: 'Data could not be retrived' });
  });
});

Array.prototype.generateFields = function() {
  return this.reduce(function (accumulator, currentValue) {
    accumulator.push(String(moment(currentValue.date).format('DD-MMM-YY')));
    return accumulator;
  }, [])
}

Array.prototype.generateDatas = function(key) {
  return this.reduce(function (accumulator, currentValue) {
    accumulator[String(moment(currentValue.date).format('DD-MMM-YY'))] = parseFloat(currentValue[key]);
    return accumulator;
  }, {})
}

function generateData(lines, fulfilled) {
  if (!lines) {
    return ({
      contract: fulfilled.generateDatas('contract'),
      rfiExp: fulfilled.generateDatas('rfiExp'),
      rfiAct: fulfilled.generateDatas('rfiAct'),
      released: fulfilled.generateDatas('released'),
      shipExp: fulfilled.generateDatas('shipExp'),
      shipAct: fulfilled.generateDatas('shipAct'),
      delExp: fulfilled.generateDatas('delExp'),
      delAct: fulfilled.generateDatas('delAct')
    });
  } else {
    let newObject = new Object;
    lines.map(function(line) {
      newObject[line] = fulfilled.generateDatas(line);
    });
    return newObject;
  }
}

function generateTitles(lines) {
  if (!lines) {
    return ['contract', 'rfiExp', 'rfiAct', 'released', 'shipExp', 'shipAct', 'delExp', 'delAct',]
  } else {
    return lines;
  }
}

module.exports = router;