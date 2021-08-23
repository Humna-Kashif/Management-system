import Color from "color";

export default {
  background: "#ebecee",
  baseColor: "#f5f6f8",
  // baseColor: Color("#f5f6f8").lighten(0.01),
  baseShadow: Color("#fff").darken(0.1),

  baseBg1: Color("#ebecee").darken(0.01),
  baseBg2: Color("#ebecee").darken(0.1),

  baseColorDarker: Color("#f5f6f8").darken(0.01),
  baseColorDarker2: Color("#f5f6f8").darken(0.05),

  white: "#ffffff",
  black: "#000000",
  gray: "#808080",

  titleColor: "#000000F0",  //black95
  headingColor: "#000000CC", //black80
  contentColor: "#00000099", // black60
  labelColor: "#0000006E",  //black45


  primaryColor: "#e0004d",
  primaryLight: Color("#e0004d").lighten(0.2),
  primaryLight2: "#ffffffc1",
  primaryDark: Color("#e0004d").darken(0.03),
  primaryDark2: Color("#e0004d").darken(0.2),

  /* Appointment Status Color Palette */
  // Past Palette

  attendedPast: "#00a0ad",
  cancelledPast: "#6c6c6c",
  missedPast: "#9c1b1b",
  rescheduledPast: "#1c5bab",
  otherPast: "#f0f0f0",

  // Current / Future Palete

  attended: "#00a0ad",
  cancelled: "#6c6c6c",
  remaining: "#1b9c31",
  checkedin: "#e04d00",
  inprogress: "#c0b812",
  rescheduled: "#1c5bab",
  waiting: "#40a9ff",

  noStatusData: "#f0f0f0",

};


// if (appointment === 'attended') {
//   return "#00a0ad"
// } else if (appointment === 'remaining') {
//   return '#1b9c31'
// } else if (appointment === 'checked in') {
//   return "#e04d00"
// } else if (appointment === 'cancelled') {
//   return '#6c6c6c'
// } else if (appointment === 'waiting') {
//   return '#40a9ff'
// } else if (appointment === 'inprogress') {
//   return '#c0b812'
// } else if (appointment === 'missed') {
//   return '#9c1b1b'
// } else if (appointment === 'rescheduled') {
//   return '#1c5bab'
// } else if (appointment === 'No Data Yet') {
//   return '#f0f0f0'
// } else
//   return '#844D9E'