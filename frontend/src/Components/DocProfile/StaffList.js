import React, { useEffect, useState, useCallback, Fragment, useContext } from 'react';
import { Select, Divider, Empty } from 'antd';
import { Avatar } from "@material-ui/core";
import { getStaff, locationsAPI, searchStaffAPI } from '../../Hooks/API';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import StaffListItem from './StaffListItem';
import AddIcon from '@material-ui/icons/Add';
import AddStaff from './AddStaff'
import SectionLoading from '../Loading/SectionLoading';
import { GlobalContext } from '../../Context/GlobalState';
import NurseListItem from './NurseListItem';
import PaListItem from './PaListItem';
import AddSearchedStaff from './AddSearchedStaff';
const { Option } = Select;

const StaffList = (props) => {
    const [staffList, setStaffList] = useState([]);
    const [staffNurse, setNurseList] = useState([]);
    const [staffFD, setFDList] = useState([]);
    const [staffPa, setPaList] = useState([]);
    const [addStaff, setAddStaff] = useState(false);
    const [addSearchedStaff, setAddSearchedStaff] = useState(false);
    const [searchList, setSearchList] = useState([]);
    const [locations, setLocations] = useState([])
    const [staffValues, setStaffValues] = useState('');
    const [staffVal, setStaffVal] = useState();
    const { accountId, accountType,elementDocId } = useContext(GlobalContext)

    const handleAddShow = () => {
        setAddStaff(true)
    }
    const handleAddHide = () => {
        setAddStaff(false)
    }
    const handleAddSearched = (data) => {
        if (`${data}` !== '') {
            searchStaffAPI(elementDocId, `${data}`).then((result) => {
                if (result[0]) {
                    setStaffValues(result[0])
                    console.log('Adding Values', result[0])
                    setAddSearchedStaff(true)
                }
            })
        }
    }
    const handleHideSearched = () => {
        setAddSearchedStaff(false)
        setSearchList('')
        setStaffVal(null)
    }
    const searchStaffList = (contact_no) => {
        if (contact_no !== "") {
            searchStaffAPI(elementDocId, contact_no).then((result) => {
                if (result) {
                    setSearchList(result)
                    console.log('Search Patient', result)
                }
                else console.log('Search Patient No Patient Result')
            })
        }
        else console.log('ApI not called')
    }
    const onChangeSelect = (value, e) => {
        setStaffVal(value);
        getLocations();
        handleAddSearched(value);
    }
    const renderPatientDropdownList = () => {
        return !!searchList && searchList.map((item, i) => (
            <Option value={item.number} key={i}>
                <div style={styles.header_container} >
                    <Avatar src={item.image} style={styles.avatar} />
                    <div style={styles.title_container}>
                        <h6 style={styles.title__name_selected}>{item.name}</h6>
                        <label style={styles.title__label}>{item.number}</label>
                        <label style={styles.title__label}> {item.dob.split('T')[0]} ({item.gender}) </label>
                    </div></div>
                <Divider />
            </Option>
        ))
    }

    //Displaying Staff
    const displayStaff = useCallback(() => {
        getStaff(elementDocId, 0).then(result => {
            if (result) {
                console.log('All staff list is ', result)
                setStaffList(result);
                if (result.staff_nurse) {
                    setNurseList(result.staff_nurse)
                    console.log('Staff type nurse results are', result.staff_nurse)
                }
                if (result.staff_pa) {
                    setPaList(result.staff_pa)
                    console.log('Staff type personal assistant results are', result.staff_pa)
                }
                if (result.staff_fd) {
                    setFDList(result.staff_fd)
                    console.log('Staff type front desk results are', result.staff_fd)
                }

            }
            console.log("Staff is ", result);
            props.firstLoadHook(false);

        });
    }, [elementDocId])

    const getLocations = () => {
        locationsAPI(elementDocId).then(result => {
            console.log("location results are: ", result);
            setLocations(result);
        });
    }

    useEffect(() => {
        displayStaff()
        getLocations();
    }, [displayStaff]);

    return (
        <div className='ProfileSection'>
            {props.load ?
                <SectionLoading />
                :
                <Fragment>
                    {
                        accountType === "doctors" &&
                        (<div className='Editsection' >
                            <Select
                                showSearch
                                allowClear
                                style={{ width: '250px', textAlign: 'left', marginRight: '15px' }}
                                placeholder="Search Staff"
                                value={staffVal}
                                onChange={onChangeSelect}
                                onSearch={searchStaffList}
                                optionLabelProp="label"
                                notFoundContent={
                                    <div className='text-center' style={{ padding: 8 }}>
                                        No Result Found
                                        <Divider style={{ margin: '4px 0' }} />
                                    </div>
                                }>
                                {renderPatientDropdownList()}
                            </Select>
                            <label style={{ color: '#acacac', marginRight: '15px' }}> or </label>
                            <label onClick={() => {
                                handleAddShow();
                                getLocations();
                            }}> Add New Staff
                                <i>
                                    <AddIcon style={{ height: 20, width: 20, marginBottom: 4 }} />
                                </i>
                            </label>
                        </div>)
                    }
                    <div className={(accountType === "nurses" || accountType === "pa" || accountType === "fd") && "mtt-20"}>
                        <div className='DetInfoSection'>
                            <AddSearchedStaff show={addSearchedStaff} hide={handleHideSearched} refreshList={displayStaff} locations={locations} data={staffValues} StaffList={staffList} />
                            <AddStaff show={addStaff} hide={handleAddHide} refreshList={displayStaff} locations={locations} StaffList={staffList} />
                            <h6 className="DetHead"> Staff  </h6>
                            {
                                (staffFD.length !== 0 || staffNurse.length !== 0 || staffPa.length !== 0) ?
                                    <Fragment>
                                        {staffFD.length !== 0 && staffFD.map((item, i) => (
                                            <StaffListItem itemData={item} docId={elementDocId} key={i} refreshList={displayStaff} locations={locations} StaffList={staffList} />
                                        ))}

                                        {staffNurse.length !== 0 && staffNurse.map((item, i) => (
                                            <NurseListItem itemData={item} docId={elementDocId} key={i} refreshList={displayStaff} locations={locations} StaffList={staffList} />
                                        ))}
                                        {staffPa.length !== 0 && staffPa.map((item, i) => (
                                            <PaListItem itemData={item} docId={elementDocId} key={i} refreshList={displayStaff} locations={locations} StaffList={staffList} />
                                        ))}
                                    </Fragment>
                                    :
                                    <Empty
                                        image={<SupervisedUserCircleIcon style={{ height: '70px', width: '70px', marginLeft: 'auto', marginRight: 'auto', color: 'rgba(0, 0, 0, 0.25)' }} />}
                                        imageStyle={{ marginBottom: '-24px' }}
                                        description={<span style={{ color: 'rgba(0, 0, 0, 0.25)' }}> No Staff Added</span>} />
                            }
                        </div>
                    </div>
                </Fragment>
            }
        </div>
    )
}
export default StaffList
const styles = {
    header_container: { display: "flex", flexDirection: "row", padding: 16, alignItems: "center", backgroundColor: "white", cursor: 'pointer' },
    header_container_selected: {
        display: "flex", flexDirection: "row", padding: 16, alignItems: "center"
        , backgroundColor: "#f6f6f6", borderColor: "#e0e0e0", borderStyle: "solid", borderWidth: 0.3
    },
    avatar: { height: "60px", width: "60px", borderWidth: 0.3, borderColor: "#e0004d", borderStyle: "solid" },
    title_container: { display: "flex", flexDirection: "column", textAlign: "left", marginLeft: 10 },
    title__name: { color: "#3a3b3c", fontSize: 14, fontWeight: "bold", marginBottom: '1px' },
    title__name_selected: { color: "#e0004d", fontSize: 14, fontWeight: "bold", marginBottom: '1px' },
    title__label: { color: "#00000081", fontSize: 12, marginBottom: '0px', marginTop: '0px' }
};