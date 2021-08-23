import React from 'react';
import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
// import history from './Services/history'
import Login from './Screens/Login/Login'
import PortalScreen from './Screens/PortalScreen';
import { GlobalProvider } from './Context/GlobalState';
// import ZoomMeeting from './views/Components/Zoom/ZoomMeeting';
// import Zoom from './views/Components/Zoom/Zoom';

function App() {
  return (
    <BrowserRouter  >
      <Switch>
        <GlobalProvider> 
        {console.log(`Build versionis ${process.env.REACT_APP_NAME} ${process.env.REACT_APP_VERSION}`)}
        <Route path="/" component={Login} exact={true}/>
        {/* <Route path="/Profile"  component={props => <PortalScreen selected={"profile"} {...props} />} exact={true}/> */}
        <Route path="/Appointments"  component={props => <PortalScreen selected={"appointment"} {...props} />} exact={true}/>
        {/* <Route path="/AppointmentsUI"  component={props => <PortalScreen selected={"appointmentUI"} {...props} />} exact={true}/> */}
        <Route path="/Patients"  component={props => <PortalScreen selected={"patient"} {...props} />} exact={true}/>
        <Route path="/Profile"  component={props => <PortalScreen selected={"Profile"} {...props} />} exact={true}/>
        <Route path="/Dashboard"  component={props => <PortalScreen selected={"dashboard"} {...props} />} exact={true}/>
        <Route path="/Support"  component={props => <PortalScreen selected={"Help & Support"} {...props} />} exact={true}/>
        <Route path="/Activity"  component={props => <PortalScreen selected={"Activities"} {...props} />} exact={true}/>
        <Route path="/Doctors"  component={props => <PortalScreen selected={"Doctors"} {...props} />} exact={true}/>
        <Route path="/Admins"  component={props => <PortalScreen selected={"Admins"} {...props} />} exact={true}/>
        <Route path="/Tests"  component={props => <PortalScreen selected={"Tests"} {...props} />} exact={true}/>
        <Route path="/Medicines"  component={props => <PortalScreen selected={"Medicines"} {...props} />} exact={true}/>
        <Route path="/Symptoms"  component={props => <PortalScreen selected={"Symptoms"} {...props} />} exact={true}/>
        <Route path="/Diagnosis"  component={props => <PortalScreen selected={"Diagnosis"} {...props} />} exact={true}/>
        <Route path="/Hospitals"  component={props => <PortalScreen selected={"Hospitals"} {...props} />} exact={true}/>
        {/* <Route path="/Telehealth"  component={props => <PortalScreen selected={"Telehealth"} {...props} />} exact={true}/>
        <Route path="/ZoomMeet"  component={Zoom} exact={true}/> */}
      </GlobalProvider>
      </Switch>

    </BrowserRouter>
  )}

export default App;
