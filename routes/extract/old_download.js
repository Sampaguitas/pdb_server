var express = require('express');
const router = express.Router();
const fault = require('../../utilities/Errors'); //../utilities/Errors
const FieldName = require('../../models/FieldName');
const Project = require('../../models/Project');
var Excel = require('exceljs');
fs = require('fs');

router.get('/', function (req, res) {
  
  const screenId = req.query.screenId;
  const projectId = req.query.projectId;

  Project.findById(projectId)
  .populate({
    path:'pos',
    populate: {
      path: 'subs'
    }
  })
  .exec(function(errProject, resProject) {
    if(errProject) {
      return res.status(400).json({message: errProject});
    } else if (!resProject) {
      return res.status(400).json({message: 'the project does not exist or is empty'});
    } else {
      FieldName.find({ screenId: screenId, projectId: projectId, forShow: {$exists: true, $nin: ['', 0]} })
      .populate('fields')
      .sort({forShow:'asc'})
      .exec(function (errFieldNames, resFieldNames) {
        if (errFieldNames) {
          return res.status(400).json({message: errFieldNames})
        } else if (!resFieldNames) {
          return res.status(400).json({message: 'an error occured'});
        } else {
          workbook = new Excel.Workbook();
          // workbook.properties.date1904 = true;
          var worksheet = workbook.addWorksheet('My Sheet');
          if (!!resFieldNames.length) {
            worksheet.addTable({
              name: 'MyTable',
              ref: 'A1',
              headerRow: true,
              totalsRow: false,
              columns: getColumns(resFieldNames),
              rows: getRows(resProject, resFieldNames)
            });
            for (var i = 1; i < resFieldNames.length + 3; i++) {
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
          }
          workbook.xlsx.write(res);
        }
      })
    }
  })
});

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
    },{
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

function getRows (resProject, resFieldNames) {
  const arrayBody = [];
  // arrayBody.push(Array.from( {length: resFieldNames.length} , () => ''));
  arraySorted(resProject.pos, 'clPo', 'clPoRev', 'clPoItem').map(po => {
    // console.log('po._id:', po._id);
    if (po.subs) {
      po.subs.map(sub => {
        let arrayRow = [];
        arrayRow.push(po._id);
        arrayRow.push(sub._id);
        resFieldNames.map(fieldname => {
          if(!fieldname) {
            arrayRow.push('');
          } else if (fieldname.fields.fromTbl == 'po') {
            arrayRow.push(po[fieldname.fields.name] === undefined ? '' : po[fieldname.fields.name]);
          } else if (fieldname.fields.fromTbl == 'sub') {
            arrayRow.push(sub[fieldname.fields.name] === undefined ? '' : sub[fieldname.fields.name]);
          } else {
            arrayRow.push('');
          }
        })
        arrayBody.push(arrayRow);
      });
    }
  });
  return arrayBody;
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

function resolve(path, obj) {
  return path.split('.').reduce(function(prev, curr) {
      return prev ? prev[curr] : null
  }, obj || self)
}

function arraySorted(array, fieldOne, fieldTwo, fieldThree) {
  if (array) {
      const newArray = array
      newArray.sort(function(a,b){
          if (resolve(fieldOne, a) < resolve(fieldOne, b)) {
              return -1;
          } else if (resolve(fieldOne, a) > resolve(fieldOne, b)) {
              return 1;
          } else if (fieldTwo && resolve(fieldTwo, a) < resolve(fieldTwo, b)) {
              return -1;
          } else if (fieldTwo && resolve(fieldTwo, a) > resolve(fieldTwo, b)) {
              return 1;
          } else if (fieldThree && resolve(fieldThree, a) < resolve(fieldThree, b)) {
              return -1;
          } else if (fieldThree && resolve(fieldThree, a) > resolve(fieldThree, b)) {
              return 1;
          } else {
              return 0;
          }
      });
      return newArray;             
  }
}

module.exports = router;