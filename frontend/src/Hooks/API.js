import config, { baseURL } from "../config";
import { getDatetoSet } from "./TimeHandling";
const BaseURL = config.baseURL;
const doc_BaseURL = BaseURL + "/doctors/";
const pat_BaseURL = BaseURL + "/patients/";
const admin_BaseURL = BaseURL + "/admins/";

function headers() {
  const apiJWT = localStorage.getItem("verify_token");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + apiJWT,
    Connection: "close",
  };
}

/////////////////////////////////////////////////// LogIn APIs ///////////////////////////////////////////////////////////////////
export function LogInAPI(phnNo, session_id) {
  console.log("Phone Number ", phnNo, " session id ", session_id);
  return fetch(BaseURL + "/contacts/" + phnNo + "/login?sid=" + session_id, {
    headers: headers(),
  }).then((response) => response.json());
}

export function LogOutAPI(session_id) {
  return fetch(BaseURL + "/contacts/sessions/" + session_id + "/logout", {
    method: "PUT",
    headers: headers(),
  }).then((response) => response.json());
}

export function createJWTForAPIsAccess(phoneNo, key) {
  console.log("In createJWTForAPIsAccess function");
  return fetch(BaseURL + "/createJWTForAPIsAccess", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      pno: phoneNo,
      apiKey: key,
    }),
  }).then((response) => response.json());
}

export function getAibersInfo(jwt) {
  return fetch(BaseURL + "/aibersInfo", {
    method: "GET",
    ContentType: "application/json",
    headers: { Authorization: "Bearer " + jwt },
  }).then((response) => response.json());
}

export function createJWTForOTP(contactNo, key, jwtForAPIAccess) {
  return fetch(BaseURL + "/createJWTForOTP", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + jwtForAPIAccess,
    },
    body: JSON.stringify({
      pno: contactNo,
      apiKey: key,
    }),
  }).then((response) => response.json());
}

export function decodeJWTForOTP(jwt) {
  return fetch(BaseURL + "/decodeJWTForOTP", {
    method: "POST",
    ContentType: "application/json",
    headers: { Authorization: "Bearer " + jwt },
  }).then((response) => response.json());
}

/////////////////////////////////////////////////// Profile Screen APIs ///////////////////////////////////////////////////////////////////

//Get Doctor all info (new implemented)
export function getProfileAllInfo(type, id) {
  return fetch(BaseURL + '/' + type + '/' + id + '/profile', {
    headers: headers()
  }).then(response => response.json());
}

// For Edit doctor all info (new implemented)
export function editAboutInfoAPI(
  type,
  id,
  nameValue,
  genderValue,
  dobValue,
  specializationValue,
  aboutValue
) {
  return fetch(BaseURL + "/" + type + "/" + id + "/update", {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      name: nameValue,
      gender: genderValue,
      dob: dobValue,
      specialization: specializationValue,
      about: aboutValue,
    }),
  }).then((response) => response.json());
}

//Get All Emails (new implemented )
export function getAllEmailsAPI(contact_id, email_id) {
  return fetch(doc_BaseURL + contact_id + "/email/" + email_id + "/getEmail", {
    headers: headers(),
  }).then((response) => response.json());
}

//Set  Emails (new implemented)
export function setEmailAPI(contact_id, email_id, APImethod, Email) {
  return fetch(doc_BaseURL + contact_id + "/email/" + email_id + "/setEmail", {
    method: APImethod,
    headers: headers(),
    body: JSON.stringify({
      email: Email,
    }),
  }).then((response) => response.json());
}

//update  Emails (new implemented)
export function updateEmailAPI(contact_id, email_id, APImethod, Email) {
  return fetch(
    doc_BaseURL + contact_id + "/email/" + email_id + "/updatetEmail",
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        email: Email,
      }),
    }
  ).then((response) => response.json());
}

//delete Email
export function deleteEmailAPI(contact_id, email_id, APImethod, Email) {
  return fetch(
    doc_BaseURL + contact_id + "/email/" + email_id + "/deleteEmail",
    {
      method: APImethod,
      headers: headers(),
    }
  ).then((response) => response.json());
}

// Get all Doctor Qualifications (new implemented)
export function qualificationsAPI(doc_id) {
  return fetch(doc_BaseURL + doc_id + "/profile/qualifications", {
    headers: headers(),
  }).then((response) => response.json());
}

// For adding a new qualification (new implementd)
export function addQualificationAPI(doc_id, APImethod, QualificationValue) {
  return fetch(doc_BaseURL + doc_id + "/profile/qualifications", {
    method: APImethod,
    headers: headers(),
    body: JSON.stringify({
      qualification: QualificationValue,
    }),
  }).then((response) => response.json());
}

// For Delete Qualification (new implemenated)
export function deleteQualificationAPI(doc_id, APImethod, Qualificationid) {
  return fetch(
    doc_BaseURL + doc_id + "/profile/qualifications/" + Qualificationid,
    {
      method: APImethod,
      headers: headers(),
    }
  ).then((response) => response.json());
}

// For Edit Qualification  (new implemented)
export function editQualificationAPI(
  doc_id,
  APImethod,
  QualificationValue,
  Qualificationid
) {
  return fetch(
    doc_BaseURL + doc_id + "/profile/qualifications/" + Qualificationid,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        qualification: QualificationValue,
      }),
    }
  ).then((response) => response.json());
}

// Get all Doctor Facilities
export function facilitiesAPI(doc_id) {
  return fetch(doc_BaseURL + doc_id + "/profile/facilities", {
    headers: headers(),
  }).then((response) => response.json());
}

// For adding a new facility
export function addFacilityAPI(doc_id, APImethod, FacilityValue) {
  return fetch(doc_BaseURL + doc_id + "/profile/facilities", {
    method: APImethod,
    headers: headers(),
    body: JSON.stringify({
      facility: FacilityValue,
    }),
  }).then((response) => response.json());
}

// For Delete Facility
export function deleteFacilityAPI(doc_id, APImethod, Facilityid) {
  return fetch(doc_BaseURL + doc_id + "/profile/facilities/" + Facilityid, {
    method: APImethod,
    headers: headers(),
  }).then((response) => response.json());
}

// For Edit Facility
export function editFacilityAPI(doc_id, APImethod, FacilityValue, Facilityid) {
  return fetch(doc_BaseURL + doc_id + "/profile/facilities/" + Facilityid, {
    method: APImethod,
    headers: headers(),
    body: JSON.stringify({
      facility: FacilityValue,
    }),
  }).then((response) => response.json());
}

// Get all Doctor Locations   (new implemented)
export function locationsAPI(doc_id) {
  return fetch(doc_BaseURL + doc_id + "/profile/locations", {
    headers: headers(),
  }).then((response) => response.json());
}

// Get all and search all Doctor locations (new implemented)
export function searchLocationsAPI(doc_id, char_val) {
  return fetch(
    doc_BaseURL + doc_id + "/profile/location?character=" + char_val,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

// Add a new location (new)
export function addLocationAPI(
  doc_id,
  APImethod,
  locationValue,
  feesValue,
  appointmentType,
  plainOptions) {
  return fetch(doc_BaseURL + doc_id + "/profile/locations", {
    method: APImethod,
    headers: headers(),
    body: JSON.stringify({
      location: locationValue,
      fees: feesValue,
      appointment_type: appointmentType,
      schedule: plainOptions,
    }),
  }).then((response) => response.json());
}

// Edit a Location
export function editLocationAPI(
  doc_id,
  doctors_hospital_location_id,
  locationValue,
  feesValue,
  appointmentType,
  plainOptions
) {
  return fetch(
    doc_BaseURL + doc_id + "/profile/locations/" + doctors_hospital_location_id,
    {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({
        location: locationValue,
        fees: feesValue,
        appointment_type: appointmentType,
        schedule: plainOptions,
      }),
    }
  ).then((response) => response.json());
}

// Delete a location

export function deleteLocationAPI(doc_id, doctors_hospital_location_id) {
  return fetch(
    doc_BaseURL + doc_id + "/profile/locations/" + doctors_hospital_location_id,
    {
      method: "DELETE",
      headers: headers(),
    }
  ).then((response) => response.json());
}

//getStaffdetail
export function getStaff(doc_ID, location_id) {
  return fetch(doc_BaseURL + doc_ID + "/locations/" + location_id + "/staff", {
    headers: headers(),
  }).then((response) => response.json());
}

//addStaff
//https://app.aibers.health/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/staff
export function addStaff(
  doc_ID,
  hospital_ID,
  APImethod,
  name,
  dob,
  gender,
  phnNo,
  role
) {
  return fetch(doc_BaseURL + doc_ID + "/locations/" + hospital_ID + "/staff", {
    method: APImethod,
    headers: headers(),
    body: JSON.stringify({
      name: name,
      dob: dob,
      gender: gender,
      contact_no: phnNo,
      role: role,
    }),
  }).then((response) => response.json());
}

//editStaff
//https://app.aibers.health/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/staff/(:staff_id)
//https://app.aibers.health/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/staff/(:staff_id)
export function editStaff(
  doc_ID,
  hospital_ID,
  staff_id,
  APImethod,
  name,
  dob,
  gender,
  // cId,
  // pa_id,
  // fd_id,
  // nurse_id,
  // roleNurse,
  // rolePa,
  // roleFD
) {
  return fetch(
    doc_BaseURL + doc_ID + "/locations/" + hospital_ID + "/staff/" + staff_id,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        name: name,
        dob: dob,
        gender: gender,
        // contact_id: cId,
        // doctor_staff_pa_id: pa_id,
        // doctor_staff_fd_id: fd_id,
        // doctor_staff_nurse_id: nurse_id,
        // status_nurse: roleNurse,
        // status_pa: rolePa,
        // status_fd: roleFD,
      }),
    }
  ).then((response) => response.json());
}
//deleteStaff
//https://app.aibers.health/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/staff/(:staff_id)
export function deleteStaff(
  doc_ID,
  hospital_ID,
  staff_id,
  APImethod
) {
  return fetch(
    doc_BaseURL + doc_ID + "/locations/" + hospital_ID + "/staff/" + staff_id,
    {
      method: APImethod,
      headers: headers(),
      // body: JSON.stringify({
      //   doctor_staff_pa_id: pa_id,
      //   doctor_staff_fd_id: fd_id,
      //   doctor_staff_nurse_id: nurse_id,
      // }),
    }
  ).then((response) => response.json());
}

/////////////////////////////////////////////////// Appointment Screen APIs ///////////////////////////////////////////////////////////////////

// Get Appointments by selected date (working)
export function appointmentsByDateAPI(doc_ID, hospital_ID, patient_ID, date) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments?selected_date=" +
    date,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

//Get patient info (working)
export function patientInfoAPI(patient_ID) {
  return fetch(pat_BaseURL + patient_ID + "/profile/info", {
    headers: headers(),
  }).then((response) => response.json());
}

//Get  patient’s appointments detail (working)
export function appointmentDetailAPI(patient_ID) {
  return fetch(pat_BaseURL + patient_ID + "/profile/history", {
    headers: headers(),
  }).then((response) => response.json());
}

//New Appointment  (working)
export function addAppointmentAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  role_type,
  role_id,
  date,
  time,
  appointmentType
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments/" +
    appointment_ID,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        action_role: role_type,
        action_role_id: role_id,
        date: date,
        time: time,
        appointment_type: appointmentType,
      }),
    }
  ).then((response) => response.json());
}

//Reschedule Appointment
export function rescheduleAppointmentAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  role_type,
  role_id,
  date,
  time,
  appointmentType
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_reschedule/" +
    appointment_ID,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        action_role: role_type,
        action_role_id: role_id,
        date: date,
        time: time,
        appointment_type: appointmentType,
      }),
    }
  ).then((response) => response.json());
}

//Change Appointment Status
export function appointmentStatusAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  role_type,
  role_id,
  status
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments/" +
    appointment_ID +
    "?appointment_status=" +
    status,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        action_role: role_type,
        action_role_id: role_id,
      }),
    }
  ).then((response) => response.json());
}

// Search all Symptoms by character
export function searchSymptomAPI(doc_id, hospital_ID, patient_ID, char_val) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_symptoms/?character=" +
    char_val,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

//Add symptoms in an appointment
export function addSymptomInAppointmentAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  symptomValue
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_symptoms/" +
    appointment_ID,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        symptoms_name: symptomValue,
      }),
    }
  ).then((response) => response.json());
}

//Add symptoms in symptoms
export function addNewSymptomAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  APImethod,
  symptomValue,
  symptomType
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_symptoms",
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        symptoms_name: symptomValue,
        symptoms_name: symptomType,
      }),
    }
  ).then((response) => response.json());
}

// Delete a symptom
export function deleteSymptomAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  symptomValue
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_symptoms/" +
    appointment_ID,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        symptoms_name: symptomValue,
      }),
    }
  ).then((response) => response.json());
}

// Add Doctor Notes
//https://app.aibers.health/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_doctornote/(:appointment_id)
export function addDoctorNotesAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  doctorNotes
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_doctornote/" +
    appointment_ID,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        doctors_note: doctorNotes,
      }),
    }
  ).then((response) => response.json());
}

// Delete Doctor Notes
//https://app.aibers.health/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_doctornote/noteId
export function deleteNotesAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  noteId,
  APImethod,
  appointment_ID
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_doctornote/" +
    noteId,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        appointment_Id: appointment_ID,
      }),
    }
  ).then((response) => response.json());
}

// Edit Doctor Notes
//https://app.aibers.health/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_doctornote/(:appointment_id)
export function editNotesAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  noteId,
  APImethod,
  doctorNotes,
  appointment_ID
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_doctornote/" +
    noteId,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        doctors_note: doctorNotes,
        appointment_Id: appointment_ID,
      }),
    }
  ).then((response) => response.json());
}

//https://app.aibers.health/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_diagnosis?character=r
//Search diagnosis

export function searchDiagnosisAPI(doc_id, hospital_ID, patient_ID, char_val) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_diagnosis?character=" +
    char_val,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

//Add Diagnosis
export function addDiagnosisAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  diagnosisValue
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_diagnosis/" +
    appointment_ID,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        diagnosis_name: diagnosisValue,
      }),
    }
  ).then((response) => response.json());
}

// Delete Diagnosis
export function deleteDiagnosisAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  diagnosisValue
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_diagnosis/" +
    appointment_ID,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        diagnosis_name: diagnosisValue,
      }),
    }
  ).then((response) => response.json());
}

// Search all Tests by character
export function searchTestAPI(doc_id, hospital_ID, patient_ID, char_val) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_tests?character=" +
    char_val,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

// https://app.aibers.health/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_tests/(:appointment_id)
//Add Test
export function addTestAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  testValue
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_tests/" +
    appointment_ID,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        test_name: testValue,
      }),
    }
  ).then((response) => response.json());
}

// Delete Test
export function deleteTestAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  testValue
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_tests/" +
    appointment_ID,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        test_name: testValue,
      }),
    }
  ).then((response) => response.json());
}

// Search all Medicines by character (working)
export function searchMedicinesAPI(doc_id, hospital_ID, patient_ID, char_val) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_medicine?character=" +
    char_val,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

//Add Prescription (working)
export function addPrescriptionAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  medicine_name,
  days,
  quantity,
  frequency
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_prescription/" +
    appointment_ID,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        medicine_name: medicine_name,
        days: days,
        quantity: quantity,
        frequency: frequency,
      }),
    }
  ).then((response) => response.json());
}

// Delete Prescription (working)
export function deletePrescriptionAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  medicine_name
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_prescription/" +
    appointment_ID,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        medicine_name: medicine_name,
      }),
    }
  ).then((response) => response.json());
}

//Schedule Followup  (working)
export function scheduleFollowupAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  role_type,
  role_id,
  doc_Date,
  doc_Time,
  appointmentType
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_followup/" +
    appointment_ID,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        action_role: role_type,
        action_role_id: role_id,
        date_by_doc: doc_Date,
        time_by_doc: doc_Time,
        appointment_type: appointmentType,
      }),
    }
  ).then((response) => response.json());
}

//https://app.aibers.health/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_status/(:appointment_id)?status=inprogress

// Get Patient’s Appointment history (working)
export function getPatientAppoinmtmentHistory(doc_ID) {
  return fetch((doc_BaseURL + doc_ID + "/locations/0/patients/0/appointments_status/0?status=inprogress"), {
    headers: headers()
  }).then(response => response.json());
}

//https://app.aibers.health/doctors/[:doctor_id]/locations/[:doctors_hospital_location_id]/availableslots/ (working)

//Available slots
export function availableSlotsAPI(doc_ID, hospital_ID, APImethod, date) {
  return fetch(doc_BaseURL + doc_ID + "/locations/" + hospital_ID + "/slots", {
    method: APImethod,
    headers: headers(),
    body: JSON.stringify({
      date: date,
    }),
  }).then((response) => response.json());
}

//https://app.aibers.health/doctors/2/locations/0/patients/1/completed_appointments
// Get Patient’s completed Appointments history
export function getPatientCompletedAppoinmtmentHistoryAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  APImethod
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/completed_appointments",
    {
      method: APImethod,
      headers: headers(),
    }
  ).then((response) => response.json());
}

//https://app.aibers.health/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/appointments_status/(:appointment_id)?status=completed
// Get Patient’s completed Appointment history profile
export function getPatientCompletedAppoinmtmentProfileAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_status/" +
    appointment_ID +
    "?status=completed",
    {
      method: APImethod,
      headers: headers(),
    }
  ).then((response) => response.json());
}

//https://app.aibers.health/patients/2/vitals/0
//Get all vitals data
export function getVitalsAPI(doc_ID, patient_ID, vital_ID, APImethod) {
  return fetch((doc_BaseURL + doc_ID + "/patients/" + patient_ID + "/vitals/" + vital_ID), {
    method: APImethod,
    headers: headers()
  }).then(response => response.json());
}

//Add Vitals
//https://app.aibers.health/doctors/1/patients/1/vitals/3  (working)
// export function addVitalAPI(doc_ID, patient_ID, vital_id, APImethod, vital_value) {
//     return fetch((doc_BaseURL + doc_ID + "/patients/" + patient_ID + "/vitals/" + vital_id), {
//         method: APImethod,
//         headers: headers(),
//         body: JSON.stringify({
//             new_value: vital_value,
//         })
//     }).then(response => response.json());
// }
export function addVitalAPI(doc_ID, patient_ID, APImethod, vitalsList) {
  return fetch(doc_BaseURL + doc_ID + "/patients/" + patient_ID + "/vitals", {
    method: APImethod,
    headers: headers(),
    body: JSON.stringify({
      vitals: vitalsList,
    }),
  }).then((response) => response.json());
}

// Get All patient (Working)
export function getAllPatientsOfDoctorByName(
  doc_ID,
  hospital_ID,
  patient_ID,
  searchKey,
  APImethod
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/allPatients/",
    {
      method: APImethod,
      headers: headers(),
    }
  ).then((response) => response.json());
}

export function getPatientAppoinmtmentByStatusAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  status,
  APImethod
) {
  console.log(
    "API Appointments Patient",
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_status/" +
    appointment_ID +
    "?status=" +
    status
  );
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_status/" +
    appointment_ID +
    "?status=" +
    status,
    {
      method: APImethod,
      headers: headers(),
    }
  ).then((response) => response.json());
}

//Get Comments (working)
export function getComments(doc_ID,patient_ID, appointment_ID) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/patients/" +
    patient_ID +
    "/appointments/" +
    appointment_ID +
    "/comments",
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

//Add Comment (working)
//https://app.aibers.health/doctors/1/patients/2/appointments/12/comments?sender=doctor
export function addComment(
  doc_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  comment_Value
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/patients/" +
    patient_ID +
    "/appointments/" +
    appointment_ID +
    "/comments?sender=doctor",
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        comment: comment_Value,
      }),
    }
  ).then((response) => response.json());
}

//Get Stats (working)
// https://app.aibers.health/doctors/1/locations/8/appointments_stats
export function getAppointmentsStats(doc_ID, hospital_ID, date) {
  return fetch(
    doc_BaseURL + doc_ID + "/locations/" + hospital_ID + "/appointments_stats",
    {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({
        date: date,
      }),
    }
  ).then((response) => response.json());
}

//Get Queue
export function getAppointmentsQueue(doc_ID) {
  return fetch(doc_BaseURL + doc_ID + "/appointments_queue", {
    headers: headers(),
  }).then((response) => response.json());
}

//add fee structure
export function addfee(
  doc_ID,
  hospital_ID,
  patient_ID,
  appointment_ID,
  APImethod,
  fee,
  discount,
  reason
) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments/" +
    appointment_ID +
    "/fee_structure",
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        fee: fee,
        discount_in_percentage: discount,
        discount_reason: reason,
      }),
    }
  ).then((response) => response.json());
}

// Search Reasons
//https://app.aibers.health/doctors/(:doctor_id)/locations/(:doctors_hospital_location_id)/patients/(:patient_id)/discount_reasons?character=d
export function searchReasonsAPI(doc_id, hospital_ID, patient_ID) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/discount_reasons?character=",
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

//Get Appointment Date (working)
export function getAppointmentsDateAPI(
  doc_ID,
  hospital_ID,
  patient_ID,
  status
) {
  console.log("Marks API: URL test", doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_date?appointment_status=" +
    status)
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/" +
    hospital_ID +
    "/patients/" +
    patient_ID +
    "/appointments_date?appointment_status=" +
    status,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

// generate notification API function
export function generateCommentNotification(
  APImethod,
  doc_name,
  appointment_date_time,
  notification_token
) {
  return fetch("https://fcm.googleapis.com/fcm/send", {
    method: APImethod,
    headers: headers(),
    body: JSON.stringify({
      notification: {
        title:
          doc_name + " commented on Appointment of " + appointment_date_time,
      },
      to: notification_token,
    }),
  }).then((response) => response.json());
}

// save notification API function
export function saveNotification(
  APImethod,
  pat_id,
  doc_id,
  app_id,
  n_type,
  n_receiver
) {
  console.log("In notification saved function");
  return fetch(
    pat_BaseURL +
    pat_id +
    "/doctors/" +
    doc_id +
    "/appointments/" +
    app_id +
    "/notifications/" +
    0,
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        notification_type: n_type,
        notification_receiver: n_receiver,
      }),
    }
  ).then((response) => response.json());
}

//Get Notification List
// https://app.aibers.health/doctors/2/patients/0/appointments/0/notifications/0 (working)
export function showNotificationListAPI(
  doc_id,
  patient_ID,
  appointment_ID,
  notification_Id
) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/patients/" +
    patient_ID +
    "/appointments/" +
    appointment_ID +
    "/notifications/" +
    notification_Id,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

//month Appointment stats
//https://app.aibers.health/doctors/1/locations/1/patients/0/patients_acrossDates/(:start_date)/(:end_date)    (working)
export function showAnalyticalStats(
  doc_id,
  location_id,
  patient_ID,
  val,
  interval
) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    location_id +
    "/patients/" +
    patient_ID +
    "/patients_acrossDates/" +
    val +
    "/" +
    interval,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

//https://app.aibers.health/doctors/1/locations/0/patients/0/total_revenue/(:start_date)/(:end_date) (working)
export function showRevenueStats(
  doc_id,
  location_id,
  patient_ID,
  val,
  interval
) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    location_id +
    "/patients/" +
    patient_ID +
    "/total_revenue/" +
    val +
    "/" +
    interval,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

//https://app.aibers.health/doctors/1/locations/0/patients/0/total_discount/(:start_date)/(:end_date) (wroking)
export function showDiscountStats(
  doc_id,
  location_id,
  patient_ID,
  val,
  interval
) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    location_id +
    "/patients/" +
    patient_ID +
    "/total_discount/" +
    val +
    "/" +
    interval,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}
//https://app.aibers.health/doctors/1/locations/4/patients/0/completedAppointment_CurrentDate/(:start_date)/(:end_date)?appointment_status=completed (working)
export function showCompletedAppointmentStats(
  doc_id,
  location_id,
  patient_ID,
  startDate,
  endDate,
  status
) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    location_id +
    "/patients/" +
    patient_ID +
    "/completedAppointment_CurrentDate/" +
    startDate + 
    "/"
    +
    endDate +
    "?appointment_status=" +
    status,
    {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({
        date: getDatetoSet(new Date()),
      }),
    }
  ).then((response) => response.json());
}

//Top medicines
//https://app.aibers.health/doctors/1/locations/1/medicine_stats/(:start_date)/(:end_date) month (working)
export function showTopMedicinesStats(doc_id, loc_id, val, interval) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    loc_id +
    "/medicine_stats/" +
    val +
    "/" +
    interval,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

//Top test
//https://app.aibers.health/doctors/1/locations/1/test_stats/(:start_date)/(:end_date) (working)
export function showTopTestsStats(doc_id, loc_id, val, interval) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    loc_id +
    "/test_stats/" +
    val +
    "/" +
    interval,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

//Top https://app.aibers.health/doctors/1/symptom_stats/(:start_date)/(:end_date) (working)
export function showTopSymptomsStats(doc_id, location_id, val, interval) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    location_id +
    "/symptom_stats/" +
    val +
    "/" +
    interval,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

//https://app.aibers.health/doctors/1/diagnosis_stats/(:start_date)/(:end_date) (working)
export function showTopDiagnosisStats(doc_id, location_id, val, interval) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    location_id +
    "/diagnosis_stats/" +
    val +
    "/" +
    interval,
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

//add patient by doctor
//https://app.aibers.health/doctors/0/contact_no/33345/allPatients
export function searchPatientAPI(doc_id, contact_no) {
  return fetch(
    doc_BaseURL + doc_id + "/search/" + contact_no + "/allPatients",
    {
      headers: headers(),
    }
  ).then((response) => response.json());
}

//add new patient  by doctor
//https://app.aibers.health/doctors/2/contact_no/+923335689121/newPatient doc_BaseURL+doc_id+"/contact_no/"+contect_no+"/newPatient"
export function addPatientByContactAPI(
  doc_id,
  contact_no,
  APImethod,
  patient_ID,
  name,
  dob,
  gender
) {
  return fetch(
    doc_BaseURL + doc_id + "/contact_no/" + contact_no + "/new_patient",
    {
      method: APImethod,
      headers: headers(),
      body: JSON.stringify({
        patient_id:  patient_ID,
        name: name,
        dob: dob,
        gender: gender,
      }),
    }
  ).then((response) => response.json());
}

export function saveNotificationStatus(
  doc_id,
  patientId,
  APImethod,
  apppointment_id,
  notfication_Id,
  status
) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/patients/" +
    patientId +
    "/appointments/" +
    apppointment_id +
    "/notifications/" +
    notfication_Id +
    "?status=" +
    status,
    {
      method: APImethod,
      headers: headers(),
    }
  ).then((response) => response.json());
}
//https://app.aibers.health/doctors/1//patients/1access_request?status=send
//Send Access Request
export function sendAccessRequest(doc_id, patient_ID, APImethod, status) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/patients/" +
    patient_ID +
    "/access_request" +
    "?status=" +
    status,
    {
      method: APImethod,
      headers: headers(),
    }
  ).then((response) => response.json());
}

//Get Pending Requests
//https://app.aibers.health/patients/1/pending_request
export function pendingAccessRequests(patient_ID) {
  return fetch(pat_BaseURL + patient_ID + "/pending_request", {
    headers: headers(),
  }).then((response) => response.json());
}

//Activity Logs
//https://app.aibers.health/doctors/1/activity

export function getActivityLogs(doc_ID) {
  return fetch(doc_BaseURL + doc_ID + "/activity", {
    headers: headers(),
  }).then((response) => response.json());
}

//Sessions Logs
//https://app.aibers.health/doctors/1/sessions

export function getSessionsLogs(doc_ID) {
  return fetch(doc_BaseURL + doc_ID + "/sessions", {
    headers: headers(),
  }).then((response) => response.json());
}

//add Staff by doctor
//https://app.aibers.health/doctors/(:doctor_id)/staffs/contact_no/(:contact_no)
//https://app.aibers.health/doctors/0/staffs/contact_no/333
export function searchStaffAPI(doc_id, contact_no) {
  return fetch(doc_BaseURL + doc_id + "/staffs" + "/contact_no/" + contact_no, {
    headers: headers(),
  }).then((response) => response.json());
}

// https://app.aibers.health/patients/2/appointments/51/test_record

export function getAppointmentTests(pat_id, appointment_id) {
  return fetch(
    pat_BaseURL + pat_id + "/appointments/" + appointment_id + "/test_record",
    {
      method: "GET",
      headers: headers(),
    }
  ).then((response) => response.json());
}

//Get Archieve info
//https://app.aibers.health/doctors/0/patients/1/test_info
export function getArchievesTestsInfo(doc_Id, pat_id) {
  return fetch(doc_BaseURL + doc_Id + "/patients/" + pat_id + "/test_info", {
    method: "GET",
    headers: headers(),
  }).then((response) => response.json());
}

/////////////////////////////////////////////////// Admin Panel APIs ///////////////////////////////////////////////////////////////////
// Get all Admins
export function getAllAdminsAPI(admin_ID) {
  return fetch(admin_BaseURL + admin_ID, {
    headers: headers(),
  }).then((response) => response.json());
}

// Add an Admin
export function addAdminAPI(admin_ID, name, contact_no) {
  return fetch(admin_BaseURL + admin_ID, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: name,
      contact_no: contact_no,
    }),
  }).then((response) => response.json());
}
//https://app.aibers.health/admins/1
//Delete Admin
export function deleteAdminAPI(admin_id) {
  return fetch(admin_BaseURL + admin_id, {
    method: "DELETE",
    headers: headers(),
  }).then((response) => response.json());
}

//Edit Admin
export function editAdminAPI(admin_id, name, contact_no) {
  return fetch(admin_BaseURL + admin_id, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      name: name,
      contact_no: contact_no,
    }),
  }).then((response) => response.json());
}

// Get all doctor
export function getAllDoctorsAPI(admin_id) {
  return fetch(admin_BaseURL + admin_id + "/doctors", {
    headers: headers(),
  }).then((response) => response.json());
}

// Add a doctor
export function addDoctorAPI(admin_ID, name, contact_no) {
  return fetch(admin_BaseURL + admin_ID + "/doctors", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: name,
      contact_no: contact_no,
    }),
  }).then((response) => response.json());
}

//https://app.aibers.health/admins/1/doctors/1
//Delete a doctor
export function deleteDoctorAPI(admin_id, doc_id) {
  return fetch(admin_BaseURL + admin_id + "/doctors/" + doc_id, {
    method: "DELETE",
    headers: headers(),
  }).then((response) => response.json());
}

//Edit Doctor
export function editDoctorAPI(admin_id, doc_id, name, contact_no) {
  return fetch(admin_BaseURL + admin_id + "/doctors/" + doc_id, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      name: name,
      contact_no: contact_no,
    }),
  }).then((response) => response.json());
}

// Add new Diagnosis
export function addNewDiagnosisAPI(admin_id, name, type) {
  return fetch(admin_BaseURL + admin_id + "/diagnosis", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      diagnosis_name: name,
      diagnosis_type: type,
    }),
  }).then((response) => response.json());
}
//https://app.aibers.health/admins/1/diagnosis/1
//Delete Diagnosis
export function deleteDiagnosisItemAPI(admin_id, diagnosis_id) {
  return fetch(admin_BaseURL + admin_id + "/diagnosis/" + diagnosis_id, {
    method: "DELETE",
    headers: headers(),
  }).then((response) => response.json());
}

//https://app.aibers.health/admins/1/diagnosis/1
//Edit Diagnosis
export function editDiagnosisItemAPI(admin_id, diagnosis_id, name, type) {
  return fetch(admin_BaseURL + admin_id + "/diagnosis/" + diagnosis_id, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      diagnosis_name: name,
      diagnosis_type: type,
    }),
  }).then((response) => response.json());
}

// Add new Symptom
export function addSymptomAPI(admin_id, name, type) {
  return fetch(admin_BaseURL + admin_id + "/symptoms", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      symptom_name: name,
      symptom_type: type,
    }),
  }).then((response) => response.json());
}

//https://app.aibers.health/admins/1/symptoms/1
//Delete symptom
export function deleteSymptomItemAPI(admin_id, symptom_id) {
  return fetch(admin_BaseURL + admin_id + "/symptoms/" + symptom_id, {
    method: "DELETE",
    headers: headers(),
  }).then((response) => response.json());
}

//https://app.aibers.health/admins/1/symptoms/1
//Edit symptom
export function editSymptomItemAPI(admin_id, symptom_id, name, type) {
  return fetch(admin_BaseURL + admin_id + "/symptoms/" + symptom_id, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      symptom_name: name,
      symptom_type: type,
    }),
  }).then((response) => response.json());
}

// Add new Tests
export function addNewTestAPI(admin_id, name, type, price) {
  return fetch(admin_BaseURL + admin_id + "/tests", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      test_name: name,
      test_type: type,
      price: price,
    }),
  }).then((response) => response.json());
}

//https://app.aibers.health/admins/1/tests/1
//Delete Test
export function deleteTestItemAPI(admin_id, test_id) {
  return fetch(admin_BaseURL + admin_id + "/tests/" + test_id, {
    method: "DELETE",
    headers: headers(),
  }).then((response) => response.json());
}

//https://app.aibers.health/admins/1/tests/1
//Edit Test
export function editTestItemAPI(admin_id, test_id, name, type, price) {
  return fetch(admin_BaseURL + admin_id + "/tests/" + test_id, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      test_name: name,
      test_type: type,
      price: price,
    }),
  }).then((response) => response.json());
}

// Add new Medicines
export function addNewMedicineAPI(admin_id, name, type, price, grams) {
  return fetch(admin_BaseURL + admin_id + "/medicines", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      medicine_name: name,
      medicine_type: type,
      price: price,
      strength: grams,
    }),
  }).then((response) => response.json());
}

//https://app.aibers.health/admins/1/medicines/1
//Delete Medicine
export function deleteMedicineItemAPI(admin_id, medicine_id) {
  return fetch(admin_BaseURL + admin_id + "/medicines/" + medicine_id, {
    method: "DELETE",
    headers: headers(),
  }).then((response) => response.json());
}

//https://app.aibers.health/admins/1/medicines/1
//Edit Medicine
export function editMedicineItemAPI(
  admin_id,
  medicine_id,
  name,
  type,
  price,
  grams
) {
  return fetch(admin_BaseURL + admin_id + "/medicines/" + medicine_id, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      medicine_name: name,
      medicine_type: type,
      price: price,
      strength: grams,
    }),
  }).then((response) => response.json());
}

//Get All Hospitals
export function getAllHospitals(admin_id) {
  return fetch(admin_BaseURL + admin_id + "/hospitals", {
    headers: headers(),
  }).then((response) => response.json());
}

//Add Hospital
//https://app.aibers.health/admins/(:admin_id)/add_hospital
export function addNewHospitalAPI(admin_id, name) {
  return fetch(admin_BaseURL + admin_id + "/hospitals", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      hospital_name: name,
    }),
  }).then((response) => response.json());
}

//Edit Hospital
//https://app.aibers.health/admins/(:admin_id)/add_hospital/(:hospital_id)
export function editNewHospitalAPI(admin_id, name, hospital_id) {
  return fetch(admin_BaseURL + admin_id + "/hospitals/" + hospital_id, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      hospital_name: name,
    }),
  }).then((response) => response.json());
}

//https://app.aibers.health/admins/1/hospitals/1
//Delete  Hospital
export function deleteHospitalItemAPI(admin_id, hospital_id) {
  return fetch(admin_BaseURL + admin_id + "/hospitals/" + hospital_id, {
    method: "DELETE",
    headers: headers(),
  }).then((response) => response.json());
}

//get hospital logo
export function getHospitalLogoAPI(hospital_ID) {
  return fetch(admin_BaseURL + "hospital_image/" + hospital_ID, {
    headers: headers(),
  }).then((response) => response.json());
}

//Add new location
export function addNewLocation(
  admin_id,
  name,
  address,
  hospital_name,
  long,
  lat,
  contact
) {
  return fetch(admin_BaseURL + admin_id + "/locations", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: name,
      address: address,
      hospital_name: hospital_name,
      longitude: long,
      latitude: lat,
      contact_no: contact,
    }),
  }).then((response) => response.json());
}
//https://app.aibers.health/admins/1/locations/1
//Delete Location
export function deleteLocationItemAPI(admin_id, location_id) {
  return fetch(admin_BaseURL + admin_id + "/locations/" + location_id, {
    method: "DELETE",
    headers: headers(),
  }).then((response) => response.json());
}

//https://app.aibers.health/admins/1/locations/1
//Edit Location
export function editLocationItemAPI(
  admin_id,
  location_id,
  name,
  address,
  hospital_name,
  long,
  lat,
  contact
) {
  return fetch(admin_BaseURL + admin_id + "/locations/" + location_id, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      name: name,
      address: address,
      hospital_name: hospital_name,
      longitude: long,
      latitude: lat,
      contact_no: contact,
    }),
  }).then((response) => response.json());
}

//Get Admin Activity Log
// https://app.aibers.health/admins/(:admin_id)/activity
export function getAdminActivityLogs(admin_id) {
  return fetch(admin_BaseURL + admin_id + "/activity", {
    method: "GET",
    headers: headers(),
  }).then((response) => response.json());
}

//Get All number of locations
// https://app.aibers.health/admins/(:admin_id)/locations/(:hospital_name)
export function getAllLocations(admin_id, hospital_name) {
  return fetch(admin_BaseURL + admin_id + "/locations/" + hospital_name, {
    method: "GET",
    headers: headers(),
  }).then((response) => response.json());
}

//Get Nurse Profile all info (new implemented)
//https://app.aibers.health/doctors/nurse/(:doctor_staff_nurse_id)/profile
export function GetNurseAllInfoAPI(nurseId) {
  return fetch(baseURL + "/doctors/nurse/" + nurseId + "/profile", {
    method: "GET",
    headers: headers(),
  }).then((response) => response.json());
}

//Get Front Desk Profile all info (new implemented)
//https://app.aibers.health/doctors/fd/(:doctor_staff_fd_id)/profile
export function GetFdAllInfoAPI(fdId) {
  return fetch(baseURL + "/doctors/fd/" + fdId + "/profile", {
    method: "GET",
    headers: headers(),
  }).then((response) => response.json());
}

//Get PA Profile all info (new implemented)
//https://app.aibers.health/doctors/pa/(:doctor_staff_pa_id)/profile
export function GetPaAllInfoAPI(paId) {
  return fetch(baseURL + "/doctors/pa/" + paId + "/profile", {
    method: "GET",
    headers: headers(),
  }).then((response) => response.json());
}

//Get Telehealth history (new implementation)
//https://app.aibers.health/doctors/2/appointments/telehealth
export function telehealthHistory(docID) {
  return fetch(baseURL + "/doctors/" + docID + "/appointments/telehealth", {
    method: "GET",
    headers: headers(),
  }).then((response) => response.json());
}

//get location

export function getlocationIP() {
  return fetch("https://jsonip.com/").then((response) => response.json());
}

// https://app.aibers.health/patients/1/doctors/0/locations/0/appointments?status=followup_trail
// https://app.aibers.health/patients/2/doctors/0/locations/0/appointments/14?status=followup_trail
// https://app.aibers.health/doctors/0/locations/0/patients/1/appointments_status?status=followup_trail

export function getAllAppointmentsWithTrail(patID, appointment_Id) {
  console.log(
    "API URL Trail: ",
    pat_BaseURL +
    patID +
    "/doctors/0/locations/0/appointments/" +
    appointment_Id +
    "?status=followup_trail"
  );
  return fetch(
    pat_BaseURL +
    patID +
    "/doctors/0/locations/0/appointments/" +
    appointment_Id +
    "?status=followup_trail",
    {
      method: "GET",
      headers: headers(),
    }
  ).then((response) => response.json());
}

// https://app.aibers.health/doctors/0/locations/0/patients/0/appointments/82   Edit appointment
// https://app.aibers.health/doctors/0/locations/0/patients/0/appointments/213/edit
// https://app.aibers.health/doctors/0/locations/0/patients/0/appointments/223/edit
export function initiateEditAppointment(appointment_Id) {
  return fetch(
    baseURL +
    "/doctors/0/locations/0/patients/0/appointments/" +
    appointment_Id +
    "/edit",
    {
      method: "POST",
      headers: headers(),
    }
  ).then((response) => response.json());
}

// https://app.aibers.health/doctors/0/locations/0/patients/0/appointments/237/edit DELETE

export function deleteEditAppointment(appointment_Id) {
  return fetch(
    baseURL +
    "/doctors/0/locations/0/patients/0/appointments/" +
    appointment_Id +
    "/edit",
    {
      method: "DELETE",
      headers: headers(),
    }
  ).then((response) => response.json());
}

export function copyFromFollowupDataAPI(perAppointment_Id, appointment_Id) {
  return fetch(
    doc_BaseURL +
    "0/copy_app_data/from/" +
    perAppointment_Id +
    "/to/" +
    appointment_Id,
    {
      method: "POST",
      headers: headers(),
    }
  ).then((response) => response.json());
}
//https://app.aibers.health/doctors/1/locations/0/patients/2/appointments_cancelled/213
export function cancelAppointment(doc_ID, pat_ID, appointment_ID, role, id) {
  return fetch(
    doc_BaseURL +
    doc_ID +
    "/locations/0/patients/" +
    pat_ID +
    "/appointments_cancelled/" +
    appointment_ID,
    {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({
        action_role: role,
        action_role_id: id,
      }),
    }
  ).then((response) => response.json());
}
//search hospitals
export function searchHospitals(doc_id, char_val) {
  return fetch(doc_BaseURL + doc_id + "/hospital_names?character=" + char_val, {
    headers: headers(),
  }).then((response) => response.json());
}
//Verifiy Symptoms
//https://app.aibers.health/admins/(:admin_id)/verify_symptom/(:symptom_id)
export function verifiyRandomSymptoms(admin_id, symptom_id) {
  return fetch(admin_BaseURL + admin_id + "/verify_symptom/" + symptom_id, {
    method: "PUT",
    headers: headers(),
  }).then((response) => response.json());
}
//https://app.aibers.health/admins/(:admin_id)/verify_diagnosis/(:diagnosis_id)
export function verifiyRandomDiagnosis(admin_id, diagnosis_id) {
  return fetch(admin_BaseURL + admin_id + "/verify_diagnosis/" + diagnosis_id, {
    method: "PUT",
    headers: headers(),
  }).then((response) => response.json());
}
//https://app.aibers.health/admins/(:admin_id)/verify_test/(:test_id)
export function verifiyRandomTest(admin_id, test_id) {
  return fetch(admin_BaseURL + admin_id + "/verify_test/" + test_id, {
    method: "PUT",
    headers: headers(),
  }).then((response) => response.json());
}
//https://app.aibers.health/admins/(:admin_id)/verify_medicine/(:medicine_id)
export function verifiyRandomMedicine(admin_id, medicine_id) {
  return fetch(admin_BaseURL + admin_id + "/verify_medicine/" + medicine_id, {
    method: "PUT",
    headers: headers(),
  }).then((response) => response.json());
}

//https://app.aibers.health/doctors/0/locations/0/patients/0/appointments/(:start_date)/(:end_date)

export function getAppointmentsListByTimeRange(
  doc_id,
  location_id,
  start_date,
  end_date
) {
  console.log(" Refresh Week/Day Appointment Data Range: URL",
    doc_BaseURL +
    doc_id +
    "/locations/" +
    location_id +
    "/patients/0/appointments/" +
    start_date +
    "/" +
    end_date)
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    location_id +
    "/patients/0/appointments/" +
    start_date +
    "/" +
    end_date,
    {
      method: "GET",
      headers: headers(),
    }
  ).then((response) => {
    // console.log("Setting time range per date: result API/appointments/"+start_date+"/"+end_date,response.json() )
    return response.json();
  });
}

//https://app.aibers.health/doctors/0/locations/0/appointments_stats/(:start_date)/(:end_date)

export function getAppointmentsStatsByTimeRange(
  doc_id,
  location_id,
  start_date,
  end_date
) {
  return fetch(
    doc_BaseURL +
    doc_id +
    "/locations/" +
    location_id +
    "/appointments_stats/" +
    start_date +
    "/" +
    end_date,
    {
      headers: headers(),
    }
  ).then((response) => {
    return response.json();
  });
}

//edit patient info
export function editPatientInfoAPI(doc_ID, patient_ID, name, dob, gender, contact_no) {
  return fetch((doc_BaseURL + doc_ID + "/patients/" + patient_ID + "/update"), {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      name: name,
      dob: dob,
      gender: gender,
      number: contact_no,
    })
  }).then(response => response.json());
}
//editVitals 
export function EditVitalAPI(doc_ID, patient_ID, vital_ID, value) {
  return fetch((doc_BaseURL + doc_ID + "/patients/" + patient_ID + "/vitals/" + vital_ID), {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      new_value: value,
    })
  }).then(response => response.json());
}

// https://app.aibers.health/doctors/(:doctor_id)/appointments/(: appointment_id)/logging

export function appointmentStateLog(appointment_ID) {
  return fetch(baseURL + "/doctors/0/appointments/" + appointment_ID + "/logging", {
    method: "GET",
    headers: headers(),
  }
  ).then((response) => {
    return response.json();
  });
}