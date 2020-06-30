var locations = [];

function updatePageCallback(obj) {
    $("#today_city_date").text(obj.city + " (" + obj.date + ")");
    $("#today_img").empty();
    var img = $("<img>");
    img.attr("src", obj.icon_url);
    $("#today_img").append(img);

    $("#today_img").attr("src", obj.icon_url);
    $("#today_temperature").html("Temperature: " + obj.temperature + " &deg;F");
    $("#today_humidity").text("Humidity: " + obj.humidity + "%");
    $("#today_wind_speed").text("Wind Speed: " + obj.wind_speed + " MPH");
    var uv_color;
    if (obj.uv_index < 3) {
        uv_color = "forestgreen";
    }
    else if (obj.uv_index < 5) {
        uv_color = "gold";
    }
    else if (obj.uv_index < 7) {
        uv_color = "orangered";
    }
    else if (obj.uv_index < 10) {
        uv_color = "red";
    }
    else {
        uv_color = "slateblue";
    }
    $("#today_uv_index").html("UV Index: <button class=\"btn\" style=\"background-color: " + uv_color + "; color: #efefef;\" disabled>" + obj.uv_index + "</button>");

    $(".forecast-item").children().each(function (index) {
        $(this).find(".forecast-date").text(obj.forecast[index].date);
        var forecastImage = $(this).find(".forecast-image");
        forecastImage.empty();
        var img = $("<img>");
        img.attr("src", obj.forecast[index].icon_url);
        img.attr("width", 35);
        forecastImage.append(img);
        $(this).find(".forecast-temperature").html("Temp: " + obj.forecast[index].temperature + " &deg;F");
        $(this).find(".forecast-humidity").text("Humidity: " + obj.forecast[index].temperature + "%");
    });
}

function main() {
    var local = localStorage.getItem("locations");
    if (local) {
        locations = JSON.parse(local);
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            getWeather({ lat: position.coords.latitude, lon: position.coords.longitude }, updatePageCallback);
        });
    }
    else {
        getWeather({ city: "San Jose" }, updatePageCallback);
    }
}

function addLocationToHistory(location) {
    if (location.length === 0) {
        return;
    }

    if (locations.includes(location)) {
        return;
    }

    locations.unshift(location);
    if (locations.length >= 8) {
        locations.pop();
    }

    localStorage.setItem("locations", JSON.stringify(locations));

    $("#location_history").empty();
    for (var location of locations) {
        var li = $("<li>");
        li.html("<li class=\"list-group-item\">" + location + "</li>");
        li.click(function(event) {
            updatePage({ city: $(event.target).text() });
        });
        $("#location_history").append(li);
    }
}

$("#submit_location").click(function (event) {
    var location = $("#input_location").val().trim();
    getWeather({ city: location }, updatePageCallback);
});

function getAjaxSettings(queryArg, api) {
    let query = {
        //callback: "test",
        id: "2172797",
        units: "imperial"
    };

    switch(api) {
        case "weather":
            url = "https://community-open-weather-map.p.rapidapi.com/weather?";
            break;
        case "history":
            url = "https://community-open-weather-map.p.rapidapi.com/onecall/timemachine?";
            break;
        case "forecast":
            url = "https://community-open-weather-map.p.rapidapi.com/forecast?";
            break;
        default:
            console.log("ERROR!");
            return;
    }
 
    query = { ...query, ...queryArg };

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": url,
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "community-open-weather-map.p.rapidapi.com",
            "x-rapidapi-key": "0a752c614cmsh11c31506d6a7ef8p1a4272jsn3a1851718b07"
        }
    };

    settings.url = settings.url + Object.entries(query).map(a => a[0].concat("=", a[1])).join("&");

    console.log("getAjaxSettings: ",settings);
    return settings;
}


/*
 * getWeather 
 * 
 * @param{string} query 
 * @param{function} callback takes an argument of Object in the following format
 *  {
 *    date: ?,
 *    icon_url: ?,
 *    temperature: ?,
 *    humidity: ?,
 *    wind_speed: ?,
 *    uv_index: ?,
 *    forecast: [
 *      {
 *          date: ?,
 *          icon_url: ?,
 *          temperature: ?,
 *          humidity: ?
 *      },
 *      ...
 *    ]
 *  }
 *  and is executed asynchonously after the data is retrieved.
 */

 function getWeather(query, callback) {
    var query;

    var obj = {
        city: "",
        date: "",
        icon_url: "",
        temperature: "",
        humidity: "",
        wind_speed: "",
        uv_index: ""
    };

    $.ajax(getAjaxSettings(query,"weather")).then(function (response) {
        console.log("weather: ",response);
        obj.city = response.name;
        obj.date = moment(parseInt(response.dt) * 1000).format("M/D/YYYY");
        obj.icon_url = "";
        obj.temperature = response.main.temp;
        obj.humidity = response.main.humidity;
        obj.wind_speed = response.wind.speed;
        obj.icon_url = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";


        query = {
            lat: response.coord.lat,
            lon: response.coord.lon,
            //start: response.dt,
            //end: response.dt //
            dt: response.dt
        };

        $.ajax(getAjaxSettings({...query, cnt: 40 },"history")).then(function (response) {
            console.log("history: ",response);

            obj.uv_index = response.current.uvi;

            obj.forecast = [];

            // remove dt from query
            delete query.dt;

            /*
             * getForecast 
             * 
             *  forecast {
             *    date: ?,
             *    icon_url: ?,
             *    temperature: ?,
             *    humidity: ?,
             *  }
             */
            let settings = getAjaxSettings({...query, cnt: 40},"forecast"); 
            let then_fn = function (response) {
                console.log("forecast: ",response);

                /* 
                 * ajax gets 8 3-hr segments per day, first segment at 4 is mid-day, 
                 * +=8 for the next 3 hour segment @ the next mid-day and so on
                 */
                for (var i = 4; i < 40; i += 8) {
                    console.log(response.list[i].main);
                    obj.forecast.push({
                        city: response.name,
                        date: moment(parseInt(response.list[i].dt) * 1000).format("M/D/YYYY"),
                        icon_url: "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png",
                        temperature: response.list[i].main.temp,
                        humidity: response.list[i].main.humidity
                    });
                }

                addLocationToHistory(obj.city);
                callback(obj);
            };
            let fail_fn = function (data) {
                console.log("data: ", data);
            };

            $.ajax(settings).then(then_fn).fail(fail_fn);
        });
    });
}

main();