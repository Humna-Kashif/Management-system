import React, { useContext, useState } from 'react'
import { Row, Col, Button, Modal } from 'react-bootstrap';
import { Fragment } from 'react';
import Avatar from '@material-ui/core/Avatar';
import '../../Styles/DocProfile.css';
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import AddIcon from '@material-ui/icons/Add';
import Chip from '@material-ui/core/Chip';
import { Divider, message, Input } from 'antd';
import { getProfileAllInfo, qualificationsAPI, deleteQualificationAPI, addQualificationAPI} from '../../Hooks/API'
import EditDocHead from './EditDocHead';
import { uploadFile, downloadFile } from '../../Hooks/ImageAPI';
import { GlobalContext } from '../../Context/GlobalState';

const ProfileEditUi = (props) => {
  console.log("edit data is ", props.data.image, props.qualification)
  const [aboutData, setAboutData] = useState(props.data);
  const [qualificationData, setQualificationData] = useState(props.qualification);
  const [qualificationValue, setQualificationValue] = useState("");
  const [image, setImage] = useState(props.image);
  const { accountId, accountType, staffDocId, setUserImage,setUsername,elementDocId } = useContext(GlobalContext)

  const showImage = () => {
    let id = accountType === 'doctors' ? elementDocId :  accountId
    downloadFile(accountType, id, 'profile').then((json) => { setImage("data:image;charset=utf-8;base64," + json.encodedData); setUserImage("data:image;charset=utf-8;base64," + json.encodedData);localStorage.setUserImage('img', "data:image;charset=utf-8;base64," + json.encodedData) }) //ToDo:
      .catch((error) => console.error(error))
      .finally(() => {
      })
  }

  //if (accountType === "nurse" || accountType === "front desk" || accountType === "personal assistant")
  const [show, setShow] = useState(false);
  const handleClose = () => {
    let id = accountType === 'doctors' ? elementDocId  : accountId
    selectedImage !== null ?
      selectedImage.size < 2097152 ?
        selectedImage.type.includes("image") ?
          uploadFile(accountType, id, selectedImage, 'profile').then((result) => {
            console.log("handleClose: image upload result: ", result);
            if (result.status == 200) {
              message.success(result.data)
              showImage()
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

    setShow(false);
  }

  const handleShow = () => setShow(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const singleFileChangedHandler = (event) => {
    setSelectedImage(event.target.files[0])
  };

  const getAbout = () => {
    let id = accountType === 'doctors' ? elementDocId  : accountId
    getProfileAllInfo(accountType,id).then(result => {
      console.log('getting result of abouttt', result)
      setAboutData(result[0]);
      setUsername(result[0].name)
      localStorage.setItem('username',result[0].name)
    })
  }

  const getQualification = () => {
    getProfileAllInfo(accountType,elementDocId).then(result => {
      if (result) {
        setQualificationData(result[0].qualification);
      }
      else setQualificationData([])

    })
  }

  const handleDeleteQualification = (id) => {
    deleteQualificationAPI(elementDocId, "DELETE", id).then((result) => {
      console.log("new qualification api", result);
      message.success("Qualification Deleted");
      getQualification();
    });
  };
  const refresh = () => {
    qualificationsAPI(elementDocId).then((result) => {
      setQualificationData([]);
      console.log("new qualification api", result);
      setQualificationData(result);
    });
  };

  const handleAddQualification = () => {
    let count = 0;
    if (qualificationValue !== '') {
      if (qualificationData) {
        console.log('main function iffff')
        for (let i = 0; i < qualificationData.length; i++) {
          if (qualificationData[i].qualification.toLowerCase() === qualificationValue.toLowerCase()) {
            count++;
          }
        }
        if (count == 1) {
          message.error("Failed! Qualification Already Exsist");
        }
        if (count == 0) {
          console.log('main second ifff')
          addQualificationAPI(elementDocId, "POST", qualificationValue).then((result) => {
            if (result == "Operation Successful") {
              message.success("Qualification Added Successfully");
              console.log("Success", result);
              refresh();
            }
            else message.error("Qualification Addition Failed " + result.message)
          });
          setQualificationValue("");
        }

      }
      else {
        console.log('main function testingggg')
        addQualificationAPI(elementDocId, "POST", qualificationValue).then((result) => {
          if (result == "Operation Successful") {
            message.success("Qualification Added Successfully");
            console.log("Success", result);
            refresh();
          }
          else message.error("Qualification Addition Failed " + result.message)
        });
        setQualificationValue("");
      }
    }

  };

  const renderQualification = () => !!qualificationData && qualificationData.map((data) =>
    <Fragment>
      {!!(data.qualification) ? <Chip label={data.qualification} onDelete={() => handleDeleteQualification(data.doctor_qualification_id)} /> : <Chip label={data.qualification} />}
      <Divider type="vertical" />
    </Fragment>
  )

  const renderSetImage = () => {
    console.log("clicked")
    return (
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className='ModalTitle'>Upload Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="card-body">
            <p className="card-text">Please upload an image for your profile</p>
            <input type="file" onChange={singleFileChangedHandler} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="primary" onClick={handleClose}>
            Upload
            </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddQualification();
    }
  }
  return (
    <Fragment>
      {props.status === "qualification" ?
        <Fragment>
          <h6 className='infoHead'> Qualification </h6>
          <Row className='m-0'>
            <Col lg={10} md={10} sm={10} className='mtt-10' >
              <Input
                className='EditInput'
                placeholder="Add Your Qualification ..."
                type="text"
                value={qualificationValue}
                noValidate
                onChange={(e) => setQualificationValue(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </Col>
            <Col lg={2} md={2} sm={2} className='mtt-10' >
              <Button style={{ width: '30px', height: '30px', padding: '0px', marginLeft: '-10px' }} onClick={() => handleAddQualification()}><AddIcon /> </Button>
            </Col>
          </Row>
          <div className='CatsDiv'>
            {renderQualification()}
          </div>
        </Fragment>
        :
        <div className='InfoSection'>
          <div style={{ display: 'flex', flexDirection: 'column', }}>
            <div className='EditSection text-center'>
              <Avatar src={image} className='' > </Avatar>
              <AddAPhotoIcon className='AddPhoto' onClick={() => { handleShow() }}></AddAPhotoIcon>
            </div>
            <EditDocHead data={aboutData} callback={getAbout} saveHandler={props.saveHandler} saveCallBack={props.saveCallBack} />
            {renderSetImage()}
          </div>
        </div>
      }
    </Fragment>
  )
}


export default ProfileEditUi

ProfileEditUi.defaultProps = {
  saveHandler: false,
  saveCallBack: () => { },
  about: {
    about: "",
    appointment_type: "",
    dob: "",
    gender: "",
    image: "",
    name: "",
    specialization: ""
  },
  facilities: [
    {
      doctor_facility_id: 10,
      facility: "Covid test"
    },
    {
      doctor_facility_id: 28,
      facility: "Typhoid tests"
    }
  ]
}