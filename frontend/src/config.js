// default values for baseURL and authentication
var baseURL = window.location.origin;
// var baseURL ="https://staging.aibers.health";
var auth = "ENABLE";
var baseDate = '05-May-2021';
// REACT_APP_BUILD_TIME=$(date +%m-%d-%Y)

// if arguments in CLI then set "baseURL" and "auth" we are getting in arguments
const base = process.env.REACT_APP_ENV;

if(base){
    baseURL = base;
    console.log("baseURL changed to: ", baseURL)
}
console.log("API URL: ", baseURL)

const authe = process.env.REACT_APP_AUTH;
if(authe){
    auth = authe;
    console.log("auth state changed to: ", auth)
}
const dt = process.env.REACT_APP_BUILD_TIME;
if(dt){
    baseDate= dt;
    console.log("build date changed to: ", baseDate)
}

module.exports = {
    baseURL,
    auth,
    baseDate
}
