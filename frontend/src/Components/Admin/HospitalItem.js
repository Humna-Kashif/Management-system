import React, { Fragment, useContext, useEffect, useState } from 'react'
import { message, Table, Avatar, Input, Modal } from 'antd';
import {
    getAllLocations,
    addNewLocation, deleteHospitalItemAPI,
    deleteLocationItemAPI, editLocationItemAPI,
    editNewHospitalAPI
} from '../../Hooks/API'
import { uploadFile, downloadFile } from '../../Hooks/ImageAPI'
import { Col, Row } from 'react-bootstrap';
import { AiFillCaretDown, AiFillCaretUp, AiFillPlusCircle } from "react-icons/ai";
import { BsFillTrashFill } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { GlobalContext } from '../../Context/GlobalState'

const HospitalItem = (props) => {
    const item = props.data;
    const { accountId } = useContext(GlobalContext);
    const [image, setImage] = useState(null);
    const [allLocations, setAllLocations] = useState([]);
    const [locationStatus, setLocationStatus] = useState(false);
    const [hospitalName, setHospitalName] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [hospitalId, setHospitalId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [locationName, setLocationName] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longtitute, setLongtitute] = useState("");
    const [editLocation, setEditLocation] = useState(false);
    const [open, setOpen] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);

    const showModal = (hospital_id, name, NoOfLocatoins) => {
        console.log(hospital_id, name, NoOfLocatoins)
        setHospitalId(hospital_id);
        setHospitalName(name);
        if (NoOfLocatoins !== null) {
            message.error("Failed! This hospital already conatians " + NoOfLocatoins + " locations. Delete These Location first");
        }
        else {
            setIsModalVisible(true);
        }
    };

    const handleOk = () => {
        setIsModalVisible(false);
        deleteHospital(hospitalId);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const renderConfirmationModal = () => {
        return <Modal title="Delete Hospital" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
            <p>Are you sure you want to delete this hospital named <b>{hospitalName}</b></p>
        </Modal>
    }

    const deleteHospital = (id) => {
        deleteHospitalItemAPI(accountId, id).then(result => {
            console.log("Delete Hospital result ", result)
            if (result.message === "API Error") {
                message.error("Failed! API error");
            } else {
                message.success("Delete Hospital successfully");
                showAllLocations(accountId, item.name);
                setLocationStatus(true);
                props.callBack();
            }
        });
    }


    const [isEditHospitalModalVisible, setIsEditHospitalModalVisible] = useState(false);

    const showEditHospitalModal = (hospital_id, name) => {
        console.log(hospital_id, name)
        setHospitalId(hospital_id);
        setHospitalName(name);
        // setSelectedImage(image);
        setIsEditHospitalModalVisible(true);
    };

    const handleEditHospitalOk = () => {
        setIsEditHospitalModalVisible(false);
        editHospitalData();
    };

    const handleEditHospitalCancel = () => {
        setIsEditHospitalModalVisible(false);
    };

    const singleFileChangedHandler = (event) => {
        console.log("my image is ", event.target.files);
        setSelectedImage(event.target.files[0]);
    };
    const onHospitalName = (event) => {
        setHospitalName(event.target.value);
    };

    const [isLogoModalVisible, setIsLogoModalVisible] = useState(false);

    const showLogoModal = () => {
        setIsLogoModalVisible(true);
    };

    const handleLogoCancel = () => {
        setIsLogoModalVisible(false);
    };

    function renderAddHospitalLogoModal() {
        return <Modal title="Add Hospital Logo" visible={isLogoModalVisible} onOk={addLogo} onCancel={handleLogoCancel}>
            <Row>
                <Col lg='3' className='SectionList'>
                    <label> Add Logo: </label>
                </Col>
                <Col lg='8' className='SectionInfo'>
                    <Input type="file" onChange={singleFileChangedHandler} />
                </Col>
            </Row>
        </Modal>
    }


    const addLogo = () => {
        selectedImage !== null ?
            selectedImage.size < 2097152 ?
                selectedImage.type.includes("image") ?
                    uploadFile('hospitals', item.hospital_id, selectedImage, 'profile').then((result) => {
                        console.log("editHospitalData: Edit hospital logo result: ", result)
                        if (result.status === 200) {
                            message.success("Logo uploaded successfully")
                            showImage(accountId)
                        } else {
                            message.error("Image uploading error! Api error")
                        }
                    })
                    :
                    message.error("Image uploading error! Selected file is not image")
                :
                message.error("Image uploading error! Image size is greater then 2MB")
            :
            message.error("Image uploading error! No image selected")

        setIsLogoModalVisible(false);
    }

    const editHospitalData = () => {
        if (hospitalName !== "") {
            editNewHospitalAPI(accountId, hospitalName, item.hospital_id).then((result) => {
                console.log("editHospitalData: Edit Hospital name result: ", result)
                if (result) {
                    message.success("Hospital Edit Successfully");
                    props.callBack();
                }
                else message.error("Hospital Edit Failed ")
            });
        }
        selectedImage !== null ?
            selectedImage.size < 2097152 ?
                selectedImage.type.includes("image") ?
                    uploadFile('hospitals', selectedImage, item.hospital_id, 'profile').then((result) => {
                        console.log("editHospitalData: Edit hospital logo result: ", result)
                        if (result.status === 200) {
                            message.success("Logo uploaded successfully")
                            showImage(accountId)
                        } else {
                            message.error("Image uploading error! Api error")
                        }
                    })
                    :
                    message.error("Image uploading error! Selected file is not image")
                :
                message.error("Image uploading error! Image size is greater then 2MB")
            :
            message.error("Image uploading error! No image selected")

        setIsLogoModalVisible(false);
    }

    const renderEditHospitalModal = () => {
        return <Modal title="Edit Hospital" visible={isEditHospitalModalVisible} onOk={handleEditHospitalOk} onCancel={handleEditHospitalCancel}>
            <Row>
                <Col lg='3' className='SectionList'>
                    <label> Name: </label>
                </Col>
                <Col lg='8' className='SectionInfo'>
                    <Input
                        name="Hospital Name"
                        type="text"
                        placeholder="Enter Hospital name"
                        value={hospitalName}
                        onChange={onHospitalName} />
                </Col>
            </Row>
            <Row>
                <Col lg='3' className='SectionList'>
                    <label> Change Logo: </label>
                </Col>
                <Col lg='8' className='SectionInfo'>
                    <Input type="file" onChange={singleFileChangedHandler} />
                </Col>
            </Row>
        </Modal>
    }

    const showLocationModal = (id, name) => {
        setLocationId(id);
        setLocationName(name);
        setIsLocationModalVisible(true)
    };

    const handleLocationOk = () => {
        setIsLocationModalVisible(false);
        deleteLocation(locationId, locationName)
    };

    const handleLocationCancel = () => {
        setIsLocationModalVisible(false);
    };

    const renderLocationConfirmationModal = () => {
        return <Modal title="Delete Hospital" visible={isLocationModalVisible} onOk={handleLocationOk} onCancel={handleLocationCancel}>
            <p>Are you sure you want to delete this Location named <b>{locationName}</b></p>
        </Modal>
    }

    const columns = [{
        title: "Name",
        dataIndex: "name"
    }, {
        title: "Address",
        dataIndex: "address"
    }, {
        title: "Number",
        dataIndex: "number"
    }, {
        title: "Latitude",
        dataIndex: "latitude"
    }, {
        title: "Longitude",
        dataIndex: "longitude"
    },
    {
        title: 'Action',
        dataIndex: '',
        key: 'x',
        render: (item) => <div className='listIcon'> <BsFillTrashFill onClick={() => { showLocationModal(item.location_id, item.name) }} />
            <FaEdit className='EditIconList' onClick={() => { handleShow(item.location_id, item.name, item.number, item.address, item.latitude, item.longitude) }} /> </div>
    },
    ];

    const renderData = () => {
        const data = [];
        allLocations.map((item, i) => (
            data.push({
                key: i,
                name: item.name,
                address: item.address,
                number: item.number,
                latitude: item.latitude,
                longitude: item.longitude,
                location_id: item.location_id
            })
        ));
        return data;
    }
    //openModal
    const handleOpen = () => {
        setOpen(true)
    }
    //closeModal
    const handleClose = () => {
        setOpen(false);
        setLocationName("");
        setAddress("");
        setContact("");
        setLatitude("");
        setLongtitute("");
    }

    const OnNameChange = (e) => {
        setLocationName(e.target.value);
    }

    const OnAddressChange = (e) => {
        setAddress(e.target.value);
    }

    const OnContactChange = (e) => {
        setContact(e.target.value);
    }

    const OnLatitudeChange = (e) => {
        setLatitude(e.target.value);
    }

    const OnLongtituteChange = (e) => {
        setLongtitute(e.target.value);
    }

    const handleOnAdd = () => {
        let count = 0;
        if (!!allLocations) {
            for (let i = 0; i < allLocations.length; i++) {
                if (allLocations[i].name.toLowerCase() === locationName.toLowerCase() || allLocations[i].number === contact.toString()) {
                    count++;
                }
            }
            if (count === 1) {
                message.error("Failed! Location Already Exsist");
            }
            else if (count === 0) {
                console.log(accountId, locationName, address, item.name, longtitute, latitude, contact.toString())
                if (locationName === "" || address === "" || item.name === "" || longtitute === "" || latitude === "" || contact === "") {
                    message.error("Failed! All Fields are required ");
                } else {
                    addNewLocation(accountId, locationName, address, item.name, longtitute, latitude, contact.toString()).then((result) => {
                        console.log("add location result is ", result);
                        if (result === "location Added Successfully!") {
                            message.success("New Location Added Successfully");
                            props.callBack();
                            showAllLocations(accountId, item.name);
                            setLocationStatus(true);
                        }
                        else message.error("Location Addition Failed ")
                    })
                }
            }
            else {
                alert(count);
            }
        }
        else {
            console.log(accountId, locationName, address, item.name, longtitute, latitude, contact.toString())
            if (locationName === "" || address === "" || item.name === "" || longtitute === "" || latitude === "" || contact === "") {
                message.error("Failed! All Fields are required ");
            } else {
                addNewLocation(accountId, locationName, address, item.name, longtitute, latitude, contact.toString()).then((result) => {
                    console.log("add location result is ", result);
                    if (result === "location Added Successfully!") {
                        message.success("New Location Added Successfully");
                        props.callBack();
                        showAllLocations(accountId, item.name);
                        setLocationStatus(true);
                    }
                    else message.error("Location Addition Failed ")
                })
            }
        }
        handleClose();
    }

    const editLocationData = () => {
        editLocationItemAPI(accountId, locationId, locationName, address, item.name, longtitute, latitude, contact.toString()).then(result => {
            console.log("Edit Location result ", result)
            if (result) {
                message.success("Location edit successfully");
                props.callBack();
                showAllLocations(accountId, item.name);
                setLocationStatus(true);
            }
        });
        setEditLocation(false);
    }

    //showModal
    const handleShow = (id, name, number, address, latitude, longitude) => {
        setLocationId(id);
        setLocationName(name);
        setContact(number);
        setAddress(address);
        setLatitude(latitude);
        setLongtitute(longitude);
        setEditLocation(true);
    }
    //hideModal
    const handleHide = () => {
        setEditLocation(false)
    }

    const editLocationModal = () => {
        return <Modal title="Edit Location" visible={editLocation} onOk={editLocationData} onCancel={handleHide}>
            <Row>
                <Col lg='4' className='SectionList'>
                    <label> Hospital: </label>
                </Col>
                <Col lg='6' className='SectionInfo'>
                    <Input
                        name="Hospital Name"
                        type="text"
                        value={item.name}
                        disabled
                    />
                </Col>
            </Row>
            <Row>
                <Col lg='4' className='SectionList'>
                    <label> Name: </label>
                </Col>
                <Col lg='6' className='SectionInfo'>
                    <Input
                        name="Hospital Name"
                        type="text"
                        placeholder='Location Name'
                        value={locationName}
                        onChange={OnNameChange}
                    />
                </Col>
            </Row>
            <Row>
                <Col lg='4' className='SectionList'>
                    <label> Address: </label>
                </Col>
                <Col lg='6' className='SectionInfo'>
                    <Input
                        name="Address"
                        type="text"
                        placeholder='Address'
                        value={address}
                        onChange={OnAddressChange}
                    />
                </Col>
            </Row>
            <Row>
                <Col lg='4' className='SectionList'>
                    <label> Contact: </label>
                </Col>
                <Col lg='6' className='SectionInfo'>
                    <Input
                        name="Contact"
                        type="number"
                        placeholder='Contact'
                        value={contact}
                        onChange={OnContactChange}
                    />
                </Col>
            </Row>
            <Row>
                <Col lg='4' className='SectionList'>
                    <label> Latitude: </label>
                </Col>
                <Col lg='6' className='SectionInfo'>
                    <Input
                        name="Latitude"
                        type="text"
                        placeholder='Latitude'
                        value={latitude}
                        onChange={OnLatitudeChange}
                    />
                </Col>
            </Row>
            <Row>
                <Col lg='4' className='SectionList'>
                    <label> Longtitute: </label>
                </Col>
                <Col lg='6' className='SectionInfo'>
                    <Input
                        name="Longtitute"
                        type="text"
                        placeholder='Longtitute'
                        value={longtitute}
                        onChange={OnLongtituteChange}
                    />
                </Col>
            </Row>
        </Modal>
    }

    const showImage = (hospital_id) => {
        if (!!hospital_id) {
            downloadFile('hospitals', hospital_id, 'profile')
                .then((json) => {
                    if (json.encodedData) {
                        setImage("data:image;charset=utf-8;base64," + json.encodedData);
                    }
                })
                .catch((error) => console.error(error))
                .finally(() => {
                });
        } else {
            console.log("Downloading Image Failed! hospital_id is null")
        }
    }

    const handleShowlocations = () => {
        if (locationStatus)
            setLocationStatus(false);
        else setLocationStatus(true);

    }

    const showAllLocations = (hospital_id, hospital_name) => {
        console.log("all locations values ", hospital_id, "  ", hospital_name);
        getAllLocations(hospital_id, hospital_name)
            .then((results) => {
                console.log("all locations ", results);
                if (results) {
                    setAllLocations(results);
                }
                else message.error("No Locations Exsist");
            });
    }

    const deleteLocation = (id, name) => {
        deleteLocationItemAPI(accountId, id).then(result => {
            console.log("Delete Location result ", result)
            if (result.message === "API Error") {
                message.error("Failed! API error");
            } else {
                message.success("Delete Location successfully");
                showAllLocations(accountId, item.name);
                props.callBack();
                setLocationStatus(true);
            }
        });
    }

    const renderAddLocationModal = () => {
        return <Modal title="Add Location" visible={open} onOk={handleOnAdd} onCancel={handleClose}>
            <Row>
                <Col lg='4' className='SectionList'>
                    <label> Hospital: </label>
                </Col>
                <Col lg='6' className='SectionInfo'>
                    <Input
                        name="Hospital Name"
                        type="text"
                        value={item.name}
                        disabled
                    />
                </Col>
            </Row>
            <Row>
                <Col lg='4' className='SectionList'>
                    <label> Name: </label>
                </Col>
                <Col lg='6' className='SectionInfo'>
                    <Input
                        name="Hospital Name"
                        type="text"
                        placeholder='Location Name'
                        value={locationName}
                        onChange={OnNameChange}
                    />
                </Col>
            </Row>
            <Row>
                <Col lg='4' className='SectionList'>
                    <label> Address: </label>
                </Col>
                <Col lg='6' className='SectionInfo'>
                    <Input
                        name="Address"
                        type="text"
                        placeholder='Address'
                        value={address}
                        onChange={OnAddressChange}
                    />
                </Col>
            </Row>
            <Row>
                <Col lg='4' className='SectionList'>
                    <label> Contact: </label>
                </Col>
                <Col lg='6' className='SectionInfo'>
                    <Input
                        name="Contact"
                        type="number"
                        placeholder='Contact'
                        value={contact}
                        onChange={OnContactChange}
                    />
                </Col>
            </Row>
            <Row>
                <Col lg='4' className='SectionList'>
                    <label> Latitude: </label>
                </Col>
                <Col lg='6' className='SectionInfo'>
                    <Input
                        name="Latitude"
                        type="text"
                        placeholder='Latitude'
                        value={latitude}
                        onChange={OnLatitudeChange}
                    />
                </Col>
            </Row>
            <Row>
                <Col lg='4' className='SectionList'>
                    <label> Longtitute: </label>
                </Col>
                <Col lg='6' className='SectionInfo'>
                    <Input
                        name="Longtitute"
                        type="text"
                        placeholder='Longtitute'
                        value={longtitute}
                        onChange={OnLongtituteChange}
                    />
                </Col>
            </Row>
        </Modal>
    }

    useEffect(() => {
        if (item.hospital_id) {
            showImage(item.hospital_id);
        }
        showAllLocations(accountId, item.name);
    }, [accountId, item.hospital_id]);

    return (
        <Fragment>
            {renderEditHospitalModal()}
            {editLocationModal()}
            {renderLocationConfirmationModal()}
            {renderConfirmationModal()}
            {renderAddLocationModal()}
            <div className="hospital-item">
                <div style={{ marginRight: 10, marginBottom: 10 }}>
                    <Avatar
                        width={100}
                        height={100}
                        style={{ borderRadius: "50%", border: '2px solid #efefef' }}
                        src={image}
                        icon={<AiFillPlusCircle />}
                        onClick={showLogoModal}
                    />
                </div>
                <div style={{ display: "flex", flex: 11, }}>
                    <div style={{ display: "flex", flex: 10, padding: 5, textTransform: 'capitalize' }}>
                        <b> {item.name} </b>
                    </div>
                    <div style={{ display: "flex", flex: 2, marginTop: '5px' }}>
                        {locationStatus ?
                            <label style={{ height: 30, cursor: "pointer" }}
                                onClick={() => {
                                    handleShowlocations();
                                }}>
                                <b> {item.no_of_locations === null ? 0 : item.no_of_locations} Locations <AiFillCaretUp /> </b>
                            </label>
                            :
                            <label style={{
                                color: "#bababa",
                                cursor: "pointer",
                            }}
                                onClick={() => {
                                    handleShowlocations();
                                }}>
                                <b> {item.no_of_locations === null ? 0 : item.no_of_locations} Locations <AiFillCaretDown /> </b>
                            </label>
                        }</div>
                    <div className='listIcon'> <BsFillTrashFill onClick={() => { showModal(item.hospital_id, item.name, item.no_of_locations) }} />
                        <FaEdit className='EditIconList' onClick={() => { showEditHospitalModal(item.hospital_id, item.name) }} /> </div>
                </div>

            </div>
            { locationStatus ?
                <div style={{ marginBottom: "10px" }}>
                    <label style={{ float: "right", marginRight: '20px', cursor: "pointer" }} onClick={() => { handleOpen() }}>Add Location +</label>
                    <Table columns={columns} dataSource={renderData()} size={"small"} pagination={false} bordered></Table>
                </div> : ""}
            {renderAddHospitalLogoModal()}
        </Fragment>
    )
}

export default HospitalItem
