import { useEffect, useState } from "react";
import "./index.css";

export default function App() {
  const [amountFrom, setAmountFrom] = useState("");
  const [amountTo, setAmountTo] = useState("");
  const [activeInput, setActiveInput] = useState("from");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rates, setRates] = useState(null);
  const [pair, setPair] = useState({ from: "USD", to: "EUR" });

  function convertFromTo(valueFrom, pair, rates) {
    if (valueFrom === "" || !rates) return "";
    const n = Number(valueFrom);
    if (!Number.isFinite(n)) return "";
    if (pair.from === pair.to) return valueFrom;
    const rate = rates[pair.to];
    if (rate == null) return "";

    return String((n * rate).toFixed(2));
  }

  function convertToFrom(valueTo, pair, rates) {
    if (valueTo === "" || !rates) return "";

    const n = Number(valueTo);
    if (!Number.isFinite(n)) return "";

    if (pair.from === pair.to) return valueTo;

    const rate = rates[pair.to];
    if (rate == null) return "";

    return String((n / rate).toFixed(2));
  }

  function swap() {
    setPair((prev) => ({ from: prev.to, to: prev.from }));
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `https://api.frankfurter.app/latest?from=${pair.from}`,
        );
        if (!response.ok) throw new Error("Something went wrong");

        const data = await response.json();
        setRates(data.rates);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pair.from]);

  useEffect(() => {
    if (!rates || loading || error) return;
    if (activeInput === "from") {
      setAmountTo(convertFromTo(amountFrom, pair, rates));
    } else {
      setAmountFrom(convertToFrom(amountTo, pair, rates));
    }
  }, [pair, activeInput, amountFrom, amountTo, rates, loading, error]);

  const defaultCurrencies = ["USD", "EUR", "UAH", "PLN"];

  const currencies = rates
    ? Array.from(new Set([...Object.keys(rates), pair.from])).sort()
    : defaultCurrencies;

  return (
    <div className="app">
      <div className="panel">
        <h1 className="title">Currency Converter</h1>

        <div className="card">
          <div className="row">
            <div className="field">
              <label className="label">Amount</label>
              <input
                type="number"
                className="input"
                value={amountFrom}
                onChange={(e) => {
                  setAmountFrom(e.target.value);
                  setActiveInput("from");
                }}
              />
            </div>

            <div className="field">
              <label className="label">From</label>
              <select
                className="select"
                value={pair.from}
                onChange={(e) =>
                  setPair((prev) => ({ ...prev, from: e.target.value }))
                }
              >
                {currencies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="swapRow">
            <button className="swapBtn" onClick={swap}>
              ⇄ Swap
            </button>
          </div>

          <div className="row">
            <div className="field">
              <label className="label">Result</label>
              <div className="resultBox">
                {loading ? (
                  <span className="muted">Loading...</span>
                ) : error ? (
                  <span className="error">{error}</span>
                ) : (
                  <input
                    type="number"
                    className="input"
                    value={amountTo}
                    onChange={(e) => {
                      setAmountTo(e.target.value);
                      setActiveInput("to");
                    }}
                  />
                )}
              </div>
            </div>

            <div className="field">
              <label className="label">To</label>
              <select
                className="select"
                value={pair.to}
                onChange={(e) =>
                  setPair((prev) => ({ ...prev, to: e.target.value }))
                }
              >
                {currencies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
