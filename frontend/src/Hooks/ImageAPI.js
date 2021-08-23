import config from "../config";
import axios from 'axios';

const baseURL = config.baseURL;
const doc_BaseURL = baseURL + "/doctors/";
const pat_BaseURL = baseURL + "/patients/";
const apiJWT = localStorage.getItem("verify_token");

function downloadHeader() {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    "Authorization": "Bearer " + apiJWT,
    'Connection': 'close'
  }
};

function uploadHeader(data) {
  return {
    'accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.8',
    "Authorization": "Bearer " + apiJWT,
    'Content-Type': `multipart/form-data; boundary=${data._boundary}`
  }
};

//Upload Image
export function uploadFile(account_Type, account_Id, selectedFile, callingType, patient_Id, appointment_Id, item_id) {
  let url = callingType === 'profile' ? baseURL + '/' + account_Type + '/' + account_Id + '/image'
  :
  callingType === 'doc' ?
  doc_BaseURL + account_Id + '/patients/' + patient_Id + '/appointments/' + appointment_Id + '/tests/' + item_id
  :
  ''
  console.log("uploadFile : API call for: ", url)
  const data = new FormData();
  callingType === 'profile' ? data.append('image', selectedFile, selectedFile.name)
  :
  data.append('file', selectedFile, selectedFile.name)
  //ToDo: need to decide whether to use axios or fetch
  if(url!==''){
    return axios.put(url, data, {
      headers: uploadHeader(data)
    }).then(response => response)
  } else {
    console.log("uploadFile: Failed! Invalid url");
  }
}

const downloadFileHandler = (val) => {
  if (val.size !== 4) {
    const blob = new Blob([val], { type: val.type });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `testing`;
    link.click();
    return "FILEDOWNLOADED"
  } else {
    return "NOFILE"
  }
}

//Download image
export function downloadFile(account_Type, account_Id, callingType, patient_Id, appointment_Id, item_id) {
  let url = callingType === 'profile' ? baseURL + '/' + account_Type + '/' + account_Id + '/image'
  :
  callingType === 'doc' ?
  doc_BaseURL + account_Id + '/patients/' + patient_Id + '/appointments/' + appointment_Id + '/tests/' + item_id
  :
  ''
  console.log("downloadFile : API call for: ", url)
  if(url!==''){
    return fetch(url, {
      headers: downloadHeader()
    }).then((response) => callingType === 'profile' ? response.json() : response.blob())
      .then(fileData => callingType === 'profile' ? fileData : downloadFileHandler(fileData))
  } else {
    console.log("downloadFile: Failed! Invalid url");
  }
}