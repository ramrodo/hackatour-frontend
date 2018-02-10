import firebase from "firebase";
import config from "./config";
var configE = config;
var fire = firebase.initializeApp(configE);
export default fire;
