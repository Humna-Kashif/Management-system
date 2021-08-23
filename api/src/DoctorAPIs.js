const pool = require('./Config').pool;
const ApiError = require('./error/ApiError');
const common = require('./DbOperation');
var request = require("request");

// get time slots
const slots = async (req, res, next) => {
  const { doctor_id, doctors_hospital_location_id } = req.params;
  const { date } = req.body;

  if (!date || doctor_id == 0 || doctors_hospital_location_id == 0) {
    next(ApiError.notFound('either date, doctor_id or location_id is missing'));
    return;
  }
  try {

    const day_of_week = await pool.query("SELECT to_char($1::date,'day')AS day", [date]);
    const day = day_of_week.rows[0].day.trim();
    console.log(day);

    const slots = await pool.query("SELECT dhl.doctor_id, dhl.doctors_hospital_location_id, ds.start_time, ds.end_time, ds.day_of_week, (select array_to_json(array_agg(row_to_json(s))) from (select generate_series(CURRENT_DATE + ds.start_time, CURRENT_DATE + ds.end_time - '15 minutes'::interval, '15 minutes'::interval)::time at time zone 'UTC' as time_slot EXCEPT ALL select date_time::time at time zone 'UTC' from appointments where doctor_id = $1 and date_time::date = $3::date and appointment_status = $4 and doctors_hospital_location_id = $2 order by time_slot asc) s) as available_time_slots, (select array_to_json(array_agg(row_to_json(os))) from(select a.date_time::time at time zone 'UTC' as time_slot from appointments a where a.doctor_id = $1 and a.date_time::date = $3::date and a.appointment_status = $4 and a.doctors_hospital_location_id = $2 order by a.date_time::time asc) os) as occupied_time_slots from doctors_hospital_locations dhl inner join doctors_schedule ds on ds.doctors_hospital_location_id = dhl.doctors_hospital_location_id where dhl.doctor_id = $1 and dhl.doctors_hospital_location_id = $2 and ds.day_of_week = $5", [doctor_id, doctors_hospital_location_id, date, 'upcoming', day]);
    res.json(slots.rows)
  }
  catch (err) {
    common.customResponse(req, res, err);
  }
}

//get doctor profile by id
const doctors_profile = async (req, res) => {
  const { doctor_id } = req.params;

  const query = "SELECT ct.name, (select to_char(ct.dob, 'YYYY-MM-DD') as dob from contacts where contact_id = (select contact_id from users where id = $1)), ct.gender, ct.specialization, ct.about, ct.image, ct.time_stamp as created_at, (select array_to_json(array_agg(row_to_json(l))) from (select dhl1.doctors_hospital_location_id,dhl1.hospital_location_status, dhl1.fees,dhl1.appointment_type, dhl1.doctor_id, c.name as hospital_location, dhl1.location_id as hospital_location_id,(select array_to_json(array_agg(row_to_json(dsh))) from (select ds.day_of_week, ds.start_time, ds.end_time from doctors_schedule ds where ds.doctors_hospital_location_id = dhl1.doctors_hospital_location_id ) dsh) as schedule,(select row_to_json(h) from(select h.hospital_id, c.name, c.image from hospitals h inner join contacts c on c.contact_id = h.contact_id where l.location_id = dhl1.location_id and l.hospital_id = h.hospital_id )h) as hospital_info, (select row_to_json(latlng) from (select c.latitude, c.longitude) latlng) as coordinates, (select array_to_json(array_agg(row_to_json(fac))) from (select hf.facility from hospital_facilities hf where hf.location_id = dhl1.location_id ) fac) as facilities from contacts c inner join hospital_locations l on c.contact_id = l.contact_id inner join doctors_hospital_locations dhl1 on l.location_id = dhl1.location_id where dhl1.doctor_id = u.id and dhl1.hospital_location_status = 'true') l )as location,(select array_to_json(array_agg(row_to_json(q))) from (select doctor_qualification_id,qualification from doctor_qualifications WHERE u.id = doctor_qualifications.doctor_id) q) as qualification from contacts ct inner join users u on u.contact_id = ct.contact_id where u.id = $1";

  await common.dbOperation(req, res, query, [doctor_id]);
}

//user login
const userLogin = async (req, res, next) => {
  let { contact_no } = req.params;
  const session_id = req.query.sid;

  if (!session_id) {
    next(ApiError.notFound('session_id missing'));
    return;
  }
  try {

    // contact id by contact no
    const contact_id = await pool.query('SELECT contact_id from phone_numbers where number = $1', [contact_no]);
    const c_id = contact_id.rows[0].contact_id;
    console.log(c_id)

    // doctor login
    const doctorLogin = await pool.query(
      "SELECT id, contact_id FROM users WHERE contact_id = (SELECT contact_id FROM phone_numbers WHERE number = $1) and role = $2", [contact_no, 'doctor']);

    // staff nurse login
    const staffNurseLogin = await pool.query(
      "SELECT u.id as id, u.contact_id, (select array_to_json(array_agg(row_to_json(d))) from (select ds.doctor_id, u.contact_id, ds.doctors_hospital_location_id from users u WHERE ds.doctor_id = u.id and ds.staff_available = $2 and u.role = $3)d) as my_doctors from users u inner join doctor_staffs ds on u.id = ds.staff_id where u.role = $4 and u.contact_id = (select contact_id FROM phone_numbers WHERE number = $1) limit 1", [contact_no, 't', 'doctor', 'nurse']);

    // staff front desk login
    const staffFDLogin = await pool.query(
      "SELECT u.id as id, u.contact_id, (select array_to_json(array_agg(row_to_json(d))) from (select ds.doctor_id, u.contact_id, ds.doctors_hospital_location_id from users u WHERE ds.doctor_id = u.id and ds.staff_available = $2 and u.role = $3)d) as my_doctors from users u inner join doctor_staffs ds on u.id = ds.staff_id where u.role = $4 and u.contact_id = (select contact_id  FROM phone_numbers WHERE number = $1) limit 1", [contact_no, 't', 'doctor', 'front desk']);

    // staff personal assistant login
    const staffPALogin = await pool.query(
      "SELECT u.id as id, u.contact_id, (select array_to_json(array_agg(row_to_json(d))) from (select ds.doctor_id, u.contact_id, ds.doctors_hospital_location_id from users u WHERE ds.doctor_id = u.id and ds.staff_available = $2 and u.role = $3)d) as my_doctors from users u inner join doctor_staffs ds on u.id = ds.staff_id where u.role = $4 and u.contact_id = (select contact_id  FROM phone_numbers WHERE number = $1) limit 1", [contact_no, 't', 'doctor', 'personal assistant']);

    // admin login
    const adminLogin = await pool.query(
      "SELECT id, contact_id FROM users WHERE contact_id = (SELECT contact_id FROM phone_numbers WHERE number = $1) and role = $2", [contact_no, 'admin']);

    if (doctorLogin.rows.length !== 0) {
      common.storeSessions(req, doctorLogin.rows[0].id, 'doctor', session_id, c_id).then(async (result) => {

        res.json({ 'session_id': result, 'doctor': doctorLogin.rows, 'nurse': staffNurseLogin.rows, 'front_desk': staffFDLogin.rows, 'personal_assistant': staffPALogin.rows, 'admin': adminLogin.rows });
      });
    }
    else if (staffNurseLogin.rows.length !== 0) {
      common.storeSessions(req, staffNurseLogin.rows[0].id, 'staff', session_id, c_id).then(async (result) => {

        res.json({ 'session_id': result, 'doctor': doctorLogin.rows, 'nurse': staffNurseLogin.rows, 'front_desk': staffFDLogin.rows, 'personal_assistant': staffPALogin.rows, 'admin': adminLogin.rows });
      });
    }
    else if (staffFDLogin.rows.length !== 0) {
      common.storeSessions(req, staffFDLogin.rows[0].id, 'staff', session_id, c_id).then(async (result) => {

        res.json({ 'session_id': result, 'doctor': doctorLogin.rows, 'nurse': staffNurseLogin.rows, 'front_desk': staffFDLogin.rows, 'personal_assistant': staffPALogin.rows, 'admin': adminLogin.rows });
      });
    }
    else if (staffPALogin.rows.length !== 0) {
      common.storeSessions(req, staffPALogin.rows[0].id, 'staff', session_id, c_id).then(async (result) => {

        res.json({ 'session_id': result, 'doctor': doctorLogin.rows, 'nurse': staffNurseLogin.rows, 'front_desk': staffFDLogin.rows, 'personal_assistant': staffPALogin.rows, 'admin': adminLogin.rows });
      });
    }
    else if (adminLogin.rows.length !== 0) {
      common.storeSessions(req, adminLogin.rows[0].id, 'admin', session_id, c_id).then(async (result) => {

        res.json({ 'session_id': result, 'doctor': doctorLogin.rows, 'nurse': staffNurseLogin.rows, 'front_desk': staffFDLogin.rows, 'personal_assistant': staffPALogin.rows, 'admin': adminLogin.rows });
      });
    }
    else {
      res.json({ 'doctor': doctorLogin.rows, 'nurse': staffNurseLogin.rows, 'front_desk': staffFDLogin.rows, 'personal_assistant': staffPALogin.rows, 'admin': adminLogin.rows });
    }
  }
  catch (err) {
    common.customResponse(req, res, err);
  }
}

// user log out
const userLogout = async (req, res) => {
  const { session_id } = req.params;

  const query = "UPDATE login_sessions SET logout_timestamp = $1 WHERE session_id = $2";

  await common.dbOperation(req, res, query, ['NOW()', session_id]);
}

//contacts APIs
// update contact by contact id
const updateContact = async (req, res) => {
  const { id } = req.params;
  const { name, dob, address, education, latitude, longitude, user_name, specialization, about, gender, blood_group } = req.body;
  var url = req.url;
  y = url.split("/");
  url = y[1];

  try {
    if (url === 'doctors') {
      await pool.query('UPDATE contacts SET name = $2, specialization = $3, about = $4, gender = $5, dob = $6, blood_group = $12, address = $7, education = $8, latitude = $9, longitude = $10, user_name = $11 WHERE contact_id = (SELECT contact_id FROM users WHERE id = $1 and role = $13)', [id, name, specialization, about, gender, dob, address, education, latitude, longitude, user_name, blood_group, 'doctor']);
      // update contact activity logs
      const contactId = await pool.query("SELECT contact_id FROM users WHERE id = $1 and role = $2", [id, 'doctor']);
      const cid = contactId.rows[0].contact_id;
      console.log(cid);

      // update contact activity log by doctor
      await common.storeActivityLogs(id, 'doctor', 'update_contact', cid).then(
        console.log("update contact activity inserted by doctor")
      );
    }
    if (url === 'patients') {
      await pool.query('UPDATE contacts SET name = $2, specialization = $3, about = $4, gender = $5, dob = $6, blood_group = $12, address = $7, education = $8, latitude = $9, longitude = $10, user_name = $11 WHERE contact_id = (SELECT contact_id FROM users WHERE id = $1 and role = $13)', [id, name, specialization, about, gender, dob, address, education, latitude, longitude, user_name, blood_group, 'patient']);
      // update contact activity logs
      const contactId = await pool.query("SELECT contact_id FROM users WHERE id = $1 and role = $2", [id, 'patient']);
      const cid = contactId.rows[0].contact_id;
      console.log(cid);

      // update contact activity log by doctor
      await common.storeActivityLogs(id, 'patient', 'update_contact', cid).then(
        console.log("update contact activity inserted by doctor")
      );
    }
    else if (url === 'nurses') {
      await pool.query('UPDATE contacts SET name = $2, specialization = $3, about = $4, gender = $5, dob = $6, blood_group = $12, address = $7, education = $8, latitude = $9, longitude = $10, user_name = $11 WHERE contact_id = (SELECT contact_id FROM users WHERE id = $1 and role = $13)', [id, name, specialization, about, gender, dob, address, education, latitude, longitude, user_name, blood_group, 'nurse']);
      // update contact activity logs
      const contactId = await pool.query("SELECT contact_id from users where id = $1 and role = $2", [id, 'nurse']);
      const cid = contactId.rows[0].contact_id;
      console.log(cid);

      // update contact activity log by doctor
      await common.storeActivityLogs(id, 'nurse', 'update_contact', cid).then(
        console.log("update contact activity inserted by nurse")
      );
    }
    else if (url === 'pa') {
      await pool.query('UPDATE contacts SET name = $2, specialization = $3, about = $4, gender = $5, dob = $6, blood_group = $12, address = $7, education = $8, latitude = $9, longitude = $10, user_name = $11 WHERE contact_id = (SELECT contact_id FROM users WHERE id = $1 and role = $13)', [id, name, specialization, about, gender, dob, address, education, latitude, longitude, user_name, blood_group, 'pa']);
      // update contact activity log
      const contactId = await pool.query("SELECT contact_id from users where id = $1 and role = $2", [id, 'pa']);
      const cid = contactId.rows[0].contact_id;
      console.log(cid);

      // update contact activity log by doctor
      await common.storeActivityLogs(id, 'pa', 'update_contact', cid).then(
        console.log("update contact activity inserted by PA")
      );
    }
    else if (url === 'fd') {
      await pool.query('UPDATE contacts SET name = $2, specialization = $3, about = $4, gender = $5, dob = $6, blood_group = $12, address = $7, education = $8, latitude = $9, longitude = $10, user_name = $11 WHERE contact_id = (SELECT contact_id FROM users WHERE id = $1 and role = $13)', [id, name, specialization, about, gender, dob, address, education, latitude, longitude, user_name, blood_group, 'fd']);
      // update contact activity logs
      const contactId = await pool.query("SELECT contact_id from users where id = $1 and role = $2", [id, 'fd']);
      const cid = contactId.rows[0].contact_id;
      console.log(cid);

      // update contact activity log by doctor
      await common.storeActivityLogs(id, 'fd', 'update_contact', cid).then(
        console.log("update contact activity inserted by FD")
      );
    }
    else {
      console.log("Use valid URL!");
    }
    res.json("Contact Update successfully!");
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//set url
const setUrl = async (req, res, next) => {
  const { contact_id } = req.params;
  const { url } = req.body;
  if (!url) {
    next(ApiError.notFound('URL field is required and must be non blank'));
    return;
  }
  const query = "INSERT INTO urls (contact_id, url) VALUES ($1, $2)";

  await common.dbOperation(req, res, query, [contact_id, url]);
}

//get url
const getUrl = async (req, res) => {
  const { contact_id } = req.params;

  const query = "SELECT url_id,url FROM urls WHERE contact_id = $1";

  await common.dbOperation(req, res, query, [contact_id]);
}

// update Url by id
const updateUrl = async (req, res, next) => {
  const { contact_id, url_id } = req.params;
  const { url } = req.body;
  if (!url) {
    next(ApiError.notFound('URL field is required and must be non blank'));
    return;
  }
  const query = "UPDATE urls SET url = $2 WHERE url_id = $1 and contact_id = $3";

  await common.dbOperation(req, res, query, [url_id, url, contact_id]);
}

//delete url by url id
const deleteUrl = async (req, res) => {
  const { contact_id, url_id } = req.params;

  const query = "DELETE FROM urls WHERE url_id = $1 AND contact_id = $2";

  await common.dbOperation(req, res, query, [url_id, contact_id]);
}

//set email
const setEmail = async (req, res, next) => {
  const { contact_id } = req.params;
  const { email } = req.body;
  if (!email) {
    next(ApiError.notFound('Email field is required and must be non blank'));
    return;
  }
  const query = "INSERT INTO emails (contact_id, email)VALUES($1, $2)";

  await common.dbOperation(req, res, query, [contact_id, email]);
}

//get email
const getEmail = async (req, res) => {
  const { contact_id } = req.params;

  const query = "SELECT email_id,email FROM emails WHERE contact_id =  $1";

  await common.dbOperation(req, res, query, [contact_id]);
}

// update email by id
const updateEmail = async (req, res, next) => {
  const { contact_id, email_id } = req.params;
  const { email } = req.body;
  if (!email) {
    next(ApiError.notFound('Email field is required and must be non blank'));
    return;
  }
  const query = "UPDATE emails SET email = $2 WHERE email_id = $1 AND contact_id = $3";

  await common.dbOperation(req, res, query, [email_id, email, contact_id]);
}

//delete email by email id
const deleteEmail = async (req, res) => {
  const { contact_id, email_id } = req.params;

  const query = "DELETE FROM emails WHERE email_id = $1 AND contact_id = $2";

  await common.dbOperation(req, res, query, [email_id, contact_id]);
}

// get doctors
const getDoctors = async (req, res) => {
  const { searchterm } = req.query;

  if (searchterm !== null) {
    const query = "SELECT dl.doctors_hospital_location_id, dl.doctor_id, (select row_to_json(dinfo) from ( SELECT u.id as doctor_id, c.name, c.gender, c.specialization, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = dl.doctor_id) dinfo) as doctor_info, dl.location_id, (select row_to_json(dhl) from(select c.name as location from contacts c inner join hospital_locations l on c.contact_id = l.contact_id where location_id = dl.location_id) dhl) as hospital_location_info, dl.fees as doctor_fee from doctors_hospital_locations dl join users u on dl.doctor_id = u.id join contacts c on c.contact_id = u.contact_id where lower(c.name) LIKE lower( '%' || $1 || '%') and dl.hospital_location_status = $2";

    await common.dbOperation(req, res, query, [searchterm, 'true']);
  }
  else {
    const query = "SELECT dl.doctors_hospital_location_id, dl.doctor_id, (select row_to_json(dinfo) from ( SELECT u.id as doctor_id, c.name, c.gender, c.specialization, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = dl.doctor_id) dinfo) as doctor_info, dl.location_id, (select row_to_json(dhl) from(select c.name as location from contacts c inner join hospital_locations l on c.contact_id = l.contact_id where location_id = dl.location_id) dhl) as hospital_location_info, dl.fees as doctor_fee from doctors_hospital_locations dl join users u on dl.doctor_id = u.id join contacts c on c.contact_id = u.contact_id where dl.hospital_location_status = $1";

    await common.dbOperation(req, res, query, ['true']);
  }
}

//get location by character
const doctors_profile_searchLocation = async (req, res) => {
  const locationCharacter = req.query.character;

  if (locationCharacter != null) {
    const query = "SELECT l.location_id, c.name from hospital_locations l INNER JOIN contacts c ON l.contact_id = c.contact_id WHERE lower(c.name) LIKE lower( '%' || $1 || '%')";

    await common.dbOperation(req, res, query, [locationCharacter]);
  }
  else {
    const query = "SELECT l.location_id, c.name from hospital_locations l INNER JOIN contacts c ON l.contact_id = c.contact_id";

    await common.dbOperation(res, query);
  }
}

//set hospital location
const doctors_profile_setlocation = async (req, res, next) => {
  const { location, fees, appointment_type } = req.body;
  let schedule_array = req.body.schedule;
  const { doctor_id } = req.params;

  if (!location || !fees || !appointment_type || !schedule_array) {
    next(ApiError.notFound('All fields are required and must be non blank'));
    return;
  }
  try {

    const doctors_profile_setlocation = await pool.query(
      "INSERT INTO doctors_hospital_locations (location_id,doctor_id,fees,appointment_type) VALUES((SELECT l.location_id from hospital_locations l INNER JOIN contacts c ON l.contact_id = c.contact_id WHERE c.name = $2 ),$1, $3,$4) RETURNING doctors_hospital_location_id", [doctor_id, location, fees, appointment_type]);

    const hid = doctors_profile_setlocation.rows[0].doctors_hospital_location_id;
    console.log('location_id', hid);

    var output = schedule_array.map(async (item) => {
      const myValue = await schedule(item.start_time, item.end_time, item.day_of_week, item.is_open, hid);

    });

    // set hospital location activity log by doctor
    await common.storeActivityLogs(doctor_id, 'doctor', 'set_hospital_location', hid).then(
      console.log("set hospital location activity inserted by doctor")
    );
    res.json("Doctor's Location Added!");
  } catch (err) {
    common.customResponse(req, res, err);
  }
}
const schedule = async (start_time, end_time, day_of_week, is_open, hid) => {
  const myquery = "INSERT INTO doctors_schedule (start_time,end_time, day_of_week,doctors_hospital_location_id,is_open) VALUES($1::time,$2::time,$3,$5,$4)";
  const values = await pool.query(
    myquery, [start_time, end_time, day_of_week, is_open, hid]
  );
  return (values);
}

// add a new vital by doctor
const addVitals = async (req, res, next) => {
  const { patient_id, doctor_id } = req.params;
  let vital_array = req.body.vitals;

  if (doctor_id == 0 || patient_id == 0 || !vital_array) {
    next(ApiError.notFound('please enter correct values!'));
    return;
  }
  try {

    var output = vital_array.map(async (item) => {
      const myValue = await vitals(item.vital_id, item.new_value, patient_id, doctor_id);
    });
    res.json("Vitals Added!");
  } catch (err) {
    common.customResponse(req, res, err);
  }
}
//function for add array of vitals
const vitals = async (vital_id, new_value, patient_id, doctor_id) => {
  try {
    const vitalId = await pool.query("insert into patient_vitals(vital_id,patient_id,doctor_id,current_value) values($1, $3, $4, $2) RETURNING patient_vital_id", [vital_id, new_value, patient_id, doctor_id]);
    const pv_id = vitalId.rows[0].patient_vital_id;

    await common.storeActivityLogs(doctor_id, 'doctor', 'add_vital', pv_id).then(
      console.log("Add Vital activity inserted by doctor")
    );
  } catch (err) {
    console.log(err);
  }
}

// get vitals 
const getVitals = async (req, res) => {
  var { patient_id, vital_id } = req.params;

  if (vital_id == 0) {
    vital_id = null;
  }
  if (vital_id === null) {
    const query = "SELECT v.vital_id, (select row_to_json(vi) from (select v.name, v.unit, v.normal_range)vi) as vital_info, (select array_to_json(array_agg(row_to_json(vd))) from (select vd.patient_vital_id, vd.patient_id, vd.vital_id, vd.current_value, vd.date_time from patient_vitals vd where vd.patient_id = $1 and vd.vital_id =  v.vital_id order by vd.date_time desc) vd)::jsonb as vital_current from vitals v";

    await common.dbOperation(req, res, query, [patient_id]);
  }
  else {
    const query = "SELECT distinct pv.patient_id, pv.vital_id,(select row_to_json(vinfo) from(select name,unit,normal_range from vitals where vital_id = pv.vital_id)vinfo)::jsonb as vital_info, (select array_to_json(array_agg(row_to_json(vd))) from (select vd.patient_vital_id, vd.doctor_id, vd.current_value, vd.date_time from patient_vitals vd where vd.patient_id = $1 and vd.vital_id =  $2 order by vd.date_time desc)vd)::jsonb as vital_data from patient_vitals pv where ($1::int is null or pv.patient_id = $1) and ($2::int is null or pv.vital_id =  $2) ORDER BY pv.vital_id ASC";

    await common.dbOperation(req, res, query, [patient_id, vital_id]);
  }
}

//  update a new vital by doctor
const updateVitals = async (req, res, next) => {
  const patient_vital_id = req.params.vital_id;
  const { new_value } = req.body;

  if (patient_vital_id == 0 || !new_value) {
    next(ApiError.notFound('please enter correct values!'));
    return;
  }
  try {

    await pool.query("UPDATE patient_vitals SET current_value = $2 WHERE patient_vital_id = $1", [patient_vital_id, new_value]);

    res.json('Vital updated successfully!');

  } catch (err) {
    // console.log(e.message);
    common.customResponse(req, res, err);
  }
}

//get hospital location and timing  by doctors_hospital_location_id
const doctors_profile_getHospitalLocation = async (req, res) => {
  const { doctor_id } = req.params;

  const query = "SELECT doctors_hospital_location_id, hospital_location_status, fees,appointment_type, doctor_id, c.name as location,(select array_to_json(array_agg(row_to_json(dsh))) from (select ds.day_of_week, ds.start_time, ds.end_time, ds.is_open from doctors_schedule ds where ds.doctors_hospital_location_id = dhl.doctors_hospital_location_id ) dsh) as schedule,(select row_to_json(h) from(select h.hospital_id, c.name, c.image from hospitals h inner join contacts c on c.contact_id = h.contact_id where l.location_id = dhl.location_id and l.hospital_id = h.hospital_id )h) as hospital_info,(select array_to_json(array_agg(row_to_json(fac))) from (select hf.facility from hospital_facilities hf where hf.location_id = dhl.location_id ) fac) as facilities from contacts c inner join hospital_locations l on c.contact_id = l.contact_id inner join doctors_hospital_locations dhl on l.location_id = dhl.location_id where doctor_id = $1 AND dhl.hospital_location_status = 'true'";

  await common.dbOperation(req, res, query, [doctor_id]);
}

// update hospital location  by doctors_hospital_location_id
const doctors_profile_updatelocation = async (req, res, next) => {
  const { doctor_id, doctors_hospital_location_id } = req.params;
  const { location, fees, appointment_type } = req.body;
  let schedule_array = req.body.schedule;

  if (!location || !fees || !appointment_type) {
    next(ApiError.notFound('location field is required and must be non blank'));
    return;
  }
  const query = "UPDATE doctors_hospital_locations SET location_id = (SELECT l.location_id from hospital_locations l INNER JOIN contacts c ON l.contact_id = c.contact_id WHERE c.name = $2), fees = $4, appointment_type = $5 WHERE doctors_hospital_location_id = $1 AND doctor_id = $3";

  await common.dbOperation(req, res, query, [doctors_hospital_location_id, location, doctor_id, fees, appointment_type]);

  var output = schedule_array.map(async (item) => {
    const myValue = await schedule_update(item.start_time, item.end_time, item.day_of_week, doctors_hospital_location_id, item.is_open);
  });
  // update hospital location activity log by doctor
  await common.storeActivityLogs(doctor_id, 'doctor', 'update_hospital_location', doctors_hospital_location_id).then(
    console.log("update hospital location activity inserted by doctor")
  );
}
//function for add days of doctor
const schedule_update = async (start_time, end_time, day_of_week, doctors_hospital_location_id, is_open) => {
  const myquery = "UPDATE doctors_schedule SET start_time = $1,end_time = $2, is_open = $5 where doctors_hospital_location_id = $4 AND day_of_week = $3 RETURNING doctors_schedule_id";
  const values = await pool.query(
    myquery, [start_time, end_time, day_of_week, doctors_hospital_location_id, is_open]
  );
  console.log('schedule_id', values.rows[0], "day is", day_of_week);
  if (!values.rows[0]) {
    const myquery = "INSERT INTO doctors_schedule (start_time,end_time, day_of_week,doctors_hospital_location_id,is_open) VALUES($1::time,$2::time,$3,$5,$4)";
    const values = await pool.query(
      myquery, [start_time, end_time, day_of_week, is_open, doctors_hospital_location_id]
    );
  }
  return (values);
}

//disable location of doctor by id
const doctors_profile_deletelocation = async (req, res) => {
  const { doctor_id, doctors_hospital_location_id } = req.params;

  try {

    const doctors_profile_deletelocation = await pool.query(
      'UPDATE doctors_hospital_locations SET hospital_location_status = $1 WHERE doctors_hospital_location_id = $2 AND doctor_id = $3', ['F', doctors_hospital_location_id, doctor_id]);

    await pool.query('UPDATE favourite_doctor set status = $3 WHERE doctor_id = $1 and doctors_hospital_location_id = $2 ', [doctor_id, doctors_hospital_location_id, 'false']);

    // delete hospital location activity log by doctor
    await common.storeActivityLogs(doctor_id, 'doctor', 'delete_hospital_location', doctors_hospital_location_id).then(
      console.log("delete hospital location activity inserted by doctor")
    );
    res.json("Doctor's Location Deleted!");
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//set qualification
const doctors_profile_setqualification = async (req, res, next) => {
  const { doctor_id } = req.params;
  const { qualification } = req.body;
  if (!qualification) {
    next(ApiError.notFound('Qualification field is required and must be non blank'));
    return;
  }
  try {
    const qualification1 = await pool.query("INSERT INTO doctor_qualifications (doctor_id, qualification)VALUES($1, $2) RETURNING doctor_qualification_id", [doctor_id, qualification]);

    const dq_id = qualification1.rows[0].doctor_qualification_id;

    // set qualification activity log by doctor
    await common.storeActivityLogs(doctor_id, 'doctor', 'add_qualification', dq_id).then(
      console.log("set qualification activity inserted by doctor")
    );
    res.json("Operation Successful")
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//get qualification
const doctors_profile_getqualification = async (req, res) => {
  const { doctor_id } = req.params;

  const query = "SELECT doctor_qualification_id, qualification from doctor_qualifications INNER JOIN users u ON u.id = doctor_qualifications.doctor_id WHERE u.id = $1 and role = $2";

  await common.dbOperation(req, res, query, [doctor_id, 'doctor']);
}

// update Qualification of doctor by id
const doctors_profile_updatequalification = async (req, res, next) => {
  const { doctor_id, doctor_qualification_id } = req.params;
  const { qualification } = req.body;
  if (!qualification) {
    next(ApiError.notFound('Qualification field is required and must be non blank'));
    return;
  }
  const query = "UPDATE doctor_qualifications SET qualification = $2 WHERE doctor_qualification_id = $1 AND doctor_id = $3";

  // update qualification activity log by doctor
  await common.storeActivityLogs(doctor_id, 'doctor', 'update_qualification', doctor_qualification_id).then(
    console.log("update qualification activity inserted by doctor")
  );

  await common.dbOperation(req, res, query, [doctor_qualification_id, qualification, doctor_id]);
}

//delete doctor qualification by doctor qualification id
const doctors_profile_deletequalification = async (req, res) => {
  const { doctor_id, doctor_qualification_id } = req.params;

  const query = "DELETE FROM doctor_qualifications WHERE doctor_qualification_id = $1 AND doctor_id = $2";

  // delete qualification activity log by doctor
  await common.storeActivityLogs(doctor_id, 'doctor', 'delete_qualification', doctor_qualification_id).then(
    console.log("delete qualification activity inserted by doctor")
  );

  await common.dbOperation(req, res, query, [doctor_qualification_id, doctor_id]);
}


//get all hospital_name
const getAllHospitals = async (req, res) => {
  const hospitalCharacter = req.query.character;

  const query = "SELECT h.hospital_id, h.contact_id, c.name, (select array_to_json(array_agg(row_to_json(l))) from(SELECT l.location_id,c.name, c.address, c.longitude, c.latitude from hospital_locations l inner join contacts c on c.contact_id = l.contact_id  where h.hospital_id = l.hospital_id)l) as locations from hospitals h inner join contacts c on c.contact_id = h.contact_id WHERE lower(c.name) LIKE lower('%' || $1 || '%')";

  await common.dbOperation(req, res, query, [hospitalCharacter]);
}

//doctor staff APIs

//get staff nurse profile by id
const staffNurse = async (req, res) => {
  const { nurse_id } = req.params;

  const query = "SELECT ds.doctor_staff_id as doctor_staff_nurse_id, u.contact_id, ct.name, ct.dob, ct.gender, ct.specialization, ct.about, ct.image, ct.time_stamp as created_at, (select array_to_json(array_agg(row_to_json(l))) from (select dhl1.doctors_hospital_location_id, c.name as hospital_location, dhl1.location_id as hospital_location_id,(select row_to_json(h) from(select h.hospital_id, c.name, c.image from hospitals h inner join contacts c on c.contact_id = h.contact_id where l.location_id = dhl1.location_id and l.hospital_id = h.hospital_id )h) as hospital_info,(select array_to_json(array_agg(row_to_json(fac))) from (select hf.facility from hospital_facilities hf where hf.location_id = dhl1.location_id ) fac) as facilities from contacts c inner join hospital_locations l on c.contact_id = l.contact_id inner join doctors_hospital_locations dhl1 on l.location_id = dhl1.location_id where ds.doctors_hospital_location_id = dhl1.doctors_hospital_location_id) l )as location from contacts ct inner join users u on u.contact_id = ct.contact_id inner join doctor_staffs ds on ds.staff_id = u.id where u.id = $1 and u.role = $2";

  await common.dbOperation(req, res, query, [nurse_id, 'nurse']);
}

//get staff fd profile by id
const staffFD = async (req, res) => {
  const { fd_id }  = req.params;

  const query = "SELECT ds.doctor_staff_id as doctor_staff_fd_id, u.contact_id, ct.name, ct.dob, ct.gender, ct.specialization, ct.about, ct.image, ct.time_stamp as created_at, (select array_to_json(array_agg(row_to_json(l))) from (select dhl1.doctors_hospital_location_id, c.name as hospital_location, dhl1.location_id as hospital_location_id,(select row_to_json(h) from(select h.hospital_id, c.name, c.image from hospitals h inner join contacts c on c.contact_id = h.contact_id where l.location_id = dhl1.location_id and l.hospital_id = h.hospital_id )h) as hospital_info,(select array_to_json(array_agg(row_to_json(fac))) from (select hf.facility from hospital_facilities hf where hf.location_id = dhl1.location_id ) fac) as facilities from contacts c inner join hospital_locations l on c.contact_id = l.contact_id inner join doctors_hospital_locations dhl1 on l.location_id = dhl1.location_id where ds.doctors_hospital_location_id = dhl1.doctors_hospital_location_id) l )as location from contacts ct inner join users u on u.contact_id = ct.contact_id inner join doctor_staffs ds on ds.staff_id = u.id where u.id = $1 and u.role = $2";

  await common.dbOperation(req, res, query, [fd_id, 'front desk']);
}

//get staff pa profile by id
const staffPA = async (req, res) => {
  const { pa_id } = req.params;

  const query = "SELECT ds.doctor_staff_id as doctor_staff_pa_id, u.contact_id, ct.name, ct.dob, ct.gender, ct.specialization, ct.about, ct.image, ct.time_stamp as created_at, (select array_to_json(array_agg(row_to_json(l))) from (select dhl1.doctors_hospital_location_id, c.name as hospital_location, dhl1.location_id as hospital_location_id,(select row_to_json(h) from(select h.hospital_id, c.name, c.image from hospitals h inner join contacts c on c.contact_id = h.contact_id where l.location_id = dhl1.location_id and l.hospital_id = h.hospital_id )h) as hospital_info,(select array_to_json(array_agg(row_to_json(fac))) from (select hf.facility from hospital_facilities hf where hf.location_id = dhl1.location_id ) fac) as facilities from contacts c inner join hospital_locations l on c.contact_id = l.contact_id inner join doctors_hospital_locations dhl1 on l.location_id = dhl1.location_id where ds.doctors_hospital_location_id = dhl1.doctors_hospital_location_id) l )as location from contacts ct inner join users u on u.contact_id = ct.contact_id inner join doctor_staffs ds on ds.staff_id = u.id where u.id = $1 and u.role = $2";

  await common.dbOperation(req, res, query, [pa_id, 'personal assistant']);
}

//insert staff in contacts
const insertStaff = async (req, res) => {
  const { doctor_id, doctors_hospital_location_id } = req.params;
  const { name, dob, contact_no, gender, role } = req.body;

  try {

    const contact_id = await pool.query('SELECT contact_id from phone_numbers where number = $1', [contact_no]);
    const c_id = contact_id.rows[0];
    console.log(c_id);

    if (c_id == null) {
      const newContact_id = await pool.query("INSERT INTO contacts(name,dob,gender,verify) VALUES ($1,$2,$3,'t') RETURNING contact_id", [name, dob, gender]);
      const newc_id = newContact_id.rows[0].contact_id;
      console.log("new contact", newc_id);
      const addPhone_no = await pool.query("INSERT INTO phone_numbers(contact_id,number) VALUES ($1,$2)", [newc_id, contact_no]);

      const staff = await pool.query("INSERT INTO users (contact_id, role) VALUES($1,$2) RETURNING id", [newc_id, role]);
      const staff_id = staff.rows[0].id;

      const insertStaff = await pool.query(
        "INSERT INTO doctor_staffs(staff_id, doctor_id, doctors_hospital_location_id) VALUES($1,$2, $3) RETURNING doctor_staff_id", [staff_id, doctor_id, doctors_hospital_location_id]);
      const s_id = insertStaff.rows[0].doctor_staff_id;

      // Add staff activity log by doctor
      await common.storeActivityLogs(doctor_id, 'doctor', 'add_staff', s_id).then(
        console.log('Add staff activity inserted by doctor')
      );
    }
    else {
      const c_id = contact_id.rows[0].contact_id;
      const staff = await pool.query("SELECT id from users WHERE contact_id = $1 and role = $2", [c_id, role]);
      const staff_id = staff.rows[0];
      console.log(staff_id)

      if (staff_id == null) {
        const staff = await pool.query("INSERT INTO users (contact_id, role) VALUES($1,$2) RETURNING id", [c_id, role]);
        const newStaff_id = staff.rows[0].id;
        console.log("new",newStaff_id)

        const insertStaff = await pool.query(
          "INSERT INTO doctor_staffs(staff_id, doctor_id, doctors_hospital_location_id) VALUES($1,$2, $3) RETURNING doctor_staff_id", [newStaff_id, doctor_id, doctors_hospital_location_id]);
        const ds_id = insertStaff.rows[0].doctor_staff_id;

        // Add staff activity log by doctor
        await common.storeActivityLogs(doctor_id, 'doctor', 'add_staff', ds_id).then(
          console.log('Add staff activity inserted by doctor')
        );
      }
      else {
        const staff_id = staff.rows[0].id;
        const doctor_staff_id = await pool.query('SELECT doctor_staff_id from doctor_staffs where staff_id = $1 and doctor_id = $2', [staff_id, doctor_id]);
        const ds_id = doctor_staff_id.rows[0];
        console.log("Old Value", ds_id);

        if (ds_id == null) {
          const insertStaff = await pool.query(
            "INSERT INTO doctor_staffs(staff_id, doctor_id, doctors_hospital_location_id) VALUES($1,$2, $3) RETURNING doctor_staff_id", [staff_id, doctor_id, doctors_hospital_location_id]);
        }
        else {
          const updateStaff = await pool.query(
            "UPDATE doctor_staffs SET staff_available = $1 WHERE doctor_id = $2 and staff_id = $3 ", ['t', doctor_id, staff_id]);
        }
        // Add staff activity log by doctor
      await common.storeActivityLogs(doctor_id, 'doctor', 'add_staff', ds_id).then(
        console.log('Add staff activity inserted by doctor')
      );
      }
    }
    res.json("Operation Successful")
  } catch (err) {
    // console.log(e.message);
    common.customResponse(req, res, err);
  }
}


// display doctor staff by doctor_id
const getStaff = async (req, res) => {
  var { doctor_id } = req.params;

  if (doctor_id == 0) {
    doctor_id = null;
  }
  try {
    const staffNurse = await pool.query(
      "SELECT ds.doctor_staff_id as doctor_staff_nurse_id, ds.doctor_id, ds.staff_id as staff_nurse_id, ds.doctors_hospital_location_id, (select contacts.name as location from contacts, hospital_locations l inner join doctors_hospital_locations dhl on dhl.doctors_hospital_location_id = ds.doctors_hospital_location_id where dhl.location_id = l.location_id and l.contact_id = contacts.contact_id), ds.staff_available,(select row_to_json(np) from (select u.id as staff_nurse_id, u.contact_id, c.name, c.gender, c.dob, c.image, ph.number from contacts c inner join phone_numbers ph ON c.contact_id = ph.contact_id where c.contact_id = u.contact_id and u.id = ds.staff_id) np) as nurse_info from doctor_staffs ds inner join users u on u.id = ds.staff_id where ($1::int is null or ds.doctor_id = $1) and ds.staff_available = $2 and u.role = $3", [doctor_id, 't', 'nurse']);

    const staffPA = await pool.query(
      "SELECT ds.doctor_staff_id as doctor_staff_pa_id, ds.doctor_id, ds.staff_id as staff_pa_id, ds.doctors_hospital_location_id, (select contacts.name as location from contacts, hospital_locations l inner join doctors_hospital_locations dhl on dhl.doctors_hospital_location_id = ds.doctors_hospital_location_id where dhl.location_id = l.location_id and l.contact_id = contacts.contact_id), ds.staff_available,(select row_to_json(d) from (select u.id as staff_pa_id, u.contact_id, c.name, c.gender, c.dob, c.image, ph.number from contacts c inner join phone_numbers ph ON c.contact_id = ph.contact_id where c.contact_id = u.contact_id and u.id = ds.staff_id) d) as pa_info from doctor_staffs ds inner join users u on u.id = ds.staff_id where ($1::int is null or ds.doctor_id = $1) and ds.staff_available = $2 and u.role = $3", [doctor_id, 't', 'personal assistant']);

    const staffFD = await pool.query(
      "SELECT ds.doctor_staff_id as doctor_staff_fd_id, ds.doctor_id, ds.staff_id as staff_fd_id, ds.doctors_hospital_location_id, (select contacts.name as location from contacts, hospital_locations l inner join doctors_hospital_locations dhl on dhl.doctors_hospital_location_id = ds.doctors_hospital_location_id where dhl.location_id = l.location_id and l.contact_id = contacts.contact_id), ds.staff_available,(select row_to_json(d) from (select u.id as staff_fd_id, u.contact_id, c.name,c.gender,c.dob, c.image, ph.number from contacts c inner join phone_numbers ph ON c.contact_id = ph.contact_id where c.contact_id = u.contact_id and u.id = ds.staff_id )d) as fd_info from doctor_staffs ds inner join users u on u.id = ds.staff_id where ($1::int is null or ds.doctor_id = $1) and ds.staff_available = $2 and u.role = $3 ", [doctor_id, 't', 'front desk']);

    res.json({ 'staff_nurse': staffNurse.rows, 'staff_pa': staffPA.rows, 'staff_fd': staffFD.rows });

  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// update staff new
const updateStaff = async (req, res) => {
  const { doctor_id, doctors_hospital_location_id, staff_id } = req.params;
  const { name, dob, gender } = req.body;
  
  try { 

    const updateStaff = await pool.query(
      "UPDATE doctor_staffs SET doctors_hospital_location_id = $2 WHERE doctor_id = $1 and doctor_staff_id = $3 ", [doctor_id, doctors_hospital_location_id, staff_id]);

    const update =  await pool.query(
      "UPDATE contacts SET name = $1, dob = $2, gender = $3 WHERE contact_id = (SELECT contact_id from users where id = (SELECT staff_id from doctor_staffs where doctor_staff_id = $4)) ", [name, dob, gender, staff_id]);

      // update staff activity log by doctor
      await common.storeActivityLogs(doctor_id, 'doctor', 'update_staff', staff_id).then(
        res.json('Update staff activity inserted by doctor')
      );
  
    } catch (err) {
    // console.log(e.message);
    common.customResponse(req, res, err);
    }
}

// delete staff
const deleteStaff = async (req, res) => {
  const { doctor_id, staff_id } = req.params;
  
  try {

    const deleteStaff = await pool.query(
      "UPDATE doctor_staffs SET staff_available = $2 WHERE doctor_staff_id = $1", [staff_id, 'f']);

    // delete staff activity log by doctor
    await common.storeActivityLogs(doctor_id, 'doctor', 'delete_nurse', staff_id).then(
      console.log("Delete staff activity inserted by doctor"));
 
    res.json("Operation Successful")
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//get all staffs 
const getAllStaffs = async (req, res) => {
  const { contact_no } = req.params;

  const query = "select c.contact_id, c.name, c.gender, c.dob, c.image, pn.number from contacts c inner join phone_numbers pn on pn.contact_id = c.contact_id where pn.number::text LIKE ( '%' || $1 || '%')";

  await common.dbOperation(req, res, query, [contact_no]);
}

//notification APIs
// get patient's notification token by patient_id
const patientToken = async (req, res) => {
  const { patient_id } = req.params;

  const query = "SELECT notification_token from patients where patient_id = $1";

  await common.dbOperation(req, res, query, [patient_id]);
}

// get doctor notifications
const getDoctorNotifications = async (req, res) => {
  const { doctor_id } = req.params;
  try {
    const getNotifications = await pool.query(
      "SELECT n.notification_id, n.notification_time_stamp,n.notification_user_type,n.notification_status,n.notification_object_id,(select nt.notification_type from notification_types nt where nt.notification_type_id = n.notification_type_id),(select nt.notification_table from notification_types nt where nt.notification_type_id = n.notification_type_id),(select row_to_json(app) from(SELECT appointment_id, date_time FROM appointments WHERE appointment_id = n.notification_object_id) app) as appointment_info, (select row_to_json(doc) from(SELECT u.id as doctor_id, c.name, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id WHERE u.id = n.notification_user and u.role = $2 ) doc) as doctor_info FROM notification_logs n WHERE n.notification_user = $1 and n.notification_user_type = $2 order by notification_time_stamp desc", [doctor_id, 'doctor']
    );
    const values = [];
    const values1 = getNotifications.rows;
    var output = values1.map(async (item) => {

      const myValue = await dataFromTable(req, res, item.notification_table, item.notification_object_id);
      values.push({ ...item, 'patient_info': myValue.rows[0] });
    });
    Promise.all(output).then(() => res.json(values));
  } catch (err) {
    // console.error(err.message);
    common.customResponse(req, res, err);
  }
}

// function for getting notification logs
const dataFromTable = async (req, res, notification_table, notification_object_id) => {
  const myId = notification_table.slice(0, notification_table.length - 1);
  if (notification_table === 'access') {
    const myquery = "select u.id as patient_id, c.name,c.image from contacts c inner join users u on c.contact_id = u.contact_id where u.id = (select patient_id from access where access_id = $1) and u.role = $2";
    const values = common.trycatchForAPIs(req, res, myquery, [notification_object_id, 'patient']);
    return (values);
  }
  if (notification_table === 'favourite_doctors') {
    const myquery = "select u.id as patient_id, c.name,c.image from contacts c inner join users u on c.contact_id = u.contact_id where u.id = (select patient_id from favourite_doctors where favourite_id = $1) and u.role = $2";
    const values = common.trycatchForAPIs(req, res, myquery, [notification_object_id, 'patient']);
    return (values);
  }
  if (notification_table === 'comments') {
    const myquery = "select u.id as patient_id, c.name, c.image, (select row_to_json(app) from(SELECT appointment_id, date_time FROM appointments WHERE appointment_id = (select appointment_id from comments where comment_id = $1)) app) as comment_appointment_info from contacts c inner join users u on c.contact_id = u.contact_id where u.id = (select patient_id from comments where comment_id = $1) and u.role = $2";
    const values = common.trycatchForAPIs(req, res, myquery, [notification_object_id, 'patient']);
    return (values);
  }
  else {
    const myquery = "select u.id as patient_id, c.name,c.image from contacts c inner join users u on c.contact_id = u.contact_id where u.id = (select patient_id from " + notification_table + " where " + myId + "_id = $1) and u.role = $2";
    const values = common.trycatchForAPIs(req, res, myquery, [notification_object_id, 'patient']);
    return (values);
  }
}

// change notification status
const changeNotificationStatus = async (req, res) => {
  const { notification_id } = req.params;
  const { status } = req.query;

  const query = "UPDATE notification_logs set notification_status = $1 where notification_id = $2";

  await common.dbOperation(req, res, query, [status, notification_id]);
}

// get login sessions of doctors
const loginSessionsDoctors = async (req, res) => {
  const { doctor_id } = req.params;

  const query = "SELECT * from login_sessions where user_id = $1 and user_type = $2 order by login_timestamp desc";

  await common.dbOperation(req, res, query, [doctor_id, 'doctor']);
}

// function for getting activity logs of doctors
const getActivityLogsDoctors = async (req, res, next) => {
  const { doctor_id } = req.params;
  try {
    const getActivityLogsDoctor = await pool.query(
      "select l.log_id,(select row_to_json(logUserInfo) from(select u.id as doctor_id, (select c.name from contacts c where c.contact_id = u.contact_id),(select c.image from contacts c where c.contact_id = u.contact_id) from users u where l.log_user = u.id and u.role = $2) logUserInfo) as log_user_info, (select a.activity from activity_type a where a.activity_id = l.activity_id),(select a.activity_table from activity_type a where a.activity_id = l.activity_id), l.object_id, l.time_stamp from activity_logs l where l.log_user_type = $2 and l.log_user = $1 order by time_stamp desc", [doctor_id, 'doctor']
    );
    const values = [];
    const values1 = getActivityLogsDoctor.rows;
    var output = values1.map(async (item) => {

      const myValue = await dataFromActivityTableDoctor(req, res, item.activity_table, item.object_id, item.activity);

      values.push({ ...item, 'activity_info': myValue.rows[0] });
    });
    Promise.all(output).then(() => res.json(values)).catch(() => console.log("error"));
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// function for getting activity logs
const dataFromActivityTableDoctor = async (req, res, activity_table, object_id) => {
  const myId = activity_table.slice(0, activity_table.length - 1);
  if (activity_table === 'patient_vitals') {
    const myquery = "select u.id as patient_id,(select c.name from contacts c where c.contact_id = u.contact_id), v.name as vital_name, pv.current_value from users u, vitals v inner join patient_vitals pv on pv.vital_id = v.vital_id where pv.patient_id = u.id and pv.patient_vital_id = $1 and pv.patient_id = (select patient_id from patient_vitals pv where patient_vital_id = $1)";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  if (activity_table === 'comments') {
    const myquery = "select a.patient_id,com.appointment_id,a.date_time,com.comment,(select c.name from contacts c where c.contact_id = users.contact_id) from users, comments com inner join appointments a on a.appointment_id = com.appointment_id where a.patient_id = users.id and com.comment_id = $1 and com.appointment_id = (select appointment_id from comments where comment_id = $1)";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  if (activity_table === 'doctors_hospital_locations') {
    const myquery = "select l.location_id, c.name as location from contacts c inner join hospital_locations l on c.contact_id = l.contact_id inner join doctors_hospital_locations dhl on l.location_id = dhl.location_id where dhl.doctors_hospital_location_id = $1 and dhl.location_id = (select location_id from doctors_hospital_locations where doctors_hospital_location_id = $1)";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  if (activity_table === 'appointments') {
    const myquery = "select a.patient_id,(select c.name from contacts c where c.contact_id = u.contact_id),a.date_time from users u inner join appointments a on a.patient_id = u.id where a.appointment_id = $1 and a.patient_id = (select patient_id from appointments where appointment_id = $1)";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  if (activity_table === 'contacts') {
    const myquery = "select c.name from contacts c inner join users u on c.contact_id = u.contact_id where u.id = (select u.id from users u where contact_id = $1 and u.role = $2)";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id, 'doctor']);
    return (values);
  }
  if (activity_table === 'users') {
    const myquery = "select name from contacts where contact_id = (select u.contact_id from users u where id = $1)";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  if (activity_table === 'doctor_staffs') {
    const myquery = "select c.name from contacts c inner join users u on c.contact_id = u.contact_id inner join doctor_staffs ds on ds.staff_id = u.id where ds.doctor_staff_id = $1";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  if (activity_table === 'doctor_qualifications') {
    const myquery = "select qualification from doctor_qualifications where doctor_qualification_id = $1";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  if (activity_table === 'favourite_doctor') {
    const myquery = "select u.id as patient_id,(select c.name from contacts c where c.contact_id = u.contact_id) from users u where id = (select patient_id from favourite_doctor where favourite_id = $1)";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
  else {
    const myquery = "select u.id as patient_id,(select c.name from contacts c where c.contact_id = u.contact_id) from users u where id = (select patient_id from " + activity_table + " where " + myId + "_id = $1)";
    const values = common.trycatchForAPIs(req, res, myquery, [object_id]);
    return (values);
  }
}

// temporary API for creating a meeting for specific user
const createMeeting = (req, res) => {

  var createMeet = {
    method: 'GET',
    // Use the `me` keyword for the request below. 
    url: 'https://api.zoom.us/v2/users/8hhONHiuTBKP1aYgVY9qzQ/meetings',
    headers: {
      authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6Ik9mTi1vUURXU3dtN0VvMzdWbXlTYlEiLCJleHAiOjE5MDI3NjkyNjAsImlhdCI6MTYxODgyNDI4Mn0.1En4yjcHTAbiz2OcFJmWcsiTDMy0wH1djQIYu9IE-Rc'
    }
  };
  try {
    request(createMeet, function (error, response, body) {
      if (error) throw new Error(error);
      body = body.split("join_url")[1].split(",")[0].split("\"")[2];
      res.json({ join_url: body });
    });
  } catch (err) {
    common.customResponse(req, res, err);
  }

}

module.exports = {
  slots,
  getDoctors,
  userLogin,
  userLogout,
  doctors_profile,
  getAllHospitals,
  getDoctors,
  updateContact,
  setUrl,
  getUrl,
  updateUrl,
  deleteUrl,
  setEmail,
  getEmail,
  updateEmail,
  deleteEmail,
  doctors_profile_searchLocation,
  doctors_profile_setlocation,
  doctors_profile_getHospitalLocation,
  doctors_profile_updatelocation,
  doctors_profile_deletelocation,
  staffNurse,
  staffFD,
  staffPA,
  insertStaff,
  getStaff,
  updateStaff,
  deleteStaff,
  getAllStaffs,
  doctors_profile_setqualification,
  doctors_profile_getqualification,
  doctors_profile_updatequalification,
  doctors_profile_deletequalification,
  addVitals,
  getVitals,
  updateVitals,
  patientToken,
  changeNotificationStatus,
  getDoctorNotifications,
  loginSessionsDoctors,
  getActivityLogsDoctors,
  createMeeting,
}
