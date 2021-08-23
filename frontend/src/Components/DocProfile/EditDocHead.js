import React, { useEffect, useState, Fragment, useContext} from "react";
import { useLocation } from "react-router-dom";
import { Divider,DatePicker,Input} from 'antd';
import { editAboutInfoAPI } from "../../Hooks/API";
import { GlobalContext } from "../../Context/GlobalState";
import moment from 'moment'
const {TextArea} = Input;

const EditDocHead=(props)=>{
  console.log('Editttttt data is', props.data)
  const [age, setAge] = useState(props.data.dob)
  const contactId = useLocation().state.contactId;
  const {info,accountId,accountType,staffDocId,elementDocId} = useContext(GlobalContext)
  console.log("Edit contact id", contactId,"doc", elementDocId)
  const dateFormat = 'YYYY-MM-DD';
  const saveHandler= props.saveHandler;
    const [aboutVal, setAboutVal] = useState({
      name: "",
      dob: "",
      gender: "",
      specilization: "",
      about: ""
    });
    const [oneTime, setOneTime] = useState(true);

    const ageChanged=(date,dateString)=>{
      console.log("check date format", date,dateString);
       setStartDate(dateString); 
    }
    useEffect(() => {
      if(props.saveHandler && oneTime){
        handleSaveBtn();
        setOneTime(false);
      }else{
        const timer = setTimeout(() => {
          setAboutVal({
            name: props.data.name,
            dob:age,
            gender: props.data.gender,
            specialization: props.data.specialization,
            about: props.data.about
          });
        }, 200);
        return () => clearTimeout(timer);
      }
    }, [props.data, props.saveHandler]);

    const [startDate, setStartDate] = useState(aboutVal.dob);
    const AboutSectionRow = (props) => {
        const aboutVal = props.value;
        const editing = props.editing;
        const editField = props.input;
    
        return (
            <Fragment> 
              {editing ? editField : aboutVal}
            </Fragment>
        );
      };
    
      const GenderRadioButton = ({ value }) => {
        return (
          <input
            style={{ width: 20 }}
            type="radio"
            value={value}
            name="gender"
            defaultChecked={aboutVal.gender === value}
          />
        );
      };

      const renderEditingItem = () => {
        return (
          <div>
            <Input
                  className='EditInput'
                  placeholder="Enter Your Name ..."
                  type="text"
                  value={aboutVal.name}
                  noValidate
                  onChange={(e) => {
                    setAboutVal({ ...aboutVal, name: e.target.value });
                    console.log("changes", e.target.value);
                  }}
                />
              <DatePicker style={{width:'100%',marginTop:10}} 
              className='EditInput mtt-10'
              defaultValue={moment(age,'YYYY-MM-DD')} 
              onChange={(date,dateString) => {
                setAge(dateString)
                setStartDate(date);
                setAboutVal({ ...aboutVal, dob: dateString });
                console.log("check date format", date,dateString);}} format={'YYYY-MM-DD'}
              />
                <Input
                style={{marginTop:10}}
                className='EditInput mtt-10'
                  placeholder="Enter Your specialization ..."
                  type="text"
                  value={aboutVal.specialization}
                  noValidate
                  onChange={(e) => {
                    setAboutVal({ ...aboutVal, specialization: e.target.value });
                    console.log("changes", aboutVal);
                  }}
                />
            <br/>
            <br/>
    
    <AboutSectionRow
     className='mtt-10'
              label={"Gender:"}
              editing={true}
              input={
                <div
                value={aboutVal}
                  onChange={(e) =>
                    setAboutVal({ ...aboutVal, gender: e.target.value })
                  }
                  className={"input__about"}
                >
                  <GenderRadioButton value={"Male"} /> <span>Male</span>
                  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                  <GenderRadioButton value={"Female"} /><span> Female </span>
                  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                  <GenderRadioButton value={"Other"} /> <span> Other </span>
                </div>
              }
            />
     <Divider className='Dividers'/>
     <h6 className='EditHead '> About </h6>
            <TextArea
            className='Edit-text-area '
            placeholder="Enter About Yourself ..."
            // type={text}
            value={aboutVal.about}
            noValidate
            rows={3}
            onChange={(e) => {
              setAboutVal({ ...aboutVal, about: e.target.value });
              console.log("changes", aboutVal);
            }}/>
          </div>
        );
      };
      const formatDate = (date) => {
      if(date!==null){
        const formattedDate =
          date.getFullYear().toString() + 
          "-" +
          (date.getMonth() + 1).toString() + 
          "-" +
          date.getDate().toString();
        console.log("New date:", formattedDate);
      
        setAboutVal({ ...aboutVal, dob: formattedDate});
      }
      else{
        setAboutVal({ ...aboutVal, dob: ''});
      }
      };

    const handleSaveBtn=() =>{
      let accountID = accountType === 'doctors' ?  elementDocId : accountId
      console.log("data to be edited ",accountType,
      accountID,
      aboutVal.name,
      aboutVal.gender,
      aboutVal.dob,
      aboutVal.specialization,
      aboutVal.about)
        editAboutInfoAPI(
          accountType,
          accountID,
          aboutVal.name,
          aboutVal.gender,
          aboutVal.dob,
          aboutVal.specialization,
          aboutVal.about
        ).then((result) => {
          props.callback();
          console.log("edit data result is ", result);
          props.saveCallBack(false);
          console.log("edit data is about api ");
        });
    }
      return (
        <div className='EditSectionDiv'> 
          {renderEditingItem()}
        </div>
      );
    };


export default EditDocHead

EditDocHead.defaultProps = {
  saveHandler: false,
  saveCallBack: () => {},
    aboutData: {
      name: "Doctor Name",
      specialization: "Doctor Specialization",
      gender: "Other",
      dob: "1992/10/03",
      about: "about"
    },
  };