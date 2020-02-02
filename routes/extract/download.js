var express = require('express');
const router = express.Router();
const fault = require('../../utilities/Errors'); //../utilities/Errors
const FieldName = require('../../models/FieldName');
const Project = require('../../models/Project');
const Po = require('../../models/Po');
var Excel = require('exceljs');
fs = require('fs');
const _ = require('lodash');

  //expediting: poId and subId
  //inspection,  release data: poId, subId, _id (from certificate)
  //inspection, certificates: poId, subId, _id (from certificate)
  //shipping, transport docs: poId, subId, _id (from packItem) , packId (from colliPack)
  //shipping, packing details: _id (from colliPack)

router.get('/', function (req, res) {
    const screenId = req.query.screenId;
    const projectId = req.query.projectId;
    if (!screenId || !projectId) {
        res.status(400).json({
            message: 'screenId or projectId is missing'
        });
    } else {
        FieldName.find({ screenId: screenId, projectId: projectId, forShow: {$exists: true, $nin: ['', 0]} })
        .populate('fields')
        .sort({forShow:'asc'})
        .exec(function (errFieldNames, resFieldNames) {
            if (errFieldNames || !resFieldNames) {
                return res.status(400).json({
                    message: 'an error has occured',
                });
            } else if(!resFieldNames.length) {
                return res.status(400).json({
                    message: 'no fields have been assigned to this screen',
                });
            } else {
                Po.find({projectId: projectId})
                .sort({
                    clPo: 'asc',
                    clPoRev: 'asc',
                    clPoItem: 'asc'
                })
                .populate({
                    path:'subs',
                    populate: {
                        path: 'certificates'
                    },
                    populate: {
                        path: 'packitems',
                        options: {
                            sort: { 
                                'plNr': 'asc',
                                'colliNr': 'asc'
                            }
                        }
                    }
                })
                .exec(function(errPos, resPos) {
                    if (errPos) {
                        res.status(400).json({
                            message: 'an error has occured'
                        });
                    } else if (!resPos) {
                        res.status(400).json({
                            message: 'it seems that your project is empty'
                        });
                    } else {
                        var workbook = new Excel.Workbook();
                        var worksheet = workbook.addWorksheet('My Sheet');
                        var hasPackitems = getScreenTbls(resFieldNames).includes('packitem')
                        worksheet.addTable({
                            name: 'MyTable',
                            ref: 'A1',
                            headerRow: true,
                            totalsRow: false,
                            columns: getColumns(resFieldNames),
                            rows: getRows(resPos, resFieldNames, hasPackitems)
                        });
                        for (var i = 1; i < resFieldNames.length + 5; i++) {
                            let cell = worksheet.getCell(`${alphabet(i) + 1}`);
                            with (cell) {
                              style = Object.create(cell.style), //shallow-clone the style, break references
                              border ={
                                top: {style:'thin'},
                                left: {style:'thin'},
                                bottom: {style:'thick'},
                                right: {style:'thin'}                
                              },
                              fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor:{argb:'FFFFFFCC'}
                              },
                              font = {
                                name: 'Calibri',
                                family: 2,
                                size: 11,
                                bold: true
                              }             
                            }
                        }
                        workbook.xlsx.write(res);
                    } //end if
                })//end exec
            }//end if
        })//end exec
    }//end if
});//end get

// function getColumns(resFieldNames) {
//     let arr = [];
//     let offset = 0;
//     switch(screenId) {

//     }
// }



function getColumns(resFieldNames) {
    const arr = [];
      arr.push({
        name: 'PO ID',
        filterButton: true,
        style: {
          border: {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
          },
          alignment: {
            vertical: 'middle',
            horizontal: 'left'
          }
        }
      },
      {
        name: 'SUB ID',
        filterButton: true,
        style: {
          border: {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
          },
          alignment: {
            vertical: 'middle',
            horizontal: 'left'
          }
        }
      },
      {
        name: 'PackItem ID',
        filterButton: true,
        style: {
          border: {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
          },
          alignment: {
            vertical: 'middle',
            horizontal: 'left'
          }
        }
      },
      {
        name: 'ColliPack ID',
        filterButton: true,
        style: {
          border: {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
          },
          alignment: {
            vertical: 'middle',
            horizontal: 'left'
          }
        }
      });
      resFieldNames.map(fieldName => {
        arr.push({
          name: fieldName.fields.custom,
          filterButton: true,
          style: {
            border: {
              top: {style:'thin'},
              left: {style:'thin'},
              bottom: {style:'thin'},
              right: {style:'thin'}
            },
            alignment: {
              vertical: 'middle',
              horizontal: fieldName.align
            }
          }         
        });
      });
    return arr;
  }

function getRows (resPos, resFieldNames, hasPackitems) {
    let arrayBody = [];
    let arrayRow = [];
    resPos.map(po => {
        if (po.subs) {
            po.subs.map(sub => {
              if (!_.isEmpty(sub.packitems) && hasPackitems) { //
                sub.packitems.map(packitem => {
                  arrayRow = [];
                  arrayRow.push(po._id, sub._id, packitem._id, ''); //poId, subId, packItemId, colliPackId
                  resFieldNames.map(fieldname => {
                    if(!fieldname) {
                      arrayRow.push('');
                    } else {
                        switch(fieldname.fields.fromTbl) {
                            case 'po':
                                arrayRow.push(getValue(fieldname.fields.name, po));
                                break;
                            case 'sub':
                                arrayRow.push(getValue(fieldname.fields.name, sub));
                                break;
                            case 'packitem':
                                arrayRow.push(getValue(fieldname.fields.name, packitem));
                                break;
                            default: arrayRow.push('');
                        }
                    }
                  });
                  arrayBody.push(arrayRow);
                });
              } else {
                arrayRow = [];
                arrayRow.push(po._id, sub._id, '', ''); //poId, subId, packItemId, colliPackId
                resFieldNames.map(fieldname => {
                  if(!fieldname) {
                      arrayRow.push('');
                  } else {
                      switch(fieldname.fields.fromTbl) {
                          case 'po':
                              arrayRow.push(getValue(fieldname.fields.name, po));
                              break;
                          case 'sub':
                              arrayRow.push(getValue(fieldname.fields.name, sub));
                              break;
                          default: arrayRow.push('');
                      }
                  }
                });
                arrayBody.push(arrayRow);
              }
            });
        }
    });
    return arrayBody;
}

function getScreenTbls (resFieldNames) {
  return resFieldNames.reduce(function (accumulator, currentValue) {
      if(!accumulator.includes(currentValue.fields.fromTbl)) {
          accumulator.push(currentValue.fields.fromTbl)
      }
      return accumulator;
  },[]);
}

function getValue(key, object) {
  if (key === undefined) {
    return '';
  } else {
    return object[key] === undefined ? '' : object[key]
  } 
}

function alphabet(num){
    var s = '', t;
    while (num > 0) {
      t = (num - 1) % 26;
      s = String.fromCharCode(65 + t) + s;
      num = (num - t)/26 | 0;
    }
    return s || undefined;
  }

module.exports = router;