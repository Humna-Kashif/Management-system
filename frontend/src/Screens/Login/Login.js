import React, { useEffect, useState, useCallback, useContext } from 'react'
import { useHistory } from "react-router-dom";
import { createJWTForAPIsAccess, createJWTForOTP, decodeJWTForOTP, LogInAPI } from '../../Hooks/API'
import { numberFormat } from '../../Hooks/TextTransform'
import './Login.css'
import 'firebase/auth'
import fb from "firebase/app"
import config from "../../config";
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SectionLoading from '../../Components/Loading/SectionLoading';
import { Select, Input } from 'antd';
import codes from 'country-calling-code';

// for websockets
// var W3CWebSocket = require('websocket').w3cwebsocket;

import { GlobalContext } from '../../Context/GlobalState'
import CountryCodes from '../../Components/Country Codes/CountryCodes';
const { Option } = Select;

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDr9N3CCwDEbeOnH1Q9OKvrQCqPOTj6_CI",
  authDomain: "staging.aibers.health",
  projectId: "aibers-health-2ac95",
  storageBucket: "aibers-health-2ac95.appspot.com",
  messagingSenderId: "649149761267",
  appId: "1:649149761267:web:5ce53bef3d078897745986",
  measurementId: "G-HJMNSNM7F5"
};
try {
  if (FIREBASE_CONFIG.apiKey) {
    fb.initializeApp(FIREBASE_CONFIG);
  }
} catch (err) {
  // ignore app already
}

const Login = () => {
  const jwtInLocal = localStorage.getItem("access_token");
  const sessionID = (localStorage.getItem("sessionId") !== "undefined" && !!localStorage.getItem("sessionId")) ? localStorage.getItem("sessionId") : 0;
  console.log('this is my session id', sessionID, 'local storage', !!localStorage.getItem("sessionId"))
  const [phonenumber, setPhoneNumber] = useState('');
  const [isLoading, setIsloading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const history = useHistory();
  const baseURL = config.baseURL;

  const [confirmOTPUI, setConfirmOTPUI] = useState(false);
  const [countryCode, setCountryCode] = useState(`+${codes[159].countryCodes[0]}`)
  const { info, setInfo, setAccountId, accountType, setAccountCId, setAccountType, setStaffDocId, sessionId, setSessionId, staffId, setStaffId, staffDocList, setStaffDocList, elementDocId, setElementDocId } = useContext(GlobalContext);
  const user = accountType
  console.log("baseURL: ", baseURL);
  const auth = config.auth;
  console.log("auth: ", auth);

  /* Type of Users Check */
  const [hasAdmin, setHasAdmin] = useState(false);
  const [hasDoc, setHasDoc] = useState(false);
  const [hasFD, setHasFD] = useState(false);
  const [hasNurse, setHasNurse] = useState(false);
  const [hasPA, setHasPA] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const handleLoginAsUserType = (userType, userVal) => {
    console.log(" Sign - In as User : ", userType, userVal)
    // setSessionId(info.session_id);
    setAccountType(userType);
    setAccountCId(userVal[0].contact_id);
    setAccountId(userVal[0].id);
    localStorage.setItem("accountType", userType);
    localStorage.setItem("accountId", userVal[0].id);
    localStorage.setItem("accountCId", userVal[0].contact_id);
    if (userType === 'doctors') {
      setElementDocId(userVal[0].id)
      localStorage.setItem("elementDocId", userVal[0].id);
    }

    if (userType !== 'doctors' && userType !== 'admins') {
      setStaffDocList(userVal[0].my_doctors);
      localStorage.setItem("staffDocList", JSON.stringify(userVal[0].my_doctors));

      if (!!userVal[0].my_doctors && userVal[0].my_doctors.length !== 0) {
        setElementDocId(userVal[0].my_doctors[0].doctor_id);
        localStorage.setItem("elementDocId", userVal[0].my_doctors[0].doctor_id);
      } else {
        setElementDocId(0);
        localStorage.setItem("elementDocId", 0);
      }
    }

    // localStorage.setItem("accountCId", info.doctor[0].contact_id);
    let userPath = (userType === 'doctors') ? "Appointments" : (userType === 'admins') ? "Admins" : "Profile"
    localStorage.setItem("path", userPath);
    history.push({
      pathname: "/" + userPath,
      state: {
        // userId: userVal[0].id,
        // contactId: userVal[0].contact_id,
        // sessionId: info.session_id,
        // userType: userType
      }
    });
  }

  const handleChange = (event) => {
    console.log('Phone number added is', event.target.value)
    setPhoneNumber(numberFormat(event.target.value))
  }

  const handleCodeChange = (event) => {
    setOtpCode(event.target.value)
  }


  const creatingStoringJWT = (currentUser, key) => {
    console.log("creatingStoringJWT: auth in this case ", currentUser, key);
    createJWTForAPIsAccess(currentUser, key)
      .then((output) => {
        console.log("Storing token in local storage");
        localStorage.setItem("verify_token", output.token1);
        console.log("Your APIs Access Token stored", output);
        createJWTForOTP(currentUser, key, output.token1)
          .then((json) => {
            console.log(json);
            console.log("createJWTForOTP Success", json);
            localStorage.setItem("access_token", json.token);    // OTP token
            if (localStorage.getItem("access_token")) {
              console.log("Jwt stored in local storage");
              console.log("access token in local storage: ", localStorage.getItem("access_token"));
            }
            decodeJWTForOTP(json.token)
              .then((json) => {
                console.log("Decode JWT For OTP - authenticateJWT", json.number, countryCode + phonenumber);
                json.number === countryCode + phonenumber ? isData(json.number, output.token1) : alert(json.message)
              })
              .catch((error) => console.error(error))
              .finally(() => console.log("authenticateJWT otp screen finally"));
          })
          .catch((error) => console.error(error))
          .finally(() => {
            console.log("Token creation finally");
            console.log("phone no create jwt finaaly");
          });
      });
  }

  // only in else condition i.e in case of authentication enable
  const onSignInSubmit = (number) => {
    setIsloading(true);
    let phoneNumber = countryCode + number;
    // recaptchaView();
    console.log(phoneNumber);
    console.log("onSignInSubmit: Auth is in this case  ", auth);
    if (auth === "ENABLE") {
      console.log("onSignInSubmit: Auth is in this case enable ");
      let appVerifier = window.recaptchaVerifier;
      fb.auth()
        .signInWithPhoneNumber(phoneNumber, appVerifier)
        .then(function (confirmationResult) {
          window.confirmationResult = confirmationResult;
          setConfirmationResult(confirmationResult);
          // console.log(confirmationResult);
          console.log("OTP is sent");
          setIsloading(false);
          setConfirmOTPUI(true);
        })
        .catch(function (error) {
          console.log("error is", error);
        });
    }
    else if (auth === "DISABLE") {
      console.log("onSignInSubmit: Auth is in this case disable  ");
      confirmOtp("123");
    }

  };

  // only in else condition i.e in case of authentication enable
  const confirmOtp = (code) => {
    setIsloading(true);
    console.log("Confirm Otp Called")
    console.log("confirmOtp: Auth is in this case  ", auth);
    if (auth === 'ENABLE') {
      console.log("confirmOtp: Auth is in this case disable  ", auth);
      confirmationResult.confirm(code).then(function (result) {
        // var user = result.user; 
        console.log("OTP confirmation success");
        // console.log(user);
        console.log("creating user", result.user.l, "number", result.user.phoneNumber);
        creatingStoringJWT(result.user.phoneNumber, result.user.l);
        // isData();
      }).catch(function (error) {
        alert('wrong otp' + error)
      });
    }
    else if (auth === 'DISABLE') {
      console.log("confirmOtp: Auth is in this case disable  ", auth);
      creatingStoringJWT(countryCode + phonenumber, FIREBASE_CONFIG.apiKey);
    }
  }

  // both cases funtion calls
  const isData = useCallback((phonenumber, jwtForAPIAccess) => {
    const contact_no = phonenumber;
    console.log('Add user data is', contact_no, sessionID)
    LogInAPI(contact_no, sessionID)
      .then((data1) => {
        if (data1) {
          // console.log('This is your data', data1);
          // localStorage.setItem("session_id", data1.session_id)
          console.log('Result of Login Api', data1)
          setInfo(data1);
          setSessionId(data1.session_id);
          localStorage.setItem('sessionId', data1.session_id);

          setHasAdmin(!!data1.admin && data1.admin.length !== 0);
          setHasDoc(!!data1.doctor && data1.doctor.length !== 0);
          setHasFD(!!data1.front_desk && data1.front_desk.length !== 0)
          setHasNurse(!!data1.nurse && data1.nurse.length !== 0)
          setHasPA(!!data1.personal_assistant && data1.personal_assistant.length !== 0)

          if (data1.doctor.length !== 0 ||
            data1.nurse.length !== 0 ||
            data1.front_desk.length !== 0 ||
            data1.personal_assistant.length !== 0 ||
            data1.admin.length !== 0) {
            console.log('Show users are present')
            setShowUsers(true)
          }

          if (data1.doctor.length === 0 && data1.nurse.length === 0 && data1.front_desk.length === 0 && data1.personal_assistant.length === 0 && data1.admin.length !== 0) {
            console.log('Only admin is present');
            handleLoginAsUserType('admins', data1.admin);
          }
          if (data1.doctor.length === 0 && data1.nurse.length !== 0 && data1.front_desk.length === 0 && data1.personal_assistant.length === 0 && data1.admin.length === 0) {
            console.log('Only nurse is present')
            handleLoginAsUserType('nurses', data1.nurse);
          }
          if (data1.doctor.length === 0 && data1.nurse.length === 0 && data1.front_desk.length !== 0 && data1.personal_assistant.length === 0 && data1.admin.length === 0) {
            console.log('Only front desk is present')
            handleLoginAsUserType('fd', data1.front_desk);
          }
          if (data1.doctor.length === 0 && data1.nurse.length === 0 && data1.front_desk.length === 0 && data1.personal_assistant.length !== 0 && data1.admin.length === 0) {
            console.log('Only personal_assistant is present')
            handleLoginAsUserType('pa', data1.personal_assistant);
          }
          if (data1.doctor.length !== 0 && data1.nurse.length === 0 && data1.front_desk.length === 0 && data1.personal_assistant.length === 0 && data1.admin.length === 0) {
            console.log('Only doctor is present')
            handleLoginAsUserType('doctors', data1.doctor)
          }
        }
        else {
          console.log('No data found')
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {
        setIsloading(false);
      });

  }, [baseURL, history, sessionID])

  if (auth === "DISABLE") {
    console.log("Authentication is DISABLE, skip FIREBASE functions and call login_with_phone_number API here");
    //jwt creation for API and authentication and login API calling
  } else {
    console.log("Authentication is ENABLED");
    //normal flow
  }

  // web socket implementation start
  // useEffect(() => {

  //   var client = new W3CWebSocket('ws://localhost:8090/', 'echo-protocol');

  //   client.onerror = function () {
  //     console.log('Connection Error');
  //   };

  //   client.onopen = function () {
  //     console.log('WebSocket Client Connected');

  //     function sendNumber() {
  //       if (client.readyState === client.OPEN) {
  //         var number = Math.round(Math.random() * 0xFFFFFF);
  //         client.send(number.toString());
  //         setTimeout(sendNumber, 1000);
  //       }
  //     }
  //     sendNumber();
  //   };

  //   client.onclose = function () {
  //     console.log('echo-protocol Client Closed');
  //   };

  //   client.onmessage = function (e) {
  //     if (typeof e.data === 'string') {
  //       console.log("Received: '" + e.data + "'");
  //     }
  //   };

  // }, [1]);
  // web socket implementation end

  const [animateOnRender, setAnimateOnRender] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setAnimateOnRender(true);
    console.log("useEffect Login js");
    console.log("JWT ", jwtInLocal);
    !!jwtInLocal && decodeJWTForOTP(jwtInLocal).then((json) => {
      // display response of jwt verification API 
      if (json.number && isMounted) {
        console.log("No in JWT: ", json.number);
        if (!localStorage.getItem("verify_token")) {
          console.log("verify_token missing in local storage")
        };
        console.log("verify_token in local storage is a ", localStorage.getItem("verify_token"))
        let path = localStorage.getItem("path");
        localStorage.setItem("selectedBtn", path);
        isData(json.number, localStorage.getItem("verify_token"))
      } else if (json.message === "Access Denied") {
        console.log("Please enter your number and click on get code");
      }
    });

    // only in else condition i.e in case of authentication enable
    if (auth === "ENABLE") {
      console.log("Authentication is ENABLED");
      window.recaptchaVerifier = new fb.auth.RecaptchaVerifier("recaptcha-container", {
        size: "invisible",
        callback: function (response) { console.log("Captcha Resolved"); }
      });
    }
    return () => { isMounted = false };


  }, [isData, jwtInLocal]);




  // View Alteration on the base of if else authentication
  return (
    <div className="header">
      <div style={{ position: "fixed", top: 0, left: 0 }}>
        <img src={require('../../Images/bgpic1.png')} style={{ maxWidth: 300, marginLeft: 0, marginRight: 4, position: "absolute" }} />
      </div>
      <div style={{ position: "fixed", top: 0, left: 0 }}>
        <img src={require('../../Images/bgpic2.png')} style={{ maxWidth: 300, marginLeft: 4, position: "fixed", right: 0, bottom: 0 }} />
      </div>
      <div>
        <div style={{ position: "relative", paddingBottom: 30 }}>
          <img src={require('../../Images/brand1-sm.png')} style={{ padding: 25 }} />
        </div>
        {isLoading && <SectionLoading />}
        <div className={`form-wrapper ${animateOnRender && 'form-wrapper__animate'}`} >
          {confirmOTPUI &&
            <IconButton
              onClick={() => {
                setConfirmOTPUI(false)
                setShowUsers(false)
              }}
              className="back-icon" >
              <ArrowBackIcon />
            </IconButton>
          }
          {(showUsers) &&
            <IconButton
              onClick={() => {
                setConfirmOTPUI(true)
                setShowUsers(false)
              }}
              className="back-icon" >
              <ArrowBackIcon />
            </IconButton>
          }
          <div style={{ fontSize: 22, paddingBottom: 24, paddingTop: 24, color: "#000000c4" }}>
            Login to your account
          </div>
          <form className="Login-form">
            <div className={`contact-container ${(confirmOTPUI || showUsers) && 'contact-animate'}`}>
              <div className="PhoneNumber">
                <Input
                  type="tel"
                  addonBefore={<CountryCodes returnHook={setCountryCode} defaultCode={countryCode} data={codes} />}
                  id="phoneNumber"
                  name="phoneNumber"
                  pattern="[0-9]"
                  placeholder="3000000000"
                  value={phonenumber}
                  noValidate
                  onChange={handleChange} />
              </div>
              <div className="SignInAccount">
                <button
                  id="getCode"
                  type="button"
                  onClick={() => { onSignInSubmit(phonenumber) }}>
                  Sign In</button>
                <br />
              </div>
            </div>

            <div className={`otp-container ${!confirmOTPUI && 'otp-animate'} ${showUsers && 'contact-animate'}`} >
              <div>
                <input
                  type="text"
                  id="code"
                  name="code"
                  placeholder="Enter code here"
                  value={otpCode}
                  noValidate
                  onChange={handleCodeChange} />
              </div>
              <div className="SignInAccount">
                <button
                  id="signInWithPhone"
                  onClick={() => { confirmOtp(otpCode) }}>
                  Verify Code</button>
              </div>
            </div>

            <div className={`otp-container ${!showUsers && 'otp-animate'}`} style={{ top: -20 }}>
              <div className="SignInAccount">
                {hasDoc &&
                  <button id="signInWithPhone"
                    onClick={() => { console.log('Doctor Sign-In', info.doctor[0].id); handleLoginAsUserType('doctors', info.doctor) }}>
                    as Doctor
                  </button>
                }
                {hasNurse &&
                  <button id="signInWithPhone"
                    onClick={() => { console.log('Nurse Sign-In', info.nurse[0].id); handleLoginAsUserType('nurses', info.nurse) }}>
                    as Nurse
                  </button>
                }
                {hasPA &&
                  <button id="signInWithPhone"
                    onClick={() => { console.log('PA Sign-In', info.personal_assistant[0].id); handleLoginAsUserType('pa', info.personal_assistant) }}>
                    as Personal Assistant
                  </button>
                }
                {hasFD &&
                  <button id="signInWithPhone"
                    onClick={() => { console.log('FD Sign-In', info.front_desk[0].id); handleLoginAsUserType('fd', info.front_desk) }}>
                    as Front Desk
                  </button>
                }
                {hasAdmin &&
                  <button
                    id="signInWithPhone"
                    onClick={() => { console.log('Admin Sign-In', info.admin[0].id); handleLoginAsUserType('admins', info.admin) }}>
                    as Admin
                  </button>
                }
              </div>
            </div>

            <div id="recaptcha-container"></div>
            <small>Don't have an Account?</small>
            &nbsp; &nbsp;
            <label>Get Registered</label><br />

          </form>
        </div>
      </div>
    </div>
  )
}

export default Login