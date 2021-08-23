const phoneNumberField = document.getElementById('phoneNumber');
const codeField = document.getElementById('code');
const getCodeButton = document.getElementById('getCode');
const signInWithPhoneButton = document.getElementById('signInWithPhone');
const logoutButton = document.getElementById('logout');

const auth = firebase.auth();

var jwt = localStorage.getItem("access_token");
 
//this API will be called on page load
authenticateJWTForOTP(jwt).then((result) => {
  // display response of jwt verification API
  if(result.message === "Access Denied"){
 
    // console.log(result.message);
    console.log("Please enter your number and click on get code");

    // access denied, now call firebase , get number from user and send it to firebase for verification//

// First resolve recaptcha
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "recaptcha-container",
          {
            size: "invisible",
            callback: function (response) {
              console.log("Captcha Resolved");
              // this.onSignInSubmit();
            },
            defaultCountry: "PK",
          }
    );
    
// Second: send verification code to firebase function
    const sendVerificationCode = () => {
      var pNo = phoneNumberField.value;
      var countryCode = "+92";
      var phoneNo = countryCode.concat(pNo);
      
        console.log("Sending code on mobile number for verification");
    
        auth.signInWithPhoneNumber(phoneNo, window.recaptchaVerifier)
         .then(confirmationResult => {
           const sentCodeId = confirmationResult.verificationId;
           console.log("Please enter a verification code from your mobile number");
            // Sign in if the verification code is set correctly
            signInWithPhoneButton.addEventListener('click', () => signInWithPhone(sentCodeId));
          })
         
    }
    
    // by clicking on get code button this event will occur
    getCodeButton.addEventListener('click', sendVerificationCode);

// Third: sign-in on basis of code entered by user in browser
    const signInWithPhone = sentCodeId => {
      const code = codeField.value;
      // A credential object (contains user's data) is created after a comparison between the 6 digit code sent to the user's phone
      // and the code typed by the user in the code field on the html form.
      const credential = firebase.auth.PhoneAuthProvider.credential(sentCodeId, code);

      auth.signInWithCredential(credential)
      .then(async (result) => {
        // window.location.assign('./successLogin');
        console.log('Signed in successfully !');
    
        const apiKey = result.user.l;
        const phNo = result.user.phoneNumber;
        
        // const currentUser = firebase.auth().currentUser.phoneNumber;
        // console.log("CURRENT USER:", currentUser);
    
        // create jwt against currentUser's phone number and store in browser local storage
        await createjwtForOTP(phNo, apiKey).then( async (result) => {
    
          console.log("JWT has been created for OTP");
          // storing jwt in local storage
          console.log("Storing jwt in local storage");
          localStorage.setItem("access_token", result.token);
          
          if(localStorage.getItem("access_token")) {console.log("Jwt stored in local storage");} 
    
            // call api to authenticate and decode jwt
          await authenticateJWTForOTP(localStorage.getItem("access_token")).then((result) => {
              if(result.message === "Access Denied"){
                  console.log(result.message);
              } else {
                console.log(result);
                // CALL LOGIN API BY SENDING PHONE NUMBER + JWT(verify_token) IN HEADER
              }
            })
        });
        
        // create jwt for APIs access and store in local storage
        console.log("Creating jwt for APIs access");

        await createJWTForAPIsAccess(phNo, apiKey).then((output) => {
          localStorage.setItem("verify_token", output.token1);
          console.log("APIs Access jwt stored in local storage");
        })
    
    
      })
      .catch(error => {
        // window.location.assign('./errorLogin');
        // Wrong code entered by user
        console.error(error.code);
      })
    
    }

    

  } else {
    // display our final data(phone number)
    console.log(result);
    // CALL LOGIN API BY SENDING PHONE NUMBER + JWT(verify_token) IN HEADER
  }

})


// logout from firebase and remove token from local storage
const logoutFunction = () => {
    //signOut() is a built in firebase function responsible for signing a user out
    // console.log("Before SignOut CURRENT USER PNO", firebase.auth().currentUser.phoneNumber);
    // localStorage.removeItem("verify_token");

    let keysToRemove = ["verify_token", "access_token"];
    for (key of keysToRemove) {
      localStorage.removeItem(key);
    }
    
    auth.signOut()
    .then(() => {
        // console.log('User signed out successfully!');
        window.location.reload();
        // window.location.assign('./');
    })
    .catch(error => {
        console.error(error);
    });
}

logoutButton.addEventListener('click', logoutFunction);




// API's Functions
// API call function for authenticating JWT and return a phone number
function authenticateJWTForOTP(jwt){
  return  fetch(("https://app.aibers.health/decodeJWTForOTP"), {
    method: "POST",
    ContentType: 'application/json',
    headers: {"Authorization" : "Bearer " + jwt},
      }).then(response => response.json());
}

// API call function for creating JWT for current user
function createjwtForOTP(phNo, apiKey){
  return  fetch(("https://app.aibers.health/createJWTForOTP"), {
    method: "POST",
    headers: {Accept: 'application/json','Content-Type': 'application/json'},
    body: JSON.stringify({
        pno: phNo,
        apiKey: apiKey
})
      }).then(response => response.json());
}

// API call function for creating JWT for APIs Access
function createJWTForAPIsAccess(phoneNo, apiKey){
  return  fetch(("https://app.aibers.health/createJWTForAPIsAccess"), {
    method: "POST",
    headers: {Accept: 'application/json','Content-Type': 'application/json'},
    body: JSON.stringify({
        pno: phoneNo,
        apiKey: apiKey
})
      }).then(response => response.json());
}