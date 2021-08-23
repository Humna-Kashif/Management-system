#!/bin/bash


# npm install express pg ejs


psql -U postgres -h 127.0.0.1 << EOF   

DROP DATABASE aibers;

CREATE DATABASE aibers WITH OWNER = postgres TABLESPACE = pg_default CONNECTION LIMIT = -1;  

\c aibers

CREATE TABLE contacts (contact_id SERIAL PRIMARY KEY NOT NULL, name varchar(100), gender varchar(6), dob date NOT NULL default '1990-10-20'::date ,specialization varchar(100),blood_group varchar(3), image varchar(200), address varchar(100), about text, education varchar(50),latitude double precision, longitude double precision, user_name varchar(50),time_stamp timestamptz NOT NULL default now(), verify boolean default false);
alter table contacts add constraint unique_contact_for_family_constraint unique (name, gender, dob);

CREATE TABLE users (id SERIAL PRIMARY KEY NOT NULL, contact_id INT NOT NULL REFERENCES contacts, role text);
alter table users add constraint unique_patient_role_wise unique (contact_id, role);

ALTER TABLE users add constraint user_unique_identification unique(contact_id, role);

CREATE TABLE hospitals (hospital_id SERIAL PRIMARY KEY NOT NULL, contact_id INT NOT NULL REFERENCES contacts);

CREATE TABLE hospital_locations (location_id SERIAL PRIMARY KEY NOT NULL, contact_id INT NOT NULL REFERENCES contacts,hospital_id INT NOT NULL REFERENCES hospitals);

CREATE TABLE hospital_facilities (hospital_facility_id SERIAL PRIMARY KEY NOT NULL,location_id INT NOT NULL REFERENCES hospital_locations, facility varchar(200));

CREATE TABLE phone_numbers (phone_no_id SERIAL PRIMARY KEY NOT NULL, contact_id INT,FOREIGN KEY(contact_id) REFERENCES contacts(contact_id), number varchar(13), primary_no boolean default true);

ALTER TABLE phone_numbers add constraint phone_number_unique_identification unique(number);

CREATE TABLE urls (url_id SERIAL PRIMARY KEY NOT NULL, contact_id INT NOT NULL REFERENCES contacts, url varchar(100));

CREATE TABLE emails (email_id SERIAL PRIMARY KEY NOT NULL, contact_id INT NOT NULL REFERENCES contacts, email varchar(50));

CREATE TABLE doctor_qualifications (doctor_qualification_id SERIAL PRIMARY KEY NOT NULL, doctor_id INT NOT NULL REFERENCES users, qualification varchar(200));

CREATE TABLE access (access_id SERIAL PRIMARY KEY NOT NULL,patient_id INT NOT NULL REFERENCES users, doctor_id INT NOT NULL REFERENCES users, is_access boolean default true,request_status varchar(10) default 'none');

ALTER TABLE access add constraint access_unique_identification unique(patient_id,doctor_id);

CREATE TABLE doctors_hospital_locations (doctors_hospital_location_id SERIAL PRIMARY KEY NOT NULL, location_id INT NOT NULL REFERENCES hospital_locations, doctor_id INT NOT NULL REFERENCES users, hospital_location_status boolean default true, fees integer,appointment_type varchar(15));

CREATE TABLE doctors_schedule (doctors_schedule_id SERIAL PRIMARY KEY NOT NULL, doctors_hospital_location_id INT NOT NULL REFERENCES doctors_hospital_locations,day_of_week varchar(50) NOT NULL,start_time time with time zone NOT NULL,end_time time with time zone NOT NULL,is_open boolean default false);

CREATE TABLE doctor_staffs(doctor_staff_id SERIAL NOT NULL PRIMARY KEY, staff_id INT NOT NULL REFERENCES users,doctor_id INT NOT NULL REFERENCES users, doctors_hospital_location_id INT NOT NULL REFERENCES doctors_hospital_locations, staff_available boolean default true);

CREATE TABLE patient_family (id SERIAL PRIMARY KEY NOT NULL, family_id INT NOT NULL, patient_id INT NOT NULL REFERENCES users);
alter table patient_family add constraint unique_family_patient_ids unique(family_id, patient_id);

CREATE TABLE favourite_doctors (favourite_id SERIAL PRIMARY KEY NOT NULL,patient_id INT NOT NULL REFERENCES users, doctor_id INT NOT NULL REFERENCES users, doctors_hospital_location_id INT NOT NULL REFERENCES doctors_hospital_locations);

ALTER TABLE favourite_doctors add constraint favourite_doctor_unique_identification unique(patient_id,doctor_id,doctors_hospital_location_id);

CREATE TABLE appointments (appointment_id SERIAL PRIMARY KEY NOT NULL, parent_appointment_id INT NOT NULL default 0,patient_id INT NOT NULL REFERENCES users, doctor_id INT NOT NULL REFERENCES users, date_time timestamptz NOT NULL, appointment_status varchar(20) not null default 'upcoming', doctors_hospital_location_id INT NOT NULL default 0,appointment_type varchar(15), telehealth_url varchar(100));

CREATE TABLE doctor_notes (doctor_note_id SERIAL PRIMARY KEY NOT NULL, doctor_note text, appointment_id INT NOT NULL,FOREIGN KEY(appointment_id) REFERENCES appointments(appointment_id));

CREATE TABLE symptoms (symptom_id SERIAL PRIMARY KEY NOT NULL,name varchar(258) NOT NULL, symptom_type varchar(128),verified boolean default true);

ALTER TABLE symptoms add constraint symptom_unique_identification unique(name);

CREATE TABLE diagnosis (diagnosis_id SERIAL PRIMARY KEY NOT NULL,name varchar(358) NOT NULL, diagnosis_type varchar(128),verified boolean default true);

ALTER TABLE diagnosis add constraint diagnosis_unique_identification unique(name);

CREATE TABLE medicines (medicine_id SERIAL PRIMARY KEY NOT NULL,name varchar(128), medicine_type varchar(128), price INT NOT NULL, amount_in_grams varchar(128),verified boolean default true);

ALTER TABLE medicines add constraint medicine_unique_identification unique(name);

CREATE TABLE medical_tests (test_id SERIAL PRIMARY KEY NOT NULL,name varchar(128), test_type varchar(128), price_in_pkr INT NOT NULL,verified boolean default true);

ALTER TABLE medical_tests add constraint test_unique_identification unique(name);

CREATE TABLE appointment_symptoms (appointment_id INT NOT NULL,FOREIGN KEY(appointment_id) REFERENCES appointments(appointment_id),symptom_id INT NOT NULL,FOREIGN KEY(symptom_id) REFERENCES symptoms(symptom_id),PRIMARY KEY (appointment_id, symptom_id));

CREATE TABLE appointment_diagnosis (appointment_id INT NOT NULL,FOREIGN KEY(appointment_id) REFERENCES appointments(appointment_id),diagnosis_id INT NOT NULL,FOREIGN KEY(diagnosis_id) REFERENCES diagnosis(diagnosis_id),PRIMARY KEY (appointment_id, diagnosis_id));


# NOTE: remove foreign key from appointment_id (because we don't have appointment_ids for archive uploads)

CREATE TABLE appointment_medical_tests (appointment_medical_test_id SERIAL PRIMARY KEY NOT NULL,appointment_id INT NOT NULL, patient_id INT NOT NULL REFERENCES users,test_id INT NOT NULL,FOREIGN KEY(test_id) REFERENCES medical_tests(test_id),test_result varchar(200),test_date_time TIMESTAMPTZ default NOW());

alter table appointment_medical_tests add constraint appointment_medical_test_unique unique(appointment_id, patient_id, test_id, test_result);
alter table appointment_medical_tests add constraint appointment_medical_test_unique_for_archive unique(patient_id, test_result);

CREATE TABLE prescriptions (appointment_id INT NOT NULL,FOREIGN KEY(appointment_id) REFERENCES appointments(appointment_id),medicine_id INT NOT NULL,FOREIGN KEY(medicine_id) REFERENCES medicines(medicine_id),days INT NOT NULL, quantity varchar(50) NOT NULL, frequency varchar(128));

CREATE TABLE discount_reasons (discount_reason_id SERIAL PRIMARY KEY NOT NULL,discount_reason varchar(228));

\copy discount_reasons from '/home/zarnain/Documents/GitHub/aibers/api/db/discount_details.csv' delimiter ',' csv header;

CREATE TABLE fee_payments (fee_id SERIAL PRIMARY KEY NOT NULL, doctor_id int not null REFERENCES users, patient_id int not null REFERENCES users,appointment_id int not null REFERENCES appointments,fee int, discount_in_percentage varchar(50),discount_reason_id int REFERENCES discount_reasons, payment int);

ALTER TABLE fee_payments add constraint appointment_unique_identification unique(appointment_id);

CREATE TABLE vitals (vital_id SERIAL PRIMARY KEY NOT NULL, name VARCHAR(30) NOT NULL, unit VARCHAR(20),normal_range VARCHAR(20));

\copy vitals from '/home/zarnain/Documents/GitHub/aibers/api/db/vitals.csv' delimiter ',' csv header;

CREATE TABLE patient_vitals (patient_vital_id SERIAL PRIMARY KEY NOT NULL, vital_id INT NOT NULL REFERENCES vitals, patient_id INT NOT NULL REFERENCES users, doctor_id INT NOT NULL DEFAULT 0,current_value VARCHAR(20) NOT NULL,date_time TIMESTAMPTZ NOT NULL DEFAULT NOW());

CREATE TABLE comments (comment_id SERIAL PRIMARY KEY NOT NULL, appointment_id INT NOT NULL REFERENCES appointments, patient_id INT NOT NULL DEFAULT 0, doctor_id INT NOT NULL DEFAULT 0,date_time_of_comment TIMESTAMPTZ NOT NULL,comment TEXT NOT NULL, sender TEXT NOT NULL);

CREATE TABLE family_members (family_member_id SERIAL PRIMARY KEY NOT NULL,family_id int not null, name varchar(50) NOT NULL, relation varchar(20) NOT NULL, patient_id INT NOT NULL REFERENCES users);
alter table family_members add constraint unique_family_member unique (family_id, name, relation, patient_id);

CREATE TABLE logging_types (logging_type_id SERIAL PRIMARY KEY NOT NULL,logging_type VARCHAR(50) NOT NULL,logging_table VARCHAR(50) NOT NULL);

CREATE TABLE state_logging (logging_id SERIAL PRIMARY KEY NOT NULL, state_to varchar(30), state_changing_time timestamptz NOT NULL, action_role varchar(30), action_role_id int not null, appointment_id int not null, FOREIGN KEY(appointment_id) REFERENCES appointments(appointment_id),logging_type_id INT NOT NULL REFERENCES logging_types);

CREATE TABLE notification_types (
    notification_type_id SERIAL PRIMARY KEY NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    notification_table VARCHAR(50) NOT NULL
);

CREATE TABLE notification_logs (
    notification_id SERIAL PRIMARY KEY NOT NULL,
    notification_user INT NOT NULL,
    notification_user_type VARCHAR(50) NOT NULL,
    notification_type_id INT NOT NULL REFERENCES notification_types,
    notification_object_id INT NOT NULL,
    notification_time_stamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notification_status BOOLEAN DEFAULT FALSE
);

CREATE TABLE activity_type (
    activity_id SERIAL PRIMARY KEY NOT NULL,
    activity VARCHAR(50) NOT NULL,
    activity_table VARCHAR(50) NOT NULL
);

CREATE TABLE activity_logs (
    log_id SERIAL PRIMARY KEY NOT NULL,
    log_user INT NOT NULL,
    log_user_type VARCHAR(50) NOT NULL,
    activity_id INT NOT NULL REFERENCES activity_type,
    object_id INT NOT NULL,
    time_stamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE login_sessions (
    session_id SERIAL PRIMARY KEY NOT NULL,
    ip_address VARCHAR(20) NOT NULL DEFAULT '',
    ip_location VARCHAR(30) NOT NULL DEFAULT '',
    os_browser_info TEXT NOT NULL DEFAULT '',
    login_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    logout_timestamp TIMESTAMPTZ,
    user_id INT NOT NULL,
    user_type VARCHAR(10),
    notification_token text,
    contact_id INT NOT NULL REFERENCES contacts
);

insert into activity_type values(1, 'add_comment', 'comments'),(2,'add_vital','patient_vitals'),(3,'add_favourite_doctor','favourite_doctor'),(4,'remove_favourite_doctor','favourite_doctor'),(5,'give_access','access'),(6,'remove_access','access'),(7,'create_patient','users'),(8,'add_family_member','family_members'),(9,'remove_family_member','family_members'),(10,'update_contact','contacts'),(11,'upload_image','contacts'),(12,'set_appointment','appointments'),(13,'cancel_appointment','appointments'),(14,'reschedule_appointment','appointments'),(15,'set_followup','appointments'),(16,'set_hospital_location','doctors_hospital_locations'),(17,'update_hospital_location','doctors_hospital_locations'),(18,'delete_hospital_location','doctors_hospital_locations'),(19,'upload_test','appointment_medical_tests'),(20,'add_admin','users'),(21,'add_doctor','users'),(22,'add_location','hospital_locations'),(23,'add_hospital','hospitals'),(24,'add_symptom','symptoms'),(25,'add_diagnosis','diagnosis'),(26,'add_test','medical_tests'),(27,'add_medicine','medicines'),(28,'delete_symptom','symptoms'),(29,'update_symptom','symptoms'),(30,'delete_diagnosis','diagnosis'),(31,'update_diagnosis','diagnosis'),(32,'delete_test','medical_tests'),(33,'update_test','medical_tests'),(34,'delete_medicine','medicines'),(35,'update_medicine','medicines'),(36,'delete_admin','users'),(37,'delete_doctor','users'),(38,'delete_location','hospital_locations'),(39,'delete_hospital','hospitals'),(40,'update_admin','users'),(41,'update_doctor','users'),(42,'update_location','hospital_locations'),(43,'update_hospital','hospitals'),(44,'add_nurse','users'),(45,'update_nurse','doctor_staffs'),(46,'delete_nurse','doctor_staffs'),(47,'add_fd','users'),(48,'update_fd','doctor_staffs'),(49,'delete_fd','doctor_staffs'),(50,'add_pa','users'),(51,'update_pa','doctor_staffs'),(52,'delete_pa','doctor_staffs'),(53,'add_qualification','doctor_qualifications'),(54,'update_qualification','doctor_qualifications'),(55,'delete_qualification','doctor_qualifications'),(56,'start_appointment','appointments'),(57,'check_in','appointments'),(58,'move_back_to_waiting','appointments'),(59,'completed_appointment','appointments'),(60,'edit_appointment','appointments');

insert into notification_types values(1,'add_comment', 'comments'), (2,'set_appointment','appointments'),(3,'cancel_appointment','appointments'),(4,'reschedule_appointment','appointments'),(5,'set_followup','appointments'),(6,'add_family_member','family_members'),(7,'remove_family_member','family_members'),(8,'give_access','access'),(9,'send_request','access'),(10,'add_favourite_doctor','favourite_doctors');

insert into logging_types values(1,'set_appointment','appointments'),(2,'cancel_appointment','appointments'),(3,'reschedule_appointment','appointments'),(4,'set_followup','appointments'),(5,'check_in','appointments'),(6,'start_appointment','appointments'),(7,'move_back_to_waiting','appointments'),(8,'add_vital','vitals'),(9,'completed_appointment','appointments'),(10,'edit_appointment','appointments');

EOF
