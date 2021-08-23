import React, { useEffect, useState } from 'react'
import { Select} from 'antd';
import moment from 'moment'
const { Option } = Select;

const IntervalDropdown = (props) =>{
    const [selectInterval,setSelectInterval] = useState(props.defaultInterval);
  
    const formatWeekValue = (date) => {
        let tempWeek = [];
        for (var i = 0; i < 7; i++) {
          tempWeek.push(moment(date).startOf("isoWeek").subtract(i, "days").toDate());
        }
        console.log('tempWeek',tempWeek[6].toISOString().slice(0,10))
        return tempWeek[6].toISOString().slice(0,10);
      };
      const formatMonthValue = () => {
        let date = new Date();
        let tempMonth = [];
        for (var i = 0; i < 30; i++) {
          tempMonth.push(moment(date).startOf("isoMonth").subtract(i, "days").toDate());
        }
        console.log('tempMonth',tempMonth[29].toISOString().slice(0,10))
        return  tempMonth[29].toISOString().slice(0,10);        
      };
      
    const handleIntervalChange=(value)=>{
        setSelectInterval(value);
        props.returnEndTime(new Date().toISOString().slice(0,10))
        if(value === 'past week'){
          props.returnStartTime(formatWeekValue(new Date()));
        }
        if(value === 'past month'){
          props.returnStartTime(formatMonthValue(new Date()));
        }
        props.returnHook(value);
    }
  

      useEffect(() => {
        props.returnEndTime(new Date().toISOString().slice(0,10))
        if(selectInterval === 'past week'){
          props.returnStartTime(formatWeekValue(new Date()));
        }
        if(selectInterval === 'past month'){
          props.returnStartTime(formatMonthValue(new Date()));
        }
      }, [selectInterval]);
     
    return(
       
             <Select
               style={{ width: 200 }}
               defaultValue={props.defaultInterval}
               placeholder="Select interval"
               onChange={handleIntervalChange}
             >
               <Option  value='past week'>
                    Past Week
              </Option>
              <Option  value='past month'>
                    Past Month
              </Option>
             </Select>
    )
}

export default IntervalDropdown

IntervalDropdown.defaultProps = {
    returnHook: () => {},
    defaultInterval: "",
}