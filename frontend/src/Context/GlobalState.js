import React, { createContext, useEffect, useReducer, useState } from 'react'

let reducer = (info, setInfo) => {
  if (setInfo === null) {
    localStorage.removeItem("info");
    return initialState;
  }
  return { ...info, ...setInfo };
};

const initialState = {
  doctor: "",
  staff: "",
  admin: "",
};

const localState = JSON.parse(localStorage.getItem("info"));

export const GlobalContext = createContext(initialState);

export const GlobalProvider = ({ children }) => {
  const [info, setInfo] = useReducer(reducer, localState || initialState);
  const [accountType, setAccountType] = useState(!!localStorage.getItem("accountType") ? localStorage.getItem("accountType") : '')
  const [accountId, setAccountId] = useState(!!localStorage.getItem("accountId") ? localStorage.getItem("accountId") : '')
  const [accountCId, setAccountCId] = useState(!!localStorage.getItem("accountCId") ? localStorage.getItem("accountCId") : '')
  const [staffDocId, setStaffDocId] = useState(!!localStorage.getItem("staffDocId") ? localStorage.getItem("staffDocId") : '')
  const [elementDocId, setElementDocId] = useState(!!localStorage.getItem("elementDocId") ? localStorage.getItem("elementDocId") : 0)
  const [staffDocList, setStaffDocList] = useState(!!localStorage.getItem("staffDocList") ? JSON.parse(localStorage.getItem("staffDocList")) : [])
  const [staffId, setStaffId] = useState([!!localStorage.getItem("staffId") ? localStorage.getItem("staffId") : ''])
  const [staffType, setStaffType] = useState(!!localStorage.getItem("staffType") ? localStorage.getItem("staffType") : '')
  const [username, setUsername] = useState(!!localStorage.getItem("username") ? localStorage.getItem("username") : '')
  const [meetingLink, setMeetingLink] = useState(!!localStorage.getItem("link") ? localStorage.getItem("link") : '')
  const [meetingPwd, setMeetingPwd] = useState(!!localStorage.getItem("password") ? localStorage.getItem("password") : '')
  const [meetingId, setMeetingId] = useState(!!localStorage.getItem("meetId") ? localStorage.getItem("meetId") : '')
  const [sessionId, setSessionId] = useState(!!localStorage.getItem("sessionId") ? localStorage.getItem("sessionId") : '')
  const [userImage, setUserImage] = useState(!!localStorage.getItem("img") ? localStorage.getItem("img") : '')



  useEffect(() => {
    localStorage.setItem("info", JSON.stringify(info));
    console.log('Global State Account Type info', info)
  }, [info]);

  useEffect(() => {
    console.log('Global State Account Type', accountType)
    localStorage.setItem("accountType", accountType);
    if (accountType === 'doctors' && !!info.doctor && info.doctor.length !== 0) {
      setAccountId(info.doctor[0].id)
      localStorage.setItem("accountId", info.doctor[0].id);
      setAccountCId(info.doctor[0].contact_id)
      localStorage.setItem("accountCId", info.doctor[0].contact_id);
      setElementDocId(info.doctor[0].id)
      localStorage.setItem("elementDocId", info.doctor[0].id);
    }

    if (accountType === 'nurses' && !!info.nurse && info.nurse.length !== 0) {
      setAccountId(info.nurse[0].id);
      localStorage.setItem("accountId", info.nurse[0].id);
      setAccountCId(info.nurse[0].contact_id);
      localStorage.setItem("accountCId", info.nurse[0].contact_id);
      setStaffDocList(info.nurse[0].my_doctors);
      localStorage.setItem("staffDocList", JSON.stringify(info.nurse[0].my_doctors));

      if (!!info.nurse[0].my_doctors && info.nurse[0].my_doctors.length !== 0) {
        setElementDocId(info.nurse[0].my_doctors[0].doctor_id)
        localStorage.setItem("elementDocId", info.nurse[0].my_doctors[0].doctor_id);
      }
    }

    if (accountType === 'fd' && !!info.front_desk && info.front_desk.length !== 0) {
      setAccountId(info.front_desk[0].id);
      localStorage.setItem("accountId", info.front_desk[0].id);
      setAccountCId(info.front_desk[0].contact_id);
      localStorage.setItem("accountCId", info.front_desk[0].contact_id);
      setStaffDocList(info.front_desk[0].my_doctors);
      localStorage.setItem("staffDocList", JSON.stringify(info.front_desk[0].my_doctors));

      if (!!info.front_desk[0].my_doctors && info.front_desk[0].my_doctors.length !== 0) {
        setElementDocId(info.front_desk[0].my_doctors[0].doctor_id)
        localStorage.setItem("elementDocId", info.front_desk[0].my_doctors[0].doctor_id);
      }
    }

    if (accountType === 'pa' && !!info.personal_assistant && !!info.personal_assistant.length !== 0) {
      setAccountId(info.personal_assistant[0].id);
      localStorage.setItem("accountId", info.personal_assistant[0].id);
      setAccountCId(info.personal_assistant[0].contact_id);
      localStorage.setItem("accountCId", info.personal_assistant[0].contact_id);
      setStaffDocList(info.personal_assistant[0].my_doctors);
      localStorage.setItem("staffDocList", JSON.stringify(info.personal_assistant[0].my_doctors));

      if (!!info.personal_assistant[0].my_doctors && info.personal_assistant[0].my_doctors.length !== 0) {
        setElementDocId(info.personal_assistant[0].my_doctors[0].doctor_id)
        localStorage.setItem("elementDocId", info.personal_assistant[0].my_doctors[0].doctor_id);
      }
    }

    if (accountType === 'admins' && !!info.admin) {
      setAccountId(info.admin.length !== 0 && info.admin[0].id)
      localStorage.setItem("accountId", info.admin.length !== 0 && info.admin[0].id);
      setAccountCId(info.admin.length !== 0 && info.admin[0].contact_id)
      localStorage.setItem("accountCId", info.admin.length !== 0 && info.admin[0].contact_id);
    }

  }, [accountType]);
  // useEffect(() => {
  //   console.log('Global State Account Type', accountType)
  //   localStorage.setItem("accountType", accountType);
  //   if (accountType === 'doctors' && !!info.doctor) {
  //     setAccountId(info.doctor.length !== 0 && info.doctor[0].id)
  //     localStorage.setItem("accountId", info.doctor.length !== 0 && info.doctor[0].id);
  //     setAccountCId(info.doctor.length !== 0 && info.doctor[0].contact_id)
  //     localStorage.setItem("accountCId", info.doctor.length !== 0 && info.doctor[0].contact_id);
  //     // history.replace({
  //     //   pathname: "/Appointments",
  //     //   state: {
  //     //     userId: info.doctor[0].doctor_id,
  //     //     contactId: info.doctor[0].contact_id,
  //     //     sessionId: info.session_id,
  //     //     userType: accountType
  //     //   }
  //     // });
  //   }

  //   if (accountType === 'nurses' && !!info.nurse) {
  //     setAccountId(info.nurse.length !== 0 && info.nurse[0].my_doctors[0].doctor_id)
  //     localStorage.setItem("accountId", info.nurse.length !== 0 && info.nurse[0].my_doctors[0].doctor_id);
  //     setAccountCId(info.nurse.length !== 0 && info.nurse[0].contact_id)
  //     localStorage.setItem("accountCId", info.nurse.length !== 0 && info.nurse[0].contact_id);
  //     setStaffDocId(info.nurse.length !== 0 && info.nurse[0].id)
  //     localStorage.setItem("staffDocId", info.nurse.length !== 0 && info.nurse[0].id);

  //     // history.replace({
  //     //   pathname: "/Profile",
  //     //   state: {
  //     //     userId: info.staff[0].my_doctors[0].doctor_id,
  //     //     contactId: info.staff[0].contact_id,
  //     //     sessionId: info.session_id,
  //     //     staffId: info.staff[0].doctor_staff_id,
  //     //     userType: "staff",
  //     //   }
  //     // });
  //   }

  //   if (accountType === 'fd' && !!info.front_desk) {
  //     setAccountId(info.front_desk.length !== 0 && info.front_desk[0].my_doctors[0].doctor_id)
  //     localStorage.setItem("accountId", info.front_desk.length !== 0 && info.front_desk[0].my_doctors[0].doctor_id);
  //     setAccountCId(info.front_desk.length !== 0 && info.front_desk[0].contact_id)
  //     localStorage.setItem("accountCId", info.front_desk.length !== 0 && info.front_desk[0].contact_id);
  //     setStaffDocId(info.front_desk.length !== 0 && info.front_desk[0].id)
  //     localStorage.setItem("staffDocId", info.front_desk.length !== 0 && info.front_desk[0].id);
  //   }

  //   if (accountType === 'pa' && !!info.personal_assistant) {
  //     setAccountId(info.personal_assistant.length !== 0 && info.personal_assistant[0].my_doctors[0].doctor_id)
  //     localStorage.setItem("accountId", info.personal_assistant.length !== 0 && info.personal_assistant[0].my_doctors[0].doctor_id);
  //     setAccountCId(info.personal_assistant.length !== 0 && info.personal_assistant[0].contact_id)
  //     localStorage.setItem("accountCId", info.personal_assistant.length !== 0 && info.personal_assistant[0].contact_id);
  //     setStaffDocId(info.personal_assistant.length !== 0 && info.personal_assistant[0].id)
  //     localStorage.setItem("staffDocId", info.personal_assistant.length !== 0 && info.personal_assistant[0].id);
  //   }

  //   if (accountType === 'admins' && !!info.admin) {
  //     setAccountId(info.admin.length !== 0 && info.admin[0].id)
  //     localStorage.setItem("accountId", info.admin.length !== 0 && info.admin[0].id);
  //     setAccountCId(info.admin.length !== 0 && info.admin[0].contact_id)
  //     localStorage.setItem("accountCId", info.admin.length !== 0 && info.admin[0].contact_id);
  //   }

  // }, [accountType]);




  return (
    <GlobalContext.Provider
      value={{ info, setInfo, accountType, setAccountType, accountId, accountCId, setAccountCId, setAccountId, staffDocId, setStaffDocId, setStaffType, staffType, username, setUsername, meetingLink, setMeetingLink, meetingPwd, setMeetingPwd, meetingId, setMeetingId, staffId, setStaffId, sessionId, setSessionId, userImage, setUserImage, staffDocList, setStaffDocList, elementDocId, setElementDocId }}>
      {children}
    </GlobalContext.Provider>
  );
};


