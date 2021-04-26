import React from 'react';

export default function ForecastElement(props) {
    return (
        <div className="card mr-4 mb-3 bg-primary text-white">
            <div className="card-body">
                <h5 className="card-title">{props.date || "--/--/----"}</h5>
                <img src={props.icon_url} width={35} alt={props.icon_url}></img>
                <p className="card-text">Temp: {props.temperature || "--.--"} &deg;F</p>
                <p className="card-text">Humidity: {props.humidity || "--"}%</p>
            </div>
        </div>
    );
}