import React,{useState}from 'react'
import { Fragment } from 'react'
import EditLocationUi from './EditLocationUi'
import StaffList from './StaffList';


const DetailsUi = () =>{
    const [addLocation,setAddLocation]=useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
    const [onEdit, setOnEdit] = useState(false);
    const [EditStaff, setEditStaff] = useState(false);
    const [saveLocation, setSaveLocation] = useState(false);
    const [saveStaff, setSaveStaff] = useState(false);

    const handleLocationEdit = () => {
        setOnEdit(true);
    };
    const handleStaffEdit = () => {
        setEditStaff(true);
    };

    const handleLocationEditConfrim = () => {
        setSaveLocation(true);
    };
    const handleStaffEditConfrim = () => {
        console.log('NotEditingggg')
    };
    const handleShow=()=>{
        setAddLocation(true)
    }
    const handleHide=()=>{
        setAddLocation(false)
    }
   
    const handleLocationEditCancel = () => {
        setOnEdit(false);
        setSaveLocation(false);
    };
    const handleStaffEditCancel = () => {
        setEditStaff(false);
        setSaveStaff(false);
    };
    const handleSaveCallBack  = (val) => {
        console.log("Value Save is parent : ", val)
        setSaveLocation(false);
        setOnEdit(false);
      
    };
    const handleCallBack=(value)=>{

        console.log("Value Save is parent : ", value)
        setSaveStaff(false);
        setEditStaff(false);
    }

    return(
        <Fragment>
            <h6 className='sectionHeader mtt-10'> DETAILS </h6>
        
                    <EditLocationUi  saveHandler={saveLocation} saveCallBack={handleSaveCallBack} load={firstLoad} firstLoadHook={setFirstLoad} />
                    <StaffList load={firstLoad} firstLoadHook={setFirstLoad}/>
            
        </Fragment>
    )
}

export default DetailsUi