import React, { useEffect, useState, useCallback, Fragment, useContext } from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import DetailsUi from './DetailsUi';
import EditBtnUi from './EditBtnUi';
import EditCtrlsBtnUi from './EditCtrlsBtnUi';
import ProfileEditUi from './ProfileEditUi';
import ProfileUi from './ProfileUi';
import { getProfileAllInfo } from '../../Hooks/API'
import { downloadFile } from '../../Hooks/ImageAPI'
import { Modal } from 'antd';
import { GlobalContext } from '../../Context/GlobalState';
import { Divider, Empty } from 'antd';
import Chip from '@material-ui/core/Chip';
const { confirm } = Modal;

const DocProfile = (props) => {
    const [onEdit, setOnEdit] = useState(false);
    const [onQualifictionEdit, setOnQualifictionEdit] = useState(false);
    const [onStaffEdit, setOnStaffEdit] = useState(false);
    const [saveProfile, setSaveProfile] = useState(false);
    const [saveStaffProfile, setSaveStaffProfile] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
    const [docImage, setDocImage] = useState(null);
    const [staffImage, setStaffImage] = useState(null);
    const [staffData, setStaffData] = useState([]);
    const [docData, setDocData] = useState([]);
    const { accountType, accountId, accountCId, info, staffDocId } = useContext(GlobalContext)
    const { staffDocList, elementDocId, setElementDocId } = useContext(GlobalContext)


    const handleStaffProfileEdit = () => {
        setOnStaffEdit(true);
        setFirstLoad(true);
    }
    const showConfirm = () => {
        accountType === "doctors" ?
            confirm({
                title: 'Do you want to save these changes?',
                okText: 'Yes',
                okType: 'primary',
                cancelText: 'No',
                onOk() {
                    setSaveProfile(true);
                },
                onCancel() {
                    console.log('Cancel');
                },
            }) :
            confirm({
                title: 'Do you want to save these changes?',
                okText: 'Yes',
                okType: 'primary',
                cancelText: 'No',
                onOk() {
                    setSaveStaffProfile(true);
                },
                onCancel() {
                    console.log('Cancel');
                },
            })
    }

    const handleStaffProfileEditConfrim = () => {
        console.log("My confirm buttn")
        // setSaveStaffProfile(true);
        showConfirm();
        // setOnStaffEdit(false);
        setFirstLoad(false);
    }


    const handleStaffProfileEditCancel = () => {
        setOnStaffEdit(false);
        setSaveStaffProfile(false);
        setFirstLoad(false);
    }

    const handleQualificationEdit = () => {
        setOnQualifictionEdit(true);
        // setSaveStaffProfile(false);
        // setFirstLoad(false);
    }
    const handleQualificatiEditDone = () => {
        setOnQualifictionEdit(false);
        docAllInfo('doctors', accountId);
        // setSaveProfile(true);
        // setFirstLoad(false);
    }

    const handleProfileEdit = () => {
        setOnEdit(true);
        setFirstLoad(true);
    }

    const handleProfileEditConfrim = () => {
        console.log("My confirm buttn")
        showConfirm()
        // setOnEdit(false);
    }

    const handleProfileEditCancel = () => {
        setOnEdit(false);
        setSaveProfile(false);
        setFirstLoad(false);
    }

    const handleSaveStaffCallBack = (val) => {
        console.log("Value Save is parent staff : ", val)
        setSaveStaffProfile(val);
        setOnStaffEdit(val);
        dataCalling();
    }

    const handleSaveCallBack = (val) => {
        console.log("Value Save is parent : ", val)
        setSaveProfile(val);
        dataCalling();
        setOnEdit(val);
    }

    const showImage = (person, accountId, inputData) => {
        if (person === 'doctors') {
            !!inputData.image ?
                downloadFile(person, elementDocId, 'profile')
                    .then((json) => { setDocImage("data:image;charset=utf-8;base64," + json.encodedData); })
                    .catch((error) => console.error(error))
                    .finally(() => {
                    })
                :
                console.log("Downloading Image Failed! image is null")
        } else {
            !!inputData.image ?
                downloadFile(person, accountId, 'profile')
                    .then((json) => { setStaffImage("data:image;charset=utf-8;base64," + json.encodedData); })
                    .catch((error) => console.error(error))
                    .finally(() => {
                    })
                :
                console.log("Downloading Image Failed! image is null")
        }
    }

    const docAllInfo = useCallback((type, id) => {
        getProfileAllInfo(type, id).then(result => {
            console.log("docAllInfo: Doctor Profile Info", result[0]);
            if (result[0]) {
                setDocData(result[0])
                showImage(type, elementDocId, result[0]);
            }
            setFirstLoad(false)
        })
    }, [elementDocId])

    const staffAllInfo = useCallback((type, id) => {
        getProfileAllInfo(type, id).then(result => {
            console.log("staffAllInfo: Staff Profile Info", result);
            if (result) {
                setStaffData(result[0])
                showImage(type, accountId, result[0])
            }
        })
    }, [accountId])


    const idAllInfo = useCallback((type, id) => {
        return getProfileAllInfo(type, id).then(result => {
            console.log("staffAllInfo: ID Profile Info", result);
            if (!!result) {
                return result[0]
            } else {
                return []
            }
        })
    }, [staffDocId])

    const [docListInfo, setDocListInfo] = useState([])

    const dataCalling = () => {
        console.log("about data in profile ui is 1", accountType, accountId);
        if (accountType === 'doctors') {
            docAllInfo(accountType, accountId);
        } else {
            staffAllInfo(accountType, accountId);
            docAllInfo('doctors', accountId);
            let ProfileArray = [];
            let response = staffDocList.map(async (d) => {
                let val = await idAllInfo('doctors', d.doctor_id);
                ProfileArray.push(val)
            })
            Promise.all(response).then(() => setDocListInfo(ProfileArray))
        }
    }

    useEffect(() => {
        dataCalling();
    }, [accountId]);

    const renderStaff = () => {
        return <Fragment>
            <h6 className='sectionHeader'>STAFF PROFILE</h6>
            <div className='ProfileSection' >
                <div>
                    {
                        onStaffEdit ?
                            <EditCtrlsBtnUi
                                onCancel={handleStaffProfileEditCancel}
                                onConfirm={handleStaffProfileEditConfrim}

                            />
                            :
                            <EditBtnUi onClick={handleStaffProfileEdit} />
                    }
                    {
                        onStaffEdit ?
                            <ProfileEditUi data={staffData} qualification={staffData.qualification}
                                image={staffImage} saveHandler={saveStaffProfile}
                                saveCallBack={handleSaveStaffCallBack} status={true} />
                            :
                            <ProfileUi data={staffData} image={staffImage} load={firstLoad} firstLoadHook={setFirstLoad} status={true} />
                    }
                </div>
            </div>
        </Fragment>
    }

    const renderDoctor = () => {
        return <Fragment>
            <h6 className='sectionHeader'>DOCTOR PROFILE</h6>
            <div className='ProfileSection' >
                <div>
                    {
                        accountType === "doctors" && (onEdit ?
                            <EditCtrlsBtnUi
                                onCancel={handleProfileEditCancel}
                                onConfirm={handleProfileEditConfrim}
                            />
                            :
                            !firstLoad && (<EditBtnUi onClick={handleProfileEdit} />))
                    }
                    <div className={(accountType === "nurses" || accountType === "fd" || accountType === "pa") && "mtt-20"}>
                        {
                            onEdit ?
                                <ProfileEditUi data={docData} qualification={docData.qualification}
                                    image={docImage} saveHandler={saveProfile} saveCallBack={handleSaveCallBack} />
                                :
                                <ProfileUi data={docData} image={docImage} firstLoadHook={setFirstLoad} />
                        }
                    </div>
                </div>
                <div>
                    <Divider className='Dividers' />
                    {
                        accountType === "doctors" && (onQualifictionEdit ?
                            <EditCtrlsBtnUi
                                onDone={handleQualificatiEditDone}
                                status={"qualification"}
                            />
                            :
                            !firstLoad && (<EditBtnUi onClick={handleQualificationEdit} />))
                    }
                    <div className={(accountType === "nurses" || accountType === "fd" || accountType === "pa") && "mtt-20"}
                        style={{ textAlign: "left", marginLeft: "10px" }}>
                        {
                            onQualifictionEdit ?
                                <ProfileEditUi qualification={docData.qualification} status={"qualification"} saveCallBack={handleSaveCallBack} data={docData} />
                                :
                                <Fragment>
                                    <h6 className='infoHead'> Qualification </h6>
                                    <div className='CatsDiv'>
                                        {!!docData.qualification && docData.qualification.length !== 0 ? renderQualification() : <div><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No Qualification Added'} /></div>}
                                    </div>
                                </Fragment>
                        }
                    </div>
                </div>
            </div>
        </Fragment>
    }

    const renderQualification = () => !!docData.qualification && docData.qualification.map((data) =>
        <Fragment>
            {!!(data.qualification) ? <Chip label={data.qualification} /> : <div>No Qualification Added.</div>}
            <Divider type="vertical" />
        </Fragment>
    )

    const renderMyDocList = () =>
        <Fragment>
            <h6 className='sectionHeader'>MY DOCTORS LIST</h6>
            <div className='ProfileSection' >
                <div>
                    {!!staffDocList && (
                        staffDocList.length !== 0 ?
                            docListInfo.map(d => <ProfileUi data={d} image={docImage} firstLoadHook={setFirstLoad} />)
                            :
                            <div>No Doctor in Your List</div>
                    )}
                </div>
            </div>
        </Fragment>

    return (
        <Container fluid>
            <Row>
                <Col sm={6} md={6} lg={4}>
                    <div style={{ position: "sticky", top: 88 }}>
                        {(accountType === "nurses" || accountType === "fd" || accountType === "pa") &&
                            renderStaff()
                        }
                        {(accountType === "nurses" || accountType === "fd" || accountType === "pa") &&
                            renderMyDocList()
                        }
                        {(accountType === "doctors") && renderDoctor()}
                    </div>
                </Col>
                {/* {accountType==="doctor"?<Col sm={6} md={6} lg={8}>
                    <DetailsUi/>
                </Col>:""} */}
                <Col sm={6} md={6} lg={8}>
                    <DetailsUi />
                </Col>
            </Row>
        </Container>
    )
}



export default DocProfile