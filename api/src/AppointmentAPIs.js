const pool = require('./Config').pool;
const ApiError = require('./error/ApiError');
const common = require('./DbOperation');

//set New Appointment
const newAppointment = async (req, res, next) => {
  const { patient_id, doctor_id, doctors_hospital_location_id } = req.params;
  const { date, time, appointment_type, action_role, action_role_id } = req.body;

  var url = req.url;
  y = url.split("/");
  url = y[1];

  if (patient_id == 0 || doctor_id == 0 || doctors_hospital_location_id == 0) {
    next(ApiError.notFound('patient_id, doctor_id and location_id can not be 0'));
    return;
  }
  if (!date || !time) {
    next(ApiError.notFound('Date and Time must not be null'));
    return;
  }
  if (!appointment_type || !action_role || !action_role_id) {
    next(ApiError.notFound("Appointment type, action_role and action_role_id can't be null"));
    return;
  }
  try {

    const setApp = await pool.query(
      "INSERT INTO appointments(patient_id,doctor_id,date_time, doctors_hospital_location_id, parent_appointment_id, appointment_type) VALUES($1,$2, $3::date+$4::time, $5, (select currval('appointments_appointment_id_seq'::regclass)), $6) RETURNING appointment_id", [patient_id, doctor_id, date, time, doctors_hospital_location_id, appointment_type]
    );

    // adding patient and doctor into access table list
    await pool.query(
      "INSERT INTO access(patient_id, doctor_id) values($1, $2) on conflict (patient_id, doctor_id) do nothing", [patient_id, doctor_id]
    );
    const aid = setApp.rows[0].appointment_id;

    // adding doctor note
    await pool.query(
      "INSERT INTO doctor_notes(appointment_id, doctor_note) values($1, $2)", [aid, " "]
    );

    // create meeting
    if (appointment_type == 'telehealth') {
      // console.log("it's telehealth");
      await common.createMeeting(req, res, aid).then(
        // console.log("meeting created and saved in database")
      );
    }

    // save logging
    await common.saveLoggings('upcoming', action_role, action_role_id, aid, 'set_appointment');

    if (url === 'doctors') {
      // set appointments activity log by doctor
      await common.storeActivityLogs(doctor_id, 'doctor', 'set_appointment', aid).then(async (resp) => {
        if (resp == 'error') {
          common.customResponse(req, res, err);
        } else {
          // 
          res.json('New Appointment Inserted Successfully!');
        }
      });
      // save notification doctor
      await common.saveNotifications(patient_id, 'patient', 'set_appointment', aid);

      // popup notification doctor
      await common.popupNotifications(patient_id, doctor_id, 'Set Appointment', 'set an appointment with you.');
    }
    if (url === 'patients') {
      // set appointments activity log by patient
      await common.storeActivityLogs(patient_id, 'patient', 'set_appointment', aid).then(async (resp) => {
        if (resp == 'error') {
          common.customResponse(req, res, err);
        } else {
          res.json('New Appointment Inserted Successfully!');
        }
      });
      // save notification patient
      await common.saveNotifications(doctor_id, 'doctor', 'set_appointment', aid);
    }
  } catch (err) {
    // console.log(e.message);
    common.customResponse(req, res, err);
  }
}

// copy of appointment
const copyOfAppointment = async (req, res, next) => {

  const { appointment_id } = req.params;

  try {
    var copyApp = "INSERT INTO appointments(patient_id,doctor_id,date_time, doctors_hospital_location_id, parent_appointment_id, appointment_type, appointment_status, telehealth_url) select patient_id, doctor_id, $1, doctors_hospital_location_id, parent_appointment_id, appointment_type, $2, telehealth_url from appointments where appointment_id = $3 RETURNING appointment_id";
    const copyAppointment = await pool.query(
      copyApp, ['NOW()', 'inprogress', appointment_id]
    );
    // console.log(copyAppointment.rows[0].appointment_id);
    const copyAppId = copyAppointment.rows[0].appointment_id;

    // copy symptoms
    var copySym = "insert into appointment_symptoms(appointment_id, symptom_id) select $1, symptom_id from appointment_symptoms where appointment_id = $2";
    await pool.query(copySym, [copyAppId, appointment_id]);

    // copy diagnosis
    var copyDiag = "insert into appointment_diagnosis(appointment_id, diagnosis_id) select $1, diagnosis_id from appointment_diagnosis where appointment_id = $2";
    await pool.query(copyDiag, [copyAppId, appointment_id]);

    // copy tests
    var copyTest = "insert into appointment_medical_tests(appointment_id, patient_id, test_id, test_result, test_date_time, appointment_medical_test_id) select $1, patient_id, test_id, test_result, test_date_time, nextval('appointment_medical_tests_appointment_medical_test_id_seq'::regclass) from appointment_medical_tests where appointment_id = $2";
    await pool.query(copyTest, [copyAppId, appointment_id]);

    // copy prescriptions
    var copyPres = "insert into prescriptions(appointment_id, medicine_id, days, quantity, frequency) select $1, medicine_id, days, quantity, frequency from prescriptions where appointment_id = $2";
    await pool.query(copyPres, [copyAppId, appointment_id]);

    // copy doctor notes
    var copyDocNote = "insert into doctor_notes(appointment_id, doctor_note_id, doctor_note) select $1, nextval('doctor_notes_doctor_note_id_seq'::regclass), doctor_note from doctor_notes where appointment_id = $2 returning *";
    var dn = await pool.query(copyDocNote, [copyAppId, appointment_id]);

    if (dn.rows[0] == undefined) {
      var addDN = "insert into doctor_notes(doctor_note, appointment_id) values($1, $2)";
      await pool.query(
        addDN, ['', copyAppId]
      );
    }
    const respQuery = "SELECT a.appointment_id, a.date_time::timestamptz as date_time_of_appointment, a.parent_appointment_id, p.date_time::timestamptz as date_time_of_parent_appointment, a.appointment_status, a.appointment_type, a.telehealth_url,(select array_to_json(array_agg(row_to_json(dn))) from (select doctor_note_id, doctor_note from doctor_notes dn where a.appointment_id = dn.appointment_id order by a.date_time desc) dn) as doctors_note, (select row_to_json(appdata) from (select (select array_to_json(array_agg(row_to_json(sym))) from (select symptoms.symptom_id as id,symptoms.name as name from symptoms inner join appointment_symptoms on appointment_symptoms.symptom_id = symptoms.symptom_id where appointment_symptoms.appointment_id = a.appointment_id ) sym) as symptoms,(select array_to_json(array_agg(row_to_json(pres))) from (select medicines.medicine_id as id,medicines.name,price,amount_in_grams,prescriptions.days,prescriptions.quantity,prescriptions.frequency from medicines inner join prescriptions on prescriptions.medicine_id = medicines.medicine_id where prescriptions.appointment_id = a.appointment_id )pres) as prescription,(select array_to_json(array_agg(row_to_json(diag))) from (select diagnosis.diagnosis_id as id,diagnosis.name as name from diagnosis inner join appointment_diagnosis on appointment_diagnosis.diagnosis_id = diagnosis.diagnosis_id where appointment_diagnosis.appointment_id = a.appointment_id )diag) as diagnosis, (select array_to_json(array_agg(row_to_json(test))) from ( select medical_tests.test_id as id,medical_tests.name ,price_in_pkr, appointment_medical_tests.test_result from medical_tests inner join appointment_medical_tests on medical_tests.test_id = appointment_medical_tests.test_id where appointment_medical_tests.appointment_id = a.appointment_id ) test) as tests) appdata) as appointment_data , (select row_to_json(d) from ( select u.id as doctor_id, c.name, c.specialization, c.image,(select row_to_json(al) from (select doctors_hospital_location_id,location_id,fees,appointment_type, (select c.name as location from contacts c inner join hospital_locations l on c.contact_id = l.contact_id where location_id = dhl.location_id) as appointment_location_of_doctor,(select row_to_json(h) from(select h.hospital_id, c.name, c.image from hospital_locations, hospitals h inner join contacts c on c.contact_id = h.contact_id where hospital_locations.location_id = dhl.location_id and hospital_locations.hospital_id = h.hospital_id )h) as hospital_info from doctors_hospital_locations dhl where a.doctors_hospital_location_id = dhl.doctors_hospital_location_id) al) as appointment_location from users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.doctor_id and u.role = $3) d) as doctorinfo,  (select row_to_json(p) from (SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.patient_id and u.role = $2) p) as patientinfo ,(select array_to_json(array_agg(row_to_json(f))) from (select fee_payments.fee,fee_payments.discount_in_percentage,discount_reasons.discount_reason,fee_payments.payment from fee_payments inner join discount_reasons on discount_reasons.discount_reason_id = fee_payments.discount_reason_id where fee_payments.appointment_id = a.appointment_id  and fee_payments.patient_id = a.patient_id  and fee_payments.doctor_id = a.doctor_id)f) as fee_detail from appointments a inner join appointments p on p.appointment_id = a.parent_appointment_id where a.appointment_id = $1";

    await common.dbOperation(req, res, respQuery, [copyAppId, 'patient', 'doctor']);
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// delete appointment and all of its associated data by appointment_id
const deleteAppointment = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const { status } = req.query;

    var deleteSym = "delete from appointment_symptoms where appointment_id = $1";
    await pool.query(
      deleteSym, [appointment_id]
    );

    var deleteDiag = "delete from appointment_diagnosis where appointment_id = $1";
    await pool.query(
      deleteDiag, [appointment_id]
    );

    var deletePres = "delete from prescriptions where appointment_id = $1";
    await pool.query(
      deletePres, [appointment_id]
    );

    var deleteTests = "delete from appointment_medical_tests where appointment_id = $1";
    await pool.query(
      deleteTests, [appointment_id]
    );

    var deleteDN = "delete from doctor_notes where appointment_id = $1";
    await pool.query(
      deleteDN, [appointment_id]
    );

    if (status != "delete_app_data") {
      var deleteApp = "delete from appointments where appointment_id = $1";
      await pool.query(
        deleteApp, [appointment_id]
      );
    }
    if (status == "delete_app_data") {
      var addDN = "insert into doctor_notes(doctor_note, appointment_id) values($1, $2)";
      await pool.query(
        addDN, ['', appointment_id]
      );
    }

    res.json("Successful");
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//copy appointment data from one appointment to another appointment
const copyAppointmentData = async (req, res, next) => {

  const { app_id_from, app_id_to } = req.params;

  if (app_id_from == app_id_to) {
    next(ApiError.notFound("appointment_from_id and appointment_to_id can't be same"));
    return;
  }

  try {
    // copy symptoms
    var copySymptoms = "insert into appointment_symptoms(appointment_id, symptom_id) select $1, symptom_id from appointment_symptoms where appointment_id = $2";
    await pool.query(copySymptoms, [app_id_to, app_id_from]);

    // copy diagnosis
    var copyDiagnosis = "insert into appointment_diagnosis(appointment_id, diagnosis_id) select $1, diagnosis_id from appointment_diagnosis where appointment_id = $2";
    await pool.query(copyDiagnosis, [app_id_to, app_id_from]);

    // copy tests
    var copyTests = "insert into appointment_medical_tests(appointment_id, patient_id, test_id, test_result, test_date_time, appointment_medical_test_id) select $1, patient_id, test_id, test_result, test_date_time, nextval('appointment_medical_tests_appointment_medical_test_id_seq'::regclass) from appointment_medical_tests where appointment_id = $2";
    await pool.query(copyTests, [app_id_to, app_id_from]);

    // copy prescriptions
    var copyPrescription = "insert into prescriptions(appointment_id, medicine_id, days, quantity, frequency) select $1, medicine_id, days, quantity, frequency from prescriptions where appointment_id = $2";
    await pool.query(copyPrescription, [app_id_to, app_id_from]);

    res.json("Successful");
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//cancel Appointment by appointment_id
const cancelAppointmentByAppointmentId = async (req, res, next) => {
  const { appointment_id, patient_id, doctor_id } = req.params;
  const { action_role, action_role_id } = req.body;

  var url = req.url;
  y = url.split("/");
  url = y[1];

  if (!appointment_id || appointment_id == 0) {
    next(ApiError.notFound('appointment_id must not be null or 0'));
    return;
  }
  if (patient_id == 0 && doctor_id == 0) {
    next(ApiError.notFound('patient_id or doctor_id can not be 0'));
    return;
  }
  if (!action_role || !action_role_id) {
    next(ApiError.notFound("Action_role and action_role_id can't be null"));
    return;
  }
  const query = "UPDATE appointments SET appointment_status = $1 WHERE appointment_id = $2";

  await common.dbOperation(req, res, query, ['cancelled', appointment_id]);

  // save logging
  await common.saveLoggings('cancelled', action_role, action_role_id, appointment_id, 'cancel_appointment');

  if (url === 'doctors') {
    // cancel appointments activity log by doctor
    await common.storeActivityLogs(doctor_id, 'doctor', 'cancel_appointment', appointment_id).then(
      console.log("cancel appointments activity inserted by doctor")
    );
    // save notification doctor
    await common.saveNotifications(patient_id, 'patient', 'cancel_appointment', appointment_id);

    // popup notification doctor
    await common.popupNotifications(patient_id, doctor_id, 'Cancel Appointment', 'cancelled an appointment with you.');
  }
  if (url === 'patients') {
    // cancel appointments activity log by patient
    await common.storeActivityLogs(patient_id, 'patient', 'cancel_appointment', appointment_id).then(
      console.log("cancel appointments activity inserted by patient")
    );
    // save notification patient
    await common.saveNotifications(doctor_id, 'doctor', 'cancel_appointment', appointment_id);
  }
}

//reschedule Appointment by appointment id
const rescheduleAppointment = async (req, res, next) => {
  const { appointment_id, doctors_hospital_location_id, patient_id, doctor_id } = req.params;
  const { date, time, appointment_type, action_role, action_role_id } = req.body;

  var url = req.url;
  y = url.split("/");
  url = y[1];

  if (appointment_id == 0 || !appointment_id || doctors_hospital_location_id == 0 || !doctors_hospital_location_id) {
    next(ApiError.notFound('appointment_id or location_id can not be 0'));
    return;
  }
  if (!date || !time || !appointment_type || !action_role || !action_role_id) {
    next(ApiError.notFound('Date, Time, appointmnet_type,action_role and action_role_id can not be null'));
    return;
  }
  if (patient_id == 0 && doctor_id == 0) {
    next(ApiError.notFound('doctor_id or patient_id cannot be 0'));
    return;
  }
  try {
    var rescheduledApp = "UPDATE appointments SET appointment_status = $1 where appointment_id = $2";
    const resAppointment = await pool.query(
      rescheduledApp, ['rescheduled', appointment_id]
    );

    var resApp = "INSERT INTO appointments(patient_id, doctor_id,  date_time, doctors_hospital_location_id, parent_appointment_id, appointment_type, appointment_status, telehealth_url) select patient_id, doctor_id, $1::date + $2::time, $3, parent_appointment_id, $4, $5, telehealth_url from appointments where appointment_id = $6 RETURNING appointment_id";
    const reschAppointment = await pool.query(
      resApp, [date, time, doctors_hospital_location_id, appointment_type, 'upcoming', appointment_id]
    );
    //create meeting
    if (appointment_type == 'telehealth') {
      // console.log("it's telehealth");
      await common.createMeeting(req, res, appointment_id).then(
      );
    }

    // save logging
    await common.saveLoggings('upcoming', action_role, action_role_id, appointment_id, 'reschedule_appointment');

    if (url === 'doctors') {
      // reschedule appointments activity log by doctor
      await common.storeActivityLogs(doctor_id, 'doctor', 'reschedule_appointment', appointment_id).then(
        console.log("reschedule appointments activity inserted by doctor")
      );
      // save notification doctor
      await common.saveNotifications(patient_id, 'patient', 'reschedule_appointment', appointment_id);

      // popup notification doctor
      await common.popupNotifications(patient_id, doctor_id, 'Reschedule Appointment', 'reschedule an appointment with you.');
    }
    if (url === 'patients') {
      // reschedule appointments activity log by patient
      await common.storeActivityLogs(patient_id, 'patient', 'reschedule_appointment', appointment_id).then(
        console.log("reschedule appointments activity inserted by patient")
      );
      // save notification patient
      await common.saveNotifications(doctor_id, 'doctor', 'reschedule_appointment', appointment_id);
    }
    res.json("Successful");
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//change Appointment status by appointment_id
const updateAppointmentStatus = async (req, res, next) => {
  const { appointment_id } = req.params;
  const { appointment_status } = req.query;
  const { action_role, action_role_id } = req.body;

  if (!appointment_id || appointment_id == 0) {
    next(ApiError.notFound('appointment_id must not be null or 0'));
  }
  if (!action_role || !action_role_id) {
    next(ApiError.notFound("Action_role and action_role_id can't be null"));
    return;
  }

  const query = "UPDATE appointments SET appointment_status = $1 WHERE appointment_id = $2";

  await common.dbOperation(req, res, query, [appointment_status, appointment_id]);

  if (appointment_status == 'inprogress') {
    // save logging
    await common.saveLoggings('inprogress', action_role, action_role_id, appointment_id, 'start_appointment');

    //activity
    await common.storeActivityLogs(action_role_id, action_role, 'start_appointment', appointment_id);
  }

  if (appointment_status == 'waiting') {
    // save logging
    await common.saveLoggings('waiting', action_role, action_role_id, appointment_id, 'check_in');

    //activity
    await common.storeActivityLogs(action_role_id, action_role, 'check_in', appointment_id);
  }

  if (appointment_status == 'hold') {
    // save logging
    await common.saveLoggings('hold', action_role, action_role_id, appointment_id, 'move_back_to_waiting');

    //activity
    await common.storeActivityLogs(action_role_id, action_role, 'move_back_to_waiting', appointment_id);
  }

  if (appointment_status == 'completed') {
    // save logging
    await common.saveLoggings('completed', action_role, action_role_id, appointment_id, 'completed_appointment');

    //activity
    await common.storeActivityLogs(action_role_id, action_role, 'completed_appointment', appointment_id);
  }

  if (appointment_status == 'edit') {
    // save logging
    await common.saveLoggings('edit', action_role, action_role_id, appointment_id, 'edit_appointment');

    //activity
    await common.storeActivityLogs(action_role_id, action_role, 'edit_appointment', appointment_id);
  }

  if (appointment_status == 'vitals') {
    // save logging
    await common.saveLoggings('vitals', action_role, action_role_id, appointment_id, 'add_vital');
  }

  if (appointment_status == 'cancelled') {
    const query1 = "update appointments set telehealth_url = $1 where appointment_id = $2";

    try {
      await pool.query(query1, ['', appointment_id]);
    } catch (err) {
      common.customResponse(req, res, err);
    }
  }
}

// List all appointments of a doctor by selected date
const getAppointmentsByDate = async (req, res) => {
  var { patient_id, doctor_id, doctors_hospital_location_id } = req.params;
  const { selected_date } = req.query;

  if (patient_id == 0) {
    patient_id = null;
  }
  if (doctor_id == 0) {
    doctor_id = null;
  }
  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  const query = "SELECT appointment_id,parent_appointment_id,(select row_to_json(p) from (SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id WHERE u.id = a.patient_id) p) as patient,doctor_id,date_time,appointment_status, telehealth_url, appointment_type,doctors_hospital_location_id,(select array_to_json(array_agg(row_to_json(dn))) from (select doctor_note_id, doctor_note from doctor_notes dn where a.appointment_id = dn.appointment_id order by a.date_time desc) dn) as doctors_note,(select row_to_json(al) from (select location_id,doctors_hospital_location_id,fees,appointment_type, (select c.name as location from contacts c inner join hospital_locations l on c.contact_id = l.contact_id where location_id = dhl.location_id) as appointment_location_of_doctor from doctors_hospital_locations dhl where a.doctors_hospital_location_id = dhl.doctors_hospital_location_id) al) as appointment_location from appointments a where ($1::int is null or patient_id = $1) and ($2::int is null or doctor_id = $2) and ($3::int is null or doctors_hospital_location_id = $3) and date_time::date = $4 ORDER BY date_time::time desc";

  await common.dbOperation(req, res, query, [patient_id, doctor_id, doctors_hospital_location_id, selected_date]);
}

// List all appointments of a doctor between selected dates
const getAppointmentsBetweenDate = async (req, res) => {
  var { patient_id, doctor_id, doctors_hospital_location_id, start_date, end_date } = req.params;

  if (patient_id == 0) {
    patient_id = null;
  }
  if (doctor_id == 0) {
    doctor_id = null;
  }
  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  const query = "SELECT appointment_id,parent_appointment_id,(select row_to_json(p) from (SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id WHERE u.id = a.patient_id and u.role = $6) p) as patient, doctor_id, date_time,appointment_status, telehealth_url, appointment_type, doctors_hospital_location_id, (select array_to_json(array_agg(row_to_json(dn))) from (select doctor_note_id, doctor_note from doctor_notes dn where a.appointment_id = dn.appointment_id order by a.date_time desc) dn) as doctors_note,(select row_to_json(al) from (select location_id,doctors_hospital_location_id,fees,appointment_type, (select c.name as location from contacts c inner join hospital_locations l on c.contact_id = l.contact_id where location_id = dhl.location_id) as appointment_location_of_doctor from doctors_hospital_locations dhl where a.doctors_hospital_location_id = dhl.doctors_hospital_location_id) al) as appointment_location from appointments a where ($1::int is null or patient_id = $1) and ($2::int is null or doctor_id = $2) and ($3::int is null or doctors_hospital_location_id = $3) and date_time BETWEEN $4 AND $5 ORDER BY date_time::time desc";

  await common.dbOperation(req, res, query, [patient_id, doctor_id, doctors_hospital_location_id, start_date, end_date, 'patient']);
}

// doctor's appointment list
const getAppointmentslist = async (req, res) => {
  var { patient_id, doctor_id, doctors_hospital_location_id } = req.params;

  if (patient_id == 0) {
    patient_id = null;
  }
  if (doctor_id == 0) {
    doctor_id = null;
  }
  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  const query = "SELECT a.appointment_id, a.date_time::timestamptz as date_time_of_appointment, a.parent_appointment_id, p.date_time::timestamptz as date_time_of_parent_appointment, a.appointment_status, (select row_to_json(p) from (SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.patient_id and u.role = $4) p) as patientinfo  from appointments a inner join appointments p on p.appointment_id = a.parent_appointment_id where ($1::int is null or a.patient_id = $1)  and ($2::int is null or a.doctor_id = $2) and ($3::int is null or a.doctors_hospital_location_id = $3) AND a.appointment_status = 'completed'";

  await common.dbOperation(req, res, query, [patient_id, doctor_id, doctors_hospital_location_id, 'patient']);
}

//get appointments history
const getAppointmentsHistory = async (req, res) => {
  var { patient_id, doctor_id, doctors_hospital_location_id, appointment_id } = req.params;
  const { status } = req.query;

  if (patient_id == 0) {
    patient_id = null;
  }
  if (doctor_id == 0) {
    doctor_id = null;
  }
  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  if (appointment_id == 0) {
    appointment_id = null;
  }
  const query = "SELECT a.appointment_id, a.date_time::timestamptz as date_time_of_appointment, a.parent_appointment_id, p.date_time::timestamptz as date_time_of_parent_appointment, a.appointment_status, a.appointment_type, a.telehealth_url,(select array_to_json(array_agg(row_to_json(dn))) from (select doctor_note_id, doctor_note from doctor_notes dn where a.appointment_id = dn.appointment_id order by a.date_time desc) dn) as doctors_note, (select row_to_json(appdata) from (select (select array_to_json(array_agg(row_to_json(sym))) from (select symptoms.symptom_id as id,symptoms.name as name from symptoms inner join appointment_symptoms on appointment_symptoms.symptom_id = symptoms.symptom_id where appointment_symptoms.appointment_id = a.appointment_id ) sym) as symptoms,(select array_to_json(array_agg(row_to_json(pres))) from (select medicines.medicine_id as id,medicines.name,medicines.medicine_type,price,amount_in_grams,prescriptions.days,prescriptions.quantity,prescriptions.frequency from medicines inner join prescriptions on prescriptions.medicine_id = medicines.medicine_id where prescriptions.appointment_id = a.appointment_id )pres) as prescriptions,(select array_to_json(array_agg(row_to_json(diag))) from (select diagnosis.diagnosis_id as id,diagnosis.name as name from diagnosis inner join appointment_diagnosis on appointment_diagnosis.diagnosis_id = diagnosis.diagnosis_id where appointment_diagnosis.appointment_id = a.appointment_id )diag) as diagnosis, (select array_to_json(array_agg(row_to_json(test))) from ( select medical_tests.test_id as id,medical_tests.name ,price_in_pkr, appointment_medical_tests.test_result from medical_tests inner join appointment_medical_tests on medical_tests.test_id = appointment_medical_tests.test_id where appointment_medical_tests.appointment_id = a.appointment_id ) test) as tests) appdata) as appointment_data , (select row_to_json(d) from ( select u.id as doctor_id, c.name, c.specialization, c.image, (select row_to_json(al) from (select doctors_hospital_location_id,location_id,(select row_to_json(f) from(select f.fee, f.discount_in_percentage, f.payment from fee_payments f where f.appointment_id = a.appointment_id)f) as fee_details, appointment_type, (select row_to_json(locdata) from (select (select c.name as location from contacts c inner join hospital_locations l on c.contact_id = l.contact_id where location_id = dhl.location_id) as appointment_location_of_doctor, (select ph.number from phone_numbers ph inner join hospital_locations l on ph.contact_id = l.contact_id where location_id = dhl.location_id) as phone_number,(select array_to_json(array_agg(row_to_json(dsh))) from (select ds.day_of_week, ds.start_time, ds.end_time, ds.is_open from doctors_schedule ds where ds.doctors_hospital_location_id = dhl.doctors_hospital_location_id) dsh) as schedule) locdata) as location_info ,(select row_to_json(h) from(select h.hospital_id, c.name, c.image from hospital_locations, hospitals h inner join contacts c on c.contact_id = h.contact_id  where hospital_locations.location_id = dhl.location_id and hospital_locations.hospital_id = h.hospital_id )h) as hospital_info from doctors_hospital_locations dhl where a.doctors_hospital_location_id = dhl.doctors_hospital_location_id) al) as appointment_location,(select array_to_json(array_agg(row_to_json(q))) from (select doctor_qualification_id,qualification from doctor_qualifications WHERE u.id = doctor_qualifications.doctor_id) q) as qualification from users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.doctor_id  and u.role = $6) d) as doctorinfo,  (select row_to_json(p) from (SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.patient_id and u.role = $7) p) as patientinfo from appointments a inner join appointments p on p.appointment_id = a.parent_appointment_id where ($1::int is null or a.patient_id = $1)  and ($2::int is null or a.doctor_id = $2) and ($3::int is null or a.doctors_hospital_location_id = $3) and ($5::int is null or a.appointment_id = $5) AND a.appointment_status = $4";

  await common.dbOperation(req, res, query, [patient_id, doctor_id, doctors_hospital_location_id, status, appointment_id, 'doctor', 'patient']);
}

//get completed appointments
const getCompletedAppointments = async (req, res) => {
  var { patient_id, doctor_id, doctors_hospital_location_id } = req.params;

  if (patient_id == 0) {
    patient_id = null;
  }
  if (doctor_id == 0) {
    doctor_id = null;
  }
  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  const query = "SELECT a.appointment_id, a.date_time::timestamptz as date_time_of_appointment, a.parent_appointment_id, p.date_time::timestamptz as date_time_of_parent_appointment, a.appointment_status, (select array_to_json(array_agg(row_to_json(dn))) from (select doctor_note_id, doctor_note from doctor_notes dn where a.appointment_id = dn.appointment_id order by a.date_time desc) dn) as doctors_note, (select row_to_json(appdata) from (select (select array_to_json(array_agg(row_to_json(pres))) from (select m.medicine_id as id, m.name as medicine_name from medicines m inner join prescriptions pp on pp.medicine_id = m.medicine_id where pp.appointment_id = a.appointment_id ) pres) as prescription, (select array_to_json(array_agg(row_to_json(test))) from (select mt.test_id as id,mt.name as test_name from medical_tests mt inner join appointment_medical_tests amt on mt.test_id = amt.test_id where amt.appointment_id = a.appointment_id ) test) as tests) appdata) as appointment_data , (select row_to_json(d) from ( select u.id as doctor_id, c.name, c.specialization, c.image,(select row_to_json(al) from (select location_id,fees,appointment_type, (select c.name as location from contacts c inner join hospital_locations l on c.contact_id = l.contact_id where location_id = dhl.location_id) as appointment_location_of_doctor from doctors_hospital_locations dhl where a.doctors_hospital_location_id = dhl.doctors_hospital_location_id) al) as appointment_location from users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.doctor_id and u.role = $5) d) as doctorinfo, (select row_to_json(p) from (SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.patient_id and u.role = $4) p) as patientinfo from appointments a inner join appointments p on p.appointment_id = a.parent_appointment_id where ($1::int is null or a.patient_id = $1)  and ($2::int is null or a.doctor_id = $2) and ($3::int is null or a.doctors_hospital_location_id = $3) AND a.appointment_status = 'completed'";

  await common.dbOperation(req, res, query, [patient_id, doctor_id, doctors_hospital_location_id, 'patient', 'doctor']);
}

// get current day's appointment stats of a doctor
const appointmentsStats = async (req, res, next) => {
  var { doctor_id, doctors_hospital_location_id } = req.params;

  const { date } = req.body;

  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  if (doctor_id == 0) {
    next(ApiError.notFound('doctor_id and location_id can not be 0'));
    return;
  }
  if (!date) {
    next(ApiError.notFound('date field missing!'));
    return;
  }
  const query = "SELECT a.doctor_id, a.date_time::date as today,(select row_to_json(astats) from(select(select row_to_json(g1) from(select (select count(*) as total_appointments from appointments where date_time::date = $3::date and doctor_id = $1 and ($2::int is null or doctors_hospital_location_id = $2)),(select count(*) as completed_appointments from appointments where date_time::date = $3::date and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status IN ('completed')),(select count(*) as waiting_appointments from appointments where date_time::date = $3::date and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status IN ('waiting')),(select count(*) as hold_appointments from appointments where date_time::date = $3::date and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status IN ('hold')),(select count(*) as inprogress_appointments from appointments where date_time::date = $3::date and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status IN ('inprogress')),(select count(*) as reschedule_appointments from appointments where date_time::date = $3::date and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status IN ('rescheduled')),(select count(*) as remaining_appointments from appointments where date_time::date = $3::date and doctor_id = $1 and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status IN ('upcoming')))g1)as graph_one, (select row_to_json(g2) from(select (select count(*) as cancelled_appointments from appointments where date_time::date = $3::date and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status = 'cancelled'),(select count(*) as showed_appointments from appointments where date_time::date = $3::date and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status = 'completed'))g2)as graph_two, (select row_to_json(g3) from(select (select count(*) as new_appointments from appointments where date_time::date = $3::date and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_id = parent_appointment_id), (select count(*) as followups from appointments where date_time::date = $3::date and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_id != parent_appointment_id))g3)as graph_three) astats) as appointment_stats, (select array_to_json(array_agg(row_to_json(cp))) from(select ca.appointment_id, ca.doctor_id, ca.date_time,ca.patient_id, (select row_to_json(cap) from(SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = ca.patient_id and u.role = $4) cap)as patient_info from appointments ca where ca.appointment_status='inprogress' and ca.date_time::date = $3::date and ca.doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2)) cp)as current_patient, (select row_to_json(np) from(select na.appointment_id, na.doctor_id, na.date_time, na.patient_id, (select row_to_json(nap) from(SELECT u1.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u1 inner join contacts c on c.contact_id = u1.contact_id where u1.id = na.patient_id and u1.role = $4) nap)as patient_info from appointments na where na.appointment_status='upcoming' and na.date_time::date = $3::date and na.doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) order by date_time asc limit 1) np)as next_patient from appointments a where a.date_time::date = $3::date and a.doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) limit 1";

  await common.dbOperation(req, res, query, [doctor_id, doctors_hospital_location_id, date, 'patient']);
}

// get current day's appointment stats of a doctor between dates
const appointmentsStatsBetweenDate = async (req, res, next) => {
  var { doctor_id, doctors_hospital_location_id, start_date, end_date } = req.params;

  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  if (doctor_id == 0) {
    next(ApiError.notFound('doctor_id and location_id can not be 0'));
    return;
  }
  const query = "SELECT a.doctor_id, (select row_to_json(astats) from(select(select row_to_json(g1) from(select (select count(*) as total_appointments from appointments where date_time BETWEEN $3 AND $4 and doctor_id = $1 and ($2::int is null or doctors_hospital_location_id = $2)),(select count(*) as completed_appointments from appointments where date_time BETWEEN $3 AND $4 and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status IN ('completed')),(select count(*) as waiting_appointments from appointments where date_time BETWEEN $3 AND $4 and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status IN ('waiting')),(select count(*) as hold_appointments from appointments where date_time BETWEEN $3 AND $4 and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status IN ('hold')),(select count(*) as inprogress_appointments from appointments where date_time BETWEEN $3 AND $4 and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status IN ('inprogress')),(select count(*) as reschedule_appointments from appointments where date_time BETWEEN $3 AND $4 and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status IN ('rescheduled')),(select count(*) as remaining_appointments from appointments where date_time BETWEEN $3 AND $4 and doctor_id = $1 and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status IN ('upcoming')))g1)as graph_one, (select row_to_json(g2) from(select (select count(*) as cancelled_appointments from appointments where date_time BETWEEN $3 AND $4 and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status = 'cancelled'),(select count(*) as showed_appointments from appointments where date_time BETWEEN $3 AND $4 and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_status = 'completed'))g2)as graph_two, (select row_to_json(g3) from(select (select count(*) as new_appointments from appointments where date_time BETWEEN $3 AND $4 and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_id = parent_appointment_id), (select count(*) as followups from appointments where date_time BETWEEN $3 AND $4 and doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) and appointment_id != parent_appointment_id))g3)as graph_three) astats) as appointment_stats, (select array_to_json(array_agg(row_to_json(cp))) from(select ca.appointment_id, ca.doctor_id, ca.date_time,ca.patient_id, (select row_to_json(cap) from(SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = ca.patient_id and u.role = $5) cap)as patient_info from appointments ca where ca.appointment_status='inprogress' and ca.date_time BETWEEN $3 AND $4 and ca.doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2)) cp)as current_patient, (select row_to_json(np) from(select na.appointment_id, na.doctor_id, na.date_time, na.patient_id, (select row_to_json(nap) from(SELECT u1.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u1 inner join contacts c on c.contact_id = u1.contact_id where u1.id = na.patient_id and u1.role = $5) nap)as patient_info from appointments na where na.appointment_status='upcoming' and na.date_time BETWEEN $3 AND $4 and na.doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) order by date_time asc limit 1) np)as next_patient from appointments a where a.date_time BETWEEN $3 AND $4 and a.doctor_id = $1  and ($2::int is null or doctors_hospital_location_id = $2) limit 1";

  await common.dbOperation(req, res, query, [doctor_id, doctors_hospital_location_id, start_date, end_date, 'patient']);
}

// get current day's appointment queue of a doctor
const appointmentsQueue = async (req, res, next) => {
  var { doctor_id, doctors_hospital_location_id } = req.params;

  if (doctor_id == 0) {
    next(ApiError.notFound('doctor_id can not be 0'));
    return;
  }
  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  const query = "SELECT a.doctor_id, (select array_to_json(array_agg(row_to_json(queue))) from(select a.appointment_id, a.doctor_id, a.date_time as appointment_date_time, a.patient_id, (select row_to_json(pi) from( SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.patient_id and role = $3) pi)as patient_info from appointments a where a.appointment_status='upcoming' and a.date_time::date = NOW()::date and a.doctor_id = $1 and ($2::int is null or a.doctors_hospital_location_id = $2) order by date_time asc ) queue)as patients_appointments_queue from appointments a where a.date_time::date = NOW()::date and a.doctor_id = $1 and ($2::int is null or a.doctors_hospital_location_id = $2) limit 1";

  await common.dbOperation(req, res, query, [doctor_id, doctors_hospital_location_id, 'patient']);
}

//get appointment detail || followUps( by status = followups) by appointment id
const getAppointmentDetail = async (req, res, next) => {
  var { appointment_id, patient_id } = req.params;
  const { status } = req.query;

  if (patient_id == 0) {
    patient_id = null;
  }
  if (appointment_id == 0) {
    appointment_id = null;
  }
  try {

    if (status === 'followups') {
      if (appointment_id == 0 || !appointment_id) {
        next(ApiError.notFound('Please send correct value(s) in params'));
        return;
      }
      const getFollowUps = await pool.query(
        "select array_to_json(coalesce(array_agg(row_to_json(t)) filter (where row_to_json(t) is not null), '{}')) from (select a.appointment_id, a.date_time::timestamptz as date_time_of_appointment, a.parent_appointment_id, p.date_time::timestamptz as date_time_of_parent_appointment, a.appointment_status,a.appointment_type, (select array_to_json(array_agg(row_to_json(dn))) from (select doctor_note_id, doctor_note from doctor_notes dn where a.appointment_id = dn.appointment_id order by a.date_time desc) dn) as doctors_note, (select row_to_json(appdata) from (select (select array_to_json(array_agg(row_to_json(pres))) from (select name as medicine_name, price, p.frequency as dosages, p.days, p.quantity from medicines m inner join prescriptions p on p.medicine_id = m.medicine_id where p.appointment_id = a.appointment_id ) pres) as prescription, (select array_to_json(array_agg(row_to_json(sym))) from (select s.name from symptoms s inner join appointment_symptoms asym on asym.symptom_id = s.symptom_id where asym.appointment_id = a.appointment_id) sym) as symptoms,  (select array_to_json(array_agg(row_to_json(diag))) from (select d.name from diagnosis d inner join appointment_diagnosis ad on ad.diagnosis_id = d.diagnosis_id where ad.appointment_id = a.appointment_id) diag) as diagnosis, (select array_to_json(array_agg(row_to_json(test))) from (select amt.test_id, name as test_name, price_in_pkr as test_price, amt.test_result from medical_tests mt inner join appointment_medical_tests amt on mt.test_id = amt.test_id where amt.appointment_id = a.appointment_id ) test) as tests) appdata) as appointment_data , (select row_to_json(d) from (select u.id as doctor_id, c.name, c.specialization, c.image,(select row_to_json(al) from (select location_id,fees, (select c.name as location from contacts c inner join hospital_locations l on c.contact_id = l.contact_id where location_id = dhl.location_id) as appointment_location_of_doctor,(select c.address from contacts c inner join hospital_locations l on c.contact_id = l.contact_id where location_id = dhl.location_id) as address,(select ph.number from phone_numbers ph inner join hospital_locations l on ph.contact_id = l.contact_id where location_id = dhl.location_id) as phone_number,(select row_to_json(h) from(select h.hospital_id, c.name, c.image from hospital_locations, hospitals h inner join contacts c on c.contact_id = h.contact_id  where hospital_locations.location_id = dhl.location_id and hospital_locations.hospital_id = h.hospital_id )h) as hospital_info from doctors_hospital_locations dhl where a.doctors_hospital_location_id = dhl.doctors_hospital_location_id) al) as appointment_location from users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.doctor_id and u.role = $3) d) as doctorinfo,  (select row_to_json(p) from (SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.patient_id and u.role = $2) p) as patientinfo, (select row_to_json(noc) from (select count(*) from comments where appointment_id = a.appointment_id) noc) as no_of_comments  from appointments a inner join appointments p on p.appointment_id = a.parent_appointment_id where a.parent_appointment_id = (select distinct parent_appointment_id from appointments where appointment_id = $1) AND a.appointment_status = 'completed' ORDER BY a.date_time desc) t", [appointment_id, 'patient', 'doctor']);

      res.json(getFollowUps.rows[0].array_to_json);
    }
    else if (status === 'followup_trail') {
      const followup_trail = await pool.query(
        "select array_to_json(coalesce(array_agg(row_to_json(fgw)) filter (where row_to_json(fgw) is not null), '{}')) from (select a.parent_appointment_id, (select array_to_json(coalesce(array_agg(row_to_json(fup)) filter (where row_to_json(fup) is not null), '{}')) from (select fa.appointment_id, fa.date_time as date_time_of_appointment,  fa.parent_appointment_id, p.date_time as date_time_of_parent_appointment, (SELECT sl.state_changing_time as started_at from state_logging sl where sl.state_to = 'inprogress' and sl.appointment_id = a.appointment_id), fa.appointment_status, (select array_to_json(array_agg(row_to_json(dn))) from (select dn.doctor_note_id, dn.doctor_note from doctor_notes dn where fa.appointment_id = dn.appointment_id) dn) as doctors_note, (select row_to_json(appdata) from (select (select array_to_json(array_agg(row_to_json(sym))) from (select s.name from symptoms s inner join appointment_symptoms asym on s.symptom_id = asym.symptom_id where asym.appointment_id = fa.appointment_id) sym) as symptoms, (select array_to_json(array_agg(row_to_json(diag))) from (select di.name from diagnosis di inner join appointment_diagnosis ad on di.diagnosis_id = ad.diagnosis_id where ad.appointment_id = fa.appointment_id) diag) as diagnosis, (select array_to_json(array_agg(row_to_json(tests))) from ( select mt.name, mt.price_in_pkr, mt.test_id, amt.test_result from medical_tests mt inner join appointment_medical_tests amt on mt.test_id = amt.test_id where amt.appointment_id = fa.appointment_id order by amt.test_date_time desc) tests) as tests, (select array_to_json(array_agg(row_to_json(pres))) from (select m.name, m.price, m.medicine_type, p.frequency, p.quantity, p.days from medicines m inner join prescriptions p on p.medicine_id = m.medicine_id where p.appointment_id = fa.appointment_id) pres) as prescriptions) appdata) as appointment_data, (select row_to_json(dinfo) from (select u.id as doctor_id, c.name, c.specialization, c.image, (select row_to_json(al) from (select location_id, (select row_to_json(f) from(select f.fee, f.discount_in_percentage, f.payment from fee_payments f where f.appointment_id = a.appointment_id)f) as fee_details, appointment_type,(select row_to_json(locdata) from (select (select cc.name as location from contacts cc inner join hospital_locations l on cc.contact_id = l.contact_id where l.location_id = dhl.location_id) as appointment_location_of_doctor,(select contacts.address from contacts inner join hospital_locations on contacts.contact_id = hospital_locations.contact_id where location_id = dhl.location_id) as address,(select ph.number from phone_numbers ph inner join hospital_locations on ph.contact_id = hospital_locations.contact_id where hospital_locations.location_id = dhl.location_id) as phone_number,(select array_to_json(array_agg(row_to_json(dsh))) from (select ds.day_of_week, ds.start_time, ds.end_time, ds.is_open from doctors_schedule ds where ds.doctors_hospital_location_id = dhl.doctors_hospital_location_id) dsh) as schedule from doctors_hospital_locations dhl where fa.doctors_hospital_location_id = dhl.doctors_hospital_location_id) locdata) as location_info,(select row_to_json(h) from(select h.hospital_id, c.name, c.image from hospital_locations, hospitals h inner join contacts c on c.contact_id = h.contact_id  where hospital_locations.location_id = doctors_hospital_locations.location_id and hospital_locations.hospital_id = h.hospital_id )h) as hospital_info from doctors_hospital_locations where a.doctors_hospital_location_id = doctors_hospital_locations.doctors_hospital_location_id) al) as appointment_location, (select array_to_json(array_agg(row_to_json(q))) from (select doctor_qualification_id,qualification from doctor_qualifications df WHERE u.id = df.doctor_id) q) as qualification from users u inner join contacts c on c.contact_id = u.contact_id where u.id = fa.doctor_id and u.role = $4) dinfo) as doctorinfo, (select row_to_json(pinfo) from (SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = fa.patient_id and u.role = $3) pinfo) as patientinfo,(select row_to_json(noc) from (select count(*) from comments where appointment_id = a.appointment_id) noc) as no_of_comments from appointments fa where fa.parent_appointment_id = a.parent_appointment_id and fa.appointment_status = 'completed' order by fa.date_time desc) fup) as followups from appointments a inner join appointments p on p.appointment_id = a.parent_appointment_id where ($1::int is null or a.patient_id = $1) and ($2::int is null or a.parent_appointment_id = $2) and a.appointment_id = a.parent_appointment_id and a.appointment_status = 'completed' order by a.date_time asc) fgw", [patient_id, appointment_id, 'patient', 'doctor']);

      res.json(followup_trail.rows[0].array_to_json);
    }
    else if (status === 'inprogress_data') {
      const inprogress_data = await pool.query(
        "SELECT a.appointment_id, a.date_time::timestamptz as date_time_of_appointment, a.parent_appointment_id, p.date_time::timestamptz as date_time_of_parent_appointment, a.appointment_status, a.appointment_type, a.telehealth_url,(select array_to_json(array_agg(row_to_json(dn))) from (select doctor_note_id, doctor_note from doctor_notes dn where a.appointment_id = dn.appointment_id order by a.date_time desc) dn) as doctors_note, (select row_to_json(appdata) from (select (select array_to_json(array_agg(row_to_json(sym))) from (select s.symptom_id as id,s.name as name from symptoms s inner join appointment_symptoms ats on ats.symptom_id = s.symptom_id where ats.appointment_id = a.appointment_id ) sym) as symptoms,(select array_to_json(array_agg(row_to_json(pres))) from (select m.medicine_id as id,m.name,price,amount_in_grams,p.days,p.quantity,p.frequency from medicines m inner join prescriptions p on p.medicine_id = m.medicine_id where p.appointment_id = a.appointment_id )pres) as prescriptions,(select array_to_json(array_agg(row_to_json(diag))) from (select d.diagnosis_id as id,d.name as name from diagnosis d inner join appointment_diagnosis ad on ad.diagnosis_id = d.diagnosis_id where ad.appointment_id = a.appointment_id )diag) as diagnosis, (select array_to_json(array_agg(row_to_json(test))) from (select mt.test_id as id,mt.name ,price_in_pkr, amt.test_result from medical_tests mt inner join appointment_medical_tests amt on mt.test_id = amt.test_id where amt.appointment_id = a.appointment_id ) test) as tests) appdata) as appointment_data , (select row_to_json(d) from ( select u.id as doctor_id, c.name, c.specialization, c.image,(select row_to_json(al) from (select doctors_hospital_location_id,location_id,(select row_to_json(f) from(select f.fee, f.discount_in_percentage, f.payment from fee_payments f where f.appointment_id = a.appointment_id)f) as fee_details,appointment_type,(select row_to_json(locdata) from (select (select cc.name as location from contacts cc inner join hospital_locations l on cc.contact_id = l.contact_id where l.location_id = dhl.location_id) as appointment_location_of_doctor,(select contacts.address from contacts inner join hospital_locations on contacts.contact_id = hospital_locations.contact_id where location_id = dhl.location_id) as address,(select ph.number from phone_numbers ph inner join hospital_locations on ph.contact_id = hospital_locations.contact_id where hospital_locations.location_id = dhl.location_id) as phone_number,(select array_to_json(array_agg(row_to_json(dsh))) from (select ds.day_of_week, ds.start_time, ds.end_time, ds.is_open from doctors_schedule ds where ds.doctors_hospital_location_id = dhl.doctors_hospital_location_id) dsh) as schedule from doctors_hospital_locations dhl where a.doctors_hospital_location_id = dhl.doctors_hospital_location_id) locdata) as location_info,(select row_to_json(h) from(select h.hospital_id, c.name, c.image from hospital_locations, hospitals h inner join contacts c on c.contact_id = h.contact_id  where hospital_locations.location_id = dhl.location_id and hospital_locations.hospital_id = h.hospital_id )h) as hospital_info from doctors_hospital_locations dhl where a.doctors_hospital_location_id = dhl.doctors_hospital_location_id) al) as appointment_location from users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.doctor_id and u.role = $4) d) as doctorinfo,  (select row_to_json(p) from (SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.patient_id and u.role = $3) p) as patientinfo from appointments a inner join appointments p on p.appointment_id = a.parent_appointment_id where ($1::int is null or a.patient_id = $1) and ($2::int is null or a.appointment_id = $2) AND a.appointment_status = 'inprogress'", [patient_id, appointment_id, 'patient', 'doctor']);

      res.json(inprogress_data.rows);
    }
    else {
      const appointmentDetail = await pool.query(
        'select * from appointments where appointment_id = $1', [appointment_id]);

      res.json(appointmentDetail.rows);
    }
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//get appointments
const getAppointments = async (req, res) => {
  var { patient_id, doctor_id, doctors_hospital_location_id } = req.params;
  const { status } = req.query;

  if (patient_id == 0) {
    patient_id = null;
  }
  if (doctor_id == 0) {
    doctor_id = null;
  }
  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  try {

    if (status === 'completed') {
      const getCompleteAppointments = await pool.query(
        "select array_to_json(coalesce(array_agg(row_to_json(t)) filter (where row_to_json(t) is not null), '{}')) from (select a.appointment_id, a.date_time::timestamptz as date_time_of_appointment, a.parent_appointment_id, p.date_time::timestamptz as date_time_of_parent_appointment, a.appointment_status, a.appointment_type, (select array_to_json(array_agg(row_to_json(dn))) from (select doctor_note_id, doctor_note from doctor_notes dn where a.appointment_id = dn.appointment_id order by a.date_time desc) dn) as doctors_note, (select row_to_json(appdata) from (select (select array_to_json(array_agg(row_to_json(pres))) from (select m.name as medicine_name from medicines m inner join prescriptions p on p.medicine_id = m.medicine_id where p.appointment_id = a.appointment_id ) pres) as prescription, (select array_to_json(array_agg(row_to_json(test))) from (select mt.name as test_name from medical_tests mt inner join appointment_medical_tests amt on mt.test_id = amt.test_id where amt.appointment_id = a.appointment_id ) test) as tests) appdata) as appointment_data , (select row_to_json(d) from (select u.id as doctor_id, c.name, c.specialization, c.image,(select row_to_json(al) from (select location_id,fees,appointment_type as doctor_appointment_type, (select c.name as location from contacts c inner join hospital_locations l on c.contact_id = l.contact_id where location_id = dhl.location_id) as appointment_location_of_doctor from doctors_hospital_locations dhl where a.doctors_hospital_location_id = dhl.doctors_hospital_location_id) al) as appointment_location from users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.doctor_id and u.role = $5) d) as doctorinfo,  (select row_to_json(p) from ( SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.patient_id and u.role = $4) p) as patientinfo  from appointments a inner join appointments p on p.appointment_id = a.parent_appointment_id where ($1::int is null or a.patient_id = $1)  and ($2::int is null or a.doctor_id = $2) and ($3::int is null or a.doctors_hospital_location_id = $3)AND a.appointment_status = 'completed' ORDER BY a.date_time desc) t", [patient_id, doctor_id, doctors_hospital_location_id, 'patient', 'doctor']);

      res.json(getCompleteAppointments.rows[0].array_to_json);
    }
    else {
      const getUpcomingAppointments = await pool.query(
        "select array_to_json(coalesce(array_agg(row_to_json(t)) filter (where row_to_json(t) is not null), '{}')) from (select appointment_id, parent_appointment_id, date_time::timestamptz as date_time, appointment_status, telehealth_url, appointment_type, (select row_to_json(d) from (select u.id as doctor_id, c.name, c.specialization, c.image,(select row_to_json(al) from (select location_id,fees,appointment_type as doctor_appointment_type,(select array_to_json(array_agg(row_to_json(dsh))) from (select ds.day_of_week, ds.start_time, ds.end_time, ds.is_open from doctors_schedule ds where ds.doctors_hospital_location_id = dhl.doctors_hospital_location_id) dsh) as schedule, (select count(*)+1 as current from appointments ca where ca.doctor_id = u.id and ca.appointment_status = 'completed' and date_time::date = NOW()::date and ($3::int is null or doctors_hospital_location_id = $3)) as current_appointment_of_doc, (select c.name as location from contacts c inner join hospital_locations l on c.contact_id = l.contact_id where location_id = dhl.location_id) as appointment_location_of_doctor,(select row_to_json(latlng) from (select c.latitude, c.longitude from contacts c inner join hospital_locations l on c.contact_id = l.contact_id where location_id = dhl.location_id) latlng) as coordinates from doctors_hospital_locations dhl where a.doctors_hospital_location_id = dhl.doctors_hospital_location_id) al) as appointment_location from users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.doctor_id and u.role = $6) d) as doctorinfo, (select row_to_json(p) from ( SELECT u.id as patient_id, c.name, c.gender, c.blood_group, c.dob, c.image FROM users u inner join contacts c on c.contact_id = u.contact_id where u.id = a.patient_id and u.role = $5) p) as patientinfo from appointments a where ($1::int is null or patient_id = $1) and ($2::int is null or doctor_id = $2) and ($3::int is null or doctors_hospital_location_id = $3)  AND appointment_status = $4 ORDER BY date_time asc) t", [patient_id, doctor_id, doctors_hospital_location_id, status, 'patient', 'doctor']);

      res.json(getUpcomingAppointments.rows[0].array_to_json);
    }
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//today Appointments
const todayAppointments = async (req, res) => {
  const { doctor_id } = req.params;
  const { date } = req.query;

  const query = "SELECT * from appointments where doctor_id = $1 and date_time::date = $2::date and appointment_status NOT IN ('cancelled') order by date_time asc";

  await common.dbOperation(req, res, query, [doctor_id, date]);
}

//get symptoms
const getSymptoms = async (req, res) => {
  const symptomsCharacter = req.query.character;

  if (symptomsCharacter) {
    const query = "SELECT symptom_id as id, name, symptom_type, verified FROM symptoms WHERE lower(name) LIKE lower('%' || $1 || '%') AND verified = 't'";

    await common.dbOperation(req, res, query, [symptomsCharacter]);
  }
  else {
    const query = "SELECT * FROM symptoms";

    await common.dbOperation(req, res, query);
  }
}

//set appointment symtoms
const setAppointmentSymptoms = async (req, res, next) => {
  const { appointment_id } = req.params;
  const { symptoms_name } = req.body;

  if (!symptoms_name) {
    next(ApiError.notFound('Symptoms_name field is required and must not be Null'));
    return;
  }
  try {

    const symptomSearch = await pool.query('SELECT symptom_id from symptoms where name = $1', [symptoms_name]);
    const s_id = symptomSearch.rows[0];
    console.log(s_id);

    if (s_id == null) {
      const addSymptom = await pool.query(
        "INSERT INTO symptoms (name, symptom_type, verified)VALUES($1,$2,$3) RETURNING symptom_id", [symptoms_name, null, 'false']);

      const ss_id = addSymptom.rows[0].symptom_id;

      const setAppointmentSymptoms = await pool.query(
        'INSERT INTO appointment_symptoms(appointment_id,symptom_id)VALUES($1,$2)', [appointment_id, ss_id]);

      const getAllSymptoms = await pool.query(
        'SELECT symptoms.symptom_id as id,symptoms.name as name FROM symptoms INNER JOIN appointment_symptoms ON appointment_symptoms.symptom_id = symptoms.symptom_id WHERE appointment_id = $1', [appointment_id]);

      res.json(getAllSymptoms.rows);
    }
    else {
      const s_id = symptomSearch.rows[0].symptom_id;
      const setAppointmentSymptoms = await pool.query(
        'INSERT INTO appointment_symptoms(appointment_id,symptom_id)VALUES($1,$2)', [appointment_id, s_id]);

      const getAllSymptoms = await pool.query(
        'SELECT symptoms.symptom_id as id,symptoms.name as name FROM symptoms INNER JOIN appointment_symptoms ON appointment_symptoms.symptom_id = symptoms.symptom_id WHERE appointment_id = $1', [appointment_id]);

      res.json(getAllSymptoms.rows);
    }
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//delete symptoms from appointment_symtoms by appointment_symtoms_ID
const deleteAppointmentSymptoms = async (req, res, next) => {
  const { appointment_id } = req.params;
  const { symptoms_name } = req.body;

  if (!symptoms_name) {
    next(ApiError.notFound('Symptoms_name field is required and must not be Null'));
    return;
  }
  try {

    const deleteAppointmentSymptoms = await pool.query(
      'DELETE FROM appointment_symptoms WHERE appointment_id = $1 AND symptom_id = (SELECT symptom_id FROM symptoms WHERE name = $2)', [appointment_id, symptoms_name]);

    const getAllSymptoms = await pool.query(
      'SELECT symptoms.symptom_id as id,symptoms.name as name FROM symptoms INNER JOIN appointment_symptoms ON appointment_symptoms.symptom_id = symptoms.symptom_id WHERE appointment_id = $1', [appointment_id]);

    res.json(getAllSymptoms.rows);
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//set doctor's note new by appointment id
const setDoctorNoteForPatient = async (req, res, next) => {
  const { appointment_id } = req.params;
  const { doctors_note } = req.body;

  if (!doctors_note) {
    next(ApiError.notFound('doctor_note field is required and must not be Null'));
    return;
  }
  try {

    if (doctors_note == 'EMPTY') {
      const setDOctorNote = await pool.query(
        'INSERT INTO doctor_notes(appointment_id, doctor_note) VALUES($1,$2)', [appointment_id, ""]);
    }
    else {
      const setDOctorNote = await pool.query(
        'INSERT INTO doctor_notes(appointment_id, doctor_note) VALUES($2, $1)', [doctors_note, appointment_id]);
    }
    const getAllNotes = await pool.query(
      'SELECT doctor_note_id, doctor_note from doctor_notes where appointment_id = $1', [appointment_id]);

    res.json(getAllNotes.rows);
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// update doctor's note by appointment id
const updateDoctorNoteForPatient = async (req, res, next) => {
  const { doctor_note_id } = req.params;
  const { appointment_id, doctors_note } = req.body;

  if (!doctors_note) {
    next(ApiError.notFound('doctors_note field is required and must not be Null'));
    return;
  }
  try {

    const updateDOctorNote = await pool.query(
      'UPDATE doctor_notes SET doctor_note = $1 WHERE doctor_note_id = $2', [doctors_note, doctor_note_id]);

    const getAllNotes = await pool.query(
      'SELECT doctor_note_id, doctor_note from doctor_notes WHERE appointment_id = $1', [appointment_id]);

    res.json(getAllNotes.rows);
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// delete doctor's note by appointment id
const deleteDoctorNoteForPatient = async (req, res) => {
  const { doctor_note_id } = req.params;
  const { appointment_id } = req.body;
  try {

    const deleteDOctorNote = await pool.query(
      'DELETE FROM doctor_notes WHERE doctor_note_id = $1', [doctor_note_id]);

    const getAllNotes = await pool.query(
      'SELECT doctor_note_id, doctor_note from doctor_notes WHERE appointment_id = $1', [appointment_id]);

    res.json(getAllNotes.rows);
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//get diagnosis
const getDiagnosis = async (req, res) => {
  const diagnosisCharacter = req.query.character;

  if (diagnosisCharacter) {
    const query = "SELECT diagnosis_id, name, diagnosis_type, verified FROM diagnosis WHERE lower(name) LIKE lower( '%' || $1 || '%') AND verified = 't'";

    await common.dbOperation(req, res, query, [diagnosisCharacter]);
  }
  else {
    const query = "SELECT * FROM diagnosis";

    await common.dbOperation(req, res, query);
  }
}

// set appointment_diagnosis
const setAppointmentDiagnosis = async (req, res, next) => {
  const { appointment_id } = req.params;
  const { diagnosis_name } = req.body;

  if (!diagnosis_name) {
    next(ApiError.notFound('diagnosis_name field is required and must not be Null'));
    return;
  }

  try {
    const diagnosisSearch = await pool.query('SELECT diagnosis_id from diagnosis where name = $1', [diagnosis_name]);
    const d_id = diagnosisSearch.rows[0];
    console.log(d_id);

    if (d_id == null) {
      const addDiagnosis = await pool.query(
        "INSERT INTO  diagnosis (name,diagnosis_type,verified)VALUES($1,$2,$3) RETURNING diagnosis_id", [diagnosis_name, null, 'false']);

      const dd_id = addDiagnosis.rows[0].diagnosis_id;

      const setAppointmentDiagnosis = await pool.query(
        "INSERT INTO appointment_diagnosis(appointment_id, diagnosis_id) VALUES($1, $2)", [appointment_id, dd_id]);

      const getDiagnosisByAID = await pool.query(
        "SELECT diagnosis.diagnosis_id as id, diagnosis.name as name FROM diagnosis INNER JOIN appointment_diagnosis ON appointment_diagnosis.diagnosis_id = diagnosis.diagnosis_id WHERE appointment_id = $1", [appointment_id]);

      res.json(getDiagnosisByAID.rows);
    }
    else {
      const d_id = diagnosisSearch.rows[0].diagnosis_id;
      const setAppointmentDiagnosis = await pool.query(
        "INSERT INTO appointment_diagnosis(appointment_id, diagnosis_id) VALUES($1, $2)", [appointment_id, d_id]);

      const getDiagnosisByAID = await pool.query(
        "SELECT diagnosis.diagnosis_id as id, diagnosis.name as name FROM diagnosis INNER JOIN appointment_diagnosis ON appointment_diagnosis.diagnosis_id = diagnosis.diagnosis_id WHERE appointment_id = $1", [appointment_id]);

      res.json(getDiagnosisByAID.rows);
    }
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// unlist diagnosis from appointment_diagnosis by appointment ID
const unlistDiagnosisByAppointmentID = async (req, res, next) => {
  const { appointment_id } = req.params;
  const { diagnosis_name } = req.body;

  if (!diagnosis_name) {
    next(ApiError.notFound('diagnosis_name field is required and must not be Null'));
    return;
  }
  try {

    const deleteAppointmentDiagnosis = await pool.query(
      "DELETE FROM appointment_diagnosis WHERE appointment_id = $1 AND diagnosis_id = (SELECT diagnosis_id FROM diagnosis WHERE name = $2)", [appointment_id, diagnosis_name]);

    const getDiagnosisByAID = await pool.query(
      "SELECT diagnosis.diagnosis_id as id, diagnosis.name as name FROM diagnosis INNER JOIN appointment_diagnosis ON appointment_diagnosis.diagnosis_id = diagnosis.diagnosis_id WHERE appointment_id = $1", [appointment_id]);

    res.json(getDiagnosisByAID.rows);
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//get test
const getTest = async (req, res) => {
  const testCharacter = req.query.character;

  if (testCharacter) {
    const query = "SELECT test_id as id, name, test_type,  price_in_pkr as price, verified FROM medical_tests WHERE lower(name) LIKE lower( '%' || $1 || '%') AND verified = 't'";

    await common.dbOperation(req, res, query, [testCharacter]);
  }
  else {
    const query = "SELECT test_id, name, test_type,  price_in_pkr as price, verified FROM medical_tests";

    await common.dbOperation(req, res, query);
  }
}

//set appointment test
const setAppointmentTests = async (req, res, next) => {
  const { appointment_id, patient_id } = req.params;
  const { test_name } = req.body;

  if (!test_name) {
    next(ApiError.notFound('test_name field is required and must not be Null'));
    return;
  }
  try {

    const testSearch = await pool.query('SELECT test_id from medical_tests where name = $1', [test_name]);
    const t_id = testSearch.rows[0];
    console.log(t_id);

    if (t_id == null) {
      const addTest = await pool.query(
        "INSERT INTO medical_tests (name, test_type,price_in_pkr,verified)VALUES($1,$2,$3,$4) RETURNING test_id", [test_name, null, 0, 'false']);

      const tt_id = addTest.rows[0].test_id;

      const setAppointmentTests = await pool.query(
        'INSERT INTO appointment_medical_tests(appointment_id,patient_id,test_id) VALUES ($1,$2,$3)', [appointment_id, patient_id, tt_id]);

      const getAllTestByAppointmentId = await pool.query(
        'SELECT medical_tests.test_id,medical_tests.name, medical_tests.price_in_pkr, mt.test_result FROM medical_tests INNER JOIN appointment_medical_tests mt ON mt.test_id = medical_tests.test_id WHERE appointment_id = $1', [appointment_id]);

      res.json(getAllTestByAppointmentId.rows);
    }
    else {
      const t_id = testSearch.rows[0].test_id;
      const setAppointmentTests = await pool.query(
        'INSERT INTO appointment_medical_tests(appointment_id,patient_id,test_id) VALUES ($1,$2,$3)', [appointment_id, patient_id, t_id]);

      const getAllTestByAppointmentId = await pool.query(
        'SELECT medical_tests.test_id,medical_tests.name, medical_tests.price_in_pkr, mt.test_result FROM medical_tests INNER JOIN appointment_medical_tests mt ON mt.test_id = medical_tests.test_id WHERE appointment_id = $1', [appointment_id]);

      res.json(getAllTestByAppointmentId.rows);
    }
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// unlist test from appointment_medical_test by appointment ID
const unlistTestByAppointmentID = async (req, res, next) => {
  const { appointment_id } = req.params;
  const { test_name } = req.body;

  if (!test_name) {
    next(ApiError.notFound('test_name field is required and must not be Null'));
    return;
  }
  try {

    const deleteAppointmentTests = await pool.query(
      'DELETE FROM appointment_medical_tests WHERE appointment_id = $1 AND test_id = (SELECT test_id FROM medical_tests WHERE name = $2)', [appointment_id, test_name]);

    const getAllTestByAppointmentId = await pool.query(
      'SELECT medical_tests.test_id,medical_tests.name, medical_tests.price_in_pkr, mt.test_result FROM medical_tests INNER JOIN appointment_medical_tests mt ON mt.test_id = medical_tests.test_id WHERE appointment_id = $1', [appointment_id]);

    res.json(getAllTestByAppointmentId.rows);
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//get medicines by character
const getPrescription = async (req, res) => {
  const PrescriptionCharacter = req.query.character;

  if (PrescriptionCharacter) {
    const query = "SELECT medicine_id as id,name, medicine_type, price, amount_in_grams as strength, verified FROM medicines WHERE lower(name) LIKE lower( '%' || $1 || '%') AND verified = 't'";

    await common.dbOperation(req, res, query, [PrescriptionCharacter]);
  }
  else {
    const query = "SELECT medicine_id, name, medicine_type, price, amount_in_grams as strength, verified FROM medicines";

    await common.dbOperation(req, res, query);
  }
}

//set prescription
const setPrescription = async (req, res, next) => {
  const { appointment_id } = req.params;
  const { medicine_name, days, quantity, frequency } = req.body;

  if (!medicine_name, !days, !quantity, !frequency) {
    next(ApiError.notFound('All field are required and must not be Null'));
    return;
  }

  try {
    const medicineSearch = await pool.query('SELECT medicine_id from medicines where name = $1', [medicine_name]);
    const m_id = medicineSearch.rows[0];
    console.log(m_id);

    if (m_id == null) {
      const addTMediicne = await pool.query(
        "INSERT INTO medicines (name, medicine_type,price,amount_in_grams,verified)VALUES($1,$2,$3,$4,$5) RETURNING medicine_id", [medicine_name, null, 0, null, 'false']);

      const mm_id = addTMediicne.rows[0].medicine_id;

      const setPrescription = await pool.query(
        'INSERT INTO prescriptions (appointment_id,medicine_id,days,quantity,frequency) VALUES ($1,$2,$3,$4,$5)', [appointment_id, mm_id, days, quantity, frequency]);

      const getAllPrescriptionByAppointmentId = await pool.query(
        'SELECT m.medicine_id,m.name,m.medicine_type,m.price,m.amount_in_grams, p.days,p.quantity,p.frequency from medicines m INNER JOIN prescriptions p ON p.medicine_id = m.medicine_id WHERE appointment_id = $1', [appointment_id]);

      res.json(getAllPrescriptionByAppointmentId.rows);
    }
    else {
      const m_id = medicineSearch.rows[0].medicine_id;
      const setPrescription = await pool.query(
        'INSERT INTO prescriptions (appointment_id,medicine_id,days,quantity,frequency) VALUES ($1,$2,$3,$4,$5)', [appointment_id, m_id, days, quantity, frequency]);

      const getAllPrescriptionByAppointmentId = await pool.query(
        'SELECT m.medicine_id,m.name,m.medicine_type,m.price,m.amount_in_grams, p.days,p.quantity,p.frequency from medicines m INNER JOIN prescriptions p ON p.medicine_id = m.medicine_id WHERE appointment_id = $1', [appointment_id]);

      res.json(getAllPrescriptionByAppointmentId.rows);
    }
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//delete prescription
const unlistPrescriptionFromAppointment = async (req, res, next) => {
  const { appointment_id } = req.params;
  const { medicine_name } = req.body;
  if (!medicine_name) {
    next(ApiError.notFound('medicine_name field is required and must not be Null'));
    return;
  }
  try {

    const deletePrescription = await pool.query(
      'DELETE FROM prescriptions WHERE appointment_id = $1 AND medicine_id = (SELECT medicine_id FROM medicines WHERE name = $2)', [appointment_id, medicine_name]);

    const getAllPrescriptionByAppointmentId = await pool.query(
      'SELECT m.medicine_id,m.name,m.medicine_type,m.price,m.amount_in_grams, p.days,p.quantity,p.frequency from medicines m INNER JOIN prescriptions p ON p.medicine_id = m.medicine_id WHERE appointment_id = $1', [appointment_id]);

    res.json(getAllPrescriptionByAppointmentId.rows);

  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// set followUp
const setFollowUp = async (req, res, next) => {
  const { appointment_id, doctors_hospital_location_id, patient_id, doctor_id } = req.params;
  const { date_by_doc, time_by_doc, appointment_type, action_role, action_role_id } = req.body;

  var url = req.url;
  y = url.split("/");
  url = y[1];


  if (appointment_id == 0 || doctors_hospital_location_id == 0 || patient_id == 0 || doctor_id == 0) {
    next(ApiError.notFound('appointment_id and location_id can not be null'));
    return;
  }
  if (!date_by_doc || !time_by_doc || !appointment_type || !action_role || !action_role_id) {
    next(ApiError.notFound('date, time, appointment_type, action_role and action_role_id can not be Null'));
    return;
  }
  const query = "INSERT INTO appointments(parent_appointment_id,patient_id, doctor_id,date_time, appointment_status,doctors_hospital_location_id, appointment_type) VALUES((SELECT DISTINCT parent_appointment_id from appointments where appointment_id = $1),$2,$3,$4::date + $5::time,$6,$7, $8) RETURNING appointment_id";
  try {
    const followUp = await pool.query(
      query, [appointment_id, patient_id, doctor_id, date_by_doc, time_by_doc, 'upcoming', doctors_hospital_location_id, appointment_type])

    console.log("followup id: ", followUp.rows[0].appointment_id);

    // adding doctor note
    await pool.query(
      "INSERT INTO doctor_notes(appointment_id, doctor_note) values($1, $2)", [followUp.rows[0].appointment_id, " "]
    );

    //create meeting
    if (appointment_type == 'telehealth') {
      console.log("it's telehealth");
      await common.createMeeting(req, res, followUp.rows[0].appointment_id).then(
      );
    }

    // save logging
    await common.saveLoggings('upcoming', action_role, action_role_id, appointment_id, 'set_followup');

    if (url === 'doctors') {
      // followup appointments activity log by doctor
      await common.storeActivityLogs(doctor_id, 'doctor', 'set_followup', appointment_id).then(
        console.log("followup appointments activity inserted by doctor")
      );
      // save notification doctor
      await common.saveNotifications(patient_id, 'patient', 'set_followup', appointment_id);

      // popup notification doctor
      await common.popupNotifications(patient_id, doctor_id, 'Follow Up Appointment', 'follow up an appointment with you.');
    }

    if (url === "patients") {
      // followup appointments activity log by patient
      await common.storeActivityLogs(patient_id, 'patient', 'set_followup', appointment_id).then(
        console.log("followup appointments activity inserted by patient")
      );
      // save notification patient
      await common.saveNotifications(doctor_id, 'doctor', 'set_followup', appointment_id);
    }
    res.json("followUp inserted successfully!");
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//fee structure
const fee_structure = async (req, res) => {
  const { appointment_id, doctor_id, patient_id } = req.params;
  const { fee, discount_in_percentage, discount_reason } = req.body;

  const pay = 100 - discount_in_percentage;
  const pay_divide = pay / 100;
  const patient_payment = pay_divide * fee;

  try {
    const fee_structure = await pool.query(
      'INSERT INTO fee_payments (doctor_id,patient_id,appointment_id,fee,discount_in_percentage,discount_reason_id,payment) VALUES ($1,$2,$3,$4,$5,(SELECT DISTINCT discount_reason_id from discount_reasons where discount_reason = $6),$7) RETURNING payment', [doctor_id, patient_id, appointment_id, fee, discount_in_percentage, discount_reason, patient_payment]
    );

    res.json(fee_structure.rows);
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//set discount details
const setDiscountReasons = async (req, res) => {
  const { discount_reason } = req.body;
  const query = "INSERT INTO discount_reasons (discount_reason) VALUES ($1)";

  await common.dbOperation(req, res, query, [discount_reason]);
}

//get discount reasons
const getDiscountReasons = async (req, res) => {
  const reasonCharacter = req.query.character;

  if (reasonCharacter !== null) {
    const query = "SELECT discount_reason_id as id, discount_reason FROM discount_reasons WHERE lower(discount_reason) LIKE lower( '%' || $1 || '%')";

    await common.dbOperation(req, res, query, [reasonCharacter]);
  }
  else {
    const query = "SELECT discount_reason_id as id, discount_reason FROM discount_reasons";

    await common.dbOperation(req, res, query);
  }
}

//get dates for appointments
const getDate = async (req, res) => {
  var { doctor_id, doctors_hospital_location_id } = req.params;
  const { appointment_status } = req.query;
  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  const query = "SELECT date_time::date as date, telehealth_url from appointments where appointment_status = $1 and doctor_id = $2 and ($3::int is null or doctors_hospital_location_id = $3)";

  await common.dbOperation(req, res, query, [appointment_status, doctor_id, doctors_hospital_location_id]);
}

// dashboard APIs
//get dates for upcoming appointments
const getDates = async (req, res) => {
  var { doctor_id, doctors_hospital_location_id, start_date, end_date } = req.params;
  const { appointment_status } = req.query;

  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  const query = "SELECT date_time::date as date, telehealth_url from appointments where appointment_status = $1 and doctor_id = $2 and ($3::int is null or doctors_hospital_location_id = $3) and date_time BETWEEN $4 AND $5";

  await common.dbOperation(req, res, query, [appointment_status, doctor_id, doctors_hospital_location_id, start_date, end_date]);
}

//extract data of patients count (past months)
const getPatientsAcrossDates = async (req, res) => {
  var { doctor_id, doctors_hospital_location_id, start_date, end_date } = req.params;

  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  try {

    const getPatientsAcrossDates = await pool.query(
      "SELECT count(patient_id) as patients, date_time::date from appointments where date_time BETWEEN $3 AND $4 AND appointment_status = 'completed' AND doctor_id = $1 AND ($2::int is null or doctors_hospital_location_id = $2) group by date_time::date", [doctor_id, doctors_hospital_location_id, start_date, end_date]
    );
    const getTotalPatients = await pool.query(
      "select count(appointment_id) as total_check_ups, AVG(appointment_id)/count(appointment_id) as average_per_day from appointments where date_time BETWEEN $3 AND $4 AND appointment_status = 'completed' AND doctor_id = $1 AND ($2::int is null or doctors_hospital_location_id = $2)", [doctor_id, doctors_hospital_location_id, start_date, end_date]
    );

    res.json({ 'graph': getPatientsAcrossDates.rows, 'end_line': getTotalPatients.rows });
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//total discount graph
const getTotalDiscount = async (req, res) => {
  var { doctor_id, doctors_hospital_location_id, start_date, end_date } = req.params;

  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  try {

    const getDiscountFriends = await pool.query(
      "SELECT sum(f.fee-payment) as discount_friend_family from fee_payments f inner join appointments a on a.appointment_id = f.appointment_id where a.date_time BETWEEN $3 AND $4 AND discount_reason_id = 1 AND f.doctor_id = $1 AND ($2::int is null or a.doctors_hospital_location_id = $2)", [doctor_id, doctors_hospital_location_id, start_date, end_date]
    );
    const getDiscountFollow = await pool.query(
      "SELECT sum(f.fee-payment) as discount_followups from fee_payments f inner join appointments a on a.appointment_id = f.appointment_id where a.date_time BETWEEN $3 AND $4 AND discount_reason_id = 2 AND f.doctor_id = $1 AND ($2::int is null or a.doctors_hospital_location_id = $2)", [doctor_id, doctors_hospital_location_id, start_date, end_date]
    );
    const getDiscountCSR = await pool.query(
      "SELECT sum(f.fee-payment) as discount_CSR from fee_payments f inner join appointments a on a.appointment_id = f.appointment_id where a.date_time BETWEEN $3 AND $4 AND discount_reason_id = 3 AND f.doctor_id = $1 AND ($2::int is null or a.doctors_hospital_location_id = $2)", [doctor_id, doctors_hospital_location_id, start_date, end_date]
    );
    const getDiscountOther = await pool.query(
      "SELECT sum(f.fee-payment) as discount_other from fee_payments f inner join appointments a on a.appointment_id = f.appointment_id where a.date_time BETWEEN $3 AND $4 AND discount_reason_id = 4 AND f.doctor_id = $1 AND ($2::int is null or a.doctors_hospital_location_id = $2)", [doctor_id, doctors_hospital_location_id, start_date, end_date]
    );
    const getTotalDiscount = await pool.query(
      "select sum(f.fee-payment)  as discount from fee_payments f inner join appointments a on a.appointment_id = f.appointment_id WHERE a.date_time BETWEEN $3 AND $4 AND f.doctor_id = $1 AND ($2::int is null or a.doctors_hospital_location_id = $2)", [doctor_id, doctors_hospital_location_id, start_date, end_date]
    );

    res.json({ 'follow_ups': getDiscountFollow.rows, 'friend_and_family': getDiscountFriends.rows, 'csr': getDiscountCSR.rows, 'other': getDiscountOther.rows, 'total_discount': getTotalDiscount.rows });
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//total revenue graph
const getTotalRevenue = async (req, res) => {
  var { doctor_id, doctors_hospital_location_id, start_date, end_date } = req.params;

  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  try {

    const getTotalPayment = await pool.query(
      "SELECT count(fee_payments.patient_id) as total_patients, sum(payment) as total_payment, date_time::date from fee_payments inner join appointments on appointments.appointment_id = fee_payments.appointment_id where appointments.date_time BETWEEN $3 AND $4 AND fee_payments.doctor_id = $1 AND ($2::int is null or appointments.doctors_hospital_location_id = $2) AND appointment_status = 'completed' group by date_time::date", [doctor_id, doctors_hospital_location_id, start_date, end_date]
    );
    const getTotalRevenue = await pool.query(
      "SELECT sum(payment) as total_revenue from fee_payments inner join appointments on appointments.appointment_id = fee_payments.appointment_id where appointments.date_time BETWEEN $3 AND $4 AND fee_payments.doctor_id = $1 AND ($2::int is null or appointments.doctors_hospital_location_id = $2) AND appointment_status = 'completed'", [doctor_id, doctors_hospital_location_id, start_date, end_date]
    );

    res.json({ 'total_payment': getTotalPayment.rows, 'total_revenue': getTotalRevenue.rows });
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// get current day's completed appointment of a doctor
const completedAppointmentsByCurrentDates = async (req, res) => {
  var { doctor_id, doctors_hospital_location_id, start_date, end_date } = req.params;
  const { appointment_status } = req.query;

  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  const query = "SELECT u.id as patient_id, c.name, c.gender, c.dob, c.image, a.date_time FROM users u inner join contacts c on c.contact_id = u.contact_id inner join appointments a on u.id = a.patient_id where a.appointment_status = $2 and u.role = $6 and a.doctor_id = $1 and ($3::int is null or doctors_hospital_location_id = $3) and a.date_time BETWEEN $4 AND $5";

  await common.dbOperation(req, res, query, [doctor_id, appointment_status, doctors_hospital_location_id, start_date, end_date, 'patient']);
}

// get treatment stats
const medicineStats = async (req, res) => {
  var { doctor_id, doctors_hospital_location_id, start_date, end_date } = req.params;

  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  const query = "SELECT (select m.name from medicines m where m.medicine_id = p.medicine_id) as medicine_name, count(p.medicine_id) as frequency from prescriptions p inner join appointments a on a.appointment_id = p.appointment_id where a.date_time BETWEEN $3 AND $4 and a.doctor_id = $1 and ($2::int is null or a.doctors_hospital_location_id = $2) and a.appointment_status = 'completed' group by medicine_id order by frequency desc limit 5";

  await common.dbOperation(req, res, query, [doctor_id, doctors_hospital_location_id, start_date, end_date]);
}

// get test stats
const testStats = async (req, res) => {
  var { doctor_id, doctors_hospital_location_id, start_date, end_date } = req.params;

  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  const query = "SELECT (select mt.name from medical_tests mt where mt.test_id = amt.test_id) as test_name, count(amt.test_id) as frequency from appointment_medical_tests amt inner join appointments a on a.appointment_id = amt.appointment_id where a.date_time BETWEEN $3 AND $4 and a.doctor_id = $1 and ($2::int is null or a.doctors_hospital_location_id = $2) and a.appointment_status = 'completed' group by amt.test_id order by frequency desc limit 5";

  await common.dbOperation(req, res, query, [doctor_id, doctors_hospital_location_id, start_date, end_date]);
}

// get symptoms stats
const symptomStats = async (req, res) => {
  var { doctor_id, doctors_hospital_location_id, start_date, end_date } = req.params;

  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  const query = "SELECT (select sn.name from symptoms sn where sn.symptom_id = s.symptom_id) as symptom_name, count(s.symptom_id) as frequency from appointment_symptoms s inner join appointments a on a.appointment_id = s.appointment_id where a.date_time BETWEEN $3 AND $4 and a.doctor_id = $1 and ($2::int is null or a.doctors_hospital_location_id = $2) and a.appointment_status = 'completed' group by s.symptom_id order by frequency desc limit 5";

  await common.dbOperation(req, res, query, [doctor_id, doctors_hospital_location_id, start_date, end_date]);
}

// get diagnosis stats
const diagnosisStats = async (req, res) => {
  var { doctor_id, doctors_hospital_location_id, start_date, end_date } = req.params;

  if (doctors_hospital_location_id == 0) {
    doctors_hospital_location_id = null;
  }
  const query = "SELECT (select d.name from diagnosis d where d.diagnosis_id = ad.diagnosis_id) as diagnosis_name, count(ad.diagnosis_id) as frequency from appointment_diagnosis ad inner join appointments a on a.appointment_id = ad.appointment_id where a.date_time BETWEEN $3 AND $4 and a.doctor_id = $1 and ($2::int is null or a.doctors_hospital_location_id = $2) and a.appointment_status = 'completed' group by ad.diagnosis_id order by frequency desc limit 5";

  await common.dbOperation(req, res, query, [doctor_id, doctors_hospital_location_id, start_date, end_date]);
}

// get test record by an appointment
const getTestRecord = async (req, res) => {
  const { appointment_id } = req.params;

  const query = "SELECT amt.test_id,name, amt.test_result, price_in_pkr from medical_tests mt inner join appointment_medical_tests amt on amt.test_id = mt.test_id where appointment_id = $1";

  await common.dbOperation(req, res, query, [appointment_id]);
}

// get count of status by date
const getStatus = async (req, res) => {
  const { selected_date } = req.query;

  const query = "select count(*) filter(where appointment_status = 'upcoming') as upcoming_appointments, count(*) filter(where appointment_status = 'waiting') as waiting_appointments,count(*) filter(where appointment_status = 'completed') as completed_appointments, count(*) filter(where appointment_status = 'inprogress') as inprogress_appointments,count(*) filter(where appointment_status = 'hold') as hold_appointments, count(*) filter(where appointment_status = 'cancelled') as cancelled_appointments from appointments where date_time::date = $1";

  await common.dbOperation(req, res, query, [selected_date]);
}

// get logging
const getLogging = async (req, res) => {
  const { appointment_id } = req.params;
  try {

    const getpatients = await pool.query(
      "SELECT a.patient_id,(select c.name from contacts c where c.contact_id = (select contact_id from users u where u.id = a.appointment_id and u.role = $2)) from appointments a where a.appointment_id = $1", [appointment_id, 'patient']
    );
    const completed = await pool.query(
      "SELECT state_changing_time as completed_at from state_logging where state_to = 'completed' and appointment_id = $1", [appointment_id]
    );
    const set = await pool.query(
      "SELECT state_changing_time as set_at from state_logging where state_to = 'upcoming' and appointment_id = $1", [appointment_id]
    );
    const check_in = await pool.query(
      "SELECT state_changing_time as check_in_at from state_logging where state_to = 'waiting' and appointment_id = $1", [appointment_id]
    );
    const start = await pool.query(
      "SELECT state_changing_time as start_at from state_logging where state_to = 'inprogress' and appointment_id = $1", [appointment_id]
    );
    const hold = await pool.query(
      "SELECT state_changing_time as moving_back_at from state_logging where state_to = 'hold' and appointment_id = $1", [appointment_id]
    );
    const edit = await pool.query(
      "SELECT state_changing_time as edit_at from state_logging where state_to = 'edit' and appointment_id = $1", [appointment_id]
    );
    const cancelled = await pool.query(
      "SELECT state_changing_time as cancelled_at from state_logging where state_to = 'cancelled' and appointment_id = $1", [appointment_id]
    );
    res.json({ 'patients_info': getpatients.rows, 'upcoming': set.rows, 'wainting': check_in.rows, 'inprogress': start.rows, 'completed': completed.rows, 'hold': hold.rows, 'edit': edit.rows, 'cancelled': cancelled.rows });
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

//telehealth appointments
const telehealthAppointments = async (req, res) => {
  const { doctor_id } = req.params;

  const query = "select a.appointment_id, a.patient_id, (select row_to_json(pinfo) from (select contact_id, name, image from contacts where contact_id = (select contact_id from users u where u.id = a.patient_id and u.role = $6)) pinfo) as patient_info, a.doctor_id, (select row_to_json(dinfo) from (select contact_id, name, image from contacts where contact_id = (select contact_id from users u where u.id = a.doctor_id and u.role = $7)) dinfo) as doctor_info, a.date_time, a.appointment_status, a.appointment_type, a.telehealth_url from appointments a where a.appointment_type = $1 and appointment_status in ($2, $3, $4) and a.doctor_id = $5";

  await common.dbOperation(req, res, query, ['telehealth', 'upcoming', 'cancelled', 'completed', doctor_id, 'patient', 'doctor']);
}


module.exports = {
  newAppointment,
  copyOfAppointment,
  deleteAppointment,
  copyAppointmentData,
  cancelAppointmentByAppointmentId,
  rescheduleAppointment,
  updateAppointmentStatus,
  getAppointmentsByDate,
  getAppointmentsBetweenDate,
  getAppointmentsHistory,
  getCompletedAppointments,
  getAppointmentslist,
  appointmentsStats,
  appointmentsStatsBetweenDate,
  appointmentsQueue,
  getAppointmentDetail,
  getAppointments,
  getSymptoms,
  setAppointmentSymptoms,
  deleteAppointmentSymptoms,
  setDoctorNoteForPatient,
  deleteDoctorNoteForPatient,
  updateDoctorNoteForPatient,
  getDiagnosis,
  setAppointmentDiagnosis,
  unlistDiagnosisByAppointmentID,
  getTest,
  setAppointmentTests,
  unlistTestByAppointmentID,
  getPrescription,
  setPrescription,
  unlistPrescriptionFromAppointment,
  setFollowUp,
  fee_structure,
  getDiscountReasons,
  setDiscountReasons,
  todayAppointments,
  getDate,
  //dashboard
  getDates,
  getPatientsAcrossDates,
  getTotalDiscount,
  getTotalRevenue,
  completedAppointmentsByCurrentDates,
  medicineStats,
  testStats,
  symptomStats,
  diagnosisStats,
  getTestRecord,
  getStatus,
  getLogging,
  telehealthAppointments,
}
