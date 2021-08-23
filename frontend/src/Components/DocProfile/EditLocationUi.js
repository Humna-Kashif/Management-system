import React, { useContext, useEffect, useState } from 'react'
import { locationsAPI } from "../../Hooks/API"
import EditLocationItemUi from './EditLocationItem';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import {Empty} from 'antd';
import AddIcon from '@material-ui/icons/Add';
import AddLocations from './AddLocations'
import { Fragment } from 'react';
import SectionLoading from '../Loading/SectionLoading';
import { GlobalContext } from '../../Context/GlobalState';

const EditLocationUi = (props) => {
    const [addLocation, setAddLocation] = useState(false);
    const [data, setData] = useState([]);
    const [oneTime, setOneTime] = useState(true);
    const { accountType, accountId,elementDocId } = useContext(GlobalContext)


    //showModal
    const handleShow = () => {
        setAddLocation(true)
    }
    //hideModal
    const handleHide = () => {
        setAddLocation(false);
    }
    //renderLocationItem
    const renderItem = () => {
        console.log("this is my locations:", data);
        return (
            data.map((item, i) => (<EditLocationItemUi callback={refresh} key={i} itemData={item} itemSchedule={item.schedule} />))
        )
    }
    //displayLocationsList
    const refresh = () => {
        locationsAPI(elementDocId).then(result => {
            console.log('Locationsss are: ', result)
            setData(result);
        });
    }

    useEffect(() => {
        console.log("loc save handler all loop", elementDocId);
        if (props.saveHandler) {
            console.log("loc save handler true");
            setOneTime(false);
        }
        else {
            console.log("loc save handler false");
            const timer = setTimeout(() => {
                oneTime &&
                    locationsAPI(elementDocId).then(result => {
                        console.log("new location api", result);
                        if (result) {
                            props.firstLoadHook(false)
                            setData(result);

                        }
                    });
                setOneTime(false);
            }, 200);
            return () => clearTimeout(timer);

        }
    });




    return (

        <div className='ProfileSection'>
            {props.load ?
                <SectionLoading />
                :
                <Fragment>
                    <AddLocations show={addLocation} hide={handleHide} refreshList={refresh} LocationsData={data} />
                    {
                        accountType === "doctors" &&
                        (<div className='Editsection' onClick={handleShow}>
                            <label> Add New Location
                                <i>
                                    <AddIcon style={{ height: 20, width: 20, marginBottom: 4 }} />
                                </i>
                            </label>
                        </div>)
                    }
                    <div className={(accountType === "nurses" || accountType === "pa" || accountType === "fd") && "mtt-20"}>
                        <div className='DetInfoSection'>
                            <h6 className='DetHead'> Locations   </h6>
                            {data.length !== 0 ? renderItem() :  
                            <Empty
                                image={<LocationOnIcon style={{ height: '70px', width:'70px', marginLeft:'auto', marginRight:'auto',color:'rgba(0, 0, 0, 0.25)'}}/>}
                                imageStyle={{marginBottom:'-24px'}}
                                description={ <span style={{ color:'rgba(0, 0, 0, 0.25)'}}> No Location Added</span>}/>}
                            <br />
                        </div>
                    </div>
                </Fragment>
            }
        </div>

    )
}

export default EditLocationUi

EditLocationUi.defaultProps = {
    saveHandler: false,
    saveCallBack: () => { },
    locationData: [{
        doctor_Location_id: "1",
        location: "cmh",
        days: "mon-fri",
        fees: "500",
        start_time: "13:00",
        end_time: "19:00",

    }
    ]
}

