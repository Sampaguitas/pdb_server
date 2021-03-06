var express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
var Excel = require('exceljs');
fs = require('fs');
const _ = require('lodash');

router.post('/', function (req, res) {
    
    const screenId = req.query.screenId;
    const projectId = req.query.projectId;
    const unlocked = req.query.unlocked;
    const selectedIds = req.body.selectedIds;
    
    
    let poIds = [];
    let locationIds = [];

    selectedIds.forEach(element => {
        element.poId && !poIds.includes(element.poId) && poIds.push(element.poId);
        element.locationId && !locationIds.includes(element.locationId) && locationIds.push(element.locationId);
    });

    if (!screenId || !projectId) {
      res.status(400).json({
          message: 'screenId or projectId is missing'
      });
    } else {
      Project.findById(projectId)
      .populate([
        {
            path: 'fieldnames',
            match: {
                screenId: screenId,
                projectId: projectId,
                forShow: { $exists: true, $nin: ['', 0] }
            },
            options: { sort: { forShow:'asc' } },
            populate: { path: 'fields' }
        },
        {
          path: 'transactions',
          options: { sort: { createdAt: 'asc'}  },
          populate: {
            path:'location',
            populate: {
              path: 'area',
              populate: {
                  path: 'warehouse'
              }
            }
          }
        },
        {
          path: 'pos',
          // match: { _id: { $in: poIds} },
          match: { _id: selectedIds.length > 0 ? { $in : poIds } : { $exists: true } },
          options: { sort: { clPo: 'asc', clPoRev: 'asc', clPoItem: 'asc' } },
        }
      ])
      .exec(async function(errProject, resProject) {
        if (errProject) {
          res.status(400).json({ message: 'An error has occured.' });
        } else if (_.isEmpty(resProject)) {
          res.status(400).json({ message: 'Could not retrive project information.' });
        } else if (_.isEmpty(resProject.fieldnames)) {
          res.status(400).json({ message: 'Could not retrive the screen fields.' });
        } else {
          var workbook = new Excel.Workbook();
          var worksheet = workbook.addWorksheet('My Sheet');
          
          //add headers
          let myHeaders = getHeaders(resProject.fieldnames);
          if (!_.isEmpty(myHeaders)) {
            worksheet.getRow(1).height = 30;
            myHeaders.map(function (header) {
              let cell = worksheet.getCell(`${alphabet(header.col)}1`);
              myFgColour = header.col < 3 ? { argb: 'A8052C'} : { argb: '0070C0'}
              with (cell) {
                style = Object.create(cell.style), //shallow-clone the style, break references
                border ={
                  top: {style:'hair'},
                  left: {style:'hair'},
                  bottom: {style:'thick'},
                  right: {style:'hair'}                
                },
                fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: myFgColour
                },
                font = {
                  name: 'Calibri',
                  color: { argb: 'FFFFFF'},
                  family: 2,
                  size: 11,
                  bold: true
                },
                alignment = {
                  vertical: 'middle',
                  horizontal: header.align
                }
                value = header.val         
              }
            });
          }

          //add lines
          let myLines = getLines(resProject, resProject.fieldnames, resProject.transactions, locationIds);
          if (!_.isEmpty(myLines)) {
            myLines.map(function (line, indexLine) {
              worksheet.getRow(indexLine + 3).height = 25;
              line.map(function (myCell) {
                let cell = worksheet.getCell(`${alphabet(myCell.col) + (indexLine + 3)}`);
                
                let myColour = function () {
                  if (myCell.col < 3) {
                    return {argb: 'd3d3d3'};
                  } else if (unlocked == 'false' && myCell.edit) {
                    return {argb: 'd3d3d3'};
                  } else {
                    return {argb: 'FFFFFF'};
                  }
                }

                let myProtection = function () {
                  if (myCell.col < 3) {
                    return { locked: true };
                  } else if (unlocked == 'false' && myCell.edit) {
                    return { locked: true };
                  } else {
                    return { locked: false }
                  }
                }
                
                with (cell) {
                  style = Object.create(cell.style), //shallow-clone the style, break references
                  border ={
                    top: {style:'hair'},
                    left: {style:'hair'},
                    bottom: {style:'hair'},
                    right: {style:'hair'}                
                  },
                  fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: myColour()
                  },
                  font = {
                    name: 'Calibri',
                    family: 2,
                    size: 11,
                    bold: false
                  },
                  alignment = {
                    vertical: 'middle',
                    horizontal: myCell.align
                  },
                  protection = myProtection(),
                  value = myCell.val         
                }
              });
            });
          }

          //add autofilter in row 2
          worksheet.autoFilter = `A2:${alphabet(resProject.fieldnames.length + 2)}2`;

          //hide Ids
          worksheet.getColumn('A').hidden = true; //poId
          worksheet.getColumn('B').hidden = true; //subId
          
          //set worksheet protection options
          let options = {
            selectLockedCells: true,
            selectUnlockedCells: true,
            formatCells: true,
            formatColumns: true,
            formatRows: true,
            insertRows: false,
            insertColumns: false,
            insertHyperlinks: false,
            deleteRows: false,
            deleteColumns: false,
            sort: true,
            autoFilter: true,
            pivotTables: true
          }

          //protect worksheet 
          await worksheet.protect('', options);
          
          workbook.xlsx.write(res);
        }
      });
    }
});

function getHeaders(fieldnames) {
    const arr = [];
      arr.push({
        val: 'PO ID',
        col: 1,
        type: 'String',
        align: 'left'
      });
      arr.push({
        val: 'LOCATION ID',
        col: 2,
        type: 'String',
        align: 'left'
      });
      fieldnames.map( function (fieldname, index) {
        arr.push({
          val: fieldname.fields.custom,
          col: index + 3,
          type: 'String',
          align: fieldname.align
        });
      });
    return arr;
  }

function getLines (resProject, fieldnames, transactions, locationIds) {
    let arrayBody = [];
    let arrayRow = [];
    let hasLocation = hasFieldName(getTblFields (fieldnames, 'location'), 'location');
    let hasArea = hasFieldName(getTblFields (fieldnames, 'location'), 'area');
    let hasWarehouse = hasFieldName(getTblFields (fieldnames, 'location'), 'warehouse');
        if (resProject.pos) {
          resProject.pos.map(po => {
            virtuals(transactions, po._id, locationIds, hasLocation, hasArea, hasWarehouse).map(function(virtual){
              if (!!virtual._id) {
                arrayRow = [];
                arrayRow.push({
                  val: po._id, //poId
                  col: 1,
                  type: 'String',
                  align: 'left',
                  edit: true
                });
                arrayRow.push({
                  val: virtual.locationId, //subId
                  col: 2,
                  type: 'String',
                  align: 'left',
                  edit: true
                });
                fieldnames.map( (fieldname, index) => {
                  switch(fieldname.fields.fromTbl) {
                    case 'po':
                      if (['project', 'projectNr'].includes(fieldname.fields.name)) {
                        arrayRow.push({
                          val: fieldname.fields.name === 'project' ? getValue('name', resProject) || '' : getValue('number', resProject) || '',
                          col: index + 3,
                          type: fieldname.fields.type,
                          align: fieldname.align,
                          edit: fieldname.edit
                        });
                      } else {
                        arrayRow.push({
                          val: getValue(fieldname.fields.name, po),
                          col: index + 3,
                          type: fieldname.fields.type,
                          align: fieldname.align,
                          edit: fieldname.edit
                        });
                      }
                      break;
                    case 'location':
                      arrayRow.push({
                        val: getValue(fieldname.fields.name, virtual),
                        col: index + 3,
                        type: fieldname.fields.type,
                        align: fieldname.align,
                        edit: fieldname.edit
                      });
                      break;
                    default: arrayRow.push({
                      val: '',
                      col: index + 3,
                      type: "String",
                      align: fieldname.align,
                      edit: fieldname.edit
                    });
                  }
                });
                arrayBody.push(arrayRow);
              }
            });
          });
        }
    return arrayBody;
}

function getValue(key, object) {

  let nonPrintable = /[\t\r\n]/mg;

  if (_.isUndefined(key) || _.isUndefined(object[key])) {
    return '';
  } else if (nonPrintable.test(object[key])) {
    return object[key].replace(nonPrintable, '');
  } else {
    return object[key]
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

  function hasFieldName(tblFields, fieldName) {
    let tempResult = false;
    if (tblFields) {
        tblFields.map(function (tblField) {
            if (tblField.name === fieldName) {
                tempResult = true;
            }
        });
    }
    return tempResult;
  }

  function getTblFields (fieldnames, fromTbl) {
    if (fieldnames) {
        let tempArray = [];
        fieldnames.reduce(function (acc, cur) {
            if (cur.fields.fromTbl === fromTbl && !acc.includes(cur.fields._id)) {
                tempArray.push(cur.fields);
                acc.push(cur.fields._id);
            }
            return acc;
        },[]);
        return tempArray;
    } else {
        return [];
    }
  }

  function virtuals(transactions, poId, locationIds, hasLocation, hasArea, hasWarehouse) {
    let tempResult = [];
        tempResult = transactions.reduce(function (acc, cur) {
            if (_.isEqual(cur.poId,poId) && locationIds.includes(String(cur.locationId))) { //
                //find existing location
                let found = acc.find(function (element) {
                    if (hasLocation) {
                        return _.isEqual(element._id, cur.locationId);
                    } else if (hasArea) {
                        return _.isEqual(element._id, cur.location.area._id);
                    } else if (hasWarehouse) {
                        return _.isEqual(element._id, cur.location.area.warehouse._id);
                    } else {
                        return element._id === '0';
                    }
                });
                if (!_.isUndefined(found)) {
                    found.stockQty += cur.transQty;
                } else if(hasLocation) {
                    let areaNr = cur.location.area.areaNr;
                    let hall = cur.location.hall;
                    let row = cur.location.row;
                    let col = cur.location.col;
                    let height = cur.location.height;
                    acc.push({
                        _id: cur.locationId,
                        stockQty: cur.transQty || 0,
                        warehouse: cur.location.area.warehouse.warehouse,
                        area: cur.location.area.area,
                        location: `${areaNr}/${hall}${row}-${leadingChar(col, '0', 3)}${!!height ? '-' + height : ''}`,
                        locationId: cur.locationId,
                    });
                } else if(hasArea) {
                    acc.push({
                        _id: cur.location.area._id,
                        stockQty: cur.transQty || 0,
                        warehouse: cur.location.area.warehouse.warehouse,
                        area: cur.location.area.area,
                        locationId: '',
                    });
                } else if (hasWarehouse) {
                    acc.push({
                        _id: cur.location.area.warehouse._id,
                        stockQty: cur.transQty || 0,
                        warehouse: cur.location.area.warehouse.warehouse,
                        locationId: '',
                    });
                } else {
                    acc.push({
                        _id: '0',
                        stockQty: cur.transQty || 0,
                        locationId: '',
                    });
                }
            }
            return acc;
        }, []);

    if (!_.isEmpty(tempResult)) {
        return tempResult;
    } else {
        return [{
            _id: '',
            stockQty: 0,
            warehouse: '',
            area: '',
            location: '',
            locationId: '', 
        }];
    }
  }

  function leadingChar(string, char, length) {
    return string.toString().length > length ? string : char.repeat(length - string.toString().length) + string;
  }

module.exports = router;