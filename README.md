# Weather Dashboard

This repository of a web application that displays the weather and the forecast for a given city.

## Code/object for getting the current weather info and on completion, setting it.

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

        /* join the key/value pairs with "=", and then join those elements with & for use in 
        query */
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
            obj.date = moment(parseInt(response.dt) * 1000).format("M/D/YYYY");
            obj.icon_url = "";
            obj.temperature = response.main.temp;
            obj.humidity = response.main.humidity;
            obj.wind_speed = response.wind.speed;
            obj.icon_url = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";

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


## Image example of the web page:

![Main](assets/img/main.PNG)
![Narrow](assets/img/narrow.PNG)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Git, SVN, Git Desktop or Microsoft Visual Studio or some disk drive
space to unzip the contents of the repository.

### Installing

1) Visit https://github.com/redmarmaduke/weather-dashboard.
2) Select the Clone or Download button
3) Select the most appropriate format/method for download. 
```
ex. using the command line git tool

git clone https://github.com/redmarmaduke/weather-dashboard.git

```

4) Open up the index.html file present in your favorite browser.

## Built With

* [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
* [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
* [JS](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
* [Moment.js](https://momentjs.com/docs/)
* [Bootstrap](https://getbootstrap.com/docs/4.4/)

## Deployed Link

* [See Live Site](https://redmarmaduke.github.io/weather-dashboard/)

## Authors

* **Manuel Nunes** 

- [Link to Portfolio Site](https://redmarmaduke.github.io/weather-dashboard/)
- [Link to Github](https://github.com/redmarmaduke/)
- [Link to LinkedIn](https://www.linkedin.com/in/manuel-nunes-272ba31b/)

See also the list of [contributors](https://redmarmaduke.github.io/weather-dashboard/contributors) who participated in this project.

## License

This project is licensed under the MIT License

## Acknowledgments

* [Icon8.com Images](https://img.icons8.com/)
