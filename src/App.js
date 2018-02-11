import React, { Component } from "react";
import { compose, withProps } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps";
import NodeGeocoder from "node-geocoder";

import fire from "./fire";
// import logo from "./logo.svg";
import "./App.css";

const options = {
  provider: "google",
  apiKey: "AIzaSyCO8zsBS9i2UPEs-xkcF4ygZMh_OlpCx4A",
};
const geocoder = NodeGeocoder(options);

const getColor = categoria => {
  if (categoria === "Movilidad")
    return `http://maps.google.com/mapfiles/ms/icons/red-dot.png`;
  else if (categoria === "Seguridad")
    return `http://maps.google.com/mapfiles/ms/icons/blue-dot.png`;
  else if (categoria === "Medio ambiente")
    return `http://maps.google.com/mapfiles/ms/icons/green-dot.png`;
};

const MyMapComponent = compose(
  withProps({
    googleMapURL:
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyDtnzn6GAYUxmhXzLmulUJ7hIaacpbgNUs&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap,
)(props => (
  <GoogleMap
    defaultZoom={11}
    defaultCenter={{
      lat: 20.704474963514798,
      lng: -103.38925581425428,
    }}
  >
    {props.isMarkerShown &&
      props.reportes.map(option => (
        <Marker
          key={option.key}
          position={{ lat: option.latitud, lng: option.longitud }}
          icon={getColor(option.categoria)}
          label={{
            text: option.likes.toString(),
            fontWeight: "400",
            color: "white",
            fontSize: "12px",
          }}
        />
      ))}
  </GoogleMap>
));

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usuario: {},
      Reporte: {},
      Evento: {},
      categoria: {},
      isMarkerShown: false,
      localidades: [],
    };
  }

  componentWillMount() {
    this.query("usuario");
    this.query("Reporte");
    this.query("Evento");
    this.query("categoria");
  }

  componentDidMount() {
    this.delayedShowMarker();
  }

  delayedShowMarker = () => {
    setTimeout(() => {
      this.setState({ isMarkerShown: true });
    }, 3000);
  };

  handleMarkerClick = () => {
    this.setState({ isMarkerShown: false });
    this.delayedShowMarker();
  };

  recastJSON = jsonObject => {
    const obj = [];
    for (var i in jsonObject) obj[i] = jsonObject[i];
    return obj;
  };

  query = refQuery => {
    const ref = fire.database().ref(refQuery);
    ref.on(
      "value",
      snapshot => {
        this.setState({ [refQuery]: this.snapshotToArray(snapshot) });
        // this.setState({ [refQuery]: snapshot.val() });
      },
      errorObject => {
        console.log("The read failed: " + errorObject.code);
      },
    );
  };

  snapshotToArray = snapshot => {
    let returnArr = [];

    snapshot.forEach(childSnapshot => {
      let item = childSnapshot.val();
      item.key = childSnapshot.key;
      returnArr.push(item);
    });

    return returnArr;
  };

  getColorTr = categoria => {
    if (categoria === "Movilidad") return "red";
    else if (categoria === "Seguridad") return "blue";
    else if (categoria === "Medio ambiente") return "green";
  };

  // getLocation = (lat, lon) => {
  //   geocoder
  //     .reverse({ lat, lon })
  //     .then(res => {
  //       console.log(res[0].extra.neighborhood);
  //       const { localidades } = this.state;
  //       localidades.push(res[0].extra.neighborhood);
  //       this.setState({ localidades });
  //       return "";
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     });
  // };

  render() {
    const { Reporte, Evento, categoria } = this.state;

    // if (Object.keys(Reporte).length !== 0) {
    //   Reporte.map(option => {
    //     this.getLocation(option.latitud, option.longitud);
    //   });
    // }

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">S.E.R.V.I.C.E - SeedDevelopment</h1>
        </header>
        <div className="dashboard">
          <div className="grid-container">
            <div id="reportes" className="grid-item">
              <h1>Reportes</h1>
              <MyMapComponent
                isMarkerShown={this.state.isMarkerShown}
                onMarkerClick={this.handleMarkerClick}
                reportes={Reporte}
              />
              <table className="reportes-container">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Título</th>
                    <th>Likes</th>
                    {/* <th>Localidad</th> */}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(Reporte).length !== 0 &&
                    Reporte.map(option => (
                      <tr
                        key={option.key}
                        style={{ color: this.getColorTr(option.categoria) }}
                      >
                        <td>{option.autor}</td>
                        <td>{option.titulo}</td>
                        <td>{option.likes}</td>
                        {/* <td>
                          {this.getLocation(option.latitud, option.longitud)}
                        </td> */}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div id="zonas-riesgo" className="grid-item">
              <h1>Zonas de mayor riesgo</h1>
            </div>
            <div id="eventos" className="grid-item">
              <h1>Eventos</h1>
              <ul>
                {Object.keys(Evento).length !== 0 &&
                  Evento.map(option => (
                    <li key={option.key}>{option.nombre}</li>
                  ))}
              </ul>
            </div>
            <div id="categorias" className="grid-item">
              <h1>Categorías</h1>
              <ul>
                {Object.keys(categoria).length !== 0 &&
                  categoria.map(option => (
                    <li key={option.key} style={{ color: option.color }}>
                      {option.nombre}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
