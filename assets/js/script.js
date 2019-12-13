if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        updatePagePosition(position.coords.latitude,position.coords.longitude);
    });
}
else {
    updatePageCity("San Jose");
}

var locations = [];
var local = localStorage.getItem("locations");
if (local) {
    locations = JSON.parse(local);
}

function updateLocationHistory(location) {
    locations.unshift(location);
    if (locations.length >= 8) {
        locations.pop();
    }
    localStorage.setItem("locations",JSON.stringify(locations));

    $("#location_history").empty();
    for (location of locations) {
        var li = $("<li>");
        li.html("<li class=\"list-group-item\">" + location + "</li>");
        li.click(updatePageByHistoryEvent);        
        $("#location_history").append(li);
    }
}

function updatePageCurrentWeather(obj) {
    $("#today_city_date").text(obj.city + " (" + obj.date + ")");
    $("#today_img").attr("src", obj.icon_url);
    $("#today_temperature").html("Temperature: " + obj.temperature + "&degF");
    $("#today_humidity").text("Humidity: " + obj.humidity + "%");
    $("#today_wind_speed").text("Wind Speed: " + obj.wind_speed + " MPH");
    var uv_color;
    if (obj.uv_index < 3) {
        uv_color="forestgreen";
    }
    else if (obj.uv_index < 5) {
        uv_color="gold";
    }
    else if (obj.uv_index < 7) {
        uv_color="orangered";
    }
    else if (obj.uv_index < 10) {
        uv_color="red";
    }
    else {
        uv_color="slateblue";
    }
    $("#today_uv_index").html("UV Index: <button class=\"btn\" style=\"background-color: "+uv_color+"; color: white;\" disabled>" + obj.uv_index+"</button>");
}

function updatePageForecast(obj) {
    $(".forecast-item").children().each(function (index) {
        $(this).find(".forecast-date").text(obj[index].date);
        $(this).find(".forecast-image").attr("src", obj[index].icon_url);
        $(this).find(".forecast-temperature").html("Temp: " + obj[index].temperature + "&degF");
        $(this).find(".forecast-humidity").text("Humidity: " + obj[index].temperature + "%");
    });
}

function updatePageCity(city) {
    getCurrentWeatherCity(city, updatePageCurrentWeather);
    getForecastCity(city, updatePageForecast);
}

function updatePagePosition(lat,lon) {
    getCurrentWeatherPosition(lat,lon, updatePageCurrentWeather);
    getForecastPosition(lat,lon, updatePageForecast);
}

function updatePageByHistoryEvent(event) {
    var city = $(event.target).text();
    updatePageCity(city);
}

$("#submit_location").click(function (event) {
    var location = $("#input_location").val().trim();
    updatePageCity(location);
    updateLocationHistory(location);
});

function getCurrentWeatherCity(city, callback) {
    var query = {
        q: city,
        units: "imperial",
        appid: "1ca7ce78e703503786e910c2c8760a17"
    };

    getCurrentWeather(query, callback);
}

function getCurrentWeatherPosition(lat,lon,callback) {
    var query = {
        lat: lat,
        lon: lon,
        units: "imperial",
        appid: "1ca7ce78e703503786e910c2c8760a17"
    };

    getCurrentWeather(query, callback);
}

/*
 * getCurrentWeather 
 * 
 * @param{string} query 
 * @param{function} callback takes an argument of Object in the following format
 *  {
 *    date: ?,
 *    icon_url: ?,
 *    temperature: ?,
 *    humidity: ?,
 *    wind_speed: ?,
 *    uv_index: ?
 *  }
 *  and is executed asynchonously after the data is retrieved.
 */
function getCurrentWeather(query, callback) {
    var url, query, urlQueryComponent, queryUrl;

    url = "https://api.openweathermap.org/data/2.5/weather?";

    urlQueryComponent = Object.entries(query).map(a => a[0].concat("=", a[1])).join("&");
    queryUrl = url + urlQueryComponent;

    var obj = {
        city: "",
        date: "",
        icon_url: "",
        temperature: "",
        humidity: "",
        wind_speed: "",
        uv_index: ""
    };

    $.ajax({
        url: queryUrl,
        method: "GET"
    }).then(function (response) {
        obj.city = response.name;
        obj.date = moment(parseInt(response.dt) * 1000).format("M/D/YY");
        obj.icon_url = "";
        obj.temperature = response.main.temp;
        obj.humidity = response.main.humidity;
        obj.wind_speed = response.wind.speed;
        obj.icon_url = "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";

        url = "https://api.openweathermap.org/data/2.5/uvi/history?";
        query = {
            lat: response.coord.lat,
            lon: response.coord.lon,
            start: response.dt,
            end: response.dt,
            appid: "1ca7ce78e703503786e910c2c8760a17"
        };
        urlQueryComponent = Object.entries(query).map(a => a[0].concat("=", a[1])).join("&");
        queryUrl = url + urlQueryComponent;

        $.ajax({
            url: queryUrl,
            method: "GET"
        }).then(function (response) {
            obj.uv_index = response[0].value;
            callback(obj);
        });

    });
}


function getForecastCity(city, callback) {
    query = {
        q: city,
        units: "imperial",
        cnt: 40,
        appid: "1ca7ce78e703503786e910c2c8760a17"
    };

    getForecast(query, callback);
}

function getForecastPosition(lat,lon,callback) {
    query = {
        lat: lat,
        lon: lon,
        units: "imperial",
        cnt: 40,
        appid: "1ca7ce78e703503786e910c2c8760a17"
    };

    getForecast(query, callback);
}
/*
 * getForecast 
 * 
 * @param{Object} query query object
 * @param{function} callback takes an argument of Object in the following format
 *  {
 *    date: ?,
 *    icon_url: ?,
 *    temperature: ?,
 *    humidity: ?,
 *  }
 *  and is executed asynchonously after the data is retrieved.
 */
function getForecast(query, callback) {
    var url, query, urlQueryComponent, queryUrl;

    url = "http://api.openweathermap.org/data/2.5/forecast?";

    urlQueryComponent = Object.entries(query).map(a => a[0].concat("=", a[1])).join("&");
    queryUrl = url + urlQueryComponent;

    var obj = [];

    $.ajax({
        url: queryUrl,
        method: "GET"
    }).then(function (response) {
        /* 
         * ajax gets 8 3-hr segments per day, first segment at 4 is mid-day, 
         * +=8 for the next 3 hour segment @ the next mid-day and so on
         */
        for (var i = 4; i < 40; i += 8) {
            obj.push({
                city: response.name,
                date: moment(parseInt(response.list[i].dt) * 1000).format("M/D/YY"),
                icon_url: "http://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png",
                temperature: response.list[i].main.temp,
                humidity: response.list[i].main.humidity
            });
        }
        callback(obj);
    });
}
