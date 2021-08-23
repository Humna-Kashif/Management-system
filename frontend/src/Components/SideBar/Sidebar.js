import React, { useContext } from "react";
import Image from 'react-bootstrap/Image'
import { Link, useHistory } from "react-router-dom";
import { LogOutAPI } from "../../Hooks/API"
import { Divider } from 'antd'
import '../../Styles/Sidebar.css'
import {
  BsFillGridFill,
  BsShuffle,
  BsPersonFill,
  BsFillPersonLinesFill,
  BsBoxArrowUp,
  BsList,
  BsFillQuestionOctagonFill,
  BsListUl,
  BsServer,
  BsPeopleFill
} from "react-icons/bs";
import {
  ProSidebar,
  SubMenu,
  Menu,
  MenuItem,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { useEffect, useState } from "react";
import 'firebase/auth'
import fb from "firebase/app"
import { GlobalContext } from "../../Context/GlobalState";

const Sidebar = (props) => {
  const auth = fb.auth();
  const history = useHistory();
  console.log("history is ", history);
  const path = localStorage.getItem("path");
  const { info, accountId, accountType, accountCId, staffDocId } = useContext(GlobalContext)
  const [sideBarBtn, setSidebarBtn] = useLocalStorage('sidebar', false);
  const [ActiveBtn, setActiveBtn] = useLocalStorage('selectedBtn', path);
  const [isDesktop, setDesktop] = useState(window.innerWidth > 992);
  const dark = JSON.parse(localStorage.getItem("dark")) || false;

  const clear_Token_localStorage = () => {
    LogOutAPI(info.session_id).then((result) => {
      console.log("Session Log Out", result)
    });
    auth.signOut().then(() => {
      // Sign-out successful.
      console.log("signout now")
    }).catch((error) => {
      console.log(error)
      // An error happened.
    });
    localStorage.removeItem("verify_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem('user');
    localStorage.removeItem('staff');
    localStorage.removeItem('admin');
    localStorage.removeItem("info");
    localStorage.removeItem("accountType");
    localStorage.removeItem('accountId');
    localStorage.removeItem('accountCId');
    localStorage.removeItem('staffDocId');
    localStorage.removeItem('username');
    localStorage.removeItem('staffType');
    localStorage.removeItem('selectedBtn');

  }
  const updateMedia = () => {
    setDesktop(window.innerWidth > 992);
  };

  useEffect(() => {
    localStorage.setItem("dark", JSON.stringify(dark));
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, [dark]);

  // Hook
  function useLocalStorage(key, initialValue) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(() => {
      try {
        // Get from local storage by key
        const item = window.localStorage.getItem(key);
        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        // If error also return initialValue
        console.log(error);
        return initialValue;
      }
    });

    const SubMenuControl = () => {
      return ("")
    }

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = value => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.log(error);
      }
    };
    return [storedValue, setValue];
  };
  return (
    <ProSidebar
      className={`d-none d-md-block bg-light pro-sidebar sidebar ${sideBarBtn ? 'collapsed' : 'sidebar'} ${isDesktop ? "sidebar" : 'collapsed'}`}
      style={{ backgroundColor: "lightslategray" }}>
      <SidebarHeader
        style={{ backgroundColor: "#e0004d" }}
        onClick={() => {
          localStorage.setItem('sidebar', !sideBarBtn);
          setSidebarBtn(!sideBarBtn);
        }}>
        <Menu iconShape="square">
          <MenuItem title="Aibers">
            <BsList style={sideBarBtn ? { ...styles.sidebarIcon, ...styles.sidebarIconSmall } : styles.sidebarIcon}></BsList>
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center"
              }}>
              <Image src={require('../../Images/mark.png')} style={{ width: 30, height: 30, marginLeft: 4, marginRight: 4 }} />
              <div hidden={sideBarBtn} style={{ color: "white", fontSize: 20, opacity: 0.9 }}>aibers</div>
            </div>
          </MenuItem>
        </Menu>
      </SidebarHeader>
      {accountType !== "admins" ? <SidebarContent>
        <Menu iconShape="square">
          <Divider className='SidebarDivider' />
          <MenuItem
            title="Appointments"
            className={`SideMenuitem ${ActiveBtn === 'Appointments' ? 'selectedMenuItem' : 'defaultMenuItem '} `}
            onClick={() => setActiveBtn('Appointments')}>
            <Link
              to={{
                pathname: "/Appointments",
                state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
              }}>
              <BsShuffle
                style={sideBarBtn ? { ...styles.icons, ...styles.iconsSmall } : styles.icons}></BsShuffle>
              {sideBarBtn ? "" : 'Appointments'}
            </Link>
          </MenuItem>
          {/* <MenuItem 
          title="AppointmentsUI" 
          className={`SideMenuitem ${ActiveBtn==='AppointmentUI'? 'selectedMenuItem' : 'defaultMenuItem '} `} 
          onClick={() => setActiveBtn('AppointmentUI')}>
            <Link
              to={{
                pathname: "/AppointmentsUI",
                state: { userId: accountId , contactId: accountCId , sessionId:info.session_id , userType:accountType, staffId:staffDocId},
              }}>
              <BsShuffle 
                style={sideBarBtn? {...styles.icons,...styles.iconsSmall} : styles.icons}></BsShuffle>
                {sideBarBtn?"": 'AppointmentsUI'}
            </Link>
          </MenuItem> */}
          <Divider className='SidebarDivider' />
          <MenuItem
            title="Patients"
            className={`SideMenuitem ${ActiveBtn === 'Patients' ? 'selectedMenuItem' : 'defaultMenuItem '} `}
            onClick={() => setActiveBtn('Patients')} >
            <Link
              to={{
                pathname: "/Patients",
                state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
              }}>
              <BsFillPersonLinesFill
                style={sideBarBtn ? { ...styles.icons, ...styles.iconsSmall } : styles.icons}></BsFillPersonLinesFill>
              {sideBarBtn ? "" : "Patients"}
            </Link>
          </MenuItem>
          <Divider className='SidebarDivider' />

          <MenuItem
            title="Dashboard"
            className={`SideMenuitem ${ActiveBtn === 'Dashboard' ? 'selectedMenuItem' : 'defaultMenuItem '} `}
            onClick={() => setActiveBtn('Dashboard')} >
            <Link
              to={{
                pathname: "/Dashboard",
                state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
              }}>
              <BsFillGridFill
                style={sideBarBtn ? { ...styles.icons, ...styles.iconsSmall } : styles.icons}></BsFillGridFill>
              {sideBarBtn ? "" : "Dashboard"}
            </Link>
          </MenuItem>
          <Divider className='SidebarDivider' />
          {/* <MenuItem 
            title="Notification" 
            className={props.open?"NotificationOpen":"NotificationClose"} 
            onClick={() => {
               props.open ? props.handleDrawerClose() : props.handleDrawerOpen()
             }}>
                <IoMdNotifications 
                  style={sideBarBtn? {...styles.icons,...styles.iconsSmall} : styles.icons}></IoMdNotifications>
                  {sideBarBtn?"": "Notifications"}
          </MenuItem>
          <Divider className='SidebarDivider'/> */}
          <MenuItem
            title="Profile"
            className={`SideMenuitem ${ActiveBtn === 'Profile' ? 'selectedMenuItem' : 'defaultMenuItem '} `}
            onClick={() => setActiveBtn('Profile')} >
            <Link
              to={{
                pathname: "/Profile",
                state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
              }}>
              <BsPersonFill
                style={sideBarBtn ? { ...styles.icons, ...styles.iconsSmall } : styles.icons}></BsPersonFill>
              {sideBarBtn ? "" : "Profile"}
            </Link>
          </MenuItem>
          <Divider className='SidebarDivider' />
          <MenuItem
            title="Audit Trails"
            className={`SideMenuitem ${ActiveBtn === 'Audit Trails' ? 'selectedMenuItem' : 'defaultMenuItem '} `}
            onClick={() => setActiveBtn('Audit Trails')} >
            <Link
              to={{
                pathname: "/Activity",
                state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
              }}>
              <BsListUl
                style={sideBarBtn ? { ...styles.icons, ...styles.iconsSmall } : styles.icons}></BsListUl>
              {sideBarBtn ? "" : "Audit Trails"}
            </Link>
          </MenuItem>
          <Divider className='SidebarDivider' />
          {/* <MenuItem 
            title="Telehealth" 
            className={`SideMenuitem ${ActiveBtn==='Telehealth'? 'selectedMenuItem' : 'defaultMenuItem '} `}  
            onClick={() => setActiveBtn('Telehealth')} >
            <Link
              to={{
                pathname: "/Telehealth",
                state: { userId: accountId , contactId: accountCId , sessionId:info.session_id , userType: accountType , staffId:staffDocId},
              }}>
                <BsDisplay
                style={sideBarBtn? {...styles.icons,...styles.iconsSmall} : styles.icons}></BsDisplay>
                {sideBarBtn?"": "Telehealth"}
            </Link>
          </MenuItem>
          <Divider className='SidebarDivider'/> */}
        </Menu>
      </SidebarContent> : <SidebarContent>
        <Menu iconShape="square">
          <Divider className='SidebarDivider' />
          <SubMenu title="Users" icon={<BsPeopleFill />} defaultOpen={true}>
            <MenuItem
              title="Admins"
              className={`SideMenuitem ${ActiveBtn === 'Admins' ? 'selectedMenuItem' : 'defaultMenuItem '} `}
              onClick={() => setActiveBtn('Admins')}>
              <Link
                to={{
                  pathname: "/Admins",
                  state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
                }}>
                {sideBarBtn ? "" : 'Admins'}
              </Link>
            </MenuItem>
            <Divider className='SidebarDivider' />
            <MenuItem
              title="Doctors"
              className={`SideMenuitem ${ActiveBtn === 'Doctors' ? 'selectedMenuItem' : 'defaultMenuItem '} `}
              onClick={() => setActiveBtn('Doctors')}>
              <Link
                to={{
                  pathname: "/Doctors",
                  state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
                }}>
                {sideBarBtn ? "" : 'Doctors'}
              </Link>
            </MenuItem>
          </SubMenu>
          <Divider className='SidebarDivider' />
          <MenuItem
            title="Hospitals"
            className={`SideMenuitem ${ActiveBtn === 'Hospitals' ? 'selectedMenuItem' : 'defaultMenuItem '} `}
            onClick={() => setActiveBtn('Hospitals')}
            icon={<BsFillPersonLinesFill />} >
            <Link
              to={{
                pathname: "/Hospitals",
                state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
              }}>
              {sideBarBtn ? "" : "Hospitals"}
            </Link>
          </MenuItem>
          <Divider className='SidebarDivider' />
          <SubMenu title="Data" icon={<BsServer />} defaultOpen={true}>
            <Divider className='SidebarDivider' />
            <MenuItem
              title="Symptoms"
              className={`SideMenuitem ${ActiveBtn === 'Symptoms' ? 'selectedMenuItem' : 'defaultMenuItem '} `}
              onClick={() => setActiveBtn('Symptoms')} >
              <Link
                to={{
                  pathname: "/Symptoms",
                  state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
                }}>
                {sideBarBtn ? "" : "Symptoms"}
              </Link>
            </MenuItem>
            <Divider className='SidebarDivider' />
            <MenuItem
              title="Tests"
              className={`SideMenuitem ${ActiveBtn === 'Tests' ? 'selectedMenuItem' : 'defaultMenuItem '} `}
              onClick={() => setActiveBtn('Tests')} >
              <Link
                to={{
                  pathname: "/Tests",
                  state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
                }}>
                {sideBarBtn ? "" : "Tests"}
              </Link>
            </MenuItem>
            <Divider className='SidebarDivider' />
            <MenuItem
              title="Diagnosis"
              className={`SideMenuitem ${ActiveBtn === 'Diagnosis' ? 'selectedMenuItem' : 'defaultMenuItem '} `}
              onClick={() => setActiveBtn('Diagnosis')} >
              <Link
                to={{
                  pathname: "/Diagnosis",
                  state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
                }}>
                {sideBarBtn ? "" : "Diagnosis"}
              </Link>
            </MenuItem>
            <Divider className='SidebarDivider' />
            <MenuItem
              title="Medicines"
              className={`SideMenuitem ${ActiveBtn === 'Medicines' ? 'selectedMenuItem' : 'defaultMenuItem '} `}
              onClick={() => setActiveBtn('Medicines')} >
              <Link
                to={{
                  pathname: "/Medicines",
                  state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
                }}>
                {sideBarBtn ? "" : "Medicines"}
              </Link>
            </MenuItem>
            <Divider className='SidebarDivider' />
          </SubMenu>
          <Divider className='SidebarDivider' />

          <MenuItem
            title="Audit Trails"
            className={`SideMenuitem ${ActiveBtn === 'Audit Trails' ? 'selectedMenuItem' : 'defaultMenuItem '} `}
            onClick={() => setActiveBtn('Audit Trails')} >
            <Link
              to={{
                pathname: "/Activity",
                state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
              }}>
              <BsListUl
                style={sideBarBtn ? { ...styles.icons, ...styles.iconsSmall } : styles.icons}></BsListUl>
              {sideBarBtn ? "" : "Audit Trails"}
            </Link>
          </MenuItem>
          {/* <MenuItem 
            title="Audit Trails" 
            className={`SideMenuitem ${ActiveBtn==='Audit Trails'? 'selectedMenuItem' : 'defaultMenuItem '} `}  
            onClick={() => setActiveBtn('Audit Trails')} 
            icon={<BsListUl/>}>
            <Link
              to={{
                pathname: "/Activity",
                state: { userId: accountId , contactId: accountCId , sessionId:info.session_id , userType: accountType , staffId:staffDocId},
              }}>
                {sideBarBtn?"": "Audit Trails"}
            </Link>
          </MenuItem> */}
          <Divider className='SidebarDivider' />
        </Menu>
      </SidebarContent>}
      <SidebarFooter>
        <div>
          <div>
          </div>
          <Menu iconShape="square" style={{ paddingTop: '0px' }}>
            <MenuItem
              title="Help & Support"
              className={`SideMenuitem ${ActiveBtn === 'Help & Support' ? 'selectedMenuItem' : 'defaultMenuItem '} `}
              onClick={() => setActiveBtn('Help & Support')} >
              <Link
                to={{
                  pathname: "/Support",
                  state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
                }}>
                <BsFillQuestionOctagonFill
                  style={sideBarBtn ? { ...styles.icons, ...styles.iconsSmall } : styles.icons}></BsFillQuestionOctagonFill>
                {sideBarBtn ? "" : "Help & Support"}
              </Link>
            </MenuItem>
            <Divider className='SidebarDivider' />
            <MenuItem
              title="Logout"
              className={`SideMenuitem`}
              onClick={() => { setActiveBtn('Log Out'); clear_Token_localStorage(); }} >
              <Link
                to={{
                  pathname: "/",
                  state: { userId: accountId, contactId: accountCId, sessionId: info.session_id, userType: accountType, staffId: staffDocId },
                }}>
                <BsBoxArrowUp
                  style={sideBarBtn ? { ...styles.icons, ...styles.iconsSmall } : styles.icons} ></BsBoxArrowUp>
                {sideBarBtn ? "" : "Log Out"}
              </Link>
            </MenuItem>
          </Menu>
        </div>
      </SidebarFooter>
    </ProSidebar>
  );
};

export default Sidebar;

Sidebar.defaultProps = {
  data: {
    image: "",
    name: "Doctor Name",
  },
  collapseSidebar: false
};

const styles = {
  avatar: {
    height: "50px",
    width: "50px",
    padding: 0,
    margin: 4,
    borderWidth: 0.3,
    borderColor: "#e0004d",
    borderStyle: "solid",
    transition: "width 0.3s, height 0.3s",
  },
  avatarSmall: {
    height: "30px",
    width: "30px",
  },
  icons: { height: "22px", width: "22px", margin: 8, marginRight: 15, marginLeft: 15, transition: "width 0.3s, height 0.3s", },
  iconsSmall: { height: "18px", width: "18px", marginLeft: 8 },
  sidebarIcon: { width: 30, height: 30, position: "absolute", left: 15, color: "#f0f0f0", transition: "left 0.3s" },
  sidebarIconSmall: { left: -15 }
};
