import React,{useState} from 'react';
import {Input} from 'antd';

const EditableText=(props)=>{
    const [vitalName,setVitalName] = useState(props.name);
    const [vitalType,setVitalType] = useState(props.type||'text');
    const [vitalVal,setVitalVal] = useState(props.value||'');
    const [editClass,setEditClass] = useState(props.editClassName);
    const [editable,setEditable] = useState(false);
    
    const EditVital =() =>{
        setEditable(true)
    }
   
    return(
        <Input 
        name={vitalName}
        type={vitalType}
        value={vitalVal}
        className={editClass}
        autoFocus
        onFocus={e=>{
          const value = e.target.value
          e.target.value = ''
          e.target.value = value
          setVitalVal(value)
        }}
        onChange={e=>{
            setVitalVal(e.target.value)
        }}
        // onBlur={
        //   setEditable(false)}
        // onKeyUp={e=>{
        //   if(e.key==='Escape') {
        //       setEditable(false);
        //       setVitalVal('')
        //     // this.setState({edit:false, value:this.state.backup})
        //   }
        //   if(e.key==='Enter') {
        //    setEditable(false)
        //   }
        // }}
      />
      ||
      <span onClick={EditVital}>
        {vitalVal}
      </span>
    )
}

export default EditableText