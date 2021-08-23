import React, {useEffect, useState } from 'react'
import { Avatar } from "@material-ui/core";
import { downloadFile } from '../Hooks/ImageAPI'
import Divider from '@material-ui/core/Divider';
import { Fragment } from 'react';
import {getDate} from '../Hooks/TimeHandling'
import AddCircleIcon from '@material-ui/icons/AddCircle';

const SearchedItem =(props)=>{
    const [image, setImage] = useState(null);
    useEffect(() => {
        if (!!props.item.image) {
            downloadFile('patients', props.item.patient_id, 'profile')
                .then((json) => { setImage("data:image;charset=utf-8;base64," + json.encodedData)})
                .catch((error) => console.error(error))
                .finally(() => {
                });
        } else {
            console.log("Downloading Image Failed! id is null")
        }
    }, [props.item]);
    return(
        <Fragment > 
          {/* onClick={() => {props.selection(props.item); props.searchList('')}} */}
        <div style={styles.header_container} onClick={() => {props.selection(props.item); props.searchList('')}}>
          <Avatar src={image} style={styles.avatar}/>   
          <div style={styles.title_container}>
            <div style={{display:'flex'}}>
                <div> 
                  <h6 style={styles.title__name_selected}>{props.item.name}</h6>
                </div>
                {props.statusNew ? 
                <div style={{position: 'absolute',right: '20px', marginTop: '-5px',color: '#969595'}}> 
                <AddCircleIcon onClick={()=>{props.selected(props.item.number,props.item.patient_id,props.item.name,props.item.dob,props.item.gender)}}/>
              </div> : ''}
            </div>
            <label style={styles.title__label}>{props.item.number}</label>
            <label style={styles.title__label}> {getDate(props.item.dob)} ({props.item.gender}) </label>
          </div>
        </div>  
        <Divider/>
      </Fragment> 
    )
}
export default SearchedItem;
const styles = {
    input: { fontSize: 13, padding: 8, borderRadius: "4px", boxShadow: "none",height:'35px', marginBottom:'6px', width:'96%' },
    header_container: {display: "flex", flexDirection: "row", padding: 16, alignItems:"center", backgroundColor: "white", cursor:'pointer'},
    header_container_selected: {display: "flex", flexDirection: "row", padding: 16, alignItems:"center"
    ,backgroundColor: "#f6f6f6", borderColor: "#e0e0e0", borderStyle: "solid", borderWidth: 0.3},
    avatar: { height:"60px", width:"60px", borderWidth: 0.3, borderColor: "#e0004d", borderStyle: "solid"},
    title_container: {display: "flex", flexDirection: "column", textAlign: "left", marginLeft: 10},
    title__name: {color: "#3a3b3c", fontSize: 14, fontWeight: "bold",marginBottom:'1px',textTransform: 'capitalize'},
    title__name_selected: {color: "#e0004d", fontSize: 14, fontWeight: "bold",marginBottom:'1px',textTransform: 'capitalize'},
    title__label: {color: "#00000081", fontSize:12,marginBottom:'0px',marginTop:'0px'},
    group_head:{marginTop:'10px', fontSize:'14px', color:'6c757d',fontWeight:'bold'}
  };