var locations = [];

/**
 * displayWeather - update today's weather DOM
 * @param {*} obj
 */
function displayWeather(obj) {
  $("#today_city_date").text(obj.city + " (" + obj.date + ")");
  $("#today_img").empty();
  var img = $("<img>");
  img.attr("src", obj.icon_url);
  $("#today_img").append(img);

  $("#today_img").attr("src", obj.icon_url);
  $("#today_temperature").html("Temperature: " + obj.temperature + " &deg;F");
  $("#today_humidity").text("Humidity: " + obj.humidity + "%");
  $("#today_wind_speed").text("Wind Speed: " + obj.wind_speed + " MPH");
}

/**
 * displayForecast - update Forecast DOM
 *
 * @param {*} obj
 */
function displayForecast(obj) {
  $(".forecast-item")
    .children()
    .each(function (index) {
      $(this).find(".forecast-date").text(obj.forecast[index].date);
      var forecastImage = $(this).find(".forecast-image");
      forecastImage.empty();
      var img = $("<img>");
      img.attr("src", obj.forecast[index].icon_url);
      img.attr("width", 35);
      forecastImage.append(img);
      $(this)
        .find(".forecast-temperature")
        .html("Temp: " + obj.forecast[index].temperature + " &deg;F");
      $(this)
        .find(".forecast-humidity")
        .text("Humidity: " + obj.forecast[index].temperature + "%");
    });
}

/**
 * displayUVI - Update UV information on today's forecast
 *
 * @param {*} obj
 *  {
 *     uv_index - uv index
 *  }
 */
function displayUVI(obj) {
  var uv_color;
  if (obj.uv_index < 3) {
    uv_color = "forestgreen";
  } else if (obj.uv_index < 5) {
    uv_color = "gold";
  } else if (obj.uv_index < 7) {
    uv_color = "orangered";
  } else if (obj.uv_index < 10) {
    uv_color = "red";
  } else {
    uv_color = "slateblue";
  }
  $("#today_uv_index").html(
    'UV Index: <button className="btn" style="background-color: ' +
      uv_color +
      '; color: #efefef;" disabled>' +
      obj.uv_index +
      "</button>"
  );
}

function displayHistory() {
  $("#location_history").empty();
  for (var location of locations) {
    var li = $("<li>");
    li.html('<li className="list-group-item">' + location + "</li>");
    li.click(function (event) {
      getWeather({ q: $(event.target).text() });
    });
    $("#location_history").append(li);
  }
}

/**
 * main - start function
 */
function main() {
  var local = localStorage.getItem("locations");
  if (local) {
    locations = JSON.parse(local);
  }
  displayHistory();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      getWeather({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
    });
  } else {
    getWeather({ q: "San+Jose" });
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

  console.log("LOCATION: "+JSON.stringify(locations));
  localStorage.setItem("locations", JSON.stringify(locations));

  displayHistory();
}

$("#submit_location").click(function (event) {
  var location = $("#input_location").val().trim().split(/\s+/).join("+");
  getWeather({ q: location });
});

function ajax(queryArg, api) {
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

  return fetch(url,settings).then(resource=>resource.json());
}

function ajax_(queryArg, api) {
  let query = {
    units: "imperial",
    appid: "1ca7ce78e703503786e910c2c8760a17",
    ...queryArg
  };

  var settings = {
    async: true,
    crossDomain: true,
    url: `https://api.openweathermap.org/data/2.5/${api}?`,
    method: "GET",
  };

  settings.url =
    settings.url +
    Object.entries(query)
      .map((a) => a[0].concat("=", a[1]))
      .join("&");

  console.log("Return $.ajax(" + JSON.stringify(settings) + ")");
  return $.ajax(settings);
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

function getWeather(query) {

  var obj = {
    city: "",
    date: "",
    icon_url: "",
    temperature: "",
    humidity: "",
    wind_speed: "",
    uv_index: "",
  };

  ajax(query, "weather").then(function (response) {
    console.log("weather: ", response);
    obj.city = response.name;
    obj.date = moment(parseInt(response.dt) * 1000).format("M/D/YYYY");
    obj.temperature = response.main.temp;
    obj.humidity = response.main.humidity;
    obj.wind_speed = response.wind.speed;
    obj.icon_url =
      "https://openweathermap.org/img/wn/" +
      response.weather[0].icon +
      "@2x.png";

    ajax({ lat: response.coord.lat, lon: response.coord.lon }, "uvi").then(
      function (response) {
        console.log("uvi: ", response);
        obj.uv_index = response.value;
        displayUVI(obj);
      }
    );

    ajax({ lat: response.coord.lat, lon: response.coord.lon, exclude: "minutely,hourly,current,alerts" }, "onecall").then(function (response) {
      obj.forecast = [];

      console.log("forecast:");
      for (var i = 1; i < 6; ++i) {
        console.log(response.daily[i]);
        obj.forecast.push({
          city: response.name,
          date: moment(parseInt(response.daily[i].dt) * 1000).format("M/D/YYYY"),
          icon_url:
            "https://openweathermap.org/img/wn/" +
            response.daily[i].weather[0].icon +
            "@2x.png",
          temperature: response.daily[i].temp.day,
          humidity: response.daily[i].humidity,
        });
      }

      
      displayForecast(obj);
    });

    displayWeather(obj);
    addLocationToHistory(obj.city);
  });
}

main();
