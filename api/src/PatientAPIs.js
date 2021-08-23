const pool = require('./Config').pool;
const ApiError = require('./error/ApiError');
const common = require('./DbOperation');
var geoip = require('geoip-lite');
const winston = require('./Logger');


//login APIs
//user login
const patientLogin = async (req, res, next) => {
  const { contact_no } = req.params;
  const { notification_token } = req.body;
  const session_id = req.query.sid;

  if (!session_id) {
    next(ApiError.notFound('session_id missing'));
    return;
  }
  try {

    const contact_id = await pool.query('SELECT contact_id from phone_numbers where number = $1', [contact_no]);
    var c_id = contact_id.rows[0];
    // console.log('contact_id: ', c_id)

    if (c_id == null || c_id == undefined) { // add new contact, phone_number and and patient

      const insertNewContact = "INSERT INTO contacts(verify) VALUES ('t') RETURNING contact_id";
      const newContact = await pool.query(insertNewContact);
      const newc_id = newContact.rows[0].contact_id;

      const insertPhoneNo = "INSERT INTO phone_numbers(contact_id,number) VALUES ($1,$2)";
      await pool.query(insertPhoneNo, [newc_id, contact_no]);

      const insertNewPatient = "INSERT INTO users(contact_id, role) VALUES ($1,$2) returning id";
      const newPat = await pool.query(insertNewPatient, [newc_id, 'patient']);

      const newPId = newPat.rows[0].id;
      // console.log("newPId: ", newPId);
      const insertFamilyId = "INSERT INTO patient_family(family_id, patient_id) values ($1, $2) on conflict (family_id, patient_id) do nothing";
      await pool.query(insertFamilyId, [newPId, newPId]);

      const selectPatient = "SELECT u.id as patient_id, u.contact_id, c.name, pn.number FROM users u join contacts c on u.contact_id = c.contact_id join phone_numbers pn on pn.contact_id = u.contact_id WHERE u.role = $2 and u.contact_id = ( SELECT contact_id FROM phone_numbers WHERE number = $1)";
      const newPatient = await pool.query(selectPatient, [contact_no, 'patient']);

      await storeSessions(req, newPatient.rows[0].patient_id, 'patient', session_id, notification_token, newc_id).then(async (result) => {

        if (result == 'error') {
          common.customResponse(req, res, err);
        } else {
          var response = [];
          await response.push({ ...newPatient.rows[0], 'session_id': result });

          winston.logger.warn("User logged in successfully!");
          res.json({ 'patient': response });
        }
      });
    }
    else {
      // console.log("in else");
      c_id = c_id.contact_id;
      const selectPatient = "SELECT u.id as patient_id FROM users u WHERE u.role = $2 and u.contact_id = (SELECT contact_id FROM phone_numbers WHERE number = $1)";
      const pid = await pool.query(selectPatient, [contact_no, 'patient']);

      var patId = pid.rows[0];
      // console.log("pid: ", patId);

      if (patId == 'undefined' || patId == null) {
        // console.log("inserting a new user");
        const newPatientQuery = "insert into users(contact_id, role) values((select contact_id from phone_numbers where number = $1), $2) returning id";
        const newPatient = await pool.query(newPatientQuery, [contact_no, 'patient']);
        patId = newPatient.rows[0].id;
        // console.log('patId: ', patId);
      } else {
        patId = patId.patient_id;
        // console.log('patId is: ', patId);
      }

      const checkPF = await pool.query("SELECT patient_id from patient_family where patient_id = $1", [patId]);
      if (checkPF.rows[0] == undefined || checkPF.rows[0] == null) {
        const insertFamilyQuery = "INSERT INTO patient_family(family_id, patient_id) values ($1, $2) on conflict (family_id, patient_id) do nothing";
        await pool.query(insertFamilyQuery, [patId, patId]);
      }

      const selectPatientRes = "SELECT u.id as patient_id, u.contact_id, c.name, pn.number FROM users u join contacts c on u.contact_id = c.contact_id join phone_numbers pn on pn.contact_id = u.contact_id WHERE u.role = $2 and u.contact_id = (SELECT contact_id FROM phone_numbers WHERE number = $1)";
      const newPatient = await pool.query(selectPatientRes, [contact_no, 'patient']);

      await storeSessions(req, newPatient.rows[0].patient_id, 'patient', session_id, notification_token, c_id).then(async (result) => {
        if (result == 'error') {
          common.customResponse(req, res, err);
        } else {
          var response = [];
          await response.push({ ...newPatient.rows[0], 'session_id': result });
          res.json({ 'patient': response });
        }
      });
    }
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// patient log out
const patientLogout = async (req, res) => {
  const { session_id } = req.params;

  const query = "update login_sessions set logout_timestamp = $1, notification_token = $3 where session_id = $2";

  await common.dbOperation(req, res, query, ['NOW()', session_id, null]);
}

// update contact of patient by patient id (web)
const updateContactPatient = async (req, res) => {
  const { patient_id } = req.params;
  const { name, dob, address, education, latitude, longitude, user_name, specialization, about, gender, blood_group, number } = req.body;

  try {
    const cid = await pool.query("SELECT contact_id from users where id = $1 and role = $2", [patient_id, 'patient']);
    const contact_id = cid.rows[0].contact_id;
    await pool.query(
      'UPDATE contacts SET name = $2 , specialization = $3, about = $4,gender = $5,dob = $6, blood_group = $12, address = $7, education = $8, latitude = $9, longitude = $10, user_name = $11 WHERE contact_id = $1', [contact_id, name, specialization, about, gender, dob, address, education, latitude, longitude, user_name, blood_group]);

    await pool.query(
      'UPDATE phone_numbers SET number = $1 WHERE contact_id = $2', [number, contact_id]);

    // update contact activity log by patient
    await common.storeActivityLogs(patient_id, 'patient', 'update_contact', contact_id).then(async (resp) => {
      if (resp == 'error') {
        console.log("error in storing activity");
        common.customResponse(req, res, err);
      } else {
        res.json('Contact Updated!');
      }
    });
  } catch (err) {
    common.customResponse(req, res, err);
  }
}


//get name,gender,BG,DOB of patient by id
const patients_profile_info = async (req, res) => {
  var { patient_id } = req.params;

  if (patient_id == 0) {
    patient_id = null;
  }
  const query = "SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id WHERE u.id = $1 and u.role = $2";

  await common.dbOperation(req, res, query, [patient_id, 'patient']);
}

//get history of patient by id
const patients_profile_history = async (req, res, next) => {
  const { patient_id } = req.params;

  if (patient_id == 0 || !patient_id) {
    next(ApiError.notFound('patient_id can not be 0'));
    return;
  }
  const query = "SELECT a.appointment_id, a.date_time::timestamptz as date_time_of_appointment, a.parent_appointment_id, p.date_time::timestamptz as date_time_of_parent_appointment, (select array_to_json(array_agg(row_to_json(dn))) from (select doctor_note_id, doctor_note from doctor_notes dn where a.appointment_id = dn.appointment_id order by a.date_time desc) dn) as doctors_note, a.appointment_status,(select row_to_json(appdata) from (select (select array_to_json(array_agg(row_to_json(sym))) from (select symptoms.name as symptoms from symptoms inner join appointment_symptoms on appointment_symptoms.symptom_id = symptoms.symptom_id where appointment_symptoms.appointment_id = a.appointment_id ) sym) as symptoms, (select array_to_json(array_agg(row_to_json(test))) from ( select medical_tests.name as test_name from medical_tests inner join appointment_medical_tests on medical_tests.test_id = appointment_medical_tests.test_id where appointment_medical_tests.appointment_id = a.appointment_id ) test) as tests) appdata) as appointment_data , (select row_to_json(d) from ( select u.id as doctor_id, c.name, c.specialization,(select row_to_json(al) from (select location_id,appointment_type, (select contacts.name as location from contacts inner join hospital_locations on contacts.contact_id = hospital_locations.contact_id where location_id = doctors_hospital_locations.location_id) as appointment_location_of_doctor from doctors_hospital_locations where  a.doctors_hospital_location_id = doctors_hospital_locations.doctors_hospital_location_id) al) as appointment_location from users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.doctor_id and u.role = $2) d) as doctorinfo,(select row_to_json(p) from ( SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.patient_id and u.role = $3) p) as patientinfo  from appointments a inner join appointments p on p.appointment_id = a.parent_appointment_id where a.patient_id = $1 AND a.appointment_status = 'completed' ORDER BY a.date_time desc LIMIT 1";

  await common.dbOperation(req, res, query, [patient_id, 'doctor', 'patient']);
}

// add family member
const addFamilyMember = async (req, res, next) => {

  const { patient_id, family_id } = req.params;
  const { name, relation, contact_no, gender, dob, blood_group } = req.body;

  if (!name || !relation || !gender || !dob) {
    next(ApiError.notFound("name, relation, gender, dob can't be null"));
    return;
  }

  try {
    var relation2 = '';  // relation of current patient with newly created patient

    const p_gender = await pool.query("SELECT c.gender FROM contacts c inner join users pu on c.contact_id = pu.contact_id where pu.id = $1", [patient_id]);
    const patient_gender = p_gender.rows[0].gender; // patient_gender is the gender of current patient

    if (relation == 'brother' || relation == 'sister') {
      if (patient_gender == 'male') { relation2 = "brother"; }
      else { relation2 = 'sister'; }
    }

    if (relation == 'mother' || relation == 'father') {
      if (patient_gender == 'male') { relation2 = "son"; }
      else { relation2 = 'daughter'; }
    }

    if (relation == 'son' || relation == 'daughter') {
      if (patient_gender == 'male') { relation2 = "father"; }
      else { relation2 = 'mother'; }
    }

    if (relation == 'wife' || relation == 'husband') {
      if (patient_gender == 'male') { relation2 = "husband"; }
      else { relation2 = 'wife'; }
    }

    // adding new patient as recieved in body
    // add contact
    const contact_id = await pool.query(
      "INSERT INTO contacts(name, gender, dob,blood_group,verify) VALUES($1, $2, $3,$4,$5) on conflict (name, gender, dob) do nothing RETURNING contact_id", [name, gender, dob, blood_group, 't']
    );
    var c_id = contact_id.rows[0];
    if (c_id == undefined) {
      const select_cid = await pool.query("SELECT contact_id FROM contacts WHERE name = $1 AND gender = $2 AND dob = $3", [name, gender, dob]);
      c_id = select_cid.rows[0].contact_id;
      // console.log('Contact id selected: ', c_id);
    } else {
      var c_id = c_id.contact_id;
      // console.log('New Contact Inserted: ', c_id);
    }

    // insert a new user(patient)
    const pat_id = await pool.query("INSERT INTO users(contact_id,role) VALUES($1, $2) on conflict (contact_id, role) do nothing RETURNING id", [c_id, 'patient']);
    var pu_id = pat_id.rows[0];
    if (pu_id == undefined) {
      const select_pid = await pool.query("SELECT id FROM users WHERE contact_id = $1 and role = $2", [c_id, 'patient']);
      pu_id = select_pid.rows[0].id;
      console.log('pu_id selected: ', pu_id);
    } else {
      var pu_id = pu_id.id;
      console.log('New patient user inserted: ', pu_id);
    }

    // insert patient's family id
    await pool.query("INSERT INTO patient_family(family_id, patient_id) values((select family_id from patient_family where patient_id = $1), $2) on conflict (family_id, patient_id) do nothing", [patient_id, pu_id]);

    // insert a new contact_no (if passed in body)
    if (contact_no) {
      const if_exist = await pool.query("select exists(select 1 from phone_numbers where number=$1)", [contact_no]);
      if (if_exist.rows[0].exists) { res.json("phone number already exists") } else {
        await pool.query("INSERT INTO phone_numbers(contact_id,number) VALUES ($1,$2)", [c_id, contact_no]);
        console.log('New Phone_number Inserted');
      }
    }

    // adding relation of newly created patient with current patient as received in body
    await pool.query(
      "INSERT INTO family_members(family_id, name, relation, patient_id) values ((select pf.family_id from patient_family pf where pf.patient_id = $1), cast($2 as varchar), $3, $1) on conflict (family_id, name, relation, patient_id) do nothing", [patient_id, name, relation]
    );
    console.log('Relation of new patient with current patient Inserted');

    // adding relation of current patient with newly created patient (smartly)
    await pool.query(
      "INSERT INTO family_members(family_id, name, relation, patient_id) values ((select pf.family_id from patient_family pf where pf.patient_id = $1), (select c.name from contacts c inner join users pu on c.contact_id = pu.contact_id where pu.id = $1), $2, $3) on conflict (family_id, name, relation, patient_id) do nothing", [patient_id, relation2, pu_id]
    );
    console.log('Relation of current patient with newl pateint Inserted');

    // FamilyMember activity logs
    const familyId = await pool.query("select family_id from patient_family where patient_id = $1", [patient_id]);

    // FamilyMember activity log by patient
    await common.storeActivityLogs(patient_id, 'patient', 'add_family_member', familyId.rows[0].family_id).then(async (resp) => {
      if (resp == 'error') {
        // console.log("error in storing activity");
        common.customResponse(req, res, err);
      } else {
        // console.log("error in storing activity");
        res.json('Family member added successfully!');
      }
    });
    // save notification patient
    await common.saveNotifications(patient_id, 'patient', 'add_family_member', familyId.rows[0].family_id);

  } catch (err) {
    console.log(err.message);
    common.customResponse(req, res, err);
  }
}

//get all patients of doctors
const getAllPatients = async (req, res, next) => {
  const { doctor_id } = req.params;

  if (doctor_id == 0 || !doctor_id) {
    next(ApiError.notFound('doctor_id can not be 0'));
    return;
  }
  const query = "SELECT acs.doctor_id, acs.patient_id, acs.access_id, acs.is_access,(select array_to_json(array_agg(row_to_json(s))) from (select l.session_id from login_sessions l where l.contact_id = (select contact_id from users u where u.id = acs.patient_id and u.role = $2) )s) as session, (select row_to_json(pt) from (SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image, pn.number FROM users u inner join contacts c on c.contact_id = u.contact_id inner join phone_numbers pn on pn.contact_id = u.contact_id where acs.patient_id = u.id and u.role = $2) pt) as patientinfo from access acs WHERE acs.doctor_id =  $1";

  await common.dbOperation(req, res, query, [doctor_id, 'patient']);
}

//get all patients by contact no and name (input -> name/ number)
const searchAllPatients = async (req, res) => {
  const { input } = req.params;

  const query = "SELECT u.id as patient_id, u.contact_id, c.name, c.gender,c.dob,c.image, pn.number FROM users u join contacts c on u.contact_id = c.contact_id join phone_numbers pn on pn.contact_id = u.contact_id WHERE u.role = $2 and (pn.number::text LIKE ( '%' || $1 || '%') or lower(c.name) LIKE lower( '%' || $1 || '%'))";

  await common.dbOperation(req, res, query, [input, 'patient']);
}

//insert a new patient in patient tab
const newPatient = async (req, res) => {
  const { contact_no, doctor_id } = req.params;
  const { name, dob, gender, patient_id } = req.body;

  try {
    if (patient_id == null || patient_id === "undefined") {
      const search = await pool.query("SELECT contact_id from phone_numbers where number = $1", [contact_no]);
      const c_id = search.rows[0];
      console.log(c_id);

      if (c_id == null || c_id == 'undefined') {
        const insertContact = "INSERT INTO contacts(name,dob,gender,verify) VALUES ($1,$2,$3,'t') RETURNING contact_id";
        const res1 = await pool.query(insertContact, [name, dob, gender]);
        //console.log("New Contact Inserted!");

        const insertPhoneNumber = "INSERT INTO phone_numbers(contact_id,number) VALUES ($1,$2)";
        await pool.query(insertPhoneNumber, [res1.rows[0].contact_id, contact_no]);
        //console.log("New PhoneNumber Inserted!");

        const searchh = await pool.query("INSERT INTO users(contact_id,role) VALUES ($1,$2) RETURNING id", [res1.rows[0].contact_id, 'patient']);
        const p_id = searchh.rows[0].id;

        const insertAccess = "INSERT INTO access(patient_id, doctor_id) values($1, $2) on conflict (patient_id, doctor_id) do nothing";
        await pool.query(insertAccess, [p_id, doctor_id]);
        //console.log("New Access Inserted!");

        // new patient activity log by doctor
        await common.storeActivityLogs(doctor_id, 'doctor', 'create_patient', p_id).then(async (resp) => {
          if (resp == 'error') {
            console.log("error in storing activity");
            common.customResponse(req, res, err);
          } else {
            res.json('Patient Added By Doctor Successfully!');
          }
        });
      }
      else {
        const c_id = search.rows[0].contact_id;
        const searchh = await pool.query("INSERT INTO users(contact_id,role) VALUES ($1,$2) RETURNING id", [c_id, 'patient']);
        const p_id = searchh.rows[0].id;

        const insertAccess = "INSERT INTO access(patient_id, doctor_id,is_access) values($1, $2,'f') on conflict (patient_id, doctor_id) do nothing";
        await pool.query(insertAccess, [p_id, doctor_id]);

        // new patient activity log by doctor
        await common.storeActivityLogs(doctor_id, 'doctor', 'create_patient', p_id).then(async (resp) => {
          if (resp == 'error') {
            console.log("error in storing activity");
            common.customResponse(req, res, err);
          } else {
            res.json('Patient Added By Doctor Successfully!');
          }
        });
      }

    } else {
      const insertAccess = "INSERT INTO access(patient_id, doctor_id,is_access) values($1, $2,'f') on conflict (patient_id, doctor_id) do nothing";
      await pool.query(insertAccess, [patient_id, doctor_id]);
      // console.log("New Access Inserted!");

      // new patient activity log by doctor
      await common.storeActivityLogs(doctor_id, 'doctor', 'create_patient', patient_id).then(async (resp) => {
        if (resp == 'error') {
          console.log("error in storing activity");
          common.customResponse(req, res, err);
        } else {
          res.json('Patient Added By Doctor Successfully!');
        }
      });
    }
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// remove family member by family_member_id
const removeFamilyMember = async (req, res) => {
  const { patient_id, family_member_id } = req.params;

  const query = "DELETE from family_members where family_member_id = $1";

  await common.dbOperation(req, res, query, [family_member_id]);

  // FamilyMember activity log by patient
  await common.storeActivityLogs(patient_id, 'patient', 'remove_family_member', 0).then(async (resp) => {
    if (resp == 'error') {
      // console.log("error in storing activity");
      common.customResponse(req, res, err);
    } else {
      res.json('FamilyMember activity removed by patient');
    }
  });
  // save notification patient
  await common.saveNotifications(patient_id, 'patient', 'remove_family_member', 0);
}

// get patient information
const getPatientInfo = async (req, res, next) => {
  const { patient_id } = req.params;

  if (patient_id == 0) {
    next(ApiError.notFound("patient id can't be 0"));
    return;
  }

  const query = "SELECT pu.id as patient_id, pu.contact_id, c.name, c.gender, c.blood_group, c.image, c.dob, pf.family_id,(select row_to_json(a) from (select(select array_to_json(coalesce(array_agg(row_to_json(b)) filter (where row_to_json(b) is not null), '{}')) from (SELECT fm.family_member_id, fm.family_id, pfmu.id as family_member_patient_id, ct.dob as family_member_dob, fm.name, fm.relation FROM users pfmu inner join contacts ct on ct.contact_id = pfmu.contact_id inner join patient_family pf on pf.patient_id = pfmu.id inner join family_members fm on fm.name = ct.name and fm.family_id = pf.family_id where fm.family_id = pf.family_id EXCEPT SELECT fm1.family_member_id, fm1.family_id, pfmu1.id as family_member_patient_id, ct1.dob as family_member_dob, fm1.name, fm1.relation from users pfmu1 inner join contacts ct1 on ct1.contact_id = pfmu1.contact_id inner join patient_family pf1 on pf1.patient_id = pfmu1.id inner join family_members fm1 on fm1.name = ct1.name and fm1.family_id = pf1.family_id where fm1.patient_id != $1 and fm1.family_id = pf1.family_id) b) as family_members)a) as family_doc_tab from users pu inner join contacts c on c.contact_id = pu.contact_id inner join patient_family pf on pf.patient_id = pu.id where pu.id = $1";

  await common.dbOperation(req, res, query, [patient_id]);

}

// get test info
const getTestInfo = async (req, res) => {
  const { patient_id } = req.params;

  const query = "SELECT u.id as patient_id,c.name,(select array_to_json(coalesce(array_agg(row_to_json(ti)) filter (where row_to_json(ti) is not null), '{}')) from(select amt.patient_id, amt.test_id,(select name from medical_tests where test_id = amt.test_id) as test_name, test_result, amt.test_date_time, amt.appointment_id,(select date_time from appointments where appointment_id = amt.appointment_id) as appointment_date_time from appointment_medical_tests amt where amt.patient_id = $1 order by amt.test_date_time desc) ti) as test_info_tab from users u inner join contacts c on c.contact_id = u.contact_id where u.id = $1 and u.role = $2";

  await common.dbOperation(req, res, query, [patient_id, 'patient']);
}

// vitals APIs
// add vital by patient
const addVitals = async (req, res, next) => {
  const { patient_id, vital_id } = req.params;
  const { new_value } = req.body;

  if (vital_id == 0 || patient_id == 0 || !new_value) {
    next(ApiError.notFound('please enter correct values!'));
    return;
  }
  try { // why you didn't use common.dbOperations generic func here, because query's response is being used in storeActivityLogs

    const vid = await pool.query("insert into patient_vitals(vital_id, patient_id, doctor_id, current_value, date_time) values($1, $2, $3, $4, $5) returning *", [vital_id, patient_id, 0, new_value, 'NOW()']);

    // vitals activity logs
    await common.storeActivityLogs(patient_id, 'patient', 'add_vital', vid.rows[0].patient_vital_id).then(async (resp) => {
      if (resp == 'error') {
        console.log("error in storing activity");
        common.customResponse(req, res, err);
      } else {
        res.json('Vital added successfully');
      }
    });
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//  update a new vital by patients
const updateVitals = async (req, res, next) => {
  const patient_vital_id = req.params.vital_id;
  const { new_value } = req.body;

  if (patient_vital_id == 0 || !new_value) {
    next(ApiError.notFound('please enter correct values!'));
    return;
  }

  const query = "UPDATE patient_vitals SET current_value = $2 WHERE patient_vital_id = $1";

  await common.dbOperation(req, res, query, [patient_vital_id, new_value]);

}

// get vitals by patient_id
const getVitals = async (req, res) => {
  var { patient_id, vital_id } = req.params;

  if (patient_id == 0) {
    patient_id = null;
  }
  if (vital_id == 0) {
    vital_id = null;
  }
  if (vital_id === null) {
    const query = "SELECT v.vital_id, (select row_to_json(vi) from (select v.name, v.unit, v.normal_range)vi) as vital_info, (select row_to_json(vd) from(select vd.patient_id, vd.patient_vital_id, vd.vital_id, vd.current_value, vd.date_time from patient_vitals vd where vd.patient_id = $1 and vd.vital_id =  v.vital_id order by vd.date_time desc limit 1) vd)::jsonb as vital_current from vitals v";

    await common.dbOperation(req, res, query, [patient_id]);
  }
  else {
    const query = "SELECT distinct pv.patient_id, pv.vital_id,(select row_to_json(vinfo) from(select name,unit,normal_range from vitals where vital_id = pv.vital_id)vinfo)::jsonb as vital_info, (select array_to_json(array_agg(row_to_json(vd))) from(select vd.patient_vital_id,vd.doctor_id, vd.current_value, vd.date_time from patient_vitals vd where vd.patient_id = $1 and vd.vital_id =  $2 order by vd.date_time desc)vd)::jsonb as vital_data from patient_vitals pv where ($1::int is null or pv.patient_id = $1) and ($2::int is null or pv.vital_id =  $2) ORDER BY pv.vital_id ASC";

    await common.dbOperation(req, res, query, [patient_id, vital_id]);
  }
}

// comments APIs
// get all comments by appointment_id
const getComments = async (req, res, next) => {
  const { appointment_id } = req.params;

  if (!appointment_id || appointment_id == 0) {
    next(ApiError.notFound('appointment_id must not be null or 0'));
    return;
  }
  const query = "SELECT ac.appointment_id, (select date_time from appointments where appointment_id = $1) as date_time_of_appointment, (select row_to_json(noc) from(select count(*) from comments where appointment_id = $1) noc) as no_of_comments, (select array_to_json(array_agg(row_to_json(cinfo))) from(select c.comment_id, c.sender, c.doctor_id, (select row_to_json(di) from( select contacts.name, contacts.image from contacts INNER JOIN users du ON contacts.contact_id = du.contact_id where du.id = c.doctor_id) di) as doctor_info, c.patient_id, (select row_to_json(pi) from( select contacts.name, contacts.image from contacts INNER JOIN users pu ON contacts.contact_id = pu.contact_id where pu.id = c.patient_id) pi) as patient_info, c.date_time_of_comment, c.comment, age(now(), c.date_time_of_comment) as age_of_comment from comments c where c.appointment_id = $1) cinfo) as comments from comments ac where ac.appointment_id = $1 limit 1";

  await common.dbOperation(req, res, query, [appointment_id]);
}

// insert a new comment
const insertComment = async (req, res, next) => {

  const { appointment_id, patient_id, doctor_id } = req.params;
  const { comment } = req.body;
  const { sender } = req.query;

  var url = req.url;
  y = url.split("/");
  url = y[1];

  if (!appointment_id || appointment_id == 0) {
    next(ApiError.notFound('appointment_id must not be null or 0'));
    return;
  }
  if (!comment) {
    next(ApiError.notFound("comment value can't be null"));
    return;
  }
  try {

    const newComment = await pool.query(
      "insert into comments(appointment_id, doctor_id, patient_id, date_time_of_comment, comment,sender) values($1, $2, $3, $4, $5, $6) RETURNING comment_id", [appointment_id, doctor_id, patient_id, 'NOW()', comment, sender]);
   
    const cid = newComment.rows[0].comment_id;
    console.log(cid);

    if (url === 'doctors') {
      // comment activity log by doctor
      await common.storeActivityLogs(doctor_id, 'doctor', 'add_comment', cid).then(
        console.log("Comment activity inserted by doctor")
      );
      // save notification doctor
      await common.saveNotifications(patient_id, 'patient', 'add_comment', cid);

      // popup notification doctor
      await common.popupNotifications(patient_id, doctor_id, 'Comment', 'Commented on appointment.');
    }

    if (url === 'patients') {
      // comment activity log by patient
      await common.storeActivityLogs(patient_id, 'patient', 'add_comment', cid).then(
        console.log("Comment activity inserted by patient")
      );
      // save notification patient
      await common.saveNotifications(doctor_id, 'doctor', 'add_comment', cid);
    }

    res.json("Comment inserted successfully");
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// add or remove doctor's access from accessing patient profile
const doctorAccess = async (req, res) => {
  const { patient_id, doctor_id } = req.params;
  const { status } = req.query;

  try {
    if (status === 'true') { // adding into access list
      var aid = await pool.query(
        "INSERT INTO access(patient_id, doctor_id) values($1, $2) on conflict (patient_id, doctor_id) do nothing returning *", [patient_id, doctor_id]
      );

      if (aid.rows[0] == 'undefined' || aid.rows[0] == null) {
        aid = await pool.query(
          "update access set is_access = $3 where patient_id = $1 and doctor_id = $2 returning access_id", [patient_id, doctor_id, 't']
        );
      }

      aid = aid.rows[0].access_id;

      // doctorAccess activity log by patient
      await common.storeActivityLogs(patient_id, 'patient', 'give_access', aid).then(
        console.log("DoctorAccess activity inserted by patient")
      );
      // save notification patient
      await common.saveNotifications(doctor_id, 'doctor', 'give_access', aid);
    }
    else { // remove from access list
      const accessId = await pool.query(
        "UPDATE access SET is_access = $3 WHERE patient_id = $1 and doctor_id = $2 returning *", [patient_id, doctor_id, 'f']
      );
      // doctorAccess activity log by patient
      await common.storeActivityLogs(patient_id, 'patient', 'remove_access', accessId.rows[0].access_id).then(
        console.log("DoctorAccess activity removed by patient")
      );
    }
    res.json("Successfull");
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// access status change
const access_request = async (req, res) => {
  const { patient_id, doctor_id } = req.params;
  const { status } = req.query;

  try {
    if (status === 'confirm') {
      const confirm_access = await pool.query("UPDATE access set request_status = $1, is_access = $4 where doctor_id = $2 and patient_id = $3 RETURNING access_id", ['none', doctor_id, patient_id, 't']);
      const cid = confirm_access.rows[0].access_id;
      // console.log(cid);

      // save notification 
      await common.saveNotifications(doctor_id, 'doctor', 'give_access', cid);
      res.json("Operation Successful");
    }
    else if (status === 'none') {
      const reject_access = await pool.query("UPDATE access set request_status = $1 where doctor_id = $2 and patient_id = $3 RETURNING access_id", [status, doctor_id, patient_id]);
      res.json("Operation Successful");
    }
    else {
      const reject_access = await pool.query("UPDATE access set request_status = $1 where doctor_id = $2 and patient_id = $3 RETURNING access_id", [status, doctor_id, patient_id]);
      const cid = reject_access.rows[0].access_id;
      // console.log(cid);

      // save notification
      await common.saveNotifications(patient_id, 'patient', 'send_request', cid);

      // popup notification doctor
      await common.popupNotifications(patient_id, doctor_id, 'Request', 'send document access request to you.');

      res.json("Operation Successful");
    }
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//get pending request (access)
const pending_request = async (req, res) => {
  const { patient_id } = req.params;

  const query = "SELECT a.access_id,a.is_access,a.request_status,a.patient_id,(select c.name from contacts c inner join users pu on c.contact_id = pu.contact_id where a.patient_id = pu.id) as patient_name, (select array_to_json(array_agg(row_to_json(d))) from (select a.doctor_id,c.name,c.image from contacts c inner join users du on c.contact_id = du.contact_id where a.doctor_id = du.id)d)as doctor_info from access a where is_access = $3 and request_status = $1 and patient_id = $2";

  await common.dbOperation(req, res, query, ['send', patient_id, 'f']);
}

//get allowed doctors (access)
const allowed_doctors = async (req, res) => {
  const { patient_id } = req.params;

  const query = "select a.access_id,a.is_access,a.request_status,a.patient_id,(select c.name from contacts c inner join users pu on c.contact_id = pu.contact_id where a.patient_id = pu.id) as patient_name, (select array_to_json(array_agg(row_to_json(d))) from (select a.doctor_id,c.name,c.image from contacts c inner join users du on c.contact_id = du.contact_id where a.doctor_id = du.id)d)as doctor_info from access a where a.is_access = $2 and a.patient_id = $1";

  await common.dbOperation(req, res, query, [patient_id, 't']);
}

//favourite APIs
// set favourite doctor by patient_id, doctor_id and doctors_hospital_location_id
const insertFavouriteDoctor = async (req, res, next) => {

  const { patient_id, doctor_id, doctors_hospital_location_id } = req.params;

  if (patient_id == 0 || doctor_id == 0 || doctors_hospital_location_id == 0) {
    next(ApiError.notFound('patient_id, doctor_id and location_id should be > 0'));
    return;
  }
  try {
    var setFavouriteDoctor = await pool.query(
      'INSERT INTO favourite_doctors(patient_id, doctor_id, doctors_hospital_location_id) VALUES ($1,$2,$3) on conflict(patient_id, doctor_id, doctors_hospital_location_id) do nothing RETURNING favourite_id', [patient_id, doctor_id, doctors_hospital_location_id]);

    if (setFavouriteDoctor.rows[0] == 'undefined' || setFavouriteDoctor.rows[0] == null) {
      setFavouriteDoctor = await pool.query(
        'SELECT favourite_id from favourite_doctors where patient_id = $1 and doctor_id = $2 and doctors_hospital_location_id = $3', [patient_id, doctor_id, doctors_hospital_location_id]);
    }

    // favourite activity logs
    const fid = setFavouriteDoctor.rows[0].favourite_id;

    // favourite activity log by patient
    await common.storeActivityLogs(patient_id, 'patient', 'add_favourite_doctor', fid).then(
      console.log("Favourite activity inserted by patient")
    );
    // save notification doctor
    await common.saveNotifications(doctor_id, 'doctor', 'add_favourite_doctor', fid);
    res.json("Successfully added to favourite list");
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// remove doctor from favourite list by patient_id, doctor_id and doctors_hospital_location_id
const deleteFavouriteDoctor = async (req, res, next) => {
  const { patient_id, doctor_id, doctors_hospital_location_id } = req.params;

  if (patient_id == 0 || doctor_id == 0 || doctors_hospital_location_id == 0) {
    next(ApiError.notFound('patient_id, doctor_id and location_id should be > 0'));
    return;
  }
  const query = "DELETE from favourite_doctors WHERE patient_id = $1 and doctor_id = $2 and doctors_hospital_location_id = $3";

  await common.dbOperation(req, res, query, [patient_id, doctor_id, doctors_hospital_location_id]);
}

// get all favourite doctors
const getFavouriteDoctors = async (req, res, next) => {
  const { patient_id, doctor_id } = req.params;

  if (patient_id == 0) {
    next(ApiError.notFound('patient_id should be > 0'));
    return;
  }
  if (doctor_id != 0) {
    const query = "SELECT f.doctors_hospital_location_id as favourite_dhl_id, f.patient_id, f.doctor_id, (select row_to_json(al) from (select dhl.location_id,dhl.fees, dhl.appointment_type,(select c.name as location from contacts c inner join hospital_locations hl on c.contact_id = hl.contact_id where hl.location_id = dhl.location_id) as location from doctors_hospital_locations dhl where  f.doctors_hospital_location_id = dhl.doctors_hospital_location_id) al)as hospital_location_info FROM favourite_doctors f where f.patient_id = $1 and f.doctor_id = $2";

    await common.dbOperation(req, res, query, [patient_id, doctor_id]);
  }
  else {
    const query = "SELECT f.doctors_hospital_location_id, f.patient_id, f.doctor_id, (select row_to_json(d) from (select contacts.name, contacts.specialization, contacts.gender, contacts.image from users du inner join contacts on contacts.contact_id = du.contact_id where du.id = f.doctor_id ) d) as doctor_info,(select dhl.location_id from doctors_hospital_locations dhl where f.doctors_hospital_location_id = dhl.doctors_hospital_location_id), (select row_to_json(al) from (select (select contacts.name as location from contacts inner join hospital_locations hl on contacts.contact_id = hl.contact_id where hl.location_id = doctors_hospital_locations.location_id) as location from doctors_hospital_locations where  f.doctors_hospital_location_id = doctors_hospital_locations.doctors_hospital_location_id) al)as hospital_location_info FROM favourite_doctors f WHERE patient_id = $1 ";

    await common.dbOperation(req, res, query, [patient_id]);
  }
}

// function for getting activity logs of patients
const activityLogs = async (req, res) => {

  const { patient_id } = req.params;

  try {
    const getActivityLogsPatients = await pool.query(
      "select l.log_id,(select row_to_json(logUserInfo) from(select pu.id as patient_id, (select c.name from contacts c where c.contact_id = pu.contact_id),(select c.image from contacts c where c.contact_id = pu.contact_id) from users pu where l.log_user = pu.id) logUserInfo) as log_user_info, (select a.activity from activity_type a where a.activity_id = l.activity_id),(select a.activity_table from activity_type a where a.activity_id = l.activity_id), l.object_id, l.time_stamp from activity_logs l where l.log_user_type = $2 and l.log_user = $1 order by time_stamp desc", [patient_id, 'patient']
    );
    const values = [];
    const values1 = getActivityLogsPatients.rows;
    var output = values1.map(async (item) => {
      const myValue = await dataFromActivityTablePatient(req, res, item.activity_table, item.object_id, item.activity);

      values.push({ ...item, 'activity_info': myValue.rows[0] });
    });
    Promise.all(output).then(() => res.json(values));
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

const dataFromActivityTablePatient = async (req, res, activity_table, object_id, activity) => {
  // const myId = activity_table.slice(0,activity_table.length -1);

  if (activity_table === 'patient_vitals') {
    const myquery = "select pu.id as patient_id,(select c.name from contacts c where c.contact_id = pu.contact_id), v.name as vital_name from users pu, vitals v inner join patient_vitals pv on pv.vital_id = v.vital_id where pv.patient_id = pu.id and pv.patient_vital_id= $1 and pv.patient_id = (select patient_id from patient_vitals pv where patient_vital_id = $1)";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  if (activity_table === 'comments') {
    const myquery = "select com.doctor_id, c.name, com.appointment_id, a.date_time, com.comment from comments com inner join appointments a on a.appointment_id = com.appointment_id inner join users du on du.id = com.doctor_id inner join contacts c on c.contact_id = du.contact_id where com.comment_id = $1";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  if (activity_table === 'appointments') {
    const myquery = "select a.appointment_id, a.date_time, a.doctor_id, (select c.name from contacts c inner join  users du on du.contact_id = c.contact_id where du.id = a.doctor_id), (select c.image from contacts c inner join  users du1 on du1.contact_id = c.contact_id where du1.id = a.doctor_id) from appointments a where a.appointment_id = $1";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  if (activity_table === 'contacts') {
    const myquery = "select contact_id, name, image from contacts where contact_id = $1";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  if (activity_table === 'favourite_doctor') {
    const myquery = "select * from favourite_doctors where favourite_id = $1";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  if (activity_table === 'access') {
    const myquery = "select * from access where access_id = $1";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  if (activity_table === 'appointment_medical_tests') {
    const myquery = "select amt.appointment_id,(select date_time from appointments where appointment_id = amt.appointment_id) as date_time_of_appointment, amt.test_result,(select mt.name from medical_tests mt where mt.test_id = amt.test_id), amt.test_date_time from appointment_medical_tests amt where amt.appointment_medical_test_id = $1";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  if (activity_table === 'family_members') {
    const myquery = "select family_id, name, relation from family_members where family_member_id = $1";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
}

// function for storing login sessions
const storeSessions = async (req, userId, userType, sid, nt, c_id) => {
  var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
  // console.log("IP address of user", ip);

  const ua = req.headers['user-agent']; // browser + os information
  // console.log("User Information: ", ua);
  var checkSession;
  try {
    checkSession = await pool.query("select * from login_sessions where session_id = $1", [sid]);
  } catch (err) {
    console.error(e.message);
    return 'error';
  }

  const insertSessionQuery = "insert into login_sessions(ip_address, user_id, user_type, os_browser_info, ip_location, notification_token, contact_id) values($1, $2, $3, $4, $5, $6, $7) returning *";
  const updateSessionQuery = "update login_sessions set login_timestamp = $1, logout_timestamp = $2, ip_address = $4, ip_location = $5, notification_token = $6 where session_id = $3 returning *";
  var geoLocation;

  var geo = geoip.lookup(ip);
  // console.log(geo);
  if (geo) {
    if (!geo.city && geo.country) {
      geoLocation = `${geo.country}`;
    }
    if (geo.city && geo.country) {
      geoLocation = `${geo.city}, ${geo.country}`;
    }
  } else {
    geoLocation = 'NA';
  }

  const insertNewSession = async () => {
    try {
      const session = await pool.query(
        insertSessionQuery, [ip, userId, userType, ua, geoLocation, nt, c_id]
      );
      // console.log("in session function: ", session.rows[0].session_id);
      return session.rows[0].session_id;
    } catch (err) {
      console.error(err.message);
      return 'error';
    }
  }

  const updateOldSession = async () => {
    try {

      const session = await pool.query(
        updateSessionQuery, ['NOW()', null, sid, ip, geoLocation, nt]
      );
      console.log("old session updated");
      return session.rows[0].session_id;
    } catch (err) {
      console.error(err.message);
      return 'error';
    }
  }

  if (sid == 0) {
    return await insertNewSession();
  } else {
    if (checkSession.rows[0] == undefined || checkSession.rows[0] == null) {
      return await insertNewSession();
    }
    return await updateOldSession();
  }
}

// get user info (temprory API for checking Browser, OS and IP information)
const userInfo = async (req, res) => {

  var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress

  console.log("In ip of user", ip);

  // const UserAgent = require('user-agents');  

  // const userAgent = new UserAgent(); 
  // console.log(JSON.stringify(userAgent.data, null, 1));

  // const userAgent = JSON.stringify(req.headers['user-agent']);
  // res.json({"User's IP Address: ": ip, "Headers: ":  req.headers['user-agent']});
  const ua = req.headers['user-agent'];
  // var browserName = 'Unknown Browser';


  // if (ua.indexOf("Chrome")){
  //   browserName = 'chrome';
  // } else if (ua.indexOf(indexOf("Firefox"))){
  //   browserName = 'firefox';
  // }
  res.json({
    "UserAgent: ": ua,
    "IP-Address: ": ip,
    "OS": getOs(ua)
  });
  // res.json({userAgent});
}

const loginSessionsPatients = async (req, res) => {
  const { patient_id } = req.params;

  const query = "SELECT * from login_sessions where user_id = $1 and user_type = $2 order by login_timestamp desc";

  await common.dbOperation(req, res, query, [patient_id, 'patient']);
}

// get patient notifications
const getPatientNotifications = async (req, res) => {
  const { patient_id } = req.params;
  try {
    const getNotifications = await pool.query(
      "SELECT n.notification_id, n.notification_time_stamp,n.notification_user_type,n.notification_status,n.notification_object_id,(select nt.notification_type from notification_types nt where nt.notification_type_id = n.notification_type_id),(select nt.notification_table from notification_types nt where nt.notification_type_id = n.notification_type_id),(select row_to_json(app) from(SELECT appointment_id, date_time FROM appointments WHERE appointment_id = n.notification_object_id) app) as appointment_info, (select row_to_json(pat) from(SELECT u.id as patient_id, contacts.name, contacts.image FROM users u inner join contacts on contacts.contact_id = u.contact_id WHERE u.id = n.notification_user and u.role = $2) pat) as patient_info FROM notification_logs n WHERE n.notification_user = $1 and n.notification_user_type = $2 order by notification_time_stamp desc", [patient_id, 'patient']
    );
    const values = [];
    const values1 = getNotifications.rows;
    var output = values1.map(async (item) => {

      const myValue = await dataFromTable(req, res, item.notification_table, item.notification_object_id);
      values.push({ ...item, 'doctor_info': myValue.rows[0] });
    });
    Promise.all(output).then(() => res.json(values));
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// change notification status
const changeNotificationStatus = async (req, res) => {
  const { notification_id } = req.params;
  const { status } = req.query;

  const query = "UPDATE notification_logs set notification_status = $1 where notification_id = $2";

  await common.dbOperation(req, res, query, [status, notification_id]);
}

// function for getting notification logs
const dataFromTable = async (req, res, notification_table, notification_object_id) => {
  const myId = notification_table.slice(0, notification_table.length - 1);
  if (notification_table === 'access') {
    const myquery = "select u.id as doctor_id, c.name, c.image from contacts c inner join users u on c.contact_id = u.contact_id where u.id = (select doctor_id from access where access_id = $1) and u.role = $2";
    const values = common.trycatchForAPIs(req, res, myquery, [notification_object_id, 'doctor']);
    return (values);
  }
  if (notification_table === 'favourite_doctors') {
    const myquery = "select u.id as doctor_id, c.name, c.image from contacts c inner join users u on c.contact_id = u.contact_id where u.id = (select doctor_id from favourite_doctors where favourite_id = $1) and u.role = $2";
    const values = common.trycatchForAPIs(req, res, myquery, [notification_object_id, 'doctor']);
    return (values);
  }
  if (notification_table === 'comments') {
    const myquery = "select u.id as doctor_id, c.name, c.image ,(select row_to_json(app) from(SELECT appointment_id, date_time FROM appointments WHERE appointment_id = (select appointment_id from comments where comment_id = $1)) app) as comment_appointment_info from contacts c inner join users u on c.contact_id = u.contact_id where u.id = (select doctor_id from comments where comment_id = $1) and u.role = $2";
    const values = common.trycatchForAPIs(req, res, myquery, [notification_object_id, 'doctor']);
    return (values);
  }
  if (notification_table === 'family_members') {
    const myquery = "select family_id, name, relation from family_members where family_member_id = $1";
    const values = common.trycatchForAPIs(req, res, myquery, [notification_object_id]);
    return (values);
  }
  else {
    const myquery = "select u.id as doctor_id, c.name, c.image from contacts c inner join users u on c.contact_id = u.contact_id where u.id = (select doctor_id from " + notification_table + " where " + myId + "_id = $1) and u.role = $2";
    const values = common.trycatchForAPIs(req, res, myquery, [notification_object_id, 'doctor']);
    return (values);
  }
}

// get all doctors
const allDoctors = async (req, res) => {
  const { patient_id } = req.params;

  const query = "SELECT dl.doctors_hospital_location_id, dl.doctor_id, (select row_to_json(dinfo) from ( SELECT u.id as doctor_id, contacts.name, contacts.gender, contacts.specialization, contacts.image FROM users u inner join contacts on contacts.contact_id = u.contact_id where u.id = dl.doctor_id and u.role = $3) dinfo) as doctor_info, dl.location_id, (select row_to_json(dhl) from(select contacts.name as location from contacts inner join hospital_locations on contacts.contact_id = hospital_locations.contact_id where location_id = dl.location_id) dhl) as hospital_location_info, dl.fees as doctor_fee, (select array_to_json(array_agg(row_to_json(f)))  from (select f.favourite_id from favourite_doctors f where patient_id = $2 and u.id = f.doctor_id and f.doctors_hospital_location_id = dl.doctors_hospital_location_id and u.role = $3)f) as favourite_doctors from doctors_hospital_locations dl join users u on dl.doctor_id = u.id join contacts on contacts.contact_id = u.contact_id where dl.hospital_location_status = $1";


  await common.dbOperation(req, res, query, ['true', patient_id, 'doctor']);
}


module.exports = {
  patientLogin,
  patientLogout,
  updateContactPatient,
  patients_profile_info,
  patients_profile_history,
  addFamilyMember,
  removeFamilyMember,
  getPatientInfo,
  getTestInfo,
  getAllPatients,
  searchAllPatients,
  newPatient,
  addVitals,
  updateVitals,
  getVitals,
  getComments,
  insertComment,
  access_request,
  pending_request,
  allowed_doctors,
  doctorAccess,
  activityLogs,
  loginSessionsPatients,
  getPatientNotifications,
  changeNotificationStatus,
  userInfo,
  allDoctors,
  insertFavouriteDoctor,
  deleteFavouriteDoctor,
  getFavouriteDoctors,
}
