
import { useState } from "react";
import "./CancelFlight.css";

const API_URL = "https://governor-set-element-maximize.trycloudflare.com/api/flights";

function CancelFlight() {
  const [flightId, setFlightId] = useState("");
  const [flight, setFlight] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchFlight(event) {
    event.preventDefault();
    setMessage("");
    setFlight(null);

    if (!flightId.trim() || Number(flightId) <= 0) {
      setMessage("Please enter a valid flight ID.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(flightId)}`
      );

      if (response.status === 404) {
        setMessage("Flight not found.");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to retrieve flight details.");
      }

      const data = await response.json();

      if (!data || !data.flightId) {
        setMessage("Flight not found.");
        return;
      }

      setFlight(data);
    } catch (error) {
      setMessage(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelFlight() {
    if (!flight) return;

    const confirmed = window.confirm(
      `Cancel flight ${flight.flightNumber}? This changes the flight status for all passengers.`
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/${flight.flightId}/cancel`,
        { method: "PATCH" }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "Flight not found."
            : "Failed to cancel the flight."
        );
      }

      const result = await response.json();
      setFlight(result);
      setMessage("Flight cancelled successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to cancel the flight.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="cancel-flight-page">
      <section className="cancel-flight-card">
        <h1>Cancel Flight</h1>
        <p>Find a flight by its database ID before cancelling it.</p>

        <form onSubmit={searchFlight}>
          <label htmlFor="flightId">Flight ID</label>
          <input
            id="flightId"
            type="number"
            min="1"
            value={flightId}
            onChange={(event) => setFlightId(event.target.value)}
            placeholder="Enter flight ID"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Find Flight"}
          </button>
        </form>

        {message && (
          <p role="status" className="cancel-flight-message">
            {message}
          </p>
        )}

        {flight && (
          <section className="flight-details">
            <h2>Flight Details</h2>
            <p><strong>Flight ID:</strong> {flight.flightId}</p>
            <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
            <p><strong>Airline:</strong> {flight.airlineName}</p>
            <p><strong>From:</strong> {flight.sourceAirport}</p>
            <p><strong>To:</strong> {flight.destinationAirport}</p>
            <p><strong>Departure:</strong> {String(flight.departureTime)}</p>
            <p><strong>Arrival:</strong> {String(flight.arrivalTime)}</p>
            <p><strong>Status:</strong> {flight.flightStatus}</p>

            {flight.flightStatus?.toUpperCase() === "CANCELLED" ? (
              <p>This flight is already cancelled.</p>
            ) : (
              <button
                type="button"
                className="cancel-button"
                onClick={cancelFlight}
                disabled={loading}
              >
                {loading ? "Please wait..." : "Cancel This Flight"}
              </button>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

export default CancelFlight;
