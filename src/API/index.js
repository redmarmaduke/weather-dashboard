const moment = require('moment');

function get(queryArg, api) {
    let query = {
        units: "imperial",
        appid: "1ca7ce78e703503786e910c2c8760a17",
        ...queryArg
    };

    var settings = {
        mode: 'cors',
        method: "GET",
    };

    var url = `https://api.openweathermap.org/data/2.5/${api}?`;
    url += Object.entries(query)
        .map((a) => a[0].concat("=", a[1]))
        .join("&");

    return fetch(url, settings).then(resource => resource.json());
}

const obj = {
    getWeather: function (queryObject) {
        return get(queryObject, "weather").then((response) => {
            var weather = {};
            if (!response.cod || response.cod === 200) {
                var {
                    name: city,
                    dt,
                    main: {
                        temp: temperature,
                        humidity
                    },
                    wind: {
                        speed: wind_speed
                    },
                    weather: [{ icon }],
                    coord: {
                        lat: latitude,
                        lon: longitude
                    }
                } = response;

                weather = {
                    city,
                    date: moment(parseInt(dt) * 1000).format("M/D/YYYY"),
                    temperature,
                    humidity,
                    wind_speed,
                    icon_url: `https://openweathermap.org/img/wn/${icon}@2x.png`,
                    latitude,
                    longitude
                };
            }

            return new Promise((resolve) => resolve(weather))
        });
    },
    getUVI: function (latitude, longitude) {
        return get({ lat: latitude, lon: longitude }, "uvi").then(({ value : uv_index }) =>
            new Promise((resolve) => resolve({ uv_index }))
        );
    },
    getForecast: function (latitude, longitude) {
        return get({ lat: latitude, lon: longitude, exclude: "minutely,hourly,current,alerts" }, "onecall").then(({daily,name : city}) =>
            new Promise((resolve) => resolve({
                forecast: daily.slice(1, 6).map((day) => {
                    return {
                        city,
                        date: moment(parseInt(day.dt) * 1000).format("M/D/YYYY"),
                        icon_url:
                            `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`,
                        temperature: day.temp.day,
                        humidity: day.humidity,
                    }
                })
            }))
        );
    }
};

export default obj;