import React from 'react';
import ForecastElement from './ForecastElement';

export default function Forecast(props) {
    const forecasts = props.forecasts || Array(5).fill({});
    return (
        <div>
            <h2 className="display-5">5-Day Forecast:</h2>
            <div className="container d-flex flex-wrap justify-content-start align-items-start">
                {
                    props.forecasts.map((forecast,i) =>
                        <ForecastElement key={i} {...forecast}/>
                    )
                }
            </div>
        </div>
    );
}