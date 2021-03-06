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
    const locale = req.query.locale || "en-US";
    const selectedIds = req.body.selectedIds;
    
    let pickticketIds = [];
    let mirIds = [];
    let wareouseIds = [];
    

    selectedIds.forEach(element => { 
      element.pickticketId && !pickticketIds.includes(element.pickticketId) && pickticketIds.push(element.pickticketId);
      element.mirId && !mirIds.includes(element.mirId) && mirIds.push(element.mirId);
      element.wareouseId && !wareouseIds.includes(element.wareouseId) && wareouseIds.push(element.wareouseId);
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
          path: 'picktickets',
          // match: { _id: { $in: pickticketIds} },
          match: { _id: selectedIds.length > 0 ? { $in : pickticketIds } : { $exists: true } },
          options: { sort: { pickNr: 'asc' } },
          populate: [
            {
              path: 'mir',
              populate: {
                path: 'miritems',
              }
            },
            {
              path: 'warehouse'
            }
          ]
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
              myFgColour = header.col < 4 ? { argb: 'A8052C'} : { argb: '0070C0'}
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
          let myLines = getLines(resProject, resProject.fieldnames);
          if (!_.isEmpty(myLines)) {
            myLines.map(function (line, indexLine) {
              worksheet.getRow(indexLine + 3).height = 25;
              line.map(function (myCell) {
                let cell = worksheet.getCell(`${alphabet(myCell.col) + (indexLine + 3)}`);
                
                let myColour = function () {
                  if (myCell.col < 4) {
                    return {argb: 'd3d3d3'};
                  } else if (unlocked == 'false' && myCell.edit) {
                    return {argb: 'd3d3d3'};
                  } else {
                    return {argb: 'FFFFFF'};
                  }
                }

                let myProtection = function () {
                  if (myCell.col < 4) {
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
          worksheet.autoFilter = `A2:${alphabet(resProject.fieldnames.length + 3)}2`;

          //hide Ids
          worksheet.getColumn('A').hidden = true; //pickticketId
          worksheet.getColumn('B').hidden = true; //mirId
          worksheet.getColumn('C').hidden = true; //warehouseId
          
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
        val: 'PICKTIECKET ID',
        col: 1,
        type: 'String',
        align: 'left'
      });
      arr.push({
        val: 'MIR ID',
        col: 2,
        type: 'String',
        align: 'left'
      });
      arr.push({
        val: 'WH ID',
        col: 3,
        type: 'String',
        align: 'left'
      });
      fieldnames.map( function (fieldname, index) {
        arr.push({
          val: fieldname.fields.custom,
          col: index + 4,
          type: 'String',
          align: fieldname.align
        });
      });
    return arr;
  }

  function getLines (resProject, fieldnames) {
    let arrayBody = [];
    let arrayRow = [];
    if (resProject.picktickets) {
      resProject.picktickets.map(pickticket => {
        let itemCount = !_.isEmpty(pickticket.mir.miritems) ? pickticket.mir.miritems.length : '';
        let mirWeight = 0;
        if (!_.isEmpty(pickticket.mir.miritems)) {
          mirWeight = pickticket.mir.miritems.reduce(function (acc, cur) {
            if (!!cur.totWeight) {
              acc += cur.totWeight;
            }
            return acc;
          }, 0);
        }
        arrayRow = [];
        arrayRow.push({
          val: pickticket._id, //poId
          col: 1,
          type: 'String',
          align: 'left',
          edit: true
        });
        arrayRow.push({
          val: pickticket.mirId, //poId
          col: 2,
          type: 'String',
          align: 'left',
          edit: true
        });
        arrayRow.push({
          val: pickticket.warehouseId, //poId
          col: 3,
          type: 'String',
          align: 'left',
          edit: true
        });
        fieldnames.map( (fieldname, index) => {
          switch(fieldname.fields.fromTbl) {
            case 'pickticket':
              if (_.isEqual(fieldname.fields.name, 'pickStatus')) {
                arrayRow.push({
                  val: pickticket.isProcessed ? 'Closed' : 'Open',
                  col: index + 4,
                  type: fieldname.fields.type,
                  align: fieldname.align,
                  edit: fieldname.edit
                });
              } else {
                arrayRow.push({
                  val: getValue(fieldname.fields.name, pickticket),
                  col: index + 4,
                  type: fieldname.fields.type,
                  align: fieldname.align,
                  edit: fieldname.edit
                });
              }
              break;
            case 'mir':
              if (['itemCount', 'mirWeight'].includes(fieldname.fields.name)) {
                arrayRow.push({
                  val: fieldname.fields.name === 'itemCount' ? itemCount : mirWeight,
                  col: index + 4,
                  type: fieldname.fields.type,
                  align: fieldname.align,
                  edit: fieldname.edit
                });
              } else {
                arrayRow.push({
                  val: getValue(fieldname.fields.name, pickticket.mir),
                  col: index + 4,
                  type: fieldname.fields.type,
                  align: fieldname.align,
                  edit: fieldname.edit
                });
              }
              break;
              case 'location':
                if (fieldname.fields.name === 'warehouse') {
                  arrayRow.push({
                    val: getValue(fieldname.fields.name, pickticket.warehouse),
                    col: index + 4,
                    type: fieldname.fields.type,
                    align: fieldname.align,
                    edit: fieldname.edit
                  });
                } else {
                  arrayRow.push({
                    val: '',
                    col: index + 4,
                    type: "String",
                    align: fieldname.align,
                    edit: fieldname.edit
                  });
                }
                break;
            default: arrayRow.push({
              val: '',
              col: index + 4,
              type: "String",
              align: fieldname.align,
              edit: fieldname.edit
            });
          }
        });
        arrayBody.push(arrayRow);
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

module.exports = router;