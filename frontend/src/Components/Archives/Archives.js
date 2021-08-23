import React,{useState,useEffect, useContext} from 'react'
import { Container } from '@material-ui/core'
import { Avatar } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { Card, Divider,Empty } from 'antd';
import PictureAsPdfTwoToneIcon from '@material-ui/icons/PictureAsPdfTwoTone';
import GetAppIcon from '@material-ui/icons/GetApp';
import {getArchievesTestsInfo} from '../../Hooks/API';
import { downloadFile } from '../../Hooks/ImageAPI'
import {getDate,getTime} from '../../Hooks/TimeHandling';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { GlobalContext } from '../../Context/GlobalState';
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { Fragment } from 'react';
import TestItem from './TestItem';


const Archives = (props) => {
    const [archiveData,setArchiveData] = useState([]);
    const [archiveList,setArchiveList] = useState([]);
    const {accountId,accountType} = useContext(GlobalContext)
    const [testGroupList, setTestGroupList] = useState([]);
    const [expandAppointmentList, setExpandAppointmentList] = useState(true);
    const [expandOtherList, setExpandOtherList] = useState(true);
    

    const downloadTest = (patient_id,appointment_id,test_id) => {
        console.log("calling function")
        if(!!test_id){
          downloadFile(accountType, accountId, 'doc', patient_id,appointment_id,test_id)
          .then(result => { 
            console.log("file getting response is " ,result) 
          });
        }
      }

      const ListArchives = (data) => {
        let list = data.filter(list => list.appointment_date_time!==null);
        const groups = list.reduce((groups, test) => {
            const date = test.appointment_date_time.split('T')[0];
            if (!groups[date]) {
              groups[date] = [];
            }
            groups[date].push(test);
            return groups;
          }, {});
          const groupArrays = Object.keys(groups).map((date) => {
            return {
              date,
              tests: groups[date]
            };
          });
          setTestGroupList(groupArrays)
        console.log('groups to be defined are',groupArrays)
    }
   const testGroup =() =>{
    return (
        testGroupList.map((list, i) => {
            return <TestItem data={list} key={i} downloadItem={downloadTest}/>      
        })
    )}

    useEffect(() => {
        getArchievesTestsInfo(accountId,props.patientID).then(result => {
           if(!!result){
            setArchiveData(result);
            if (!!result[0] && result[0].test_info_tab){
                console.log('archive array', !!result[0])
                setArchiveList(result[0].test_info_tab)
                ListArchives(result[0].test_info_tab)
            }
           }
        });
        
    }, []);


    const OtherListArchives = () => {
        return (
            archiveList.filter(list => list.appointment_date_time === null).map((item, i) => (
                    <div key={i} className='listContainer' style={{ marginBottom:'20px',padding: 10, borderRadius: '4px', border: '1px solid #cecece', position:'relative', boxShadow: 'rgb(0 0 0 / 9%) 0px 1px 2px -2px, 0 3px 6px 0 rgba(0,0,0,.12), 0 5px 12px 4px rgba(0,0,0,.09)', height: 70 }}>
                        <Avatar style={{ float: 'left', borderRadius: '4px', marginRight: '10px', height: '50px', width: '50px', color: '#6c757d' }}><PictureAsPdfTwoToneIcon /> </Avatar>
                        <h6 style={{ marginBottom: 0, marginTop: 6, color: '#333333',textTransform:'capitalize' }}> <b> {item.test_name ? item.test_name : 'Prescribed Test'} </b> </h6>
                        <div style={styles.appointment_time}>
                            Prescribed on: <label > {getDate(item.test_date_time)}, {getTime(item.test_date_time)}
                        </label>
                        </div>
                        {item.test_result === null ? 
                         <Button
                         style={{ position:"absolute", top: 17, right:10 }}
                         variant="contained" disabled
                         startIcon={<HighlightOffIcon/>}
                        >
                            Not Uploaded
                        </Button>
                        :
                        <Button
                            variant="contained"
                            color="secondary"
                            style={{ position:"absolute", top: 17, right:10 }}
                            startIcon={<GetAppIcon />}
                            onClick={()=>{downloadTest(item.patient_id,item.appointment_id,item.test_id)}}
                        >
                            Download
                        </Button>
                        } 
                    </div>
            ))
        )
    }
    return (
        <div style={styles.containerClass}>
            {(archiveList.length!==0 && !!archiveList ) ? (
            <Container>
                <h6 style={{fontWeight:'bold',marginBottom:0, color:'#e0004d',cursor:'pointer'}} onClick={() => setExpandAppointmentList(!expandAppointmentList)}> Appointment Test Results {expandAppointmentList ? <BsChevronUp style={{ fontSize: 12 }} /> : <BsChevronDown style={{ fontSize: 12 }} />} </h6>
                    <Divider  style={{marginTop:2}}/>
                    
                    {expandAppointmentList && testGroup()}
                <h6 style={{fontWeight:'bold',marginBottom:0, color:'#e0004d',cursor:'pointer'}} onClick={() => setExpandOtherList(!expandOtherList)}> Other Test Results {expandOtherList ? <BsChevronUp style={{ fontSize: 12 }} /> : <BsChevronDown style={{ fontSize: 12 }} />}</h6>
                <Divider  style={{marginTop:2}}/>
                   {expandOtherList && OtherListArchives()}
            </Container>
            ) : 
            
            <div style={{...styles.card, minHeight: "60vh", flex: 1, flexDirection: "column", display: "flex", justifyContent: "center",alignItems:"center", backgroundColor: "#f5f5f5"}}>
            <div style={{fontSize:48, fontWeight: "300", color:"#0000003a"}}>
                No Archives 
            </div>
        </div>
}




        </div>
    )
}


export default Archives
const styles = {
    containerClass: { borderRadius: '0px 0px 4px 4px', border: '1px solid rgb(226 223 223)', padding: 20, textAlign: 'left', borderTop: 'none' },
    label: { fontSize: 14, textAlign: "Left", margin: "20px", backgroundColor: "whtiesmoke", padding: 20, borderRadius: "0.5em", border: "solid", borderColor: "gray", borderWidth: 1 },
    input: { fontSize: 14, padding: 8, borderRadius: "5px" },
    labelStyle: { color: '#847c7e', marginBottom: '0px', fontWeight: '550' },
    avatar: { height: "80px", width: "80px", display: "flex", border: '2px solid #e0004d' },
    add_photo: { color: "black", cursor: "pointer", display: "flex" },
    name_title: { color: "#e0004d", fontWeight: "bold", fontSize: 22, textAlign: "left", marginTop: "10px", marginBottom: '0px' },
    appointment_time: { fontSize: 13, textAlign: "left", color: 'rgb(109 107 107)' },
    pTag: { textIndent: 10, fontSize: '14px', color: '#333333' },
    headTag: { fontSize: '14px', color: '#e0004d', fontWeight: 'bold', marginTop: '5px' },
    reschedule_btn: {
        background: "#91DB92",
        color: "#096A0B ",
        height: "25px",
        borderRadius: "0.5em",
        border: "#91DB92",
        margin: "10px",
        width: "100px"
    },
    checkIn_btn: {
        background: "#8EDAD8 ",
        color: "#29A9A7",
        height: "25px",
        borderRadius: "0.5em",
        border: "#8EDAD8",
        margin: "10px",
        width: "100px"
    }
}