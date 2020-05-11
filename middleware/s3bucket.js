var aws = require('aws-sdk');
var path = require('path');
var _ = require('lodash');
var multer = require('multer');
var storage = multer.memoryStorage();
var multerUpload = multer({ storage: storage });
const fault = require('../utilities/Errors');
const accessKeyId = require('../config/keys').accessKeyId;
const secretAccessKey = require('../config/keys').secretAccessKey;
const region = require('../config/keys').region;
const awsBucketName = require('../config/keys').awsBucketName;

//configuring the AWS environment
aws.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
});

//Functions
function deleteFile (file, project) {
  return new Promise(
    function (resolve, reject) {
      if (!project) {
        reject('No Project selected'); //"2400": "No Project selected",
      } else if (!file) {
        reject('No file selected'); //"2401": "No file selected",
      } else {
        var s3 = new aws.S3();
        var params = {
            Bucket: awsBucketName,
            Key: path.join('templates', project, file),
        };
        s3.deleteObject(params, function(err, data) {
          if (err) {
            reject('An error occurred'); //"2405": "An error occurred",        
          } else {
            resolve('Template has been deleted'); //"2403": "Template has been deleted",
          }
        });
      }
    }
  );
}

function deleteProject(project) {
  return new Promise(
    function (resolve, reject) {
      if (!project) {
        reject('No Project selected'); //"2400": "No Project selected",
      } else {
        var s3 = new aws.S3();
        var listParams = {
            Bucket: awsBucketName,
            Prefix: path.join('templates', project)
        };
        s3.listObjectsV2(listParams, function(err, listData) {
          if (err) {
            reject('An error occurred'); //"2405": "An error occurred",
          } else if (listData.Contents) {
            var candidate = [];
            listData.Contents.map(a => {
              candidate.push({ Key: a.Key });
            });
            if (_.isEmpty(candidate)) {
              resolve('The Project folder is already empty'); //"2406": "The Project folder is already empty",
            } else {
              var deleteParams = {
                Bucket: awsBucketName,
                Delete: {
                    Objects: candidate,
                    Quiet: false
                }
              };
              s3.deleteObjects(deleteParams, function(err, deleteData) {
                if (err) {
                  reject('An error occurred'); //"2405": "An error occurred",
                } else {
                  resolve('Project folder has been deleted'); //"2404": "Project folder has been deleted",
                }
              });
            }
          } else {
            reject('An error occurred'); //"2405": "An error occurred",
          }
        });
      }
    }
  );   
}

// function download(req, res) {
//   const project = req.body.project;
//   const file = req.body.file;
//   if (!project) {
//     return res.status(400).json({
//       message: fault(2400).message
//       //"2400": "No Project selected",
//     });      
//   } else if (!file) {
//     return res.status(400).json({
//       message: fault(2401).message
//       //"2401": "No file selected",
//     });         
//   } else {
//     var s3 = new aws.S3();
//     var params = {
//         Bucket: awsBucketName,
//         Key: path.join('templates', project, file),
//     };
//     res.attachment(file);
//     var fileStream = s3.getObject(params).createReadStream();
//     fileStream.pipe(res);
//   } 
// }

function duplicateProject(oldProject, newProject) {
  return new Promise(
    function (resolve, reject) {
      if (!oldProject || !newProject) {
        reject('No Project selected'); //"2400": "No Project selected",
      } else {
        var s3 = new aws.S3();
        var listParams = {
          Bucket: awsBucketName,
          Prefix: path.join('templates', oldProject),
        };
        s3.listObjectsV2(listParams, function(err, listData) {
          if (err) {
            reject('An error occurred'); //"2405": "An error occurred",           
          } else if (_.isEmpty(listData.Contents)) {
            reject('An error occurred'); //"2405": "An error occurred",         
          } else {
            listData.Contents.map(a => {
              var copyParams = {
                Bucket: awsBucketName,
                CopySource: path.join(awsBucketName,a.Key),
                Key: a.Key.replace(oldProject, newProject)
              };
              s3.copyObject(copyParams, function(err) {
                if (err) {
                  reject('An error occurred'); //"2405": "An error occurred",
                } else {
                  resolve('Templates have been copied to the new Project'); //"2407": "Templates have been copied to the new Project"
                }                     
              });
            });
          }
        });
      }          
    }
  );
}

function findAll(req, res) {
  const project = req.body.project;
  if (!project) {
    return res.status(400).json({
      message: 'No Project selected'
      //"2400": "No Project selected",
    });      
  } else {
    var s3 = new aws.S3();
    var params = {
      Bucket: awsBucketName,
      Prefix: path.join('templates', project),
    };
    s3.listObjectsV2(params, function(err, data) {
      if (err) {
        return res.status(400).json({
          message: 'An error occurred'
          //"2405": "An error occurred",
        });              
      } else {
        return res.json(data);
      }
    });
  }
}

function uploadFile(file, project) {
  return new Promise(
    function (resolve, reject) {
      if (!project){
        reject('No Project selected'); //"2400": "No Project selected",
      } else if (!file) {
        reject('No file selected'); //"2401": "No file selected",
      } else {
        var s3 = new aws.S3();
        var params = {
          Bucket: awsBucketName,
          Body: file.buffer,
          Key: path.join('templates', project, file.originalname),
        }; 
        s3.upload(params, function(err, data) {
          if (err) {
            reject('An error occurred'); //"2405": "An error occurred",
          } else {
            resolve(data);
          }      
        });
      }
    }
  );
}

function uploadCif(file, id) {
  return new Promise(
    function (resolve, reject) {
      if (!id){
        reject({ message: 'Certificate ID is missing.' });
      } else if (!file) {
        reject({message: 'Please select one file to be uploaded.'});
      } else {
        var s3 = new aws.S3();
        var params = {
          Bucket: awsBucketName,
          Body: file.buffer,
          Key: path.join('certificates', `${id}.pdf`),
        }; 
        s3.upload(params, function(err) {
          if (err) {
            reject({ message: 'An error occurred' });
          } else {
            resolve();
          }
        });
      }
    }
  );
}

function deleteCif (id) {
  return new Promise(
    function (resolve, reject) {
      if (!id) {
        reject({ message: 'Certificate ID is missing' });
      } else {
        var s3 = new aws.S3();
        var params = {
            Bucket: awsBucketName,
            Key: path.join('certificates', `${id}.pdf`),
        };
        s3.deleteObject(params, function(err) {
          if (err) {
            reject({ message: 'An error occurred' });   
          } else {
            resolve();
          }
        });
      }
    }
  );
}
//   const project = req.body.project;
//   const file = req.file;
//   if (!project) {
//     return res.status(400).json({
//       message: fault(2400).message
//       //"2400": "No Project selected",
//     });      
//   } else if (!file) {
//     return res.status(400).json({
//       message: fault(2401).message
//       //"2401": "No file selected",
//     });         
//   } else {
//     var s3 = new aws.S3();
//     var params = {
//       Bucket: awsBucketName,
//       Body: file.buffer,
//       Key: path.join('templates', project, file.originalname),
//     };
//     s3.upload(params, function(err, data) {
//       if (err) {
//         return res.status(400).json({
//           message: fault(2405).message
//           //"2405": "An error occurred",
//         });
//       } else {
//         res.send({ data });
//       }
//     });
//   }  
// }



//Exports
module.exports = {
  deleteProject,
  deleteFile,
  // download,
  duplicateProject,
  findAll,
  uploadFile,
  uploadCif,
  deleteCif
};