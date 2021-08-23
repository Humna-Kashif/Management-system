import React from "react"
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { getDatetoSet } from '../Hooks/TimeHandling'

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);
// data.vital_current[0].current_value
const VitalsList = (props) => {
  const data = props.itemData;
  console.log('Table data for vital', props.itemData)

  const normalRange = props.range;
  return (
    <StyledTableRow >
      <StyledTableCell align="center">{!!data.current_value ? data.current_value : "-"}</StyledTableCell>
      <StyledTableCell align="center">{getDatetoSet(data.date_time)}</StyledTableCell>
      <StyledTableCell align="center">{!!normalRange ? normalRange : "-"}</StyledTableCell>
    </StyledTableRow>
  )
}
export default VitalsList