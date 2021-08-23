const pool = require('./Config').pool;
const common = require('./DbOperation');

//for files/images
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');


// connecting to s3 bucket
const s3 = new aws.S3({
  accessKeyId: 'AKIAWNWAADBIDKG3T7WL',
  secretAccessKey: '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',
  region: 'ap-south-1',
  Bucket: 'upload.aibers.health'
});

// image upload function
const imgUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'upload.aibers.health/uploads/contacts',
    acl: 'public-read',
    key: function (req, file, cb) {
      var url = req.url.split("/");
      url = url[1];
      cb(null, url + '-' + req.params.id + path.extname(file.originalname))
    }
  }),
  limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image');

// checking file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|pdf|doc/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: images/fies Only!');
  }
}

//image upload
const uploadImage = async (req, res) => {

  imgUpload(req, res, async (error) => {
    const { id } = req.params;

    var url = req.url.split("/");
    url = url[1];

    if (error) {
      console.log('errors', error);
      res.json({ error: error });
    } else {
      // If File not found
      if (req.file === undefined) {
        console.log('Error: No Image Selected!');
        res.json('Error: No Image Selected');
      } else {
        // If Success
        imageName = req.file.key;
        try {
          if (url === 'doctors') {
            await pool.query('UPDATE contacts SET image = $1 WHERE contact_id = (SELECT du.contact_id from users du where du.id = $2)', [imageName, id]);
            // image upload activity logs
            const contactId = await pool.query("SELECT du.contact_id FROM users du WHERE du.id = $1", [id]);
            const cid = contactId.rows[0].contact_id;

            // image upload activity log by patient
            await common.storeActivityLogs(id, 'doctor', 'upload_image', cid).then(
              console.log("Image upload activity inserted by doctor")
            );
          }
          else if (url === 'patients') {
            await pool.query('UPDATE contacts SET image = $1 WHERE contact_id = (SELECT pu.contact_id FROM users pu WHERE pu.id = $2)', [imageName, id]);
            // image upload activity logs
            const contactId = await pool.query("SELECT pu.contact_id FROM users pu WHERE pu.id = $1", [id]);
            const cid = contactId.rows[0].contact_id;

            // image upload activity log by patient
            await common.storeActivityLogs(id, 'patient', 'upload_image', cid).then(
              console.log("Image upload activity inserted by patient")
            );
          }
          else if (url === 'hospitals') {
            await pool.query('UPDATE contacts SET image = $1 WHERE contact_id = (SELECT contact_id from hospitals where hospital_id = $2)', [imageName, id]);
          }
          else if (url === 'nurses') {
            await pool.query('UPDATE contacts SET image = $1 WHERE contact_id = (SELECT snu.contact_id from users snu where snu.id = $2)', [imageName, id]);
          }
          else if (url === 'pa') {
            await pool.query('UPDATE contacts SET image = $1 WHERE contact_id = (SELECT spau.contact_id from users spau where spau.id = $2)', [imageName, id]);
          }
          else if (url === 'fd') {
            await pool.query('UPDATE contacts SET image = $1 WHERE contact_id = (SELECT sfdu.contact_id from users sfdu where sfdu.id = $2)', [imageName, id]);
          }
          else {
            console.log("Please select role!");
            res.json('Invalid requested URL');
          }
          res.json("Image uploded successfully!");
        } catch (err) {
          common.customResponse(req, res, err);
        }
      }
    }
  });
}

// getting image from private s3
const getImage = async (req, res) => {
  const { id } = req.params;

  var url = req.url.split("/");
  url = url[1];

  try {
    if (url === 'doctors') {
      const image = await pool.query('SELECT image from contacts WHERE contact_id = (SELECT du.contact_id FROM users du WHERE du.id = $1)', [id]);
      var img = await imgValidation(res, image.rows[0].image);
    }
    else if (url === 'patients') {
      const image = await pool.query('SELECT image from contacts WHERE contact_id = (SELECT pu.contact_id FROM users pu WHERE pu.id = $1)', [id]);
      var img = await imgValidation(res, image.rows[0].image);
    }
    else if (url === 'hospitals') {
      const image = await pool.query('SELECT image from contacts WHERE contact_id = (SELECT contact_id FROM hospitals WHERE hospital_id = $1)', [id]);
      var img = await imgValidation(res, image.rows[0].image);
    }
    else if (url === 'nurses') {
      const image = await pool.query('SELECT image from contacts WHERE contact_id = (SELECT nu.contact_id from users nu where nu.id = $1)', [id]);
      var img = await imgValidation(res, image.rows[0].image);
    }
    else if (url === 'pa') {
      const image = await pool.query('SELECT image from contacts WHERE contact_id = (SELECT pau.contact_id from users pau where pau.id = $1)', [id]);
      var img = await imgValidation(res, image.rows[0].image);
    }
    else if (url === 'fd') {
      const image = await pool.query('SELECT image from contacts WHERE contact_id = (SELECT fdu.contact_id from users fdu where fdu.id = $1)', [id]);
      var img = await imgValidation(res, image.rows[0].image);
    }
    else {
      res.json('Invalid requested URL');
      console.log("Please select role!");
    }
    if (img != undefined) {
      async function getImage() {
        const data = s3.getObject(
          {
            Bucket: 'upload.aibers.health/uploads/contacts',
            Key: img
          }
        ).promise();
        return data;
      }

      getImage()
        .then((data) => {
          let image = "data:image;base64";
          let encoded = encode(data.Body);
          res.json({
            "fileType": "image",
            "fileHeader": image,
            "encodedData": encoded
          })
        }).catch((e) => {
          // res.send(e)
          console.log(e);
        })
      function encode(data) {
        let buf = Buffer.from(data);
        let base64 = buf.toString('base64');
        return base64
      }
    }
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

const imgValidation = async (res, img) => {
  if (img == null || img == 'undefined') {
    res.json("Image does not exist");
  } else {
    var image = img.toString();
    return image;
  }
}

// file upload function
const testReportUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'upload.aibers.health/uploads/testReports',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, 'test_of_a' + req.params.appointment_id + '_p' + req.params.patient_id + '_t' + req.params.test_id + path.extname(file.originalname))
    }
  }),
  limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('file');

const testReportUploadArchive = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'upload.aibers.health/uploads/testReports',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, 'test_of_a' + req.params.appointment_id + '_p' + req.params.patient_id + '_t' + Date.now() + path.extname(file.originalname))
    }
  }),
  limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('file');

// uploading test reports API function
const uploadTestResult = (req, res, next) => {
  const { patient_id, doctor_id, appointment_id, test_id } = req.params;

  if (patient_id == 0 || appointment_id == 0 || test_id == 0) {
    next(ApiError.notFound('Please enter appropriate arguments!'));
    return
  }

  var url = req.url.split("/");
  y = url[1];

  testReportUpload(req, res, (error) => {
    if (error) {
      console.log('errors', error);
      res.json({ error: error });
    } else {
      // If File not found
      if (req.file === undefined) {
        console.log('Error: No File Selected!');
        res.json('Error: No File Selected');
      } else {
        // If Success
        fileName = req.file.key;
        updateDBForTestUploads(fileName, appointment_id, patient_id, test_id, doctor_id, y).then(() => {
          res.json("File uploded successfully!");
        }).catch((err) => {
          // res.json("File uploaded failed for archive!")
          console.log("File uploading failed: ", err);
          common.customResponse(req, res, err);
        }
        );
      }
    }
  });
}

// uploading test reports API function for archive
const uploadTestResultArchive = (req, res, next) => {
  const { doctor_id, patient_id, test_name } = req.params;

  var url = req.url.split("/");
  y = url[1];

  if (patient_id == 0 || !test_name) {
    next(ApiError.notFound('Please enter patient_id and test name!'));
    return;
  }

  // for archive test results
  testReportUploadArchive(req, res, (error) => {
    if (error) {
      console.log('errors', error);
      res.json({ error: error });
    } else {
      // If File not found
      if (req.file === undefined) {
        console.log('Error: No File Selected!');
        res.json('Error: No File Selected');
      } else {
        // If Success
        fileName = req.file.key;

        updateDBForTestUploadsArchive(fileName, doctor_id, patient_id, test_name, y).then(() => {
          res.json("File uploded successfully! Archive");
        }).catch((err) => {
          // res.json("File uploaded failed for archive!")
          console.log("File uploading failed: ", err);
          common.customResponse(req, res, err);
          console.log(err.message);
        }
        );
      }
    }
  });
}

async function updateDBForTestUploads(fileName, appointment_id, patient_id, test_id, doctor_id, url) {

  await pool.query("delete from appointment_medical_tests where appointment_id = $1 and patient_id = $2 and test_id = $3", [appointment_id, patient_id, test_id]);
  await pool.query("INSERT INTO appointment_medical_tests (appointment_id, patient_id, test_id, test_result) values($1, $2, $3, $4) on conflict (appointment_id, patient_id, test_id, test_result) DO UPDATE SET test_result = $4 ", [appointment_id, patient_id, test_id, fileName]);

  // upload test activity logs
  const testId = await pool.query("select appointment_medical_test_id from appointment_medical_tests where appointment_id = $1 and patient_id = $2 and test_id = $3", [appointment_id, patient_id, test_id]);
  const aid = testId.rows[0].appointment_medical_test_id;

  if (url === 'doctors') {
    // upload test activity log by doctor
    await common.storeActivityLogs(doctor_id, 'doctor', 'upload_test', aid).then(
      console.log("upload test activity inserted by doctor")
    );
  }
  if (url === 'patients') {
    // upload test activity log by patient
    await common.storeActivityLogs(patient_id, 'patient', 'upload_test', aid).then(
      console.log("upload test activity inserted by patient")
    );
  }
}

// update db function for archive file uploads
async function updateDBForTestUploadsArchive(fileName, doctor_id, patient_id, test_name, url) {

  await pool.query("INSERT INTO medical_tests(name,price_in_pkr) values($1,$2) on conflict (name) do nothing", [test_name, 0]);

  // appointment_id is 0 because we don't have any appointment_id for archives
  let amtid = await pool.query("INSERT INTO appointment_medical_tests(appointment_id, patient_id, test_id, test_result) values($1, $2, (select test_id from medical_tests where name = $3), $4) on conflict(patient_id, test_result) do nothing returning *", [0, patient_id, test_name, fileName]);

  if (amtid.rows[0] == null || amtid.rows[0] == 'undefined') {
    amtid = await pool.query("select * from appointment_medical_tests where patient_id = $1 and test_id = (select test_id from medical_tests where name = $2) ", [patient_id, test_name]);
  }

  const amti = amtid.rows[0].appointment_medical_test_id;

  if (url === 'doctors') {
    // upload test activity log by doctor
    await common.storeActivityLogs(doctor_id, 'doctor', 'upload_test', amti).then(
      console.log("upload archive test activity inserted by doctor")
    );
  }
  if (url === 'patients') {
    // upload test activity log by patient
    await common.storeActivityLogs(patient_id, 'patient', 'upload_test', amti).then(
      console.log("upload archive test activity inserted by patient")
    );
  }
}

// getting test report from s3 
const getTestResult = async (req, res) => {
  const { patient_id, appointment_id, test_id } = req.params;

  try {
    var image = await pool.query(
      "select test_result from appointment_medical_tests where appointment_id = $1 and patient_id = $2 and test_id = $3", [appointment_id, patient_id, test_id]);
      image = image.rows[0].test_result;
      
    if (image == 'null' || image == null) {
      res.json(image);
    } else {
      var result = image.toString();

      var options = {
        Bucket: 'upload.aibers.health/uploads/testReports',
        Key: result
      };

      res.attachment(result);
      var fileStream = s3.getObject(options).createReadStream();
      fileStream.pipe(res);
    }
  } catch (err) {
    //console.log(err.message);
    common.customResponse(req, res, err);
  }
}


module.exports = {
  uploadImage,
  getImage,
  uploadTestResult,
  uploadTestResultArchive,
  getTestResult,
}