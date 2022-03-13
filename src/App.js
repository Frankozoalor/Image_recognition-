import React from "react";
import './App.css';
import Navigation from "./Components/Navigation/Navigation";
import ImageLinkForm from "./Components/ImageLinkForm/ImageLinkForm";
import Logo from "./Components/Logo/logo";
import Rank from "./Components/Rank/Rank";
import FaceRecognition from "./Components/FaceRecognition/FaceRecognition";
import Clarifai from 'clarifai';
import SignIn from "./Components/SignIn/SignIn";
import Register from "./Components/Register/Register";


 const app = new Clarifai.App({
  apiKey: "aa8cb795fdc642269ddf236827d95258"});
    
  const initialState = {
    input: "",
    imageUrl: "",
    box: {},
    route: 'sign in',
    isSignedin: false, 
    user: {
      id : '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
  }


class App extends React.Component{
  constructor(){
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState( {user:{
        id : data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  componentDidMount(){
    //fetch('https://intense-meadow-35881.herokuapp.com/').then(response => response.json()).then(console.log)
  }

  calculateFaceLocation = (data) => {
    const clarifaiface = data.output[0].data.region[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width,height);
    return {
      leftCol: clarifaiface.left_col * width,
      topRow: clarifaiface.top_row * height,
      rightCol: width - (clarifaiface.Right_col * width),
      bottomRow: height- (clarifaiface.bottomRow * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
     this.setState({input: event.target.value});
  }


  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models
      .predict(
        Clarifai.FACE_DETECTION_MODEL,
        this.state.input)
      .then(response => {
        if (response) {
          fetch('https://intense-meadow-35881.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })
            .then(console.log)

        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }


  onRouteChange = (route) => {
    if(route === 'sign in'){
      this.setState(initialState)
    }
    else if(route === 'home'){
      this.setState({isSignedin: true})
    }
    this.setState({route: route})
  }

  render() {
    const {isSignedin, imageUrl, route,box} = this.state 
    return(
      <div className="App">

      <Navigation isSignedin={isSignedin} onRouteChange={this.onRouteChange}/>
      {route === 'home'?
      <div>
      <Logo/>
      <Rank name = {this.state.user.name} entries = {this.state.user.entries}/>
      <ImageLinkForm 
      onInputChange ={this.onInputChange} 
      onButtonSubmit = {this.onButtonSubmit}/>
      <FaceRecognition box = {box} imageUrl={imageUrl}/>
      </div>
      :(
        route === 'sign in'?
        <SignIn   loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
        :<Register loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
      )
      }
      </div>
    )
      }
    }
        
export default App;
