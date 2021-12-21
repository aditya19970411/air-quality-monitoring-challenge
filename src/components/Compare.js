import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import moment from "moment";

const Compare = () => {
  const [cityOneChartData, setcityOneChartData] = useState([]);
  const [cityTwoChartData, setcityTwoChartData] = useState([]);
  let { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Wesb Socket Url
    const ws = new WebSocket("ws://city-ws.herokuapp.com/");

    ws.onmessage = async (event) => {
      const { data } = event;
      const json = JSON.parse(data);

      let tempCityOneChartData = [...cityOneChartData];
      let tempCityTwoChartData = [...cityTwoChartData];
      let foundCityOne = json.find((js) => js.city === slug.split("-")[0]);
      let foundCityTwo = json.find((js) => js.city === slug.split("-")[1]);

      if (foundCityOne) {
        if (tempCityOneChartData.length >= 60) tempCityOneChartData.shift();
        tempCityOneChartData.push({
          aqi: foundCityOne.aqi,
          created_at: moment(new Date()),
        });
      }

      if (foundCityTwo) {
        if (tempCityTwoChartData.length >= 60) tempCityTwoChartData.shift();
        tempCityTwoChartData.push({
          aqi: foundCityTwo.aqi,
          created_at: moment(new Date()),
        });
      }

      setcityOneChartData(tempCityOneChartData);
      setcityTwoChartData(tempCityTwoChartData);
    };

    return () => {
      ws.close();
    };
  }, [cityOneChartData, cityTwoChartData, slug]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 50,
        flexDirection: "column",
      }}
    >
      <Chart
        options={{
          chart: {
            id: "apexchart-aqi",
            toolbar: {
              show: false,
            },
            animations: {
              enabled: false,
            },
          },
          xaxis: {
            type: "numeric",
            labels: {
              formatter: (val) => Number(val).toFixed(0),
            },
            title: {
              text: "Seconds",
              style: { marginBottom: "10px" },
            },
          },
          yaxis: [
            {
              title: {
                text: slug.split("-")[0] + " AQI Value",
              },
            },
            {
              opposite: true,
              title: {
                text: slug.split("-")[1] + " AQI Value",
              },
            },
          ],
          title: {
            text: slug + " Air Quality Index",
            align: "center",
          },
          legend: {
            show: true,
          },
          dataLabels: {
            enabled: false,
          },
        }}
        series={[
          {
            name: slug.split("-")[0] + " AQI",
            data: cityOneChartData.map((cd) => cd.aqi.toFixed(2)),
          },
          {
            name: slug.split("-")[1] + " AQI",
            data: cityTwoChartData.map((cd) => cd.aqi.toFixed(2)),
          },
        ]}
        type="area"
        width={750}
        height={350}
      />
      <div style={{ paddingTop: 40 }}>
        <button className="btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Compare;
