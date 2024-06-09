<h1 align="center">Welcome to PARIS AQ 👋</h1>
<p>
  <a href="https://github.com/AliMarzouk/Paris-AQ#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/AliMarzouk/Paris-AQ/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/AliMarzouk/Paris-AQ/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/bishkou/password-pwnd" />
  </a>
</p>

* **Air quality insight monitoring for the paris and Île de France Area**

[![demo ](https://github.com/AliMarzouk/Paris-AQ/assets/47494225/b00172c6-3984-40a5-8963-d26ad3c15423)](https://alimarzouk.github.io/Paris-AQ/dashboard/)

[**Try it**](https://alimarzouk.github.io/Paris-AQ/dashboard)

[**Full article** ](https://www.linkedin.com/pulse/end-to-end-data-engineering-openaq-api-real-time-using-ali-marzouk-1enxe/?trackingId=M%2F50LUOST3%2BOp3lUDtDZig%3D%3D)

## What is Paris AQ

**Paris AQ** is a data engineering project that implements an *ELTL* pipeline 
to monitor air quality in the Paris Île-de-France area. 
The project extracts air quality data from the **OpenAQ API**, 
stores it in a Google *Cloud Storage (GCS) data lake*,
processes it with *Apache Spark*, and loads it into *Google BigQuery*.
The processed data is then visualized in an interactive web dashboard built 
with *Flask* for the backend and *Dc.js* and *Crossfilter.js* for charts rendering.

## How It Works

**Apache Spark**

Apache spark is used in every aspect of the data processing in this project. 
This includes the api requests, data transformation and storing.

Refer to [this article for utilizing Spark for Rest API calls](https://medium.com/geekculture/how-to-execute-a-rest-api-call-on-apache-spark-the-right-way-in-python-4367f2740e78).

This project is mainly composed of two spark jobs:
* spark_api_to_gcs: Retrieves yesterday's data from a Rest API and saves the data to a GCS data lake.
* spark_gcs_to_big_query: Transforms the data in the data lake and loads it into BigQuery data warehouse.

PS: Please note that the job files in this repo are in a Jupyter notebook format, so you should convert 
them to a python script in order to use them.
You can use Jupyter's `` jupyter nbconvert --to script [YOUR_NOTEBOOK].ipynb `` command.

**Orchestration**

For orchestrating our Spark jobs, we use Apache Airflow. A pipeline is run daily using the Airflow 
scheduler, submitting the two spark jobs sequentially.

**Backend**

For the backend we used Flask to expose a Rest API. In order to avoid network bottleneck, 
we opted for a long living connection that sends the data in chunks of 20000 records. 

**Fronted**

In order to monitor the data, we opted for an easy-to-access web interactive dashboard. 
Used [Crossfilter.js](https://github.com/crossfilter/crossfilter/wiki/API-Reference), [DC.js](https://dc-js.github.io/dc.js/) and [D3.js](https://d3js.org/) to render the charts with cross filtering. For the map component,
we used the [Leaflet.js](https://leafletjs.com/) library.

## Author

👤 **Ali**

* Github: [@AliMarzouk](https://github.com/AliMarzouk/)
* LinkedIn: [@ali-marzouk](linkedin.com/in/ali-marzouk/)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/AliMarzouk/Paris-AQ/issues).

## Show your support

Give a [STAR](https://github.com/AliMarzouk/Paris-AQ/) if this project helped you!

## 📝 License

* Copyright © 2024 [Ali](https://github.com/AliMarzouk).
* This project is [MIT](https://github.com/AliMarzouk/Paris-AQ/blob/master/LICENSE) licensed.
