const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "aibershealth",
  host: "localhost",
  port: 5432,
  database: "aibers",
});

otpSecretKey = 'lakdfawejr209323#@%QFASDRT#$%RQTQ#$T#$G#WEASADF#$#4345WFACVQ#$^AGA#@#TFGWY#$^@#$!RQQ{""L"{ORQRFQTAD';
apiSecretKey = 'jsdlaud(*&B*&%^7685v6VT&^YOJLDSDWQ}W|"SFY(YIHSDF)#*734FFLJSLFJadsfj:JEFE"SDFJ{WE}FSD<>SDFD>SDFHIOWEUR(#*U';
apiKeyFirebase = "AIzaSyDr9N3CCwDEbeOnH1Q9OKvrQCqPOTj6_CI";

// if you want to DISABLE authentication for APIs then set (auth = "DISABLE")
// if you want to ENABLE  authentication for APIs then set (auth = "ENABLE")
auth = "ENABLE";


module.exports = {
  pool,
  otpSecretKey,
  apiSecretKey,
  apiKeyFirebase,
  auth,
}
