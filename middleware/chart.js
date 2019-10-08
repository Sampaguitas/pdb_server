const fault = require('../utilities/Errors'); //../utilities/Errors
const Po = require('../models/Po');
const Article = require('../models/Article');
const moment = require('moment');
fs = require('fs');
const _ = require('lodash');

function getLine(projectId, unit, period, clPo, clPoRev) {
    return new Promise(
        function (resolve, reject) {
            Po.find({ projectId })
            .populate('subs')
            .exec(function(errPos, resPos) {
              if(errPos) {
                reject('an error has occured');
              } else if (!resPos) {
                reject('the project is empty');
              } else {
                let filteredLines = resPos.filterLines(clPo, clPoRev);
                let allDates = filteredLines.returnAllDates();
                if (_.isEmpty(allDates)) {
                    reject('the project does not contain any dates');
                } else {
                  let earliest = allDates.returnEarliest();
                  let latest = allDates.returnLatest();
                  let dates = populateDates(earliest, latest, period);
                  Promise.all(promeses(filteredLines, dates, unit)).then( function(fields) {
                    resolve(fields);
                  });
                }
              }
            });
        }
    );
}

function promeses(filteredLines, dates, unit) {
  return dates.map(async date => {
    return {
      date: date,
      contract: await filteredLines.populateValue(date, 'po', 'vlContDelDate', 'qty', unit).toFixed(2),
      rfiExp: await filteredLines.populateValue(date, 'sub', 'rfiDateExp', 'rfiQty', unit).toFixed(2),
      rfiAct: await filteredLines.populateValue(date, 'sub', 'rfiDateAct', 'rfiQty', unit).toFixed(2),
      released: await filteredLines.populateValue(date, 'sub', 'inspRelDate', 'relQty', unit).toFixed(2),
      shipExp: await filteredLines.populateValue(date, 'sub', 'shipDateExp', 'shippedQty', unit).toFixed(2),
      shipAct: await filteredLines.populateValue(date, 'sub', 'shipDateAct', 'shippedQty', unit).toFixed(2),
      delExp: await filteredLines.populateValue(date, 'sub', 'vlDelDateExp', 'splitQty', unit).toFixed(2),
      delAct: delAct = await filteredLines.populateValue(date, 'sub', 'vlDelDateAct', 'splitQty', unit).toFixed(2),      
    };
  });
}



function populateDates(earliest, latest, period) {
  let array = [];
  switch(period) {
    case 'day':
      for (var i = 0; moment(earliest).add(i, 'days') < moment(latest).add(1, 'days'); i++ ) {
        array.push(moment(earliest).add(i, 'days'));
      }
      break;
    case 'week':
        for (var i = 0; moment(earliest).add(i, 'weeks') < moment(latest).add(1, 'weeks'); i++ ) {
          array.push(moment(earliest).add(i, 'weeks'));
        }
      break;
    case 'fortnight':
        for (var i = 0; moment(earliest).add(i * 2, 'weeks') < moment(latest).add(2, 'weeks'); i++ ) {
          array.push(moment(earliest).add(i * 2, 'weeks'));
        }
      break;
    case 'month':
        for (var i = 0; moment(earliest).add(i, 'months') < moment(latest).add(1, 'months'); i++ ) {
          array.push(moment(earliest).add(i, 'months'));
        }
      break;
    case 'quarter':
        for (var i = 0; moment(earliest).add(i * 3, 'months') < moment(latest).add(3, 'months'); i++ ) {
          array.push(moment(earliest).add(i * 3, 'months'));
        }      
      break;
    default:
      for (var i = 0; moment(earliest).add(i, 'weeks') < moment(latest).add(1, 'weeks'); i++ ) {
        array.push(moment(earliest).add(i, 'weeks'));
      }
  }
  return array;
}

Array.prototype.filterLines = function(clPo, clPoRev) {
  return this.filter(function(el) {
    if (!clPo && !clPoRev) {
      return true;
    } else if (clPo) {
      return _.isEqual(clPo, el.clPo);
    } else if (clPoRev) {
      return _.isEqual(clPoRev, el.clPoRev);
    } else {
      return _.isEqual(clPo, el.clPo) && _.isEqual(clPoRev, el.clPoRev);
    }
  })
}

Array.prototype.populateValue = function(date, collection, dateField, qtyField, unit) {
  return this.reduce(function (accumulator, currentValue){
    switch (unit) {
      case 'value':
        switch (collection) {
          case 'po':
            if (Date.parse(currentValue[dateField]) < Date.parse(date)) {
              accumulator += (currentValue[qtyField] * currentValue.unitPrice) || 0
            }
            break;
          default: //sub
            currentValue.subs.map(sub => {
              if (Date.parse(sub[dateField]) < Date.parse(date)) {
                accumulator += ( (sub[qtyField] || sub.splitQty) * currentValue.unitPrice) || 0
              }
            });
        }
      case 'qty':
          switch (collection) {
            case 'po':
              if (Date.parse(currentValue[dateField]) < Date.parse(date)) {
                accumulator += currentValue[qtyField] || 0
              }
              break;
            default: //sub
              currentValue.subs.map(sub => {
                if (Date.parse(sub[dateField]) < Date.parse(date)) {
                  accumulator += (sub[qtyField] || sub.splitQty) || 0
                }
              });
          }
      case 'weight':////////////////////////////////////////////////
          switch (collection) {
            case 'po':
              if (Date.parse(currentValue[dateField]) < Date.parse(date)) {
                accumulator += getTotalWeight(currentValue, currentValue[qtyField]) || 0
              }
              break;
            default: //sub
              currentValue.subs.map(sub => {
                if (Date.parse(sub[dateField]) < Date.parse(date)) {
                  accumulator += getTotalWeight(currentValue, (sub[qtyField] || sub.splitQty)) || 0
                }
              });
          }////////////////////////////////////////////////////////
      default: //qty
        switch (collection) {
          case 'po':
            if (Date.parse(currentValue[dateField]) < Date.parse(date)) {
              accumulator += currentValue[qtyField] || 0
            }
            break;
          default: //sub
            currentValue.subs.map(sub => {
              if (Date.parse(sub[dateField]) < Date.parse(date)) {
                accumulator += (sub[qtyField] || sub.splitQty) || 0
              }
            });
        }
    }
    return accumulator;
  }, 0 );
}

function getTotalWeight(currentValue, qty) {
  if (!currentValue.vlArtNo && !currentValue.vlArtNoX) {
    return 0
  } else if (!!currentValue.vlArtNo) {
    Article.findOne({vlArtNo: currentValue.vlArtNo}, function(err, doc) {
      if (err) {
        return 0;
      } else if (doc) {
        return qty * doc.netWeight;
      }
    });
  } else {
    Article.findOne({vlArtNoX: currentValue.vlArtNoX}, function(err, doc) {
      if (err) {
        return 0;
      } else if (doc) {
        return qty * doc.netWeight;
      }
    });
  }
}


Array.prototype.returnAllDates = function() {
  return this.reduce(function (accumulator, currentValue){
    currentValue.vlContDelDate && accumulator.push(currentValue.vlContDelDate);
    if (currentValue.subs) {
      currentValue.subs.map(sub => {
        sub.vlDelDateAct && accumulator.push(sub.vlDelDateAct);
        sub.rfiDateAct && accumulator.push(sub.rfiDateAct);
        sub.inspRelDate && accumulator.push(sub.inspRelDate);
        sub.rfsDateAct && accumulator.push(sub.rfsDateAct);
        sub.shipDateAct && accumulator.push(sub.shipDateAct);
      });
    }
    return accumulator;
  }, []);
}

Array.prototype.returnEarliest = function() {
  return this.reduce(function (accumulator, currentValue){
    return Date.parse(accumulator) > Date.parse(currentValue) ? currentValue : accumulator;
  });
}

Array.prototype.returnLatest = function() {
  return this.reduce(function (accumulator, currentValue){
    return Date.parse(accumulator) > Date.parse(currentValue) ? accumulator : currentValue;
  });
}

module.exports = {
  getLine
};