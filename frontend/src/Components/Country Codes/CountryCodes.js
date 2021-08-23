import React,{useState} from 'react'
import {Select} from 'antd'
const {Option} = Select

const CountryCodes = (props) =>{
    const [countryCode,setCountryCode] = useState(`+${props.data[159].countryCodes[0]}`)

    const onChangeCode = (value) => {
        console.log(`selected code ${value}`);
        setCountryCode(value)
        props.returnHook(value)
      }
    return(
        <Select placeholder='+92' className="select-before" onChange={onChangeCode} defaultValue={`+${props.data[159].countryCodes[0]}`}>
            {props.data.map((item,i)=>(
                <Option key={i} value={`+${item.countryCodes[0]}`}>+{item.countryCodes[0]}</Option>
            ))}
        </Select>
    )
}

export default CountryCodes