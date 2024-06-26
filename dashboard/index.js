var cc = [
  '#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#e6550d',
  '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354', '#74c476',
  '#a1d99b', '#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc',
  '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9'];

const PARAMETERS_TITLES = {
  "PM25": "Particulate matter smaller than 2.5 microns",
  "PM10": "Particulate matter smaller than 10 microns",
  "NO2": "Nitrogen Dioxide",
  "O3": "Ozone",
  "PM4": "Particulate matter smaller than 4 microns",
  "NO": "Nitrogen Monoxide",
  "CH4": "Methane",
  "SO2": "Sulfur Dioxide",
  "CO": "Carbon Monoxide",
  "BC": "Black Carbon",
}


dc.config.defaultColors(cc)

const renderCharts = (csvData) => {

  // var experiments = d3.csvParse(d3.select('pre#data').text());
  var experiments = d3.csvParse(csvData);
  var locationsMap = {};
  var lowestDate = new Date();

  experiments.forEach(element => {
    element.longitude = +element.longitude;
    element.latitude = +element.latitude;
    element.parameter = element.name.toUpperCase();
    element.local = new Date(element.local);
    element.value = +element.value;
    locationsMap[element.location] = { lat: element.latitude, lng: element.longitude }
    if(element.local < lowestDate) {
      lowestDate = element.local;
    }
  });

  var ndx = crossfilter(experiments);
  var parameterDimension = ndx.dimension(function (d) { return d.parameter; }),
    locationDimension = ndx.dimension(function (d) { return d.location; }),
    localDateTimeDimension = ndx.dimension(function (d) { return d.local; });

  var locationGroup = locationDimension.group(),
    parameterGroup = parameterDimension.group(),
    maxDateTimeValueGroup = localDateTimeDimension.group();

  reductio()
    .max(d => d.value)(locationGroup);

  reductio()
    .max(d => d.value)(maxDateTimeValueGroup);

  reductio()
    .max(d => d.value)(parameterGroup);

  const parameterSelect = new dc.SelectMenu('#parameter-selector');
  parameterSelect.dimension(parameterDimension)
    .title(kv => kv.key + ': ' + PARAMETERS_TITLES[kv.key])
    .valueAccessor(d => d.value.max)
    .group(parameterGroup)
    .on('filtered', _ => void mapUtils.renderMap());

  const maxValueByDatetimeRangeLineChart = dc.lineChart("#series-chart");
  maxValueByDatetimeRangeLineChart.dimension(localDateTimeDimension)
    .group(maxDateTimeValueGroup)
    .keyAccessor(d => d.key)
    .valueAccessor(d => d.value.max || 0)
    .width(700)
    .height(250)
    .clipPadding(20)
    .brushOn(true)
    .elasticY(true)
    .elasticX(true)
    .x(d3.scaleTime().domain([lowestDate, new Date()]))
    .on('filtered', _ => void mapUtils.renderMap())
    .yAxisLabel('Concentration in "µg/m3"');
  maxValueByDatetimeRangeLineChart.yAxis().ticks(3);

  const maxValueByDateLineChart = dc.lineChart("#series-chart-mini");
  maxValueByDateLineChart.dimension(localDateTimeDimension)
    .yAxisLabel('Concentration in "µg/m3"')
    .group(maxDateTimeValueGroup)
    .keyAccessor(function (d) { return d.key; })
    .valueAccessor(function (d) { return d.value.max || 0; })
    .width(700)
    .brushOn(false)
    .height(500)
    .rangeChart(maxValueByDatetimeRangeLineChart)
    .clipPadding(20)
    .elasticY(true)
    .x(d3.scaleTime().domain([lowestDate, new Date()]))
    .on('filtered', _ => mapUtils.renderMap());

  const rowChart = dc.rowChart("#top-parameter");
  rowChart.width(500)
    .height(500)
    .dimension(parameterDimension)
    .elasticX(true)
    .valueAccessor(d => d.value.max || 0)
    .ordering((d) => -d.value.max || 0)
    .group(parameterGroup);


  const topLocationRowChart = dc.rowChart("#top-location");
  topLocationRowChart.width(500)
    .height(500)
    .valueAccessor(d => +d.value.max || 0)
    .dimension(locationDimension)
    .cap(10)
    .elasticX(true)
    .group(locationGroup)
    .ordering(d => -d.value.max || 0)
    .othersGrouper(null)

  const mapUtils = {
    recenter: () => {
      map.setView([48.86211, 2.344615], 11);
    },
    selectMarker: (latitude, longitude) => {
      Object.keys(markersMap).forEach(key => {
        if (key !== [latitude, longitude].toString()) {
          markersMap[key].setOpacity(0.6);
        } else {
          selectedMarker = markersMap[key];
          selectedMarker.setOpacity(1);
        }
      });
    },
    clearMarkerSelection: () => {
      selectedMarker = undefined;
      Object.keys(markersMap).forEach(key => {
        markersMap[key].setOpacity(1);
      });
    },
    isSelectedMarker: (latitude, longitude) => {
      return selectedMarker && selectedMarker.getLatLng().lat === latitude && selectedMarker.getLatLng().lng == longitude;
    },
    renderMap: () => {
      for (key in markersMap) {
        markersMap[key].remove();
      }
      markersMap = {};
      locationGroup
        .top(Infinity)
        .filter(entry => entry.value.max)
        .forEach(entry => {
          element = locationsMap[entry.key];
          markersMap[[element.lat, element.lng].toString()] =
            L.marker([element.lat, element.lng])
              .setOpacity(selectedMarker ?
                (mapUtils.isSelectedMarker(element.lat, element.lng) ? 1 : 0.6) : 1)
              .addTo(map)
              .on('mouseover', (ev) => void ev.target.openPopup())
              .on('mouseout', (ev) => void ev.target.closePopup())
              .on('click', d => {
                if (mapUtils.isSelectedMarker(d.latlng.lat, d.latlng.lng)) {
                  mapUtils.clearMarkerSelection();
                  locationDimension.filterAll();
                  dc.renderAll();
                } else {
                  locationDimension.filter(utils.findLocationName(d.latlng.lat, d.latlng.lng));
                  dc.renderAll();
                  mapUtils.selectMarker(d.latlng.lat, d.latlng.lng);
                }
              })
              .bindPopup(entry.key);
        });
    },
  }

  const utils = {
    findLocationName: (latitude, longitude) => {
      for (key in locationsMap) {
        if (locationsMap[key].lat === latitude && locationsMap[key].lng === longitude) {
          return key;
        }
      }
      throw Error('could not find location for latitude = ' + latitude + ' & longitude = ' + longitude);
    },
    clearAll: () => {
      dc.filterAll();
      dc.redrawAll();
      mapUtils.clearMarkerSelection();
      mapUtils.recenter();
    }
  }

  const init = () => {
    mapUtils.renderMap();
    dc.renderAll();
  }


  var map = L.map('map').setView([48.86211, 2.344615], 11);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  var markersMap = {};
  var selectedMarker;

  init();

  return utils.clearAll;
}