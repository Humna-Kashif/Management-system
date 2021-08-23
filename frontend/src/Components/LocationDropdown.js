import React, { useContext, useEffect, useState } from 'react'
import {locationsAPI} from '../Hooks/API'
import { useLocation } from "react-router-dom";
import '../Styles/PatientProfileHeader.css';
import { Select,Form } from 'antd';
import { GlobalContext } from '../Context/GlobalState';

const { Option } = Select;

const LocationDropdown = (props) =>{

   const{elementDocId} = useContext(GlobalContext)
    const [locationList,setLocationList] = useState([]);
    const [selectLocation,setSelectLocation] = useState(props.defaultLoc);

    const LocationListAPI= () =>{
        locationsAPI(elementDocId).then((result)=>{
          console.log('Loc days resultttt list', result )
          
            if(result){
                setLocationList(result);
             
            }
        })
    }
    const getLocDays = (value) => {
      for (var i = 0; i < locationList.length; i++) {
          console.log('Loc days resultttt', value, " id", )
          if (locationList[i].doctors_hospital_location_id == value) {
            console.log('Loc days resultttt type', locationList[i].appointment_type, " id")
            props.returnDocType(locationList[i].appointment_type);
            return locationList[i].schedule;
          }
        }
        return [];
      };

    const renderItem = () => {
        return locationList.map((item, i) => (
          <Option value={item.doctors_hospital_location_id} key={i}>
             {item.location}
          </Option>
        ));
      };
    const handleLocationChange=(value)=>{
        setSelectLocation(value);
        props.disableDays(getLocDays(value));
        props.returnHook(value);
    }
    useEffect(() => {
        
        LocationListAPI(elementDocId);
      }, []);

      useEffect(() => {
        if(locationList.length ===1){
          setSelectLocation(locationList[0].doctors_hospital_location_id);
          props.disableDays(getLocDays(locationList[0].doctors_hospital_location_id));
          props.returnHook(locationList[0].doctors_hospital_location_id);
        }
       
      }, [locationList]);

    return(
        <div className='SelectBox'>
            <h6 className='optionHeading'>Select Location  </h6>
             {locationList.length > 1 ? 
             <Form.Item name={'Location'}  rules={[{required: true, message:'Select Location'}]}>
             <Select
               style={{ width: '100%' }}
               placeholder="Please Select a Location"
               onChange={handleLocationChange}
             >
              {renderItem()}
             </Select>
             </Form.Item> :
             locationList.map((item, i) => (
              <h6 value={item.doctors_hospital_location_id} key={i}>
                {item.location}
              </h6> ))
            }
           
            {/* <select value={selectLocation} onChange={handleLocationChange}>
                <option value="">Please Select a Location</option>
                {renderItem()}
            </select> */}
        </div>
    )
}

export default LocationDropdown

LocationDropdown.defaultProps = {
    returnHook: () => {},
    defaultLoc: "",
}