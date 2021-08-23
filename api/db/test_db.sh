#!/bin/bash


# npm install express pg ejs


psql -U postgres -h 127.0.0.1 << EOF   

\c aibers_health

insert into contacts (name,verify) values ('CMH','t'), ('CMH Peshawar','t'),('CMH Islamabad','t'), ('CMH Lahore','t'),('shaukat khanum','t'),('shaukat khanum Peshawar','t'),('shaukat khanum Lahore','t');

insert into hospitals values (1,1),(2,5);

insert into locations values (1,2,1),(2,3,1),(3,4,1),(4,6,2),(5,7,2);

insert into hospital_facilities values (1,1,'COVID Test'),(2,3,'Ultra-Sound'),(3,2,'X-RAYS'),(4,2,'COVID Test');

insert into contacts (name,verify) values ('Dr. Khan Afser','t'),('Dr. Kashan Aslam','t');

insert into phone_numbers values(1,8,'+923335717374','t'),(2,9,'+923126265260','t');

insert into doctors values(1,8),(2,9);

insert into doctor_qualifications values(1,1,'MBBS'),(2,2,'BDS');

insert into contacts(name,verify) values ('ali khan','t');

insert into phone_numbers values(3,10,'+923339184139','t');

insert into patients(contact_id) values(10);

insert into favourite_doctor values(1,1,2,1);

insert into appointments values (1,1,1,2,'2021-03-12 05:00','new','upcoming','1','inperson'),(2,1,1,1,'2021-03-12 05:00','new','upcoming','1','inperson');

insert into appointment_symptoms values (1,2),(1,5),(1,21),(1,52),(2,5),(2,7),(2,10),(2,19);

insert into appointment_diagnosis values (1,2),(1,3),(1,21),(1,52),(2,5),(2,7),(2,10),(2,19);

insert into appointment_medical_tests values (1,1,1,2),(2,1,1,3),(3,1,1,21),(4,1,1,52),(5,2,1,5),(6,2,1,7),(7,2,1,10),(8,2,1,19);

insert into prescriptions values (1,20,5,5,'morning before meal'),(1,5,5,10,'morning-evening after meal'),(2,8,5,10,'morning-evening after meal'),(2,8,5,10,'morning-evening after meal');

insert into patient_vitals values (1,1,1,1,102,NOW()),(2,2,1,1,102,NOW());

insert into fee_payments values(1,1,1,1,2000,0,null,1350),(2,1,1,2,2000,0,null,2000);

insert into activity_type values(1, 'add_comment', 'comments'),(2,'add_vital','patient_vitals'),(3,'add_favourite_doctor','favourite_doctor'),(4,'remove_favourite_doctor','favourite_doctor'),(5,'give_access','access'),(6,'remove_access','access'),(7,'create_patient','patients'),(8,'add_family_member','family_members'),(9,'remove_family_member','family_members'),(10,'update_contact','contacts'),(11,'upload_image','contacts'),(12,'set_appointment','appointments'),(13,'cancel_appointment','appointments'),(14,'reschedule_appointment','appointments'),(15,'set_followup','appointments'),(16,'set_hospital_location','doctors_hospital_locations'),(17,'update_hospital_location','doctors_hospital_locations'),(18,'delete_hospital_location','doctors_hospital_locations'),(19,'upload_test','appointment_medical_tests'),(20,'add_admin','admins'),(21,'add_doctor','doctors'),(22,'add_location','locations'),(23,'add_hospital','hospitals'),(24,'add_symptom','symptoms'),(25,'add_disgnosis','diagnosis'),(26,'add_test','medical_tests'),(27,'add_medicine','medicines'),(28,'delete_symptom','symptoms'),(29,'update_symptom','symptoms'),(30,'delete_disgnosis','diagnosis'),(31,'update_disgnosis','diagnosis'),(32,'delete_test','medical_tests'),(33,'update_test','medical_tests'),(34,'delete_medicine','medicines'),(35,'update_medicine','medicines'),(36,'delete_admin','admins'),(37,'delete_doctor','doctors'),(38,'delete_location','locations'),(39,'delete_hospital','hospitals'),(40,'update_admin','admins'),(41,'update_doctor','doctors'),(42,'update_location','locations'),(43,'update_hospital','hospitals'),(44,'add_nurse','contact_staff'),(45,'update_nurse','doctor_staff_nurse'),(46,'delete_nurse','doctor_staff_nurse'),(47,'add_fd','contact_staff'),(48,'update_fd','doctor_staff_fd'),(49,'delete_fd','doctor_staff_fd'),(50,'add_pa','contact_staff'),(51,'update_pa','doctor_staff_pa'),(52,'delete_pa','doctor_staff_pa'),(53,'add_qualification','doctor_qualifications'),(54,'update_qualification','doctor_qualifications'),(55,'delete_qualification','doctor_qualifications'),(56,'start_appointment','appointments'),(57,'check_in','appointments'),(58,'move_back_to_waiting','appointments'),(59,'completed_appointment','appointments'),(60,'edit_appointment','appointments');

insert into notification_types values(1,'add_comment', 'comments'), (2,'set_appointment','appointments'),(3,'cancel_appointment','appointments'),(4,'reschedule_appointment','appointments'),(5,'set_followup','appointments'),(6,'add_family_member','family_members'),(7,'remove_family_member','family_members'),(8,'give_access','access'),(9,'send_request','access'),(10,'add_favourite_doctor','favourite_doctor');

insert into logging_types values(1,'set_appointment','appointments'),(2,'cancel_appointment','appointments'),(3,'reschedule_appointment','appointments'),(4,'set_followup','appointments'),(5,'check_in','appointments'),(6,'start_appointment','appointments'),(7,'move_back_to_waiting','appointments'),(8,'add_vital','vitals'),(9,'completed_appointment','appointments'),(10,'edit_appointment','appointments');

EOF


