import React, { useState, useEffect, useContext } from 'react'
import { Navbar, Nav } from 'react-bootstrap';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import Badge from '@material-ui/core/Badge';
import { Menu, Dropdown } from 'antd';
import './Navbar.css';
import { Avatar } from "@material-ui/core";
import { IoIosArrowDown, IoMdNotificationsOutline, IoMdNotifications } from "react-icons/io";
import Notifications from '../Notifications/Notifications';
import { Link, useHistory } from 'react-router-dom';
import { showNotificationListAPI } from '../../Hooks/API'
import { downloadFile } from '../../Hooks/ImageAPI'
import 'firebase/auth'
import fb from "firebase/app"
import { GlobalContext } from '../../Context/GlobalState';
import { Fragment } from 'react';
const { SubMenu } = Menu;

const Navbars = (props) => {
  const auth = fb.auth();
  const history = useHistory();
  const [image, setImage] = useState(null);
  const [statusRead, setStatusRead] = useState([]);
  const [list, setList] = useState([]);
  const { info, accountId, accountType, setUsername, setAccountType, userImage, setUserImage, username, elementDocId } = useContext(GlobalContext)
  console.log("Data from Navbar: info is: ", props)
  const doctorData = info.doctor;
  const nurseData = info.nurse;
  const fdData = info.front_desk;
  const paData = info.personal_assistant;
  const adminData = info.admin;

  const BadgeStats = (dataArray) => {
    const statusArray = [];
    dataArray.map((item, i) => {
      statusArray.push({
        status: item.notification_status
      })
    })
    return statusArray;
  }

  const displayBadge = (id) => {
    setUsername(props.data.name);
    showNotificationListAPI(id, 0, 0, 0).then((result) => {
      if (result[0]) {
        console.log("Notification Badge results ", result)
        setList(result);
        const NotificationCopy = [...result];
        setStatusRead(BadgeStats(NotificationCopy))
        console.log('Notification Status results are:', BadgeStats(NotificationCopy))
      }
    })
  }

  const showImage = (isMounted) => {
    console.log("showImage: download image function : ", props.data)
    if (!!props.data.image) {
      console.log("showImage: download image function")
      downloadFile(accountType, elementDocId, 'profile')
        .then((json) => { isMounted && setImage("data:image;charset=utf-8;base64," + json.encodedData); setUserImage("data:image;charset=utf-8;base64," + json.encodedData); localStorage.setItem("img", "data:image;charset=utf-8;base64," + json.encodedData) })
        .catch((error) => console.error(error))
        .finally(() => {
        });
    } else {
      console.log("Downloading Image Failed! image is null")
    }
  }

  useEffect(() => {
    let isMounted = true;
    showImage(isMounted);
    displayBadge(elementDocId);
    return () => { isMounted = false };
  }, [elementDocId, username, userImage]);

  const useStyles = makeStyles((theme) => ({
    navbar: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    navBarShift: {
      width: 'calc(100% - 300px)',
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 300,
    },

    opened: {
      color: '#e0004d',
      padding: '3px',
      fontSize: '31px',
      borderRadius: '50%',
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    closed: {
      fontSize: 24,
      color: "#a0a0a0",

    }
  }));

  const classes = useStyles();
  const clear_Token_localStorage = () => {

    localStorage.removeItem("verify_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("accountType");
    localStorage.removeItem('accountId');
    localStorage.removeItem('accountCId');
    localStorage.removeItem('staffDocId');
    localStorage.removeItem('link');
    localStorage.removeItem('meetId');
    localStorage.removeItem('password');
    localStorage.removeItem('username');

    auth.signOut().then(() => {
      // Sign-out successful.
      console.log("signout now")
    }).catch((error) => {
      console.log(error)
      // An error happened.
    });;
  }

  const handleUserTypes = () => {
    localStorage.setItem('username', props.data.name)
    setUsername(props.data.name)
    if (accountType === "doctors") {
      return <span className="ant-dropdown-link" >
        <Avatar src={userImage} style={styles.avatar} />
        <label style={{ marginTop: '7px', fontWeight: '550', fontSize: '15px' }}> Dr. {(username ? username : 'Loading...')} <IoIosArrowDown style={{ color: "#e0004d" }}></IoIosArrowDown>  </label>
      </span>
    }
    else if (accountType === "admins") {
      return <span className="ant-dropdown-link" >
        <label style={{ marginTop: '7px', fontWeight: '550', fontSize: '15px' }}> Admin. {(username ? username : 'Loading...')} <IoIosArrowDown style={{ color: "#e0004d" }}></IoIosArrowDown>  </label>
      </span>
    }
    else if (accountType === "nurses") {
      return <span className="ant-dropdown-link" >
        <label style={{ marginTop: '7px', fontWeight: '550', fontSize: '15px' }}>Nurse. {(username ? username : "Loading...")} <IoIosArrowDown style={{ color: "#e0004d" }}></IoIosArrowDown>  </label>
      </span>
    }
    else if (accountType === "fd") {
      return <span className="ant-dropdown-link" >
        <label style={{ marginTop: '7px', fontWeight: '550', fontSize: '15px' }}> FD. {(username ? username : "Loading...")} <IoIosArrowDown style={{ color: "#e0004d" }}></IoIosArrowDown>  </label>
      </span>
    }
    else if (accountType === "pa") {
      return <span className="ant-dropdown-link" >
        <label style={{ marginTop: '7px', fontWeight: '550', fontSize: '15px' }}> PA.{(username ? username : "Loading...")} <IoIosArrowDown style={{ color: "#e0004d" }}></IoIosArrowDown>  </label>
      </span>
    }
    else return <span className="ant-dropdown-link" >
      <label style={{ marginTop: '7px', fontWeight: '550', fontSize: '15px' }}>  {"Anonymous"} <IoIosArrowDown style={{ color: "#e0004d" }}></IoIosArrowDown>  </label>
    </span>

  }

  return (
    <div>
      <Navbar variant="light" expand="lg" className={clsx(classes.navbar, {
        [classes.navBarShift]: props.open,
      })}>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
          </Nav>
          {accountType !== 'admins' && <Fragment>
            {statusRead.some(list => list.status == false) ?
              <Badge color="secondary" badgeContent=" " variant="dot" style={{ top: -9 }} />
              : ''}
            {props.open ? <div className='Notifications' onClick={props.handleDrawerClose}>
              <IoMdNotifications className={classes.opened}  ></IoMdNotifications>
            </div> : <div className='Notifications' onClick={props.handleDrawerOpen}>
              <IoMdNotificationsOutline className={classes.closed}  ></IoMdNotificationsOutline>
            </div>}
          </Fragment>}
          <Dropdown overlay={<Menu>
            <Menu.Item>
              <Link style={{ color: '#333333', fontSize: '16px', padding: '5px', opacity: 0.9, fontWeight: 'bold', paddingLeft: '10px', paddingRight: '24px' }}
                to={{
                  pathname: "/Profile",
                  state: { userId: elementDocId },
                }}
              > Profile </Link>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item>
              <Link style={{ color: '#333333', fontSize: '16px', padding: '5px', opacity: 0.9, fontWeight: 'bold', paddingLeft: '10px', paddingRight: '24px' }} to={{
                pathname: "/Support",
                state: { userId: elementDocId },
              }}>Help & Support</Link>
            </Menu.Item>
            <Menu.Divider />
            {(info.doctor.length !== 0 && info.admin.length === 0 && info.nurse.length === 0 && info.front_desk.length === 0 && info.personal_assistant.length === 0)
              || (info.doctor.length === 0 && info.admin.length !== 0 && info.nurse.length === 0 && info.front_desk.length === 0 && info.personal_assistant.length === 0) ||
              (info.doctor.length === 0 && info.admin.length === 0 && info.nurse.length !== 0 && info.front_desk.length === 0 && info.personal_assistant.length === 0) ||
              (info.doctor.length === 0 && info.admin.length === 0 && info.nurse.length === 0 && info.front_desk.length !== 0 && info.personal_assistant.length === 0) ||
              (info.doctor.length === 0 && info.admin.length === 0 && info.nurse.length === 0 && info.front_desk.length === 0 && info.personal_assistant.length !== 0) ? " " :
              <SubMenu title="Role" style={{ color: '#333333', fontSize: '16px', opacity: 0.9, fontWeight: 'bold', }}>
                {!!doctorData && doctorData.length !== 0 ?
                  <Menu.Item key='doctor' style={accountType === 'doctors' ? styles.selectedRole : styles.ItemStyle}
                    onClick={() => {
                      setAccountType('doctors');
                      localStorage.setItem("path", "Profile");
                      localStorage.setItem("selectedBtn", "Profile");
                      history.replace({
                        pathname: "/Profile",
                        state: {
                          // accountId: info.doctor.length !== 0 && info.doctor[0].doctor_id,
                          // contactId: info.doctor.length !== 0 && info.doctor[0].contact_id,
                          // sessionId: info.session_id,
                          // userType: 'doctor'
                        }
                      });
                    }}>
                    Doctor
                  </Menu.Item>
                  : ''}
                {!!doctorData && doctorData.length !== 0 ? <Menu.Divider /> : ''}

                {!!adminData && adminData.length !== 0 ?
                  <Menu.Item key='admin' style={accountType === 'admins' ? styles.selectedRole : styles.ItemStyle}
                    onClick={() => {
                      setAccountType('admins');
                      localStorage.setItem("path", "Admins");
                      localStorage.setItem("selectedBtn", "Admins");
                      history.replace({
                        pathname: "/Admins",
                        state: {
                          // userId: info.admin.length !== 0 && info.admin[0].admin_id,
                          // contactId: info.admin.length !== 0 && info.admin[0].contact_id,
                          // sessionId: info.session_id,
                          // userType: 'admin',
                        }
                      });
                    }} >

                    Admin
                  </Menu.Item>
                  : ''}
                {!!adminData && adminData.length !== 0 ? <Menu.Divider /> : ''}

                {!!nurseData && nurseData.length !== 0 ?
                  <Menu.Item key='nurse' style={accountType === 'nurses' ? styles.selectedRole : styles.ItemStyle}
                    onClick={() => {
                      setAccountType('nurses');
                      localStorage.setItem("path", "Profile");
                      localStorage.setItem("selectedBtn", "Profile");
                      history.replace({
                        pathname: "/Profile",
                        state: {
                          // userId: info.nurse.length !== 0 && info.nurse[0].my_doctors[0].doctor_id,
                          // contactId: info.nurse.length !== 0 && info.nurse[0].contact_id,
                          // sessionId: info.session_id,
                          // staffId: info.nurse.length !== 0 && info.nurse[0].doctor_staff_nurse_id,
                          // userType: 'nurse',
                        }
                      });
                    }}
                  >
                    Nurse
                  </Menu.Item> : ''}

                {!!nurseData && nurseData.length !== 0 ? <Menu.Divider /> : ''}

                {!!fdData && fdData.length !== 0 ?
                  <Menu.Item key='fd' style={accountType === 'fd' ? styles.selectedRole : styles.ItemStyle}
                    onClick={() => {
                      setAccountType('fd');
                      localStorage.setItem("path", "Profile");
                      localStorage.setItem("selectedBtn", "Profile");
                      history.replace({
                        pathname: "/Profile",
                        state: {
                          // userId: info.front_desk.length !== 0 && info.front_desk[0].my_doctors[0].doctor_id,
                          // contactId: info.front_desk.length !== 0 && info.front_desk[0].contact_id,
                          // sessionId: info.session_id,
                          // staffId: info.front_desk.length !== 0 && info.front_desk[0].doctor_staff_fd_id,
                          // userType: 'front desk',
                        }
                      });
                    }}
                  >
                    Front Desk
                  </Menu.Item>

                  : ''}
                {!!fdData && fdData.length !== 0 ? <Menu.Divider /> : ''}

                {!!paData && paData.length !== 0 ?
                  <Menu.Item key='personal assistant' style={accountType === 'pa' ? styles.selectedRole : styles.ItemStyle}
                    onClick={() => {
                      setAccountType('pa');
                      localStorage.setItem("path", "Profile");
                      localStorage.setItem("selectedBtn", "Profile");
                      history.replace({
                        pathname: "/Profile",
                        state: {
                          // userId: info.personal_assistant.length !== 0 && info.personal_assistant[0].my_doctors[0].doctor_id,
                          // contactId: info.personal_assistant.length !== 0 && info.personal_assistant[0].contact_id,
                          // sessionId: info.session_id,
                          // staffId: info.personal_assistant.length !== 0 && info.personal_assistant[0].doctor_staff_pa_id,
                          // userType: 'personal assistant',
                        }
                      });
                    }}
                  >
                    Personal Assistant
                  </Menu.Item>

                  : ''}

              </SubMenu>
            }

            {(info.doctor.length !== 0 && info.admin.length === 0 && info.nurse.length === 0 && info.front_desk.length === 0 && info.personal_assistant.length === 0)
              || (info.doctor.length === 0 && info.admin.length !== 0 && info.nurse.length === 0 && info.front_desk.length === 0 && info.personal_assistant.length === 0) ||
              (info.doctor.length === 0 && info.admin.length === 0 && info.nurse.length !== 0 && info.front_desk.length === 0 && info.personal_assistant.length === 0) ||
              (info.doctor.length === 0 && info.admin.length === 0 && info.nurse.length === 0 && info.front_desk.length !== 0 && info.personal_assistant.length === 0) ||
              (info.doctor.length === 0 && info.admin.length === 0 && info.nurse.length === 0 && info.front_desk.length === 0 && info.personal_assistant.length !== 0) ? "" : <Menu.Divider />}

            <Menu.Item onClick={() => { clear_Token_localStorage(); }}>
              <Link style={{ color: '#333333', fontSize: '16px', padding: '5px', opacity: 0.9, fontWeight: 'bold', paddingLeft: '10px', paddingRight: '24px' }}
                to={{
                  pathname: "/",
                  state: { userId: '' },
                }}
              > Log Out</Link>
            </Menu.Item>
          </Menu>}>
            {handleUserTypes()}
          </Dropdown>
        </Navbar.Collapse>
      </Navbar>
      <Notifications open={props.open} onClick={props.handleDrawerClose} />
    </div>
  )
}

export default Navbars

Navbars.defaultProps = {
  data: {
    image: "",
    name: "Name",
  },
  collapseSidebar: false
};

const styles = {
  avatar: {
    zIndex: 200,
    height: 30,
    width: 30,
    padding: 0,
    margin: 4,
    float: 'left',
    borderWidth: 0.1,
    borderColor: "#e0004d",
    borderStyle: "solid",
    transition: "width 0.3s, height 0.3s",
  },
  hideStyle: {
    display: 'none'
  },
  showStyle: {
    display: 'block'
  },
  selectedRole: {
    color: '#e0004d',
    fontSize: '16px',
    padding: '5px',
    opacity: 0.9,
    fontWeight: 'bold',
    paddingLeft: '10px',
    paddingRight: '24px'
  },
  ItemStyle: {
    color: '#333333',
    fontSize: '16px',
    padding: '5px',
    opacity: 0.9,
    fontWeight: 'bold',
    paddingLeft: '10px',
    paddingRight: '24px'
  }
};

