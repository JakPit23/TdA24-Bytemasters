var name = "Jakub Pitner"

function App() {
    return React.createElement('h2', null, name)
}

ReactDOM.render(
    React.createElement(App),
    document.getElementById('list')
);