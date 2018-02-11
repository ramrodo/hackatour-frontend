import React, { Component } from "react";
import { compose, withProps } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps";
// import NodeGeocoder from "node-geocoder";

import fire from "./fire";
// import logo from "./logo.svg";
import "./App.css";

// const options = {
//   provider: "google",
//   apiKey: "AIzaSyCO8zsBS9i2UPEs-xkcF4ygZMh_OlpCx4A",
// };
// const geocoder = NodeGeocoder(options);

const getColor = categoria => {
  console.log("categoria", categoria);
  if (categoria === "Movilidad")
    return `http://maps.google.com/mapfiles/ms/icons/red-dot.png`;
  else if (categoria === "Seguridad")
    return `http://maps.google.com/mapfiles/ms/icons/blue-dot.png`;
  else if (categoria === "Medio ambiente")
    return `http://maps.google.com/mapfiles/ms/icons/green-dot.png`;
  else return `http://maps.google.com/mapfiles/ms/icons/purple-dot.png`;
};

const MyMapComponent = compose(
  withProps({
    googleMapURL:
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyDtnzn6GAYUxmhXzLmulUJ7hIaacpbgNUs&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: (
      <div
        style={{
          height: `400px`,
          width: `80%`,
          margin: `auto`,
          display: `inline-block`,
        }}
      />
    ),
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap,
)(props => (
  <GoogleMap
    id="map"
    defaultZoom={12}
    defaultCenter={{
      lat: 20.675548,
      lng: -103.3421187,
    }}
  >
    {props.isMarkerShown &&
      props.reportes.concat(props.eventos).map(option => {
        if (option.categoria === "Medio ambiente" && !props.showAmbiente) {
          return null;
        } else if (option.categoria === "Seguridad" && !props.showSeguridad) {
          return null;
        } else if (option.categoria === "Movilidad" && !props.showMovilidad) {
          return null;
        } else {
          return (
            <Marker
              key={option.key}
              position={{ lat: option.latitud, lng: option.longitud }}
              icon={getColor(option.nombre || option.categoria)}
              label={{
                text: option.likes ? option.likes.toString() : ".",
                fontWeight: "400",
                color: "white",
                fontSize: "12px",
              }}
            />
          );
        }
      })}
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
      showMovilidad: true,
      showSeguridad: true,
      showAmbiente: true,
      eventName: "",
      eventCategory: "Movilidad",
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
      // console.log("item", item);
      if (typeof item === "object") {
        item.key = childSnapshot.key;
        returnArr.push(item);
      }
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

  show = categoria => {
    if (categoria === "Movilidad") {
      return this.state.showMovilidad;
    } else if (categoria === "Seguridad") {
      return this.state.showSeguridad;
    } else if (categoria === "Medio ambiente") {
      return this.state.showAmbiente;
    }
  };

  onChangeCheckbox = categoria => {
    if (categoria === "Movilidad") {
      this.setState({ showMovilidad: !this.state.showMovilidad });
    } else if (categoria === "Seguridad") {
      this.setState({ showSeguridad: !this.state.showSeguridad });
    } else if (categoria === "Medio ambiente") {
      this.setState({ showAmbiente: !this.state.showAmbiente });
    }
  };

  handleSubmit = e => {
    e.preventDefault();

    const { eventName, eventCategory } = this.state;

    const ref = fire.database().ref();
    const eventsRef = ref.child("Evento");
    eventsRef.push({
      nombre: eventName,
      categoria: eventCategory,
    });
  };

  handleChangeSelect = event => {
    this.setState({ eventCategory: event.target.value });
  };

  onChangeEventName = eventName => {
    this.setState({ eventName: eventName.target.value });
  };

  render() {
    const {
      Reporte,
      Evento,
      categoria,
      showMovilidad,
      showSeguridad,
      showAmbiente,
      eventCategory,
    } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">S.E.R.V.I.C.E - SeedDevelopment</h1>
          <h2>Reto iTexico</h2>
        </header>
        <div className="dashboard">
          <div className="grid-container">
            <div id="reportes" className="grid-item header">
              <h1>Reportes</h1>
              <MyMapComponent
                isMarkerShown={this.state.isMarkerShown}
                onMarkerClick={this.handleMarkerClick}
                reportes={Reporte}
                eventos={Evento}
                showMovilidad={showMovilidad}
                showSeguridad={showSeguridad}
                showAmbiente={showAmbiente}
              />

              <div id="categorias">
                <h4>Categorías</h4>
                {Object.keys(categoria).length !== 0 &&
                  categoria.map(option => (
                    <div
                      key={option.key}
                      style={{ color: this.getColorTr(option.nombre) }}
                    >
                      <input
                        type="checkbox"
                        name="categoria"
                        className="checkbox"
                        onChange={() => this.onChangeCheckbox(option.nombre)}
                        checked={this.show(option.nombre)}
                      />
                      {option.nombre}
                    </div>
                  ))}
              </div>

              <table id="table-reportes">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Título</th>
                    <th>Descripción</th>
                    <th>Likes</th>
                    {/* <th>Localidad</th> */}
                  </tr>
                </thead>
                <tbody id="tbody">
                  {Object.keys(Reporte).length !== 0 &&
                    Reporte.map(option => {
                      if (
                        option.categoria === "Medio ambiente" &&
                        !showAmbiente
                      ) {
                        return null;
                      } else if (
                        option.categoria === "Seguridad" &&
                        !showSeguridad
                      ) {
                        return null;
                      } else if (
                        option.categoria === "Movilidad" &&
                        !showMovilidad
                      ) {
                        return null;
                      } else {
                        return (
                          <tr
                            key={option.key}
                            style={{ color: this.getColorTr(option.categoria) }}
                            className={option.likes >= 5 ? "flashit" : ""}
                          >
                            <td>{option.autor}</td>
                            <td>{option.titulo}</td>
                            <td>{option.descripcion}</td>
                            <td>{option.likes}</td>
                            {/* <td>
                            {this.getLocation(option.latitud, option.longitud)}
                          </td> */}
                          </tr>
                        );
                      }
                    })}
                </tbody>
              </table>
            </div>

            <div id="eventos" className="grid-item main">
              <h1>Eventos</h1>
              <ul>
                {Object.keys(Evento).length !== 0 &&
                  Evento.map(option => (
                    <li
                      key={option.key}
                      style={{ color: this.getColorTr(option.categoria) }}
                    >
                      {option.nombre}
                    </li>
                  ))}
              </ul>
            </div>

            <div id="registro-eventos" className="grid-item right">
              <h1>Añadir Evento</h1>
              <form onSubmit={this.handleSubmit}>
                <label className="label">
                  Name:
                  <input
                    onChange={this.onChangeEventName}
                    type="text"
                    name="name"
                  />
                </label>
                <label className="label">
                  Categoría:
                  <select
                    value={eventCategory}
                    onChange={this.handleChangeSelect}
                  >
                    <option defaultValue value="Movilidad">
                      Movilidad
                    </option>
                    <option value="Seguridad">Seguridad</option>
                    <option value="Medio ambiente">Medio ambiente</option>
                  </select>
                </label>
                <input id="submitEvent" type="submit" value="Crear" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
