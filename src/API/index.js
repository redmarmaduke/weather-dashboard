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
            if (response.cod && response.cod !== 200) {
                console.log("COD!!!")
                return {}
            }            
            return new Promise((resolve) => resolve({
                city: response.name,
                date: moment(parseInt(response.dt) * 1000).format("M/D/YYYY"),
                temperature: response.main.temp,
                humidity: response.main.humidity,
                wind_speed: response.wind.speed,
                icon_url: "https://openweathermap.org/img/wn/" +
                    response.weather[0].icon + "@2x.png",
                latitude: response.coord.lat,
                longitude: response.coord.lon
            }))
        });
    },
    getUVI: function (latitude, longitude) {
        return get({ lat: latitude, lon: longitude }, "uvi").then((response) =>
            new Promise((resolve) => resolve({ uv_index: response.value }))
        );
    },
    getForecast: function (latitude, longitude) {
        return get({ lat: latitude, lon: longitude, exclude: "minutely,hourly,current,alerts" }, "onecall").then((response) =>
            new Promise((resolve) => resolve({
                forecast: response.daily.slice(1, 6).map((value, i) => {
                    return {
                        city: response.name,
                        date: moment(parseInt(response.daily[i].dt) * 1000).format("M/D/YYYY"),
                        icon_url:
                            "https://openweathermap.org/img/wn/" +
                            response.daily[i].weather[0].icon +
                            "@2x.png",
                        temperature: response.daily[i].temp.day,
                        humidity: response.daily[i].humidity,
                    }
                })
            }))
        );
    }
};

export default obj;