import React from 'react'
import Avatar from '@material-ui/core/Avatar';
import "../../Styles/Card.scss"


function titleCase(str) {
    if(str!==null)
    {
    return str.toLowerCase().split(" ").map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
    }
    else
    return "";
  }

const AppointmentsStatusList=(props)=>{
    return(
        <div className='MyCard'  style={{...styles.card, display: "flex", flex: 1, marginBottom: 5}}>
                  <div style={{display: "flex", flexDirection: "row", flex: 1, padding: 10 }}>
                        <Avatar src={props.src} style={styles.avatar} />
                        <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1}}>
                          <div
                              style={{
                                  paddingLeft: 10,
                                  fontSize: 24,
                                  fontWeight: "lighter",
                                  color: "#e0004d",
                              }}
                              >
                              {titleCase(props.name)}
                          </div>
                          <div style={{ paddingLeft: 10, color: "#0000007f", fontWeight: 'bold', fontSize: 12 }}>
                            {props.age}  Years ({titleCase(props.gender)})
                          </div>
                        </div>
                        <div style={{display: "flex", flexDirection:"column", justifyContent: "flex-start", color: "#e0004d", fontWeight: 550, fontSize: 14}}>
                          {/* <div onClick={() => setOpenDialog(true)} style={{cursor: "pointer"}}>
                              <label> Cancel <i> <MdDeleteForever style={{fontSize:20}} /> </i></label>
                          </div> */}
                          {/* <div style={{color: "#00000028"}}>Time</div> */}
                          <div style={{fontWeight: 100, fontSize: 36, color: "#0000004f",}}>{props.date}</div>
                        </div>
                    </div>
                      {/* <div className={sideTagClass} style={{...sideTagBackgroundColor, textOrientation: "mixed", writingMode: "vertical-lr"}}>
                          {itemData.appointment_status}
                      </div> */}
                  </div>

        // <Card className='ProgressCard' variant="outlined">
        //     <CardContent>
        //         <label className='patientStatus'> Patient Number: &nbsp;&nbsp;  <Badge count={props.number}/></label>
        //         <Row >
        //                 <Col lg={2}>
        //                     <Avatar alt="patient-image" src={props.src} />
        //                 </Col>
        //                 <Col lg={10}>
        //                     <div className='mll-15'>
        //                         <h4 className='NameLabel'>{props.name} </h4>
        //                         <h6 className='AgeLabel'> Age: {props.age} </h6>
        //                         <h6 className='GenderLabel'> Gender:{props.gender} </h6>
        //                     </div>
        //                 </Col>
        //         </Row>    
        //     </CardContent>
        //     <CardActions>
        //         <h6> Appointment Time: <label>{props.date}</label></h6>
        //     </CardActions>
        // </Card>
    )
}


export default AppointmentsStatusList
const styles = {
    label: {
      fontSize: 13,
      color: "grey",
      textAlign: "Left",
      marginLeft: "10px",
      marginTop: "10px",
    },
    input: { fontSize: 14, padding: 8, borderRadius: "5px" },
    header_container: {display: "flex", flexDirection: "row", padding: 10, alignItems:"center"},
    avatar: { height:"55px", width:"55px", borderWidth: 0.3, borderColor: "#e0004d", borderStyle: "solid"},
    cards: {
      backgroundColor: "#f9f9f9",
      width: "330px",
    },
    // card: { backgroundColor: "#fff", boxShadow: "#00000018 2px 2px 10px"}
  };