var express = require('express');
const multer = require('multer');
const jimp = require('jimp');

var router = express.Router();

router.get('/', async (req, res, next) => {
    res.render('upload_img', {});
});

// ******************* Multiple Image Upload *******************

router.post('/upload-imges', async (req, res, next) => {
    var file_name = '';
    var file_name_thumb = '';

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/images/uploads/')
        },
        filename: function (req, file, cb) {
            var ext = file.mimetype.split('/')[1];
            file_name = 'Hello' + '-' + Date.now() + "." + ext
            cb(null, file_name);  
        }
    });

    const upload = multer({ storage: storage }).array('file-to-upload', 5);

    upload(req, res, async function (err) {
        if (err) {
            // An unknown error occurred when uploading.
            res.send({
                err_code: 1,
                err_msg: 'An unknown error occurred when uploading.',
                err
            })
        }else{
            const filedate =  req.files.map(file => {
                var file_path = file.path;
                return jimp.read(file_path).then(image => {
                    file_name_thumb = 'Thumb' + '-' + Date.now() + ".png";
    
                        var og_width = image.bitmap.width;
                        var og_height = image.bitmap.height;
    
                        var ch_height = 137;
                        var ch_width = ch_height * og_width / og_height;
                       
                        // var ch_width = 369;
                        // var ch_height = ch_width * og_height / og_width;
    
                        image.resize(ch_width, ch_height)
                        .quality(80)
                        .write('public/images/uploads/thumb/'+file_name_thumb);
                        file.url = 'http://'+req.headers.host+'/images/uploads/'+file.filename;
                        file.thumb_url = 'http://'+req.headers.host+'/images/uploads/thumb/'+file_name_thumb;   
                })
                .catch(e => {
                    return res.send(e);
                });
            });
            Promise.all(filedate).then(() => {
                res.send(req.files);
            });
        }
    });

});

// ******************* Single Image Upload *******************

router.post('/upload-img', (req, res, next) => {
    var file_name = '';
    var file_name_thumb = '';

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/images/uploads/')
        },
        filename: function (req, file, cb) {
            var ext = file.mimetype.split('/')[1];
            file_name = 'Hello' + '-' + Date.now() + "." + ext
            cb(null, file_name);  
        }
    });
      
    const upload = multer({ storage: storage }).single('file-to-upload');
    
    upload(req, res, function (err) {

        if (err) {
            // An unknown error occurred when uploading.
            res.send({
                err_code: 1,
                err_msg: 'An unknown error occurred when uploading.',
                err
            })
            
        }else{
            
            var file_path = 'public/images/uploads/'+file_name;
            jimp.read(file_path, function(err, image){
                if(err){
                    console.log(err)
                }else{
                    file_name_thumb = 'Thumb' + '-' + Date.now() + ".png";

                    var og_width = image.bitmap.width;
                    var og_height = image.bitmap.height;

                    var ch_height = 137;
                    var ch_width = ch_height * og_width / og_height;

                   
                    // var ch_width = 369;
                    // var ch_height = ch_width * og_height / og_width;


                    image.resize(ch_width, ch_height)
                    .quality(80)
                    .write('public/images/uploads/thumb/'+file_name_thumb);

                    req.file.url = 'http://'+req.headers.host+'/images/uploads/'+file.filename;
                    req.file.thumb_url = 'http://'+req.headers.host+'/images/uploads/thumb/'+file_name_thumb;   

                    res.send(req.file);
                }
            });            
        }
    });
});

module.exports = router;