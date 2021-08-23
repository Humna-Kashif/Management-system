import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
      maxWidth: '36ch',
      backgroundColor: theme.palette.background.paper,
    },
    inline: {
      display: 'inline',
    },
  }));

const PatientList = (props) =>{
    const patient_data = props.locData;
    const classes = useStyles();
    return(
        <div>
            <List className={classes.root}>
            <ListItem alignItems="flex-start">
                <ListItemAvatar>
                <Avatar alt="Remy Sharp"/>
                </ListItemAvatar>
                <ListItemText
                primary={patient_data.Name}
                secondary={
                    <React.Fragment>
                    <p>Appointment: {patient_data.Appoitment}</p>
                    </React.Fragment>
                }
                />
            </ListItem>
            <Divider/>
            </List>
        </div>
    )
}
export default PatientList;

PatientList.defaultProps = {
    locData : 
    {
      Name: 'Farid',
      Appoitment:'28 Aug, 2020. 2:00 PM'
    }
  
  }