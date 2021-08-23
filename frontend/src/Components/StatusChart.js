import React, { useState, useEffect, useCallback } from 'react';
import { Pie } from '@ant-design/charts';
import '../Styles/Stats.css';
import { Fragment } from 'react';
import Colors from '../Styles/Colors';


const StatusChart = (props) => {

  const [config, setConfig] = useState({
    appendPadding: 10,
    data: [],
    angleField: 'value',
    colorField: 'appointment',
    color: ({ appointment }) => {
      if (appointment === 'attended') {
        return Colors.attended
      } else if (appointment === 'remaining') {
        return Colors.remaining
      } else if (appointment === 'checked in') {
        return Colors.checkedin
      } else if (appointment === 'cancelled') {
        return Colors.cancelled
      } else if (appointment === 'waiting') {
        return Colors.waiting
      } else if (appointment === 'inprogress') {
        return Colors.inprogress
      } else if (appointment === 'missed') {
        return Colors.missedPast
      } else if (appointment === 'rescheduled') {
        return Colors.rescheduled
      } else if (appointment === 'No Data Yet') {
        return Colors.noStatusData
      } else
        return Colors.noStatusData
    },
    legend: false,
    radius: 0.9,
    animate: false,
    innerRadius: 0.6,
    meta: {
      value: {
        formatter: function formatter(v) {
          return ''.concat(v, '');
        },
      },
    },
    label: {
      type: 'inner',
      labelHeight: 28,
      offset: '-50%',
      autoRotate: false,
      content: '{value } ',
      style: {
        textAlign: 'center',
        fontSize: 12,
      },
    },
    interactions: [{ appointment: 'element-selected' }, { appointment: 'element-active' }],
    statistic: {
      title: false,
      content: {
        style: {
          textAlign: 'center',
        },
      },
    },
    pieStyle: function pieStyle(_ref) {

      var appointment = _ref.appointment;
      if (props.status === "past") {
        if (appointment === 'attended') {
          return { fill: Colors.attended };
        } else if (appointment === 'cancelled') {
          return { fill: Colors.cancelled };
        } else if (appointment === 'missed') {
          return { fill: Colors.missedPast };
        } else if (appointment === 'rescheduled') {
          return { fill: Colors.rescheduled };
        } else if (appointment === 'No Data Yet') {
          return { fill: Colors.noStatusData };
        } else
          return { fill: Colors.noStatusData };
      } else {
        if (appointment === 'attended') {
          return { fill: Colors.attended };
        } else if (appointment === 'remaining') {
          return { fill: Colors.remaining };
        } else if (appointment === 'checked in') {
          return { fill: Colors.checkedin };
        } else if (appointment === 'cancelled') {
          return { fill: Colors.cancelled };
        } else if (appointment === 'waiting') {
          return { fill: Colors.waiting };
        } else if (appointment === 'inprogress') {
          return { fill: Colors.inprogress };
        } else if (appointment === 'rescheduled') {
          return { fill: Colors.rescheduled };
        } else if (appointment === 'No Data Yet') {
          return { fill: Colors.noStatusData };
        } else
          return { fill: Colors.noStatusData };
      }

    }

  });

  const formatDataArray = useCallback(() => {
    let tempArray = []
    if (props.status === "past") {
      (props.completed !== 0) && tempArray.push({
        appointment: 'attended',
        value: props.completed,
      })
      props.cancelled !== 0 && tempArray.push({
        appointment: 'cancelled',
        value: props.cancelled
      })
      props.remaining !== 0 && tempArray.push({
        appointment: 'missed',
        value: props.remaining,
      })
      props.reschedule !== 0 && tempArray.push({
        appointment: 'rescheduled',
        value: props.reschedule,
      })
    } else {
      props.completed !== 0 && tempArray.push({
        appointment: 'attended',
        value: props.completed,
      })
      props.remaining !== 0 && tempArray.push({
        appointment: 'remaining',
        value: props.remaining,
      })
      props.waiting !== 0 && tempArray.push({
        appointment: 'checked in',
        value: props.waiting
      })
      props.cancelled !== 0 && tempArray.push({
        appointment: 'cancelled',
        value: props.cancelled
      })
      props.hold !== 0 && tempArray.push({
        appointment: 'waiting',
        value: props.hold
      })
      props.inprogress !== 0 && tempArray.push({
        appointment: 'inprogress',
        value: props.inprogress
      })
      props.reschedule !== 0 && tempArray.push({
        appointment: 'rescheduled',
        value: props.reschedule,
      })
    }

    if (tempArray.length === 0) {
      tempArray.push({
        appointment: "No Data Yet",
        value: 0
      })
    }

    console.log("Status Chart Value: Array", tempArray, tempArray.length)
    return tempArray
  }, [props.completed, props.remaining, props.waiting, props.cancelled, props.hold, props.inprogress, props.reschedule, props.status])

  useEffect(() => {
    console.log("Status Chart Value:", props.completed, props.remaining, props.waiting, props.cancelled, props.hold, props.inprogress, props.reschedule, props.status)
    setConfig(config => ({
      ...config, data: formatDataArray()
    }))
  },
    [props.completed, props.remaining, props.waiting, props.cancelled, props.hold, props.inprogress, props.reschedule, props.status, setConfig, formatDataArray])


  return (
    <Fragment>
      {formatDataArray().length !== 0 && <Pie {...config} />}
    </Fragment>

  );
}

export default StatusChart;

StatusChart.defaultProps = {
  status: "",
  completed: [],
  remaining: [],
  waiting: [],
  cancelled: [],
  hold: [],
  inprogress: [],
  reschedule: []
}