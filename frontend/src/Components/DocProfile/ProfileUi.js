import React, { Fragment, useContext } from 'react'
import Avatar from '@material-ui/core/Avatar';
import '../../Styles/DocProfile.css';
import { Divider, Empty } from 'antd';
import { getDateOfBirth } from '../../Hooks/TimeHandling'
import SectionLoading from '../Loading/SectionLoading';
import { GlobalContext } from '../../Context/GlobalState';

const ProfileUi = (props) => {
    console.log("edit data is ", props.data, props.status)
    const { accountType } = useContext(GlobalContext)
    // const qualificationData = !!props.data.qualification ? props.data.qualification : []
    console.log("My User Data is ", props.image)
    const image = props.image;
    return (
        <Fragment>
            {
                props.load ?
                    <SectionLoading />
                    :
                    <div className='InfoSection'>
                        {props.load ?
                            <div style={{ display: 'flex', flexDirection: 'row', marginTop: 50 }}>
                                <div className='InfoImg'>
                                    <Avatar src={image} className='' > </Avatar> 
                                </div>
                                <div className='DocInfo'>
                                    <h6 className='InfoName'> {props.data.name ? props.data.name : 'Enter your name'} </h6>
                                    <label className='LabelInfo'> {props.data.specialization ? props.data.specialization : 'Enter your specialization'} </label>
                                    <br />
                                    <label className='LabelInfo'>
                                        {getDateOfBirth(props.data.dob)} years ( {props.data.gender ? props.data.gender : 'Select gender'} ) </label>
                                </div>
                            </div>
                            :
                            accountType === "nurses" ? <div style={{ display: 'flex', flexDirection: 'row', marginTop: 30 }}>
                                <div className='InfoImg'>
                                    <Avatar src={image} className='' />
                                </div>
                                <div className='DocInfo'>
                                    <h6 className='InfoName'>{props.data.name ? props.data.name : 'Enter your name'}</h6>
                                    <label className='LabelInfo'> {props.data.specialization ? props.data.specialization : 'Enter your specialization'} </label>
                                    <br />
                                    <label className='LabelInfo'>
                                        {getDateOfBirth(props.data.dob)} years ( {props.data.gender ? props.data.gender : 'Select gender'} ) </label>
                                </div>
                            </div>

                            :

                            accountType === "fd" ? <div style={{ display: 'flex', flexDirection: 'row', marginTop: 30 }}>
                                <div className='InfoImg'>
                                    <Avatar src={image} className='' />
                                </div>
                                <div className='DocInfo'>
                                    <h6 className='InfoName'> {props.data.name ? props.data.name : 'Enter your name'} </h6>
                                    <label className='LabelInfo'> {props.data.specialization ? props.data.specialization : 'Enter your specialization'} </label>
                                    <br />
                                    <label className='LabelInfo'>
                                        {getDateOfBirth(props.data.dob)} years ( {props.data.gender ? props.data.gender : 'Select gender'} ) </label>
                                </div>
                            </div>
                            :
                            accountType === "pa" ? <div style={{ display: 'flex', flexDirection: 'row', marginTop: 30 }}>
                                <div className='InfoImg'>
                                    <Avatar src={image} className='' />
                                </div>
                                <div className='DocInfo'>
                                    <h6 className='InfoName'>{props.data.name ? props.data.name : 'Enter your name'} </h6>
                                    <label className='LabelInfo'> {props.data.specialization ? props.data.specialization : 'Enter your specialization'} </label>
                                    <br />
                                    <label className='LabelInfo'>
                                        {getDateOfBirth(props.data.dob)} years ( {props.data.gender ? props.data.gender : 'Select gender'} ) </label>
                                </div>
                            </div>
                            :
                            accountType === "doctors" ? <div style={{ display: 'flex', flexDirection: 'row', marginTop: 30 }}>
                                <div className='InfoImg'>
                                    <Avatar src={image} className='' />
                                </div>
                                <div className='DocInfo'>
                                    <h6 className='InfoName'>{props.data.name ? props.data.name : 'Enter your name'} </h6>
                                    <label className='LabelInfo'> {props.data.specialization ? props.data.specialization : 'Enter your specialization'} </label>
                                    <br />
                                    <label className='LabelInfo'>
                                        {getDateOfBirth(props.data.dob)} years ( {props.data.gender ? props.data.gender : 'Select gender'} ) </label>
                                </div>
                            </div> : ""

                        }
                        
                                <h6 className='infoHead'> About </h6>
                                <Divider className='Dividers' />
                                <div className='infoQuote'>
                                    {!!props.data.about ? <q> {props.data.about} </q> : <div><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No Data'} /></div>}
                                </div>
                                
                                    {/* <Fragment>
                                        <Divider className='Dividers' />
                                        <h6 className='infoHead'> Qualification </h6>
                                        <div className='CatsDiv'>
                                            {!!qualificationData && qualificationData.length !== 0 ? renderQualification() : <div><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No Qualification Added'} /></div>}
                                        </div>
                                    </Fragment> */}
                                
                    </div>
            }
        </Fragment>
    )
}


export default ProfileUi

ProfileUi.defaultProps = {
    about: {
        about: "",
        appointment_type: "",
        dob: "",
        gender: "",
        image: "",
        name: "",
        specialization: ""
    }
}