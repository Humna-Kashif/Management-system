require('dotenv').config();
const express = require("express");
const apiErrorHandler = require('./error/api-error-handler');
const app = express();
const cors = require("cors");
const doctorAPIs = require('./DoctorAPIs');
const patientAPIs = require('./PatientAPIs');
const appointmentAPIs = require('./AppointmentAPIs');
const adminAPIs = require('./AdminAPIs');
const fileHandlingAPIs = require('./FileHandlingAPIs');
const aibersInfo = require('./AibersAPIs');
const auth = require('./Auth');
const http = require('http');

// middle-wares
app.use(express.static('./public'));
app.use(cors());
app.use(express.json());

var server = http.createServer(app, function (request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});

// const server = http.createServer(app)
const port = 8090;
server.listen(port, function () {
  console.log((new Date()) + ` Server is listening on port ${port}`);
});

// jwt APIs
//create jwt for APIs access
app.post('/createJWTForAPIsAccess', auth.createTokenForAPIsAccess);

// decodeing/verifying jwt for otp
app.post('/decodeJWTForOTP', auth.verifyTokenForOTP);

// creating jwt for otp
app.post('/createJWTForOTP', auth.createTokenForOTP);

app.use(auth.verifyTokenForAPIsAccess);

// zoom APIs (temporary)
app.get('/doctors/createMeeting', doctorAPIs.createMeeting);

// getting telehealth appointments (temporary)
app.get('/doctors/(:doctor_id)/appointments/telehealth', appointmentAPIs.telehealthAppointments);


//login and logout APIs (done)
//user login
app.get('/contacts/(:contact_no)/login', doctorAPIs.userLogin);

//user log out
app.put('/contacts/sessions/(:session_id)/logout', doctorAPIs.userLogout);

//get patient_id by contact no
app.put('/patients/(:contact_no)/login', patientAPIs.patientLogin);

//log out patient
app.put('/patients/sessions/(:session_id)/logout', patientAPIs.patientLogout);


//admin APIs (done)
//get (all doctors) and add doctors
app.route('/admins/(:admin_id)/doctors').get(adminAPIs.getAllDoctors).post(adminAPIs.addDoctor);

//delete and update doctor
app.route('/admins/(:admin_id)/doctors/(:doctor_id)').delete(adminAPIs.deleteDoctor).put(adminAPIs.updateDoctor);

//get (all admins), add, delete and update admins
app.route('/admins/(:admin_id)').get(adminAPIs.getAllAdmins).post(adminAPIs.addAdmin).delete(adminAPIs.deleteAdmin).put(adminAPIs.updateAdmin);

//get admin profile
app.get('/admins/(:admin_id)/profile', adminAPIs.getAllAdmins);

//add location
app.post('/admins/(:admin_id)/locations', adminAPIs.addLocation);

//delete and update location
app.route('/admins/(:admin_id)/locations/(:location_id)').delete(adminAPIs.deleteLocation).put(adminAPIs.updateLocation);

//add hospital name
app.route('/admins/(:admin_id)/hospitals').get(adminAPIs.getHospitals).post(adminAPIs.addHospital);

//update and delete hospital 
app.route('/admins/(:admin_id)/hospitals/(:hospital_id)').put(adminAPIs.updateHospital).delete(adminAPIs.deleteHospital);

//get all locations by hospital_name
app.get('/admins/(:admin_id)/locations/(:hospital_name)', adminAPIs.getLocationsByHospital);

//add symptoms
app.post('/admins/(:admin_id)/symptoms', adminAPIs.addSymptom);

//update and delete symptoms by id
app.route('/admins/(:admin_id)/symptoms/(:symptom_id)').put(adminAPIs.updateSymptom).delete(adminAPIs.deleteSymptom);

//verify symptoms
app.put('/admins/(:admin_id)/verify_symptom/(:symptom_id)', adminAPIs.verifySymptom);

//add diagnosis
app.post('/admins/(:admin_id)/diagnosis', adminAPIs.addDiagnosis);

//verify diagnosis
app.put('/admins/(:admin_id)/verify_diagnosis/(:diagnosis_id)', adminAPIs.verifyDiagnosis);

//update and delete diagnosis by id
app.route('/admins/(:admin_id)/diagnosis/(:diagnosis_id)').put(adminAPIs.updateDiagnosis).delete(adminAPIs.deleteDiagnosis);

//add test
app.post('/admins/(:admin_id)/tests', adminAPIs.addTest);

//verify test
app.put('/admins/(:admin_id)/verify_test/(:test_id)', adminAPIs.verifyTest);

//update and delete test by id
app.route('/admins/(:admin_id)/tests/(:test_id)').put(adminAPIs.updateTest).delete(adminAPIs.deleteTest);

//add medicine
app.post('/admins/(:admin_id)/medicines', adminAPIs.addMedicine);

//verify medicine
app.put('/admins/(:admin_id)/verify_medicine/(:medicine_id)', adminAPIs.verifyMedicine);

//update and delete medicine by id
app.route('/admins/(:admin_id)/medicines/(:medicine_id)').put(adminAPIs.updateMedicine).delete(adminAPIs.deleteMedicine);

// get activity logs of admins
app.get('/admins/(:admin_id)/activity', adminAPIs.getActivityLogsAdmins);


//contacts APIs (done)
// update contact by contact id
var contact = ['/doctors/(:id)/update','/patients/(:id)/update', '/nurses/(:id)/update', '/fd/(:id)/update', '/pa/(:id)/update'];

app.put(contact, doctorAPIs.updateContact);

// update patient's contact by patient_id (web)
app.put('/doctors/(:doctor_id)/patients/(:patient_id)/update', patientAPIs.updateContactPatient);

// url APIs
app.route('/doctors/(:contact_id)/url/(:url_id)').get(doctorAPIs.getUrl).post(doctorAPIs.setUrl).put(doctorAPIs.updateUrl).delete(doctorAPIs.deleteUrl);

// email APIs
app.route('/doctors/(:contact_id)/email/(:email_id)').get(doctorAPIs.getEmail).post(doctorAPIs.setEmail).put(doctorAPIs.updateEmail).delete(doctorAPIs.deleteEmail);


//doctor APIs (done)
//get doctor profile by id
app.get('/doctors/(:doctor_id)/profile', doctorAPIs.doctors_profile);

//get doctors
app.get('/doctors', doctorAPIs.getDoctors);

// //get location by character
app.get('/doctors/(:doctor_id)/profile/location', doctorAPIs.doctors_profile_searchLocation);

//get all hospitals by hospital_name
app.get('/doctors/(:doctor_id)/hospital_names', doctorAPIs.getAllHospitals);

//get all hospitals
app.get('/doctors/(:doctor_id)/hospitals', adminAPIs.getHospitals);

//get and post hospital location of doctors
app.route('/doctors/(:doctor_id)/profile/locations').get(doctorAPIs.doctors_profile_getHospitalLocation).post(doctorAPIs.doctors_profile_setlocation);

// update and disable hospital location  by doctors_hospital_location_id
app.route('/doctors/(:doctor_id)/profile/locations/(:doctors_hospital_location_id)').put(doctorAPIs.doctors_profile_updatelocation).delete(doctorAPIs.doctors_profile_deletelocation);

//get and post Qualification of doctors
app.route('/doctors/(:doctor_id)/profile/qualifications').get(doctorAPIs.doctors_profile_getqualification).post(doctorAPIs.doctors_profile_setqualification);

//update and delete Qualification of doctors
app.route('/doctors/(:doctor_id)/profile/qualifications/(:doctor_qualification_id)').put(doctorAPIs.doctors_profile_updatequalification).delete(doctorAPIs.doctors_profile_deletequalification);


//doctor staff APIs (done)
//get staff nurse profile by id
app.get('/nurses/(:nurse_id)/profile', doctorAPIs.staffNurse)

//get staff fd profile by id
app.get('/fd/(:fd_id)/profile', doctorAPIs.staffFD)

//get staff pa profile by id
app.get('/pa/(:pa_id)/profile', doctorAPIs.staffPA)

//get and post staff in contacts
app.route('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/staff').get(doctorAPIs.getStaff).post(doctorAPIs.insertStaff)

//update and delete staff by id
app.route('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/staff/(:staff_id)').put(doctorAPIs.updateStaff).delete(doctorAPIs.deleteStaff)

//get all staffs 
app.get('/doctors/(:doctor_id)/staffs/contact_no/(:contact_no)', doctorAPIs.getAllStaffs)


//appointment APIs (done)
//get symptoms by character
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_symptoms', appointmentAPIs.getSymptoms);

//set and delete appointment symptoms
app.route('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_symptoms/(:appointment_id)').post(appointmentAPIs.setAppointmentSymptoms).delete(appointmentAPIs.deleteAppointmentSymptoms);

// set doctor note for paitent
app.post('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_doctornote/(:appointment_id)', appointmentAPIs.setDoctorNoteForPatient);

// update and delete doctor note for paitent
app.route('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_doctornote/(:doctor_note_id)').put(appointmentAPIs.updateDoctorNoteForPatient).delete(appointmentAPIs.deleteDoctorNoteForPatient);

//get diagnosis list for drop down
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_diagnosis', appointmentAPIs.getDiagnosis);

//set and delete appointment diagnosis
app.route('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_diagnosis/(:appointment_id)').post(appointmentAPIs.setAppointmentDiagnosis).delete(appointmentAPIs.unlistDiagnosisByAppointmentID);

//get test list for drop down
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_tests', appointmentAPIs.getTest);

//set and delete appointment test
app.route('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_tests/(:appointment_id)').post(appointmentAPIs.setAppointmentTests).delete(appointmentAPIs.unlistTestByAppointmentID);

//get medicines by character
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_medicine', appointmentAPIs.getPrescription);

//set and delete prescription
app.route('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_prescription/(:appointment_id)').post(appointmentAPIs.setPrescription).delete(appointmentAPIs.unlistPrescriptionFromAppointment);

//set fee structure
app.post('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments/(:appointment_id)/fee_structure', appointmentAPIs.fee_structure);

//set, cancel and reschedule appointment
app.route('/patients/(:patient_id)/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/appointments/(:appointment_id)').post(appointmentAPIs.newAppointment).delete(appointmentAPIs.cancelAppointmentByAppointmentId).put(appointmentAPIs.rescheduleAppointment);

// set followUp 
app.post('/patients/(:patient_id)/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/appointments_followup/(:appointment_id)', appointmentAPIs.setFollowUp);

//set (web) and change appointment status by appointment
app.route('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments/(:appointment_id)').post(appointmentAPIs.newAppointment).put(appointmentAPIs.updateAppointmentStatus);

// make copy of appointment + delete and all associated data
app.route('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments/(:appointment_id)/edit').post(appointmentAPIs.copyOfAppointment).delete(appointmentAPIs.deleteAppointment);

// copy appointment data from one appointment to another appointment
app.post('/doctors/(:doctor_id)/copy_app_data/from/(:app_id_from)/to/(:app_id_to)', appointmentAPIs.copyAppointmentData);

//reschedule appointment by appointment_id (web)
app.put('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_reschedule/(:appointment_id)', appointmentAPIs.rescheduleAppointment);

//cancel appointment by appointment_id (web)
app.put('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_cancelled/(:appointment_id)', appointmentAPIs.cancelAppointmentByAppointmentId);

// set followUp (web)
app.post('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_followup/(:appointment_id)', appointmentAPIs.setFollowUp);

// List all appointments of a doctor by selected date
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments', appointmentAPIs.getAppointmentsByDate)

// List all appointments of a doctor between selected dates
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments/(:start_date)/(:end_date)', appointmentAPIs.getAppointmentsBetweenDate);

//get all appointments list
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointment_list', appointmentAPIs.getAppointmentslist);

//get all appointments
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_status/(:appointment_id)', appointmentAPIs.getAppointmentsHistory);

//get all completed appointments
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/completed_appointments', appointmentAPIs.getCompletedAppointments);

// get current day's appointment stats of a doctor
app.put('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/appointments_stats', appointmentAPIs.appointmentsStats);

// get current day's appointment stats of a doctor
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/appointments_stats/(:start_date)/(:end_date)', appointmentAPIs.appointmentsStatsBetweenDate);

// get current day's appointment queue of a doctor
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/appointments_queue', appointmentAPIs.appointmentsQueue);

//get appointment detail || followUps(filter status = followups + status = followup_trail)
var getFollowups = ['/patients/(:patient_id)/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/appointments/(:appointment_id)', '/doctors/(:doctor_id)/patients/(:patient_id)/locations/(:doctors_hospital_location_id)/appointments/(:appointment_id)'];
app.get(getFollowups, appointmentAPIs.getAppointmentDetail);

//get appointments by status
var getAppointments = ['/patients/(:patient_id)/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/appointments', '/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_status'];
app.get(getAppointments, appointmentAPIs.getAppointments);

//get discount reasons by character and set discount reasons
app.route('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/discount_reasons').get(appointmentAPIs.getDiscountReasons).post(appointmentAPIs.setDiscountReasons);

//get completed appointments by doctor_id
app.get('/patients/(:patient_id)/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/appointments_ondate', appointmentAPIs.todayAppointments);

// get test record by an appointment
app.get('/patients/(:patient_id)/appointments/(:appointment_id)/test_record', appointmentAPIs.getTestRecord);

// get count of status by date
app.get('/doctors/(:doctor_id)/appointment_status', appointmentAPIs.getStatus);

// get logging
app.get('/doctors/(:doctor_id)/appointments/(:appointment_id)/logging', appointmentAPIs.getLogging);

//get dates without range
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_date', appointmentAPIs.getDate);


//dashboard APIs 
//get dates with range
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_date/(:start_date)/(:end_date)', appointmentAPIs.getDates);

//extract data of patients count (past months)
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/patients_acrossDates/(:start_date)/(:end_date)', appointmentAPIs.getPatientsAcrossDates);

//get total discount 
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/total_discount/(:start_date)/(:end_date)', appointmentAPIs.getTotalDiscount);

//get total revenue
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/total_revenue/(:start_date)/(:end_date)', appointmentAPIs.getTotalRevenue);

//get completed appointments by current date
app.put('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/completedAppointment_CurrentDate/(:start_date)/(:end_date)', appointmentAPIs.completedAppointmentsByCurrentDates);

// medicine stats
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/medicine_stats/(:start_date)/(:end_date)', appointmentAPIs.medicineStats);

// test stats
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/test_stats/(:start_date)/(:end_date)', appointmentAPIs.testStats);

// symtom stats
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/symptom_stats/(:start_date)/(:end_date)', appointmentAPIs.symptomStats);

// diagnosis stats
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/diagnosis_stats/(:start_date)/(:end_date)', appointmentAPIs.diagnosisStats);


//patient APIs

//get doctors
app.get('/patients/(:patient_id)/allDoctors', patientAPIs.allDoctors) //done

//get name,gender,BG,DOB of patient by id
app.get('/patients/(:patient_id)/profile/info', patientAPIs.patients_profile_info) //done

//get history of patient by id
app.get('/patients/(:patient_id)/profile/history', patientAPIs.patients_profile_history) //done

//get all patients
app.get('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/allPatients', patientAPIs.getAllPatients);//done

//get all patients by contact no and name (input -> name/ number)
app.get('/doctors/(:doctor_id)/search/(:input)/allPatients', patientAPIs.searchAllPatients);//done

//insert a new patient in patient tab
app.post('/doctors/(:doctor_id)/contact_no/(:contact_no)/new_patient', patientAPIs.newPatient);//done

// add family member
app.post('/patients/(:patient_id)/family/(:family_id)', patientAPIs.addFamilyMember); // done

// remove family member
app.delete('/patients/(:patient_id)/family/(:family_id)/familymember/(:family_member_id)', patientAPIs.removeFamilyMember); //done

// get patient information
app.get('/patients/(:patient_id)', patientAPIs.getPatientInfo); //done

// get test info
var testInfo = ['/patients/(:patient_id)/test_info', '/doctors/(:doctor_id)/patients/(:patient_id)/test_info']; //done
app.get(testInfo, patientAPIs.getTestInfo); //done


// vitals APIs
//get and add vitals by patient
app.route('/patients/(:patient_id)/vitals/(:vital_id)').get(patientAPIs.getVitals).post(patientAPIs.addVitals).put(patientAPIs.updateVitals) //done

// update and get vitals by doctor
app.route('/doctors/(:doctor_id)/patients/(:patient_id)/vitals/(:vital_id)').put(doctorAPIs.updateVitals).get(doctorAPIs.getVitals);//done

// add vitals by doctor
app.post('/doctors/(:doctor_id)/patients/(:patient_id)/vitals', doctorAPIs.addVitals);//done

//get patient notification token by patient_id 
app.get('/patients/(:patient_id)/notification_token', doctorAPIs.patientToken); //confirm from front then remove if not in use

//save, get and change notifications
app.route('/patients/(:patient_id)/doctors/(:doctor_id)/appointments/(:appointment_id)/notifications/(:notification_id)').get(patientAPIs.getPatientNotifications).put(patientAPIs.changeNotificationStatus) //done

//get and change notifications
app.route('/doctors/(:doctor_id)/patients/(:patient_id)/appointments/(:appointment_id)/notifications/(:notification_id)').get(doctorAPIs.getDoctorNotifications).put(doctorAPIs.changeNotificationStatus)//done


// comments APIs
//get and insert comments by appointment_id
app.route('/patients/(:patient_id)/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/appointments/(:appointment_id)/comments').get(patientAPIs.getComments).post(patientAPIs.insertComment) //done

//get and insert comments by appointment_id(web)
app.route('/doctors/(:doctor_id)/patients/(:patient_id)/appointments/(:appointment_id)/comments').get(patientAPIs.getComments).post(patientAPIs.insertComment) //done


//access APIs
// add or remove doctor's access from accessing patient's profile
app.post('/patients/(:patient_id)/doctors/(:doctor_id)/access', patientAPIs.doctorAccess); //done

//get allowed doctors (access)
app.get('/patients/(:patient_id)/allowed_doctors', patientAPIs.allowed_doctors); //done

//get pending request (access)
app.get('/patients/(:patient_id)/pending_request', patientAPIs.pending_request); //done

// access status change
app.put('/patients/(:patient_id)/doctors/(:doctor_id)/access_request', patientAPIs.access_request); //done

// access status change(web)
app.put('/doctors/(:doctor_id)/patients/(:patient_id)/access_request', patientAPIs.access_request); //done

// time slot API
app.put('/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/slots', doctorAPIs.slots);


//favourite APIs
//get, remove and insert favourite doctors by patient_id
app.route('/patients/(:patient_id)/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/favourites').get(patientAPIs.getFavouriteDoctors).post(patientAPIs.insertFavouriteDoctor).delete(patientAPIs.deleteFavouriteDoctor) //done

// get login sessions of doctors
app.get('/doctors/(:doctor_id)/sessions', doctorAPIs.loginSessionsDoctors); //done

// get login sessions of patients
app.get('/patients/(:patient_id)/sessions', patientAPIs.loginSessionsPatients); //done

// get activity logs of doctors
app.get('/doctors/(:doctor_id)/activity', doctorAPIs.getActivityLogsDoctors); //done

// get activity logs of patients
app.get('/patients/(:patient_id)/activity', patientAPIs.activityLogs); //done

// get user info (temprory API for checking Browser, OS and IP information)
app.get('/userInfo', patientAPIs.userInfo); //done

// get app's info(name + version number)
app.get('/aibersInfo', aibersInfo.aibers_info); //done


//file handling APIs
//upload image
var putImage = ['/hospitals/(:id)/image', '/nurses/(:id)/image', '/fd/(:id)/image', '/pa/(:id)/image', '/doctors/(:id)/image', '/patients/(:id)/image'];
app.put(putImage, fileHandlingAPIs.uploadImage); //done

//get image
var displayImage = ['/hospitals/(:id)/image', '/nurses/(:id)/image', '/fd/(:id)/image', '/pa/(:id)/image', '/doctors/(:id)/image', '/patients/(:id)/image'];
app.get(displayImage, fileHandlingAPIs.getImage); //done

//upload and get test result
app.route('/patients/(:patient_id)/appointments/(:appointment_id)/tests/(:test_id)').get(fileHandlingAPIs.getTestResult).put(fileHandlingAPIs.uploadTestResult); //done

// upload test result API for archive patient
app.post('/patients/(:patient_id)/appointments/(:appointment_id)/tests/(:test_id)/(:test_name)', fileHandlingAPIs.uploadTestResultArchive); //done

// upload test result API for archive web
app.post('/doctors/(:doctor_id)/patients/(:patient_id)/appointments/(:appointment_id)/tests/(:test_id)/(:test_name)', fileHandlingAPIs.uploadTestResultArchive); //done

//upload and get test result (web)
app.route('/doctors/(:doctor_id)/patients/(:patient_id)/appointments/(:appointment_id)/tests/(:test_id)').get(fileHandlingAPIs.getTestResult).put(fileHandlingAPIs.uploadTestResult); //done


app.use(apiErrorHandler); // don't remove this api error handler
