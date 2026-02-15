import { useEffect, useState } from "react";
import "./index.css";

export default function App() {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rates, setRates] = useState(null);
  const [pair, setPair] = useState({ from: "USD", to: "EUR" });

  function calculateResult(amount, pair, rates) {
    if (amount <= 0) return 0;
    if (!rates) return 0;
    if (pair.from === pair.to) return Number(amount);
    if (!(pair.to in rates)) return 0;

    return amount * rates[pair.to];
  }

  const result = calculateResult(amount, pair, rates);

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
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
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
                  <span className="result">{result.toFixed(2)}</span>
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
