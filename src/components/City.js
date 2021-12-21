import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getAirQualityIndexObj } from "./Main";
import Chart from "react-apexcharts";
import moment from "moment";

const City = () => {
  const [chartData, setchartData] = useState([]);
  let { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Wesb Socket Url
    const ws = new WebSocket("ws://city-ws.herokuapp.com/");

    ws.onmessage = async (event) => {
      const { data } = event;
      const json = JSON.parse(data);

      let tempChartData = [];
      let found = json.find((js) => js.city === slug);

      chartData.forEach((cd) => {
        if (moment(new Date()).diff(cd.created_at, "hours") <= 24) {
          if (tempChartData.length > 60) tempChartData.shift();
          tempChartData.push(cd);
        }
      });

      if (found) {
        if (tempChartData.length >= 60) tempChartData.shift();
        tempChartData.push({ aqi: found.aqi, created_at: moment(new Date()) });
      }

      setchartData(tempChartData);
    };

    return () => {
      ws.close();
    };
  }, [chartData, slug]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "fit-content",
        margin: "0px auto",
        marginTop: 40,
      }}
    >
      <div
        style={{
          padding: 20,
          height: 100,
          backgroundColor:
            chartData.length > 0
              ? getAirQualityIndexObj(chartData[chartData.length - 1].aqi).color
              : "black",
          borderTopRightRadius: 8,
          borderTopLeftRadius: 8,
          boxShadow: "0 2px 20px 0 rgb(0 0 0 / 8%)",
          display: "flex",
        }}
      >
        <div
          style={{
            width: 100,
            backgroundColor:
              chartData.length > 0
                ? getAirQualityIndexObj(chartData[chartData.length - 1].aqi)
                    .secondaryColor
                : "black",
            display: "flex",
            flexDirection: "column",
            padding: 10,
            color: "white",
            fontWeight: "bold",
            borderRadius: 4,
          }}
        >
          <div>{slug} AQI</div>
          <div style={{ marginTop: "auto" }}>
            {chartData.length > 0
              ? chartData[chartData.length - 1].aqi.toFixed(0)
              : 0}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "10px 20px",
            fontWeight: "bold",
            color:
              chartData.length > 0
                ? getAirQualityIndexObj(chartData[chartData.length - 1].aqi)
                    .secondaryColor
                : "black",
          }}
        >
          <div style={{ fontSize: 12 }}>LIVE AQI INDEX</div>
          <div style={{ fontSize: 30, lineHeight: "50px" }}>
            {chartData.length > 0
              ? getAirQualityIndexObj(chartData[chartData.length - 1].aqi)
                  .condition
              : ""}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          boxShadow: "0 2px 20px 0 rgb(0 0 0 / 8%)",
          padding: 20,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
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
              },
            },
            yaxis: {
              title: {
                text: "AQI Value",
              },
            },
            fill: {
              colors: [(series) => getAirQualityIndexObj(series.value).color],
            },
            // title: {
            //   text: slug + " Air Quality Index",
            //   align: "center",
            // },
            legend: {
              show: true,
            },
            dataLabels: {
              enabled: false,
            },
          }}
          series={[
            {
              name: "AQI",
              data: chartData.map((cd) => cd.aqi.toFixed(2)),
            },
          ]}
          type="bar"
          width={750}
          height={350}
        />
        <div style={{ paddingTop: 40 }}>
          <button className="btn" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default City;
