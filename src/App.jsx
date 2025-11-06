import React, { useEffect, useState } from "react";

export default function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [error, setError] = useState(null);

  // Tsengel (Bayan-Ölgii) координаттары
  const latitude = 48.96;
  const longitude = 89.34;

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();
        setWeather(data);
        setHourly(data.hourly || []);
        setDaily(data.daily || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch weather data");
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen text-white text-2xl">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;

  return (
    <div className="relative min-h-screen text-white font-sans overflow-hidden bg-black">
      {/* Жұлдызды фон */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950 to-black opacity-90" />
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:3px_3px]" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-5xl font-bold tracking-widest mb-6">Quantum</h1>
        <p className="text-lg text-gray-300 mb-4">
          Bayan-Ölgii (Tsengel) • Next 7 days forecast
        </p>

        {/* Ағымдағы температура */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl w-full max-w-md mb-6">
          <p className="text-2xl mb-2">
            🌡️ Current: {hourly.temperature_2m ? hourly.temperature_2m[0] : "N/A"}°C
          </p>
          <p>💨 Wind: {hourly.wind_speed_10m ? hourly.wind_speed_10m[0] : "N/A"} km/h</p>
          <p>💧 Humidity: {hourly.relative_humidity_2m ? hourly.relative_humidity_2m[0] : "N/A"}%</p>
        </div>

        {/* 7 күндік болжам */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {daily.time?.map((day, i) => (
            <div
              key={day}
              className="bg-white/10 backdrop-blur-md rounded-xl p-3 w-36 shadow-md hover:bg-white/20 transition"
            >
              <p className="text-sm text-gray-300">{day}</p>
              <p className="text-xl font-semibold text-white">
                {daily.temperature_2m_max[i]}° / {daily.temperature_2m_min[i]}°
              </p>
              <p className="text-sm text-gray-400">
                💨 {daily.wind_speed_10m_max[i]} km/h
              </p>
              <p className="text-sm text-gray-400">
                🌧 {daily.precipitation_sum[i]} mm
              </p>
            </div>
          ))}
        </div>

        <footer className="mt-10 text-gray-500 text-sm">
          Quantum Weather • Powered by Open-Meteo
        </footer>
      </div>
    </div>
  );
              }
