import moment from "moment";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getAirQualityIndexObj } from "./EnhancedTable";
import Chart from "react-apexcharts";

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
          },
          fill: {
            colors: [(series) => getAirQualityIndexObj(series.value).color],
          },
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
            name: "AQI",
            data: chartData.map((cd) => cd.aqi.toFixed(2)),
          },
        ]}
        type="bar"
        width={750}
        height={350}
      />
      <div style={{ paddingTop: 40 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: 8, cursor: "pointer" }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default City;
