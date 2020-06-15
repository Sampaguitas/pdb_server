var express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
var Excel = require('exceljs');
fs = require('fs');
const _ = require('lodash');

  //expediting: poId and subId
  //inspection,  release data: poId, subId, _id (from certificate)
  //inspection, certificates: poId, subId, _id (from certificate)
  //shipping, transport docs: poId, subId, _id (from packItem) , collipackId (from colliPack)
  //shipping, packing details: _id (from colliPack)

  //screenId: '5cd2b642fd333616dc360b63', //Expediting
  //screenId: '5cd2b642fd333616dc360b64', //Inspection
  //screenId: '5cd2b642fd333616dc360b65', //Certificates
  //screenId: '5cd2b643fd333616dc360b67', //packing details
  //screenId: '5ed1e76e7c213e044cc01884', //Material Issue Record
  //screenId: '5ed1e7a67c213e044cc01888', //Material Issue Record Splitwindow

router.post('/', function (req, res) {
    
    const screenId = req.query.screenId;
    const projectId = req.query.projectId;
    const unlocked = req.query.unlocked;
    const selectedIds = req.body.selectedIds;
    

    let poIds = [];
    let subIds = [];
    let certificateIds = [];
    let packitemIds = [];
    let collipackIds = [];
    // let locationIds = [];

    selectedIds.forEach(element => {
        element.poId && !poIds.includes(element.poId) && poIds.push(element.poId);
        element.subId && !subIds.includes(element.subId) && subIds.push(element.subId);
        element.certificateId && !certificateIds.includes(element.certificateId) && certificateIds.push(element.certificateId);
        element.packitemId && !packitemIds.includes(element.packitemId) && packitemIds.push(element.packitemId);
        element.collipackId && !collipackIds.includes(element.collipackId) && collipackIds.push(element.collipackId);
        // element.locationId && !locationIds.includes(element.locationId) && locationIds.push(element.locationId);
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
          path: 'pos',
          match: { _id: { $in: poIds} },
          options: { sort: { clPo: 'asc', clPoRev: 'asc', clPoItem: 'asc' } },
          populate: [
            {
              path: 'subs',
              match: { _id: { $in: subIds} },
              populate: [
                {
                  path: 'packitems',
                  match: { _id: { $in: packitemIds} },
                  options: { sort: {  'plNr': 'asc', 'colliNr': 'asc' } }
                },
                {
                  path: 'heats',
                  options: {
                      sort: {
                          heatNr: 'asc'
                      }
                  },
                  populate: {
                      path: 'certificate',
                  }
                },
              ]
            },
            {
              path: 'transactions',
              populate: {
                path: 'location',
                // match: { _id: { $in: locationIds} },
                populate: {
                  path: 'area',
                  populate: {
                    path: 'warehouse'
                  }
                }
              }
            }
          ]
        },
        {
          path: 'collipacks',
          match: { _id: { $in: collipackIds} }
        },
        // {
        //   path: 'certificates',
        //   match: { _id: { $in: subIds} }
        // }
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
              let cell = worksheet.getCell(`${alphabet(header.col) + 1}`);
              myFgColour = header.col < 5 ? { argb: 'A8052C'} : { argb: '0070C0'}
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
          let myLines = getLines(resProject, resProject.fieldnames, screenId);
          if (!_.isEmpty(myLines)) {
            myLines.map(function (line, indexLine) {
              worksheet.getRow(indexLine + 3).height = 25;
              line.map(function (myCell) {
                let cell = worksheet.getCell(`${alphabet(myCell.col) + (indexLine + 3)}`);
                
                let myColour = function () {
                  if (myCell.col < 5) {
                    return {argb: 'd3d3d3'};
                  } else if (unlocked == 'false' && myCell.edit) {
                    return {argb: 'd3d3d3'};
                  } else {
                    return {argb: 'FFFFFF'};
                  }
                }

                let myProtection = function () {
                  if (myCell.col < 5) {
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
          worksheet.autoFilter = `A2:${alphabet(resProject.fieldnames.length + 4)}2`;

          //hide Ids
          worksheet.getColumn('A').hidden = true; //poId
          worksheet.getColumn('B').hidden = true; //subId
          worksheet.getColumn('C').hidden = true; //packitemId
          worksheet.getColumn('D').hidden = true; //collipackId
          
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
        val: 'SUB ID',
        col: 2,
        type: 'String',
        align: 'left'
      });
      arr.push({
        val: 'PackItem ID',
        col: 3,
        type: 'String',
        align: 'left'
      });
      arr.push({
        val: 'ColliPack ID',
        col: 4,
        type: 'String',
        align: 'left'
      });
      fieldnames.map( (fieldname, index) => {
        arr.push({
          val: fieldname.fields.custom,
          col: index + 5,
          type: 'String',
          align: fieldname.align       
        });
      });
    return arr;
  }

function getLines (resProject, fieldnames, screenId) {
    let arrayBody = [];
    let arrayRow = [];
    switch(screenId) {
      case '5cd2b642fd333616dc360b63': //Expediting
      case '5cd2b642fd333616dc360b64': //Inspection
      case '5cd2b643fd333616dc360b67': //packing details
        if (resProject.pos) {
          resProject.pos.map(po => {
            if (po.subs) {
              po.subs.map(sub => {
                let certificate = sub.heats.reduce(function (acc, cur) {
                  if (!acc.heatNr.split(' | ').includes(cur.heatNr)) {
                    acc.heatNr = !acc.heatNr ? cur.heatNr : `${acc.heatNr} | ${cur.heatNr}`
                  }
                  if (!acc.cif.split(' | ').includes(cur.certificate.cif)) {
                    acc.cif = !acc.cif ? cur.certificate.cif : `${acc.cif} | ${cur.certificate.cif}`
                  }
                  if (!acc.inspQty.split(' | ').includes(String(cur.inspQty))) {
                    acc.inspQty = !acc.inspQty ? String(cur.inspQty) : `${acc.inspQty} | ${String(cur.inspQty)}`
                  }
                  return acc;
                }, {
                    heatNr: '',
                    cif: '',
                    inspQty: ''
                });
                if (!_.isEmpty(sub.packitems)) {
                  sub.packitems.map(packitem => {
                    arrayRow = [];
                    arrayRow.push({
                      val: po._id, //poId
                      col: 1,
                      type: 'String',
                      align: 'left',
                      edit: true
                    });
                    arrayRow.push({
                      val: sub._id, //subId
                      col: 2,
                      type: 'String',
                      align: 'left',
                      edit: true
                    });
                    arrayRow.push({
                      val: packitem._id, //packitemId
                      col: 3,
                      type: 'String',
                      align: 'left',
                      edit: true
                    });
                    arrayRow.push({
                      val: '', //collipackId
                      col: 4,
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
                              col: index + 5,
                              type: fieldname.fields.type,
                              align: fieldname.align,
                              edit: fieldname.edit
                            });
                          } else {
                            arrayRow.push({
                              val: getValue(fieldname.fields.name, po),
                              col: index + 5,
                              type: fieldname.fields.type,
                              align: fieldname.align,
                              edit: fieldname.edit
                            });
                          }
                          break;
                        case 'sub':
                          if (fieldname.fields.name === 'heatNr') {
                            arrayRow.push({
                              val: getValue(fieldname.fields.name, certificate),
                              col: index + 5,
                              type: fieldname.fields.type,
                              align: fieldname.align,
                              edit: fieldname.edit
                            });
                          } else {
                            arrayRow.push({
                              val: getValue(fieldname.fields.name, sub),
                              col: index + 5,
                              type: fieldname.fields.type,
                              align: fieldname.align,
                              edit: fieldname.edit
                            });
                          }
                          break;
                        case 'certificate':
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, certificate),
                            col: index + 5,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                          break;
                        case 'packitem':
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, packitem),
                            col: index + 5,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                          break;
                        default: arrayRow.push({
                          val: '',
                          col: index + 5,
                          type: 'String',
                          align: 'left',
                          edit: true
                        });
                      }
                    });
                    arrayBody.push(arrayRow);
                  });
                } else {
                  arrayRow = [];
                  arrayRow.push({
                    val: po._id, //poId
                    col: 1,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  arrayRow.push({
                    val: sub._id, //subId
                    col: 2,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  arrayRow.push({
                    val: '', //packitemId
                    col: 3,
                    type: 'String',
                    align: 'left',
                    edit: true
                  });
                  arrayRow.push({
                    val: '', //collipackId
                    col: 4,
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
                            col: index + 5,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                        } else {
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, po),
                            col: index + 5,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                        }
                        break;
                      case 'sub':
                        if (fieldname.fields.name === 'heatNr') {
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, certificate),
                            col: index + 5,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                        } else {
                          arrayRow.push({
                            val: getValue(fieldname.fields.name, sub),
                            col: index + 5,
                            type: fieldname.fields.type,
                            align: fieldname.align,
                            edit: fieldname.edit
                          });
                        }
                        break;
                      case 'certificate':
                        arrayRow.push({
                          val: getValue(fieldname.fields.name, certificate),
                          col: index + 5,
                          type: fieldname.fields.type,
                          align: fieldname.align,
                          edit: fieldname.edit
                        });
                        break;
                      default: arrayRow.push({
                        val: '',
                        col: index + 5,
                        type: "String",
                        align: 'left',
                        edit: true
                      });
                    }
                  });
                  arrayBody.push(arrayRow);
                }
              });
            }
          });
        }
        break;
      case '5ea8eefb7c213e2096462a2c':
        if (resProject.pos) {
          resProject.pos.map(po => {
            virtuals(po.transactions).map(function(virtual){
              arrayRow = [];
              arrayRow.push({
                val: po._id, //poId
                col: 1,
                type: 'String',
                align: 'left',
                edit: true
              });
              arrayRow.push({
                val: '', //subId
                col: 2,
                type: 'String',
                align: 'left',
                edit: true
              });
              arrayRow.push({
                val: '', //packitemId
                col: 3,
                type: 'String',
                align: 'left',
                edit: true
              });
              arrayRow.push({
                val: '', //collipackId
                col: 4,
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
                        col: index + 5,
                        type: fieldname.fields.type,
                        align: fieldname.align,
                        edit: fieldname.edit
                      });
                    } else {
                      arrayRow.push({
                        val: getValue(fieldname.fields.name, po),
                        col: index + 5,
                        type: fieldname.fields.type,
                        align: fieldname.align,
                        edit: fieldname.edit
                      });
                    }
                    break;
                  case 'location':
                    // console.log(getValue(fieldname.fields.name, virtual));
                    arrayRow.push({
                        val: getValue(fieldname.fields.name, virtual),
                        col: index + 5,
                        type: "String",
                        align: 'left',
                        edit: true
                    });
                    break;
                  default: arrayRow.push({
                    val: '',
                    col: index + 5,
                    type: "String",
                    align: 'left',
                    edit: true
                  });
                }
              });
              arrayBody.push(arrayRow);
            });
          });
        }
      // case '5cd2b642fd333616dc360b65': //Certificates
      // case '5cd2b643fd333616dc360b67': //Print Transport Documents
    }
    
    return arrayBody;
}

function virtuals(transactions) {
  let tempResult = transactions.reduce(function(acc, cur) {
      let found = acc.find(element => element._id === cur.loactionId);
      if (!_.isUndefined(found)) {
        found.stockQty += cur.transQty;
      } else {
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