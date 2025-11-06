import React, {useEffect, useState, useRef} from 'react';

// Quantum Weather - single-file React app (can be used inside a Next.js page or any React app) // - Uses Open-Meteo (no API key) to fetch hourly + 7-day forecast for Tsengel / Ölgii (Bayan-Ölgii) // - Default location: Tsengel district (lat: 48.9523, lon: 89.1462). Change coords if you prefer Ölgii. // - Caches responses in localStorage for performance and scale. // - Lets user choose refresh interval (every 1h / 2h / 3h / custom minutes). // - Minimal UI: only the word "Quantum" appears as brand text (per request). Starry background via CSS. // - Tailwind classes used (no import required in this snippet if your project already has Tailwind configured).

// How to use: // 1) Put this component into a React app (create-react-app / Vite / Next.js). If Next.js, add a page at pages/index.jsx and export default. // 2) Ensure Tailwind is configured, or swap classes for your CSS. // 3) Deploy to Vercel or Netlify (this is a static frontend). For server-side subscription billing (Stripe) or webhooks, add a small serverless function.

const LAT = 48.9523; // Tsengel district latitude const LON = 89.1462; // Tsengel district longitude const TIMEZONE = 'Asia/Ulaanbaatar';

function openMeteoUrl(lat = LAT, lon = LON) { // Request hourly + daily fields for a reliable 7-day forecast. const params = new URLSearchParams({ latitude: lat, longitude: lon, timezone: TIMEZONE, hourly: [ 'temperature_2m', 'relativehumidity_2m', 'windspeed_10m', 'precipitation', 'cloudcover', 'surface_pressure' ].join(','), daily: [ 'temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'weathercode' ].join(','), forecast_days: '7' }); return https://api.open-meteo.com/v1/forecast?${params.toString()}; }

export default function QuantumWeather() { const [data, setData] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState(null); const [intervalMins, setIntervalMins] = useState(60); // default 1 hour const timerRef = useRef(null); const [lastFetched, setLastFetched] = useState(null);

useEffect(() => { loadCachedOrFetch(); // cleanup on unmount return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

useEffect(() => { // whenever interval changes, reset timer if (timerRef.current) clearInterval(timerRef.current); timerRef.current = setInterval(() => { fetchForecast({force: true}); }, Math.max(10, intervalMins) * 60 * 1000); return () => clearInterval(timerRef.current); }, [intervalMins]);

async function loadCachedOrFetch() { const key = 'quantum_weather_tsengel_v1'; try { const raw = localStorage.getItem(key); if (raw) { const parsed = JSON.parse(raw); const ageMinutes = (Date.now() - parsed.__fetchedAt) / 60000; // if cached data is younger than chosen interval, use it if (ageMinutes < Math.max(1, intervalMins)) { setData(parsed.payload); setLastFetched(new Date(parsed.__fetchedAt).toLocaleString()); return; } } } catch (e) { // ignore cache errors } await fetchForecast({force: true}); }

async function fetchForecast({force = false} = {}) { setLoading(true); setError(null); const url = openMeteoUrl(); try { const res = await fetch(url); if (!res.ok) throw new Error(HTTP ${res.status}); const json = await res.json(); setData(json); setLastFetched(new Date().toLocaleString()); // cache (include tiny metadata) try { localStorage.setItem('quantum_weather_tsengel_v1', JSON.stringify({__fetchedAt: Date.now(), payload: json})); } catch (e) { // ignore storage errors } } catch (e) { setError(e.message); } finally { setLoading(false); } }

function formatHour(hourISO) { // input example: "2025-11-06T09:00" try { const d = new Date(hourISO + ':00'); return d.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric'}); } catch (e) { return hourISO; } }

return ( <div className="min-h-screen flex items-center justify-center bg-black text-white p-4" style={{backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.03) 1px, transparent 1px), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.02) 1px, transparent 1px)'}}> <div className="w-full max-w-4xl bg-black/60 rounded-2xl shadow-2xl backdrop-blur p-6 border border-white/10"> <header className="flex items-center justify-between mb-4"> <h1 className="text-3xl font-extrabold tracking-tight">Quantum</h1> <div className="space-x-2 text-sm"> <label>Refresh:</label> <select value={intervalMins} onChange={(e)=>setIntervalMins(Number(e.target.value))} className="bg-transparent border border-white/10 rounded px-2 py-1"> <option value={60}>Every 1 hour</option> <option value={120}>Every 2 hours</option> <option value={180}>Every 3 hours</option> <option value={30}>Every 30 minutes</option> <option value={15}>Every 15 minutes</option> </select> <button onClick={()=>fetchForecast({force:true})} className="ml-2 px-3 py-1 rounded bg-white text-black text-sm">Update now</button> </div> </header>

<main>
      <section className="mb-4">
        <div className="text-sm text-white/60">Location: Tsengel, Bayan-Ölgii (Lat {LAT}, Lon {LON}) • Timezone: {TIMEZONE}</div>
        <div className="text-xs text-white/50">Last fetched: {lastFetched ?? 'never'}</div>
      </section>

      {loading && <div className="py-6">Loading forecast...</div>}
      {error && <div className="py-4 text-red-300">Error: {error}</div>}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/3 p-4 rounded">
            <h2 className="font-semibold">7-day summary</h2>
            <div className="mt-3 space-y-3 text-sm">
              {data.daily.time.map((d,i)=> (
                <div key={d} className="flex justify-between">
                  <div>{d}</div>
                  <div className="text-right">
                    <div>Max {data.daily.temperature_2m_max[i]}°C</div>
                    <div>Min {data.daily.temperature_2m_min[i]}°C</div>
                    <div>Precip {data.daily.precipitation_sum[i]} mm</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/3 p-4 rounded">
            <h2 className="font-semibold">Next 24 hours (hourly)</h2>
            <div className="mt-3 max-h-80 overflow-auto text-sm">
              <table className="w-full table-auto text-left text-sm">
                <thead>
                  <tr className="text-white/60">
                    <th className="pr-4">Time</th>
                    <th className="pr-4">Temp (°C)</th>
                    <th className="pr-4">RH (%)</th>
                    <th className="pr-4">Wind (m/s)</th>
                    <th className="pr-4">Precip (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.hourly.time.slice(0,24).map((t,idx)=> (
                    <tr key={t} className="border-t border-white/5">
                      <td className="py-1 pr-4">{formatHour(t)}</td>
                      <td className="py-1 pr-4">{data.hourly.temperature_2m[idx]}</td>
                      <td className="py-1 pr-4">{data.hourly.relativehumidity_2m[idx]}</td>
                      <td className="py-1 pr-4">{data.hourly.windspeed_10m[idx]}</td>
                      <td className="py-1 pr-4">{data.hourly.precipitation[idx]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-6 text-xs text-white/50">
        Data source: Open‑Meteo (no API key required). This forecast is a best-effort 7‑day prediction — use it for planning only. For critical life-safety alerts integrate official government/meterological alerts as well.
      </footer>
    </main>
  </div>
</div>

); }
