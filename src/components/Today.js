import React from 'react';

export default function Today(props) {
    var backgroundColor;
    if (props.uv_index < 3) {
        backgroundColor = "forestgreen";
    } else if (props.uv_index < 5) {
        backgroundColor = "gold";
    } else if (props.uv_index < 7) {
        backgroundColor = "orangered";
    } else if (props.uv_index < 10) {
        backgroundColor = "red";
    } else {
        backgroundColor = "slateblue";
    }

    return (
        <div className="container-fluid">
            <div className="display-5 d-flex align-items-center">
                <h2 id="today_city_date" className="mb-1">{props.city || "--------"} ({props.date || "--/--/----"})</h2>
                <img src={props.icon_url} alt={props.icon_url} id="today_img"></img>
            </div>
            <p id="today_temperature">Temperature: {props.temperature || "--.--"} &deg;F</p>
            <p id="today_humidity">Humidity: {props.humidity || "--"}%</p>
            <p id="today_wind_speed">Wind Speed: {props.wind_speed || "-.-"} MPH</p>
            <div>
                <span style={{ display: "inline-block" }}>UV Index: </span>
                <span id="today_uv_index" style={{ backgroundColor, color: "#000" }} disabled>{props.uv_index || "--.-"}</span>
            </div>
        </div>
    );
}