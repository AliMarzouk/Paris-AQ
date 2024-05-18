from google.cloud import bigquery
import pandas as pd
import base64
PAGE_SIZE = 20000

client = bigquery.Client()

def fetchData(page_size, page_number) -> pd.DataFrame:
    QUERY = (
        'SELECT DISTINCT value,local,unit,name,location,latitude,longitude ' +
        'FROM `air-quality-421919.air_quality_0123.measurement` as m ' +
        'LEFT JOIN (SELECT DISTINCT id, location, latitude, longitude FROM `air-quality-421919.air_quality_0123.location`) as l ON l.id = m.location_id ' +
        'LEFT JOIN `air_quality_0123.date` as d ON d.id = m.date_id ' +
        'LEFT JOIN `air_quality_0123.parameter` AS p on p.id = m.parameter_id '
    )
    if page_size:
        QUERY += 'LIMIT ' + str(page_size)
        if page_number:
            QUERY += ' OFFSET ' + str(page_number * page_size)
    print(QUERY)
    query_job = client.query(QUERY) 
    return query_job.to_dataframe()

def results_generator():
    page_number = 0
    query_df = fetchData(PAGE_SIZE, page_number)
    while query_df.size != 0:
        query_df.to_csv('results.csv', index=False)
        f = open("results.csv", "r")
        yield 'data:' + base64.b64encode(str.encode(f.read())).decode("utf-8") + '\n\n'
        page_number += 1
        query_df = fetchData(PAGE_SIZE, page_number)
    
    yield 'data:FINISHED\n\n'
    
    

from flask import Flask
import flask
from flask_cors import CORS, cross_origin
app = Flask(__name__)
# cors = CORS(app)
# app.config['CORS_HEADERS'] = 'Content-Type'


app = Flask(__name__)

@app.route("/")
@cross_origin(allow_headers=['Content-Type'], origins=['https://alimarzouk.github.io/'])
def stream():
    response = flask.Response(results_generator(), mimetype="text/event-stream")
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response
