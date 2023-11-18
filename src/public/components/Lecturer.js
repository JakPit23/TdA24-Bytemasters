// Lecturer is profile of each lecturer
// Props: Title before, Full Name, Title After
const Lecturer = (props) => {
    return React.createElement("h2", null, props.firstTitle + " " + props.fullName + " " + props.secondTitle);
}