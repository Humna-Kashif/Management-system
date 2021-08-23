import React, { useState, useContext } from "react"
import { Button, message } from 'antd';
import { Modal } from 'react-bootstrap'
import { uploadFile, downloadFile  } from '../../Hooks/ImageAPI'
import PublishIcon from '@material-ui/icons/Publish';
import GetApp from '@material-ui/icons/GetApp';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { GlobalContext } from '../../Context/GlobalState';
import { Fragment } from "react";

const TestItem = (props) => {
  const itemData = props.itemData;
  const [selectedFile, setselectedFile] = useState(null);
  const { accountType, accountId } = useContext(GlobalContext)
  console.log("Test Item data: ", itemData, " and ", itemData.id)

  const downloadTest = () => {
    console.log("calling function")
    if (!!itemData.id) {
      downloadFile(accountType, accountId, 'doc', props.data.patientinfo.patient_id, props.data.appointment_id, itemData.id)
        .then(result => {
          console.log("file getting response is ", result)
        });
    }
    else if (!!itemData.test_id) {
      downloadFile(accountType, accountId, 'doc', props.data.patientinfo.patient_id, props.data.appointment_id, itemData.test_id)
        .then(result => {
          console.log("file getting response is ", result)
        });
    }
  }

  //https://app.aibers.health/patients/10/appointments/169/tests/3
  const singleFileChangedHandler = (event) => {
    console.log("choose file is ", event.target.files[0])
    setselectedFile(event.target.files[0])
  };

  const [show, setShow] = useState(false);
  const handleClose = () => {
    let id = itemData.id ? itemData.id : itemData.test_id
    selectedFile !== null ? 
    selectedFile.size < 2097152 ?
      uploadFile(accountType, accountId, selectedFile, 'doc',props.data.patientinfo.patient_id, props.data.appointment_id, id).then((result) => {
        console.log("Test upload result : ", result);
        result.status == 200 ? message.success(result.data) : message.error("Failed! API error")
        props.refreshList();
      })
      :
      message.error("File uploading error! File size is greater then 2MB")
      :
      message.error("File uploading error! No file selected")
    setShow(false);
  }

  const handleShow = () => { setShow(true); }
  const renderTest = () => {
    console.log("clicked")
    return (
      <Fragment>
        <tr>
          <td className='text-center'>
            <div className='MedicineTitle'>{itemData.name}</div>
          </td>

          <td className='text-center'>
            <span className='TestStatus' style={!!itemData.test_result ? { backgroundColor: "#61b15a" } : { backgroundColor: "#f0a500" }}
              onClick={() => { downloadTest() }}> {!!itemData.test_result ? 'Uploaded' : "Pending"} </span>
          </td>
          <td className='text-center'>
            <Button icon={!!itemData.test_result ? <GetApp /> : <PublishIcon />}
              onClick={() => !!itemData.test_result ? downloadTest() : handleShow()} />
          </td>

          <td className='text-center'>
            <Button varient='primary' className='DeleteBtn' onClick={() => { props.handleTest(itemData.name) }}> <DeleteForeverIcon /> </Button>
          </td>
          <td className='text-center'>
            <label className='TestPriceLabel'> Price: <b> {itemData.price_in_pkr} </b> PKR</label>
          </td>
          {uploadFileModal()}
        </tr>
      </Fragment>
    )
  }

  const uploadFileModal = () => {
    return (
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Test</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="card-body">
            <p className="card-text">Please upload test document</p>
            <input type="file" onChange={singleFileChangedHandler} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Upload
                  </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  return (

    renderTest()
  )
}

export default TestItem

TestItem.defaultProps = {
  refreshList: () => { }
}