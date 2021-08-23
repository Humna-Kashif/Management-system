import React, { useState, useContext, useEffect } from "react"
import { Container } from "react-bootstrap";
import { BrowserRouter, Route, Switch, useRouteMatch } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import Sidebar from "../Components/SideBar/Sidebar";
import Navbars from "../Components/Navbar/Navbar";
import DoctorAppointmentsTab from "./DoctorAppointmentsTab";
import DoctorPatientsTab from './DoctorPatientsTab'
import { getProfileAllInfo } from '../Hooks/API'
import DocProfile from '../Components/DocProfile/DocProfile';
import DashboardUi from '../Components/Dashboard/DashboardUi';
import HelpAndSupport from '../Components/Support/HelpAndSupport';
import Activities from './Activities'
import Doctors from '../Components/Admin/User/Doctors'
import Admins from '../Components/Admin/User/Admins'
import Tests from '../Components/Admin/Data/Tests'
import Diagnosis from '../Components/Admin/Data/Diagnosis'
import Symptoms from '../Components/Admin/Data/Symptoms'
import Medicines from '../Components/Admin/Data/Medicines'
import Hospitals from '../Components/Admin/Hospitals'
import { GlobalContext } from "../Context/GlobalState";
import clsx from 'clsx';
import '../Styles/dash.css';

const drawerWidth = 300;
const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  content: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 300,
  },
}));

const PortalScreen = (props) => {
  const selected = props.selected;
  let match = useRouteMatch();
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const { accountId, accountType, staffDocId, username, userImage } = useContext(GlobalContext)

  /*
  ToDo proper error handling.
  */
  const roleInfo = (type, Id) => {
    console.log('roleInfo: In case of staff', type, Id)
    type !== "" && Id !== "" ?
      getProfileAllInfo(type, Id).then(result => {
        console.log("roleInfo: result is ", result);
        if (result.message !== "API Error!") {
          if (!!result[0]) {
            setData(result[0]);
          }
        } else {
          console.error("roleInfo: API Error role type or account id is undefine")
        }
      })
      :
      console.error("roleInfo: API Error role type or account id is undefine")
  }

  useEffect(() => {
    if (accountType === "nurses" || accountType === "fd" || accountType === "pa") {
      roleInfo(accountType, accountId);
    } else if (accountType === "doctors" || accountType === "admins") {
      roleInfo(accountType, accountId);
    } else {
      console.error("roleInfo: account type error ")
    }
  }, [accountId, username])

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };


  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column", backgroundColor: "#0000001a", position: "relative" }}>
      <div style={{ display: "flex", flex: 1, flexDirection: "row", position: "relative" }}>
        <Sidebar data={data} open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ width: "100%", position: "sticky", top: 0, right: 0, zIndex: 100 }}>
            <Navbars data={data} open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose} />
          </div>
          <Container fluid>
            <main className={clsx(classes.content, { [classes.contentShift]: open })} >
              <div style={{ marginTop: 10, }}>
                <BrowserRouter>
                  <Switch>
                    {console.log("calender pie portal Screen")}
                    {console.log("Selected path:", match.path, "matching", selected)}
                    <Route path={"/Appointments"} exact={true} component={DoctorAppointmentsTab} />
                    <Route path={"/Patients"} exact={true} component={DoctorPatientsTab} />
                    <Route path='/Profile' exact={true} component={DocProfile} />
                    <Route path='/Dashboard' exact={true} component={DashboardUi} />
                    <Route path='/Support' exact={true} component={HelpAndSupport} />
                    <Route path='/Activity' exact={true} component={Activities} />
                    <Route path='/Doctors' exact={true} component={Doctors} />
                    <Route path='/Admins' exact={true} component={Admins} />
                    <Route path='/Tests' exact={true} component={Tests} />
                    <Route path='/Medicines' exact={true} component={Medicines} />
                    <Route path='/Diagnosis' exact={true} component={Diagnosis} />
                    <Route path='/Symptoms' exact={true} component={Symptoms} />
                    <Route path='/Hospitals' exact={true} component={Hospitals} />
                  </Switch>
                </BrowserRouter>
              </div>
            </main>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default PortalScreen

PortalScreen.defaultProps = {

}