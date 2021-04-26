import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import API from './API';

import Forecast from './components/Forecast';
import Today from './components/Today';
import SearchInput from './components/SearchInput';
import History from './components/History';

function App() {
    var [forecast, setForecast] = useState(Array(5).fill({}));
    var [today, setToday] = useState({});
    var [history, setHistory] = useState([]);
    var [location, setLocation] = useState(undefined);

    useEffect(() => {
        if (location === undefined) {
            var local = localStorage.getItem("locations");
            if (local) {
              local = JSON.parse(local);
              //setLocation(local[0]);
              setHistory(local);
            }          
            else if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(function (position) {
                search({
                  lat: position.coords.latitude,
                  lon: position.coords.longitude,
                });
              });
            } else {
              search({ q: "San+Jose" });
            }            
        }
    },[]);

    useEffect(() => {
        search({q: location });
    }, [location]);

    useEffect(() => {
        if (history.length) {
            search({q: history[0]});
        }
    }, [history]);

    function search(queryObject) {
        console.log(queryObject);
        return API.getWeather(queryObject).then((response) => {
            if (!response.latitude || !response.longitude) {
                throw Error("Err?");
            }

            API.getForecast(response.latitude, response.longitude).then(({ forecast }) => {
                setForecast(forecast);
            });

            return API.getUVI(response.latitude, response.longitude).then((responseUVI) => {
                const weather = { ...today, ...response, ...responseUVI };
                setToday(weather);
                return weather.city;
            });
        }).then((city) => {
            if (history.indexOf(city) === -1) {
                let temp = [city, ...history];
                localStorage.setItem("locations",JSON.stringify(temp));
                setHistory(temp);
            }
        });
    }

    return (
        <div>
            <nav className="navbar bg-dark justify-content-center">
                <h1 className="navbar-brand text-white display-5" style={{ fontSize: "250%" }}>Weather Dashboard</h1>
            </nav>
            <div className="row d-flex flex-column flex-md-row">
                <div className="col-auto col-md-3 pl-4 pb-2 h-auto search">
                    <div className="pb-4">
                        <h5><label className="display-5">Search for a City:</label></h5>
                        <SearchInput setState={setLocation} />
                    </div>
                    <History history={history} setHistory={setHistory} />
                </div>
                <div className="col-auto col-md-9 p-0">
                    <div className="container-fluid m-2 p-2">
                        <div className="jumbotron jumbotron-fluid px-4 border bg-white">
                            <Today {...today} />
                            <Forecast forecasts={forecast} />
                        </div>
                        <div>
                            <a href="https://icons8.com/icon/7695/search">Search icon by Icons8</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
