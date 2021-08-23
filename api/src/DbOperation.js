const pool = require('./Config').pool;
const winston = require('./Logger');
var request = require("request");
var geoip = require('geoip-lite');
const fetch = require('node-fetch');

// function for APIs
const dbOperation = async (req, res, query, args) => {

  y = query.split(" ");
  url = y[0];

  try {
    const response = await pool.query(query, args);
    if ((url === 'SELECT') || (url === 'select')) {
      res.json(response.rows);
    }
    else {
      res.json("Operation Successful");
    }
  } catch (err) {
    customResponse(req, res, err);
  }
}

const customResponse = async (req, res, err) => {
  // console.log("in custom");
  var message = err.message;
  if (message == undefined) {
    message = err;
  }
  ip = await userInfo(req);
  winston.logger.error(`[${req.method}: "${req.url}"] ` + `[message: "${message}"] [IP Address: ${ip}]`);
  res.json({
    code: 404,
    message: 'API Error!'
  });
  // res.sendStatus(500);
}

// function for storing activity logs
const storeActivityLogs = async (log_user, log_user_type, activity, object) => {

  const query = "INSERT into activity_logs(log_user, log_user_type, activity_id, object_id) values($1, $2, (select activity_id from activity_type where activity = $3), $4)";

  try {
    await pool.query(
      query, [log_user, log_user_type, activity, object]
    );
  } catch (err) {
    // console.error(err.message);
    return 'error';
  }
}

// save notification function
const saveNotifications = async (notification_user, notification_user_type, notification_type_id, notification_object_id) => {
  try {
    await pool.query("insert into notification_logs (notification_user, notification_user_type, notification_type_id, notification_object_id) values($1, $2, (select notification_type_id from notification_types where notification_type = $3), $4)", [notification_user, notification_user_type, notification_type_id, notification_object_id]);
    console.log("notification saved");
  } catch (err) {
    console.error(err.message);
  }
}

//pop up notification
const popupNotifications = async (patient_id, doctor_id, title, body) => {
  try {
    const token = await pool.query("SELECT session_id, notification_token from login_sessions where user_id = $1 and user_type = $2", [patient_id, 'patient']);
    console.log(token.rows);
    const doc_name = await pool.query("select name from contacts where contact_id = (select contact_id from users where id = $1 and role = $2)", [doctor_id, 'doctor']);
    // console.log("token",token.rows[0].notification_token);
    if (token.rows.length > 0) {
      for (let i = 0; i < token.rows.length; i++) {
        if (token.rows[i].notification_token && token.rows[i].notification_token !== '') {
          //console.log("token",token.rows[0].notification_token);
          fetch(("https://fcm.googleapis.com/fcm/send"), {
            method: "POST",
            headers: { Accept: 'application/json', 'Content-Type': 'application/json', "Authorization": " key =AAAAlyRXRvM:APA91bECmIRSxCZjxbkzxgiLO6wdW6n7fgH7K8o1bVcLcwY6GuKu47fjR-_0evK9m34hbq6FHT0m7nxh5fh8XkoO2bjckdUpixqyfZeQlWEm3DbJ_gYjTO15J7QJMUX6qgYxHBd0Hv6v", 'Connection': 'close' },
            body: JSON.stringify({
              notification: {
                title: title,
                body: doc_name.rows[0].name + ' ' + body
              },
              to: token.rows[i].notification_token
            })
          }).then(response => response.json()).then((data) => {
            console.log(data)
            if (data.failure == 1) {
              pool.query("update login_sessions SET notification_token = '' where session_id = $1", [token.rows[i].session_id]);
            }
          });
        }
      }
    }
  } catch (err) {
    console.error(err.message);
  }
}

// save state logging function
const saveLoggings = async (state_to, action_role, action_role_id, appointment_id, logging_type_id) => {
  try {
    await pool.query("insert into state_logging (state_to, state_changing_time, action_role,action_role_id,appointment_id,logging_type_id) values($1, $2, $3, $4,$5,(select logging_type_id from logging_types where logging_type = $6))", [state_to, 'now()', action_role, action_role_id, appointment_id, logging_type_id]);
    console.log("logging saved");
  } catch (err) {
    console.error(err.message);
  }
}

const userInfo = async (req) => {

  var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress

  // console.log("In ip of user", ip);

  return ip;
}

// function for storing login sessions
const storeSessions = async (req, userId, userType, sid, c_id) => {
  var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
  // console.log("IP address of user", ip);

  const ua = req.headers['user-agent']; // browser + os information
  // console.log("User Information: ", ua);
  const checkSession = await pool.query("select * from login_sessions where session_id = $1", [sid]);

  const insertSessionQuery = "insert into login_sessions(ip_address, user_id, user_type, os_browser_info, ip_location, contact_id) values($1, $2, $3, $4, $5, $6) returning *";
  const updateSessionQuery = "update login_sessions set login_timestamp = $1, logout_timestamp = $2, ip_address = $4, ip_location = $5 where session_id = $3 returning *";
  var geoLocation;

  var geo = geoip.lookup(ip);
  // console.log(geo);
  if (geo) {
    if (!geo.city && geo.country) {
      geoLocation = `${geo.country}`;
    }
    if (geo.city && geo.country) {
      geoLocation = `${geo.city}, ${geo.country}`;
    }
  } else {
    geoLocation = 'NA';
  }


  if (sid == 0) {
    const session = await pool.query(
      insertSessionQuery, [ip, userId, userType, ua, geoLocation, c_id]
    );
    console.log("new session stored");
    return session.rows[0].session_id;
  } else {
    if (checkSession.rows[0] == undefined) {
      const session = await pool.query(
        insertSessionQuery, [ip, userId, userType, ua, geoLocation, c_id]
      );
      console.log("new session stored");
      return session.rows[0].session_id;
    }
    const session = await pool.query(
      updateSessionQuery, ['NOW()', null, sid, ip, geoLocation]
    );
    console.log("old session updated");
    return session.rows[0].session_id;
  }
}

const createMeeting = async (req, res, aid) => {
  // console.log("creating meeting");
  var meet;
  var createMeet = {
    method: 'GET',

    url: 'https://api.zoom.us/v2/users/8hhONHiuTBKP1aYgVY9qzQ/meetings',
    headers: {
      authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6Ik9mTi1vUURXU3dtN0VvMzdWbXlTYlEiLCJleHAiOjE5MDI3NjkyNjAsImlhdCI6MTYxODgyNDI4Mn0.1En4yjcHTAbiz2OcFJmWcsiTDMy0wH1djQIYu9IE-Rc'
    }
  };
  try {
    await request(createMeet, async (error, response, body) => {
      if (error) throw new Error(error);

      if (response.statusCode == 200) {
        meet = await body.split("join_url")[1].split(",")[0].split("\"")[2];
        // console.log("meet is: ", meet)
        await pool.query("UPDATE appointments SET telehealth_url = $1 WHERE appointment_id = $2", [meet, aid]);
      } else {
        customResponse(req, res, body);
      }
    });
  } catch (err) {
    console.error(err.message);
    customResponse(req, res, err);
  }

}

// function for APIs
const trycatchForAPIs = async (req, res, query, args) => {
  var response;
  try {
    response = await pool.query(query, args);
  } catch (err) {
    customResponse(req, res, err);
  }
  return response;
}

module.exports = {
  dbOperation,
  customResponse,
  storeActivityLogs,
  userInfo,
  storeSessions,
  saveNotifications,
  saveLoggings,
  createMeeting,
  trycatchForAPIs,
  popupNotifications,
}
