import React from "react"
import ReactDOM from "react-dom"

import * as $ from "jquery"
import Dexie from "dexie"

import "./bootstrap 4.1/css/bootstrap.min.css"
import "./css/custom.css"

class App extends React.Component {
    constructor(props){
        super(props);

        // Construct new indexedDB called 'react-db'
        const db = new Dexie("react-db");
        db.version(1).stores({
            mist: "id++"
        })

        this.state = ({
            arrayvar: [],
            arrayEnd: 0
        })

        this.handleAdd = this.handleAdd.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentWillMount(){
        // React somehow force me to call 'react-db' every time I have to use.
        const db = new Dexie("react-db");
        db.version(1).stores({
            mist: "id++"
        })
        db.mist.toArray().then(data => {
            data.map(task => {
                this.setState(prevState => ({
                    arrayvar: [...prevState.arrayvar, task]
                }))
                return this.state.arrayvar;
            });
        })
        db.mist.count().then(count => {
            this.setState({
                arrayEnd: count
            })
        });
    }

    async handleAdd(e){
        e.preventDefault();
        let data = ($("#input").val());

        // If input is blank, return invalid.
        if(data.trim() === ""){
            $("#input").addClass("is-invalid");
            return;
        } else if($("#input").hasClass("is-invalid")){
            $("#input").removeClass("is-invalid");
        }

        const db = new Dexie("react-db");
        db.version(1).stores({
            mist: "id++"
        })

        // Add data to react-db
        db.mist.put({
            data:data
        })

        // Create async function for using await.
        const pushArrayEnd = $.when().then(async () => {
            let arrayEnd;
            const pushStart = db.mist.count().then(count => {
                arrayEnd = count;
            });

            // Wait until arrayEnd is get.
            await pushStart;
            this.setState({
                arrayEnd: arrayEnd
            });
        })

        // Wait until this.state.arrayEnd is set.
        await pushArrayEnd;

        $.when().then(async () => {
            let data = [];
            const pushData = db.mist.toArray().then(arr => {
                data.push(arr);
            });
            await pushData;
            this.setState({
                arrayvar: []
            })
            data[0].map(task => {
                this.setState(prevState => ({
                    arrayvar: [...prevState.arrayvar, task]
                }));
                return this.state.arrayvar;
            });
        });        
    }

    handleDelete(e){
        let data = [],
        removeId = parseInt(e.target.getAttribute("value"), 10),
        index = parseInt(e.target.getAttribute("index"), 10),
        prevArr = [...this.state.arrayvar];

        const db = new Dexie("react-db");
        db.version(1).stores({
            mist: "id++"
        })

        // Remove Data from react-db
        db.mist.where("id").equals(removeId).delete();

        // Remove delete data from being display.
        $.when().then(async () => {
            const pushData = db.mist.toArray().then((arr,index) => {
                data.push(arr);
            });
            await pushData;

            let lastPartArr = prevArr.splice((index + 1),this.state.arrayEnd),
            firstPartArr = prevArr.splice(0,index),
            arr = firstPartArr.concat(lastPartArr);

            this.setState({
                arrayvar: arr
            })
        });
    }

    render(){
        return(
            <div>
                <div id="banner" className="jumbotron">
                    <h1>React Todo List</h1>
                    <h5>React + Dexie</h5>
                </div>
                <div className="container">
                    <form className="form-group">
                        <small>Objective</small>
                        <div className="input-group mb-3">
                            <input id="input" type="text" className="form-control" placeholder="Example: Create react app" />
                            <div className="input-group-append">
                                <button onClick={this.handleAdd} className="btn btn-primary">Add</button>
                            </div>
                        </div>
                    </form>

                    <div className="dropdown-divider"></div>
                    <ul id="data" className="list-group">
                        <small>Objective</small>
                        {
                            this.state.arrayvar.map((table,index) =>
                            <li className="list-group-item d-flex justify-content-between align-items-center" key={index} value={table.id}>
                                    {table.data}
                                    <span className="badge badge-danger badge-pill" onClick={this.handleDelete} value={table.id} index={index}>X</span>
                                </li>
                            )
                        }
                    </ul>
                </div>
                <a href="https://www.github.com/aomkirby123/react-dexie-todo-list" className="nav-link" target="_blank" rel="noopener noreferrer">View on Github</a>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById("root"));