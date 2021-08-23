const pool = require('./Config').pool;
const ApiError = require('./error/ApiError');
const common = require('./DbOperation');

// add admin
const addAdmin = async (req, res) => {
  const { admin_id } = req.params;
  const { name, contact_no } = req.body;
  if (!name || !contact_no) {
    next(ApiError.notFound('Name and Contact_no field is required and must be non blank'));
    return;
  }

  try {

    const contact_id = await pool.query('SELECT contact_id from phone_numbers where number = $1', [contact_no]);
    const c_id = contact_id.rows[0];

    if (c_id == null) { // add new contact, phone_number and doctor
      const newContact_id = await pool.query("INSERT INTO contacts(name,verify) VALUES ($1,'t') RETURNING contact_id", [name]);

      const newc_id = newContact_id.rows[0].contact_id;
      console.log("new contact", newc_id);
      const addPhone_no = await pool.query("INSERT INTO phone_numbers(contact_id,number) VALUES ($1,$2)", [newc_id, contact_no]);

      const addAdmin = await pool.query("INSERT INTO users(contact_id,role) VALUES ($1,$2) RETURNING id", [newc_id,'admin']);
      const a_id = addAdmin.rows[0].id;
      console.log("new admin", a_id);

      await common.storeActivityLogs(admin_id, 'admin', 'add_admin', a_id).then(
        console.log("activity inserted by admin")
      );

      res.json("Admin Added Successfully!");
    }
    else {
      const c_id = contact_id.rows[0].contact_id;
      const newContact_id = await pool.query("update contacts set name = $1 where contact_id = $2 ", [name, c_id]);
      const addAdmin = await pool.query("INSERT INTO users(contact_id,role) VALUES ($1,$2) RETURNING id", [c_id,'admin']);

      const a_id = addAdmin.rows[0].id;
      console.log("new admin", a_id);

      await common.storeActivityLogs(admin_id, 'admin', 'add_admin', a_id).then(
        console.log("activity inserted by admin")
      );
      res.json("Admin Added Successfully!");
    }
  }
  catch (err) {
    common.customResponse(req, res, err);
  }
}

//delete admin
const deleteAdmin = async (req, res) => {
  const { admin_id } = req.params;

  const query = "DELETE from users where id = $1 and role = $2";

  await common.dbOperation(req, res, query, [admin_id,'admin']);

  await common.storeActivityLogs(admin_id, 'admin', 'delete_admin', 0).then(
    console.log("activity inserted by admin")
  );
}

//update admin
const updateAdmin = async (req, res) => {
  const { admin_id } = req.params;
  const { name, contact_no } = req.body;
  try {
    const contact_id = await pool.query('SELECT contact_id from users where id = $1 and role = $2', [admin_id,'admin']);
    const c_id = contact_id.rows[0].contact_id;
    console.log(c_id);

    const updateName = await pool.query("UPDATE contacts SET name = $1 WHERE contact_id = $2", [name, c_id]);
    const updateContact = await pool.query("UPDATE phone_numbers SET number = $1 WHERE contact_id = $2", [contact_no, c_id]);

    await common.storeActivityLogs(admin_id, 'admin', 'update_admin', admin_id).then(
      console.log("activity inserted by admin")
    );
    res.json("Admin Updated Successfully!");
  }
  catch (err) {
    common.customResponse(req, res, err);
  }
}

// get all admins
const getAllAdmins = async (req, res) => {
  var { admin_id } = req.params;
  if (admin_id == 0) {
    admin_id = null;
  }
  const query = "SELECT u.id as admin_id, c.name, p.number, c.time_stamp as created_at FROM users u inner join contacts c on c.contact_id = u.contact_id inner join phone_numbers p on p.contact_id = u.contact_id WHERE ($1::int is null or u.id = $1) and u.role = 'admin'";

  await common.dbOperation(req, res, query, [admin_id]);
}

// add doctor
const addDoctor = async (req, res) => {
  const { admin_id } = req.params;
  const { name, contact_no } = req.body;
  if (!name || !contact_no) {
    next(ApiError.notFound('Name and Contact_no field is required and must be non blank'));
    return;
  }

  try {

    const contact_id = await pool.query('SELECT contact_id from phone_numbers where number = $1', [contact_no]);
    const c_id = contact_id.rows[0];

    if (c_id == null) { // add new contact, phone_number and doctor
      const newContact_id = await pool.query("INSERT INTO contacts(name,verify) VALUES ($1,'t') RETURNING contact_id", [name]);

      const newc_id = newContact_id.rows[0].contact_id;
      console.log("new contact", newc_id);
      const addPhone_no = await pool.query("INSERT INTO phone_numbers(contact_id,number) VALUES ($1,$2)", [newc_id, contact_no]);

      const addDoctor = await pool.query("INSERT INTO users(contact_id,role) VALUES ($1,$2) RETURNING id", [newc_id,'doctor']);
      const d_id = addDoctor.rows[0].id;
      console.log("new doctor", d_id);

      await common.storeActivityLogs(admin_id, 'admin', 'add_doctor', d_id).then(
        console.log("activity inserted by admin")
      );

      res.json("Doctor Added Successfully!");
    }
    else {
      const c_id = contact_id.rows[0].contact_id;
      const newContact_id = await pool.query("update contacts set name = $1 where contact_id = $2 ", [name, c_id]);
      const addDoctor = await pool.query("INSERT INTO users(contact_id,role) VALUES ($1,$2) RETURNING id", [c_id,'doctor']);
      const d_id = addDoctor.rows[0].id;
      console.log("new doctor", d_id);

      await common.storeActivityLogs(admin_id, 'admin', 'add_doctor', d_id).then(
        console.log("activity inserted by admin")
      );

      res.json("Doctor Added Successfully!");
    }
  }
  catch (err) {
    common.customResponse(req, res, err);
  }
}

//delete doctor
const deleteDoctor = async (req, res) => {
  const { admin_id, doctor_id } = req.params;

  const query = "DELETE from users where id = $1 and role = $2";

  await common.dbOperation(req, res, query, [doctor_id,'doctor']);

  await common.storeActivityLogs(admin_id, 'admin', 'delete_doctor', 0).then(
    console.log("activity inserted by admin")
  );
}

//update doctor
const updateDoctor = async (req, res) => {
  const { admin_id, doctor_id } = req.params;
  const { name, contact_no } = req.body;
  try {
    const contact_id = await pool.query('SELECT contact_id from users where id = $1 and role = $2', [doctor_id,'doctor']);
    const c_id = contact_id.rows[0].contact_id;
    console.log(c_id);

    const updateName = await pool.query("UPDATE contacts SET name = $1 WHERE contact_id = $2", [name, c_id]);
    const updateContact = await pool.query("UPDATE phone_numbers SET number = $1 WHERE contact_id = $2", [contact_no, c_id]);

    await common.storeActivityLogs(admin_id, 'admin', 'update_doctor', doctor_id).then(
      console.log("activity inserted by admin")
    );
    res.json("Doctor Updated Successfully!");
  }
  catch (err) {
    common.customResponse(req, res, err);
  }
}

// get all doctors
const getAllDoctors = async (req, res) => {

  const query = "SELECT u.id as doctor_id, c.name, c.image, p.number, c.time_stamp as created_at FROM users u inner join contacts c on c.contact_id = u.contact_id inner join phone_numbers p on p.contact_id = u.contact_id WHERE u.role = 'doctor'";

  await common.dbOperation(req, res, query);
}

// add locations
const addLocation = async (req, res, next) => {
  const { admin_id } = req.params;
  const { name, hospital_name, address, longitude, latitude, contact_no } = req.body;
  if (!name || !hospital_name || !address || !longitude || !latitude || !contact_no) {
    next(ApiError.notFound('All fields are required and must be non blank'));
    return;
  }

  try {

    const contact_id = await pool.query('SELECT contact_id from phone_numbers where number = $1', [contact_no]);
    const c_id = contact_id.rows[0];

    if (c_id == null) { // add new contact, phone_number and doctor
      const newContact_id = await pool.query("INSERT INTO contacts(name, address, longitude, latitude,verify) VALUES ($1,$2,$3,$4,'t') RETURNING contact_id", [name, address, longitude, latitude]);

      const newc_id = newContact_id.rows[0].contact_id;
      console.log("new contact", newc_id);
      const addPhone_no = await pool.query("INSERT INTO phone_numbers(contact_id,number) VALUES ($1,$2)", [newc_id, contact_no]);

      const addLocation = await pool.query("INSERT INTO hospital_locations(contact_id, hospital_id) VALUES ($1,(select h.hospital_id from hospitals h inner join contacts c on c.contact_id = h.contact_id where c.name = $2)) RETURNING location_id", [newc_id, hospital_name]);
      const l_id = addLocation.rows[0].location_id;
      console.log("new location", l_id);

      await common.storeActivityLogs(admin_id, 'admin', 'add_location', l_id).then(
        console.log("activity inserted by admin")
      );
      res.json("location Added Successfully!");
    }
    else {
      const c_id = contact_id.rows[0].contact_id;

      const newContact_id = await pool.query("update contacts set name = $1, address = $3, longitude = $4, latitude = $5 where contact_id = $2 ", [name, c_id, address, longitude, latitude]);
      const addLocation = await pool.query("INSERT INTO hospital_locations(contact_id, hospital_id) VALUES ($1,(select h.hospital_id from hospitals h inner join contacts c on c.contact_id = h.contact_id where c.name = $2)) RETURNING location_id", [c_id, hospital_name]);
      const l_id = addLocation.rows[0].location_id;
      console.log("new location", l_id);

      await common.storeActivityLogs(admin_id, 'admin', 'add_location', l_id).then(
        console.log("activity inserted by admin")
      );
      res.json("location Added Successfully!");
    }
  }
  catch (err) {
    common.customResponse(req, res, err);
  }
}

//delete location
const deleteLocation = async (req, res) => {
  const { admin_id, location_id } = req.params;

  const query = "DELETE from hospital_locations where location_id = $1";

  await common.dbOperation(req, res, query, [location_id]);

  await common.storeActivityLogs(admin_id, 'admin', 'delete_location', 0).then(
    console.log("activity inserted by admin")
  );
}

//update location
const updateLocation = async (req, res) => {
  const { admin_id, location_id } = req.params;
  const { name, address, longitude, latitude, contact_no } = req.body;
  try {
    const contact_id = await pool.query('SELECT contact_id from hospital_locations where location_id = $1', [location_id]);
    const c_id = contact_id.rows[0].contact_id;
    console.log(c_id);

    const updateName = await pool.query("UPDATE contacts SET name = $1, address = $2, longitude = $3, latitude = $4 WHERE contact_id = $5", [name, address, longitude, latitude, c_id]);
    const updateContact = await pool.query("UPDATE phone_numbers SET number = $1 WHERE contact_id = $2", [contact_no, c_id]);

    await common.storeActivityLogs(admin_id, 'admin', 'update_doctor', location_id).then(
      console.log("activity inserted by admin")
    );
    res.json("Location Updated Successfully!");
  }
  catch (err) {
    common.customResponse(req, res, err);
  }
}

//add symtom in symtom's table
const addSymptom = async (req, res, next) => {
  const { admin_id } = req.params;
  const { symptom_name, symptom_type } = req.body;
  if (!symptom_name || !symptom_type) {
    next(ApiError.notFound('Symptom name and type field is required and must be non blank'));
    return;
  }
  try {
    const addSymptom = await pool.query(
      "INSERT INTO symptoms (name, symptom_type,verified)VALUES($1,$2,$3) RETURNING symptom_id", [symptom_name, symptom_type, 'true']);

    const s_id = addSymptom.rows[0].symptom_id;
    console.log("new symptom", s_id);

    await common.storeActivityLogs(admin_id, 'admin', 'add_symptom', s_id).then(
      console.log("activity inserted by admin")
    );
    res.json("Operation Successful");
  }
  catch (err) {
    common.customResponse(req, res, err);
  }
}

//delete symptom
const deleteSymptom = async (req, res) => {
  const { admin_id, symptom_id } = req.params;

  const query = "DELETE from symptoms where symptom_id = $1";

  await common.dbOperation(req, res, query, [symptom_id]);

  await common.storeActivityLogs(admin_id, 'admin', 'delete_symptom', 0).then(
    console.log("activity inserted by admin")
  );
}

//update symptom
const updateSymptom = async (req, res) => {
  const { admin_id, symptom_id } = req.params;
  const { symptom_name, symptom_type } = req.body;

  const query = "UPDATE symptoms SET name = $2, symptom_type = $3 where symptom_id = $1";

  await common.dbOperation(req, res, query, [symptom_id, symptom_name, symptom_type]);

  await common.storeActivityLogs(admin_id, 'admin', 'update_symptom', symptom_id).then(
    console.log("activity inserted by admin")
  );
}

//verify symptom 
const verifySymptom = async (req, res) => {
  const { symptom_id } = req.params;

  const query = "UPDATE symptoms set verified = $2 where symptom_id = $1";

  await common.dbOperation(req, res, query, [symptom_id, "t"]);
}

//add diagnosis in diagnosis's table
const addDiagnosis = async (req, res, next) => {
  const { admin_id } = req.params;
  const { diagnosis_name, diagnosis_type } = req.body;
  if (!diagnosis_name || !diagnosis_type) {
    next(ApiError.notFound('Diagnosis name and type field is required and must be non blank'));
    return;
  }
  try {
    const addDiagnosis = await pool.query(
      "INSERT INTO  diagnosis (name, diagnosis_type,verified)VALUES($1,$2,$3) RETURNING diagnosis_id", [diagnosis_name, diagnosis_type, 'true']);

    const d_id = addDiagnosis.rows[0].diagnosis_id;
    console.log("new diagnosis", d_id);

    await common.storeActivityLogs(admin_id, 'admin', 'add_diagnosis', d_id).then(
      console.log("activity inserted by admin")
    );
    res.json("Operation Successful");
  }
  catch (err) {
    common.customResponse(req, res, err);
  }
}

//delete diagnosis
const deleteDiagnosis = async (req, res) => {
  const { admin_id, diagnosis_id } = req.params;

  const query = "DELETE from diagnosis where diagnosis_id = $1";

  await common.dbOperation(req, res, query, [diagnosis_id]);

  await common.storeActivityLogs(admin_id, 'admin', 'delete_diagnosis', 0).then(
    console.log("activity inserted by admin")
  );
}

//update diagnosis
const updateDiagnosis = async (req, res) => {
  const { admin_id, diagnosis_id } = req.params;
  const { diagnosis_name, diagnosis_type } = req.body;

  const query = "UPDATE diagnosis SET name = $2, diagnosis_type = $3 where diagnosis_id = $1";

  await common.dbOperation(req, res, query, [diagnosis_id, diagnosis_name, diagnosis_type]);

  await common.storeActivityLogs(admin_id, 'admin', 'update_diagnosis', diagnosis_id).then(
    console.log("activity inserted by admin")
  );
}

//verify diagnosis 
const verifyDiagnosis = async (req, res) => {
  const { diagnosis_id } = req.params;

  const query = "UPDATE diagnosis set verified = $2 where diagnosis_id = $1";

  await common.dbOperation(req, res, query, [diagnosis_id, "t"]);
}

//add test in test's table
const addTest = async (req, res, next) => {
  const { admin_id } = req.params;
  const { test_name, test_type, price } = req.body;
  if (!test_name || !test_type || !price) {
    next(ApiError.notFound('Test name, type and price field is required and must be non blank'));
    return;
  }
  try {
    const addTest = await pool.query(
      "INSERT INTO medical_tests (name, test_type,price_in_pkr,verified)VALUES($1,$2,$3,$4) RETURNING test_id", [test_name, test_type, price, 'true']);

    const t_id = addTest.rows[0].test_id;
    console.log("new test", t_id);

    await common.storeActivityLogs(admin_id, 'admin', 'add_test', t_id).then(
      console.log("activity inserted by admin")
    );
    res.json("Operation Successful");
  }
  catch (err) {
    common.customResponse(req, res, err);
  }
}

//delete test
const deleteTest = async (req, res) => {
  const { admin_id, test_id } = req.params;

  const query = "DELETE from medical_tests where test_id = $1";

  await common.dbOperation(req, res, query, [test_id]);

  await common.storeActivityLogs(admin_id, 'admin', 'delete_test', 0).then(
    console.log("activity inserted by admin")
  );
}

//update test
const updateTest = async (req, res) => {
  const { admin_id, test_id } = req.params;
  const { test_name, test_type, price } = req.body;

  const query = "UPDATE medical_tests SET name = $2, test_type = $3 ,price_in_pkr = $4 where test_id = $1";

  await common.dbOperation(req, res, query, [test_id, test_name, test_type, price]);

  await common.storeActivityLogs(admin_id, 'admin', 'update_test', test_id).then(
    console.log("activity inserted by admin")
  );
}

//verify test 
const verifyTest = async (req, res) => {
  const { test_id } = req.params;

  const query = "UPDATE medical_tests set verified = $2 where test_id = $1";

  await common.dbOperation(req, res, query, [test_id, "t"]);
}

//add medicines in medicine's table
const addMedicine = async (req, res, next) => {
  const { admin_id } = req.params;
  const { medicine_name, medicine_type, price, strength } = req.body;
  if (!medicine_name || !medicine_type || !price || !strength) {
    next(ApiError.notFound('Medicine name, type, price and strength field is required and must be non blank'));
    return;
  }
  try {
    const addTMediicne = await pool.query(
      "INSERT INTO medicines (name, medicine_type,price,amount_in_grams,verified)VALUES($1,$2,$3,$4,$5) RETURNING medicine_id", [medicine_name, medicine_type, price, strength, 'true']);

    const m_id = addTMediicne.rows[0].medicine_id;
    console.log("new medicine", m_id);

    await common.storeActivityLogs(admin_id, 'admin', 'add_medicine', m_id).then(
      console.log("activity inserted by admin")
    );
    res.json("Operation Successful");
  }
  catch (err) {
    common.customResponse(req, res, err);
  }
}

//delete medicine
const deleteMedicine = async (req, res) => {
  const { admin_id, medicine_id } = req.params;

  const query = "DELETE from medicines where medicine_id = $1";

  await common.dbOperation(req, res, query, [medicine_id]);

  await common.storeActivityLogs(admin_id, 'admin', 'delete_medicine', 0).then(
    console.log("activity inserted by admin")
  );
}

//update medicine
const updateMedicine = async (req, res) => {
  const { admin_id, medicine_id } = req.params;
  const { medicine_name, medicine_type, price, strength } = req.body;

  const query = "UPDATE medicines SET name = $2, medicine_type = $3, price = $4, amount_in_grams = $5 where medicine_id = $1";

  await common.dbOperation(req, res, query, [medicine_id, medicine_name, medicine_type, price, strength]);

  await common.storeActivityLogs(admin_id, 'admin', 'update_medicine', medicine_id).then(
    console.log("activity inserted by admin")
  );
}

//verify medicine 
const verifyMedicine = async (req, res) => {
  const { medicine_id } = req.params;

  const query = "UPDATE medicines set verified = $2 where medicine_id = $1";

  await common.dbOperation(req, res, query, [medicine_id, "t"]);
}

//get all hospitals
const getHospitals = async (req, res) => {

  const query = "SELECT h.hospital_id, h.contact_id, c.name, c.image, (select count(location_id) as no_of_locations from hospital_locations l where l.hospital_id = h.hospital_id group by l.hospital_id) from hospitals h inner join contacts c on c.contact_id = h.contact_id";

  await common.dbOperation(req, res, query);
}

//delete hospital
const deleteHospital = async (req, res) => {
  const { admin_id, hospital_id } = req.params;

  const query = "DELETE from hospitals where hospital_id = $1";

  await common.dbOperation(req, res, query, [hospital_id]);

  await common.storeActivityLogs(admin_id, 'admin', 'delete_hospital', 0).then(
    console.log("activity inserted by admin")
  );
}

//get all locations by hospital_name
const getLocationsByHospital = async (req, res) => {
  const { hospital_name } = req.params;

  const query = "SELECT l.location_id,c.name, c.address, c.longitude, c.latitude, pn.number from hospital_locations l inner join contacts c on c.contact_id = l.contact_id inner join hospitals h on h.hospital_id = l.hospital_id inner join phone_numbers pn on pn.contact_id = l.contact_id where h.contact_id = (select h.contact_id from contacts c inner join hospitals h on h.contact_id = c.contact_id where c.name = $1)";

  await common.dbOperation(req, res, query, [hospital_name]);
}

//add hospital name
const addHospital = async (req, res, next) => {
  const { admin_id } = req.params;
  const { hospital_name } = req.body;
  if (!hospital_name) {
    next(ApiError.notFound('hospital_name is required and must be non blank'));
    return;
  }
  try {
    const contact_id = await pool.query('SELECT contact_id from contacts where name = $1', [hospital_name]);
    const c_id = contact_id.rows[0];

    if (c_id == null) {
      const hospitalImage = await pool.query('INSERT INTO contacts(name) VALUES($1) RETURNING contact_id ', [hospital_name]);
      const newc_id = hospitalImage.rows[0].contact_id;
      console.log("new contact", newc_id);
      const addHospital = await pool.query('INSERT INTO hospitals(contact_id) VALUES($1) RETURNING hospital_id', [newc_id]);
      const h_id = addHospital.rows[0].hospital_id;
      console.log("new hospital", h_id);

      await common.storeActivityLogs(admin_id, 'admin', 'add_hospital', h_id).then(
        console.log("activity inserted by admin")
      );
      res.json("Hospital Added");
    }
    else {
      res.json("All ready exist!");
    }
  }
  catch (err) {
    common.customResponse(req, res, err);
  }
}

//update hospital name
const updateHospital = async (req, res) => {
  const { admin_id, hospital_id } = req.params;
  const { hospital_name } = req.body;
  try {
    const contact_id = await pool.query('SELECT contact_id from hospitals where hospital_id = $1', [hospital_id]);
    const c_id = contact_id.rows[0].contact_id;
    console.log(c_id);

    const updateName = await pool.query("UPDATE contacts SET name = $1 WHERE contact_id = $2", [hospital_name, c_id]);

    await common.storeActivityLogs(admin_id, 'admin', 'update_hospital', hospital_id).then(
      console.log("activity inserted by admin")
    );
    res.json("hospital updated!");

  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// function for getting activity logs of doctors
const getActivityLogsAdmins = async (req, res) => {
  const { admin_id } = req.params;
  try {
    const getActivityLogsAdmin = await pool.query(
      "select l.log_id,(select row_to_json(logUserInfo) from(select u.id as admin_id, (select c.name from contacts c where c.contact_id = u.contact_id),(select c.image from contacts c where c.contact_id = u.contact_id) from users u where l.log_user = u.id and u.role = $2) logUserInfo) as log_user_info, (select a.activity from activity_type a where a.activity_id = l.activity_id),(select a.activity_table from activity_type a where a.activity_id = l.activity_id), l.object_id, l.time_stamp from activity_logs l where l.log_user_type = $2 and l.log_user = $1 order by time_stamp desc", [admin_id, 'admin']
    );
   
    const values = [];
    const values1 = getActivityLogsAdmin.rows;
    var output = values1.map(async (item) => {
      const myValue = await dataFromActivityTableAdmin(item.activity_table, item.object_id, item.activity);
      values.push({ ...item, 'activity_on': myValue.rows[0] });
    });
    Promise.all(output).then(() => res.json(values));
  } catch (err) {
    common.customResponse(req, res, err);
  }
}

// function for getting activity logs
const dataFromActivityTableAdmin = async (activity_table, object_id) => {
  const myId = activity_table.slice(0, activity_table.length - 1);
  if (activity_table == 'users') {
    const myquery = "select u.id as user_id,(select c.name from contacts c where c.contact_id = u.contact_id) from users u where u.id = $1 and contact_id = (select contact_id from users where id = $1)";
    const values = await pool.query(
      myquery, [object_id]
    );
    return (values);
  }
  if (activity_table == 'hospital_locations') {
    const myquery = "select l.location_id,(select c.name from contacts c where c.contact_id = l.contact_id), (select row_to_json(h) from(select h.hospital_id, c.name, c.image from hospitals h inner join contacts c on c.contact_id = h.contact_id  where l.hospital_id = h.hospital_id )h) as hospital_info from hospital_locations l where l.location_id = $1 and contact_id = (select contact_id from hospital_locations where location_id = $1)";
    const values = await pool.query(
      myquery, [object_id]
    );
    return (values);
  }
  if (activity_table == 'hospitals') {
    const myquery = "select h.hospital_id,(select c.name from contacts c where c.contact_id = h.contact_id) from hospitals h where h.hospital_id = $1 and contact_id = (select contact_id from hospitals where hospital_id = $1)";
    const values = await pool.query(
      myquery, [object_id]
    );
    return (values);
  }
  if (activity_table == 'symptoms') {
    const myquery = "select symptom_id,name from symptoms where symptom_id = $1";
    const values = await pool.query(
      myquery, [object_id]
    );
    return (values);
  }
  if (activity_table == 'diagnosis') {
    const myquery = "select diagnosis_id,name from diagnosis where diagnosis_id = $1";
    const values = await pool.query(
      myquery, [object_id]
    );
    return (values);
  }
  if (activity_table == 'medical_tests') {
    const myquery = "select test_id, name from medical_tests where test_id = $1";
    const values = await pool.query(
      myquery, [object_id]
    );
    return (values);
  }
  if (activity_table == 'medicines') {
    const myquery = "select medicine_id,name from medicines where medicine_id = $1";
    const values = await pool.query(
      myquery, [object_id]
    );
    return (values);
  }
}


module.exports = {
  getAllDoctors,
  getAllAdmins,
  deleteAdmin,
  updateAdmin,
  addDoctor,
  deleteDoctor,
  updateDoctor,
  addAdmin,
  addLocation,
  deleteLocation,
  updateLocation,
  addSymptom,
  deleteSymptom,
  updateSymptom,
  verifySymptom,
  addDiagnosis,
  deleteDiagnosis,
  updateDiagnosis,
  verifyDiagnosis,
  addTest,
  deleteTest,
  updateTest,
  verifyTest,
  addMedicine,
  deleteMedicine,
  updateMedicine,
  verifyMedicine,
  updateHospital,
  getHospitals,
  addHospital,
  deleteHospital,
  getActivityLogsAdmins,
  getLocationsByHospital,
}
