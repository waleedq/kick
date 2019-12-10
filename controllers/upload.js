
'use strict';
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + "-" + file.originalname)
  }
})
var upload = multer({ storage })
var kick    = require('includes/kick.js');
var File    = require('models/File.js');

module.exports = function (router) {
  router.post('/', upload.single('file'), function (req, res) {
    if(req.file && req.user && req.user._id){
      var file = new File({
        user: req.user._id,
        name: req.file.filename,
        path: req.file.path,
        type: req.file.mimetype,
        size: req.file.size,
        attributes: {
          fileInfo: req.file
        }
      })
      file.save().then(function (file) {
        if(!file){
          res.status(422);
          return res.json({});
        }
        return res.json({file: file});
      }).error(function (error) {
        res.status(403);
        return res.json({error});
      })
    }else{
      res.status(422);
      return res.json({});
    }
  });
};
