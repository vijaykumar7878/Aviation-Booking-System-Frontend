
import { useEffect, useState } from "react";
import "./CreateFlight.css";

function CreateFlight() {
  const [airports, setAirports] = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(true);
  const [airportError, setAirportError] = useState("");

  const [form, setForm] = useState({
    flightNumber: "",
    airlineName: "",
    sourceAirportId: "",
    destinationAirportId: "",
    departureTime: "",
    arrivalTime: "",
    durationMinutes: "95",
    price: "3500",
    totalSeats: "186",
    availableSeats: "186",
    aircraftType: "Airbus A320neo",
    flightStatus: "SCHEDULED",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  // Load available airports from the backend.
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await fetch(
         "http://13.201.100.65:8080/api/airports"
        );

        if (!response.ok) {
          throw new Error("Failed to load available airports.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "Airport API must return a JSON array."
          );
        }

        setAirports(data);
        setAirportError("");
      } catch (error) {
        setAirportError(
          error instanceof TypeError
            ? "Cannot connect to the server. Check backend and CORS settings."
            : error.message
        );
      } finally {
        setAirportsLoading(false);
      }
    };

    fetchAirports();
  }, []);

  // Get an airport's ID, supporting common response property names.
  const getAirportId = (airport) =>
    airport.airportId ?? airport.id;

  // Update form fields.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => {
      const updated = {
        ...previous,
        [name]: value,
      };

      // Reset destination when the source changes.
      if (
        name === "sourceAirportId" &&
        value === previous.destinationAirportId
      ) {
        updated.destinationAirportId = "";
      }

      return updated;
    });

    setMessage("");
    setMessageType("");
  };

  // Create a flight.
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (airportsLoading || airports.length === 0) {
      setMessage("No available airports to create a flight.");
      setMessageType("error");
      return;
    }

    if (
      !airports.some(
        (airport) =>
          String(getAirportId(airport)) ===
          String(form.sourceAirportId)
      ) ||
      !airports.some(
        (airport) =>
          String(getAirportId(airport)) ===
          String(form.destinationAirportId)
      )
    ) {
      setMessage("Please select valid source and destination airports.");
      setMessageType("error");
      return;
    }

    if (form.sourceAirportId === form.destinationAirportId) {
      setMessage("Source and destination must be different.");
      setMessageType("error");
      return;
    }

    if (
      new Date(form.arrivalTime) <=
      new Date(form.departureTime)
    ) {
      setMessage("Arrival time must be after departure time.");
      setMessageType("error");
      return;
    }

    if (
      Number(form.availableSeats) > Number(form.totalSeats)
    ) {
      setMessage("Available seats cannot exceed total seats.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://13.201.100.65:8080/api/flights",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flightNumber: form.flightNumber.trim(),
            airlineName: form.airlineName.trim(),
            sourceAirportId: Number(form.sourceAirportId),
            destinationAirportId: Number(
              form.destinationAirportId
            ),
            departureTime: form.departureTime,
            arrivalTime: form.arrivalTime,
            durationMinutes: Number(form.durationMinutes),
            price: Number(form.price),
            totalSeats: Number(form.totalSeats),
            availableSeats: Number(form.availableSeats),
            aircraftType: form.aircraftType.trim(),
            flightStatus: form.flightStatus,
          }),
        }
      );

      const result = await response.text();

      if (!response.ok) {
        let errorMessage = result;

        try {
          const errorData = JSON.parse(result);
          errorMessage =
            errorData.message ||
            errorData.error ||
            result;
        } catch {
          // Keep the original response text.
        }

        throw new Error(
          errorMessage || "Failed to create flight."
        );
      }

      setMessage(
        result || "Flight created successfully!"
      );
      setMessageType("success");

      setForm((previous) => ({
        ...previous,
        flightNumber: "",
        airlineName: "",
      }));
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? "Unable to connect to the server. Check backend and CORS settings."
          : error.message
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-flight-page">
      <div className="create-flight-card">
        <h2>Create Flight</h2>

        <p className="create-flight-subtitle">
          Add a new flight to SkyBooker.
        </p>

        {airportError && (
          <div className="flight-message error" role="alert">
            {airportError}
          </div>
        )}

        <form
          className="create-flight-form"
          onSubmit={handleSubmit}
        >
          <div className="flight-form-grid">
            <div>
              <label htmlFor="flightNumber">
                Flight Number
              </label>
              <input
                id="flightNumber"
                name="flightNumber"
                value={form.flightNumber}
                onChange={handleChange}
                placeholder="e.g. 6E404"
                required
              />
            </div>

            <div>
              <label htmlFor="airlineName">
                Airline Name
              </label>
              <input
                id="airlineName"
                name="airlineName"
                value={form.airlineName}
                onChange={handleChange}
                placeholder="e.g. IndiGo"
                required
              />
            </div>

            <div>
              <label htmlFor="sourceAirportId">
                From (City)
              </label>
              <select
                id="sourceAirportId"
                name="sourceAirportId"
                value={form.sourceAirportId}
                onChange={handleChange}
                required
                disabled={
                  airportsLoading || airports.length === 0
                }
              >
                <option value="">
                  {airportsLoading
                    ? "Loading cities..."
                    : "Select source city"}
                </option>

                {airports.map((airport) => (
                  <option
                    key={getAirportId(airport)}
                    value={getAirportId(airport)}
                  >
                    {airport.city} (
                    {airport.airportCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="destinationAirportId">
                To (City)
              </label>
              <select
                id="destinationAirportId"
                name="destinationAirportId"
                value={form.destinationAirportId}
                onChange={handleChange}
                required
                disabled={
                  airportsLoading || airports.length === 0
                }
              >
                <option value="">
                  Select destination city
                </option>

                {airports
                  .filter(
                    (airport) =>
                      String(getAirportId(airport)) !==
                      String(form.sourceAirportId)
                  )
                  .map((airport) => (
                    <option
                      key={getAirportId(airport)}
                      value={getAirportId(airport)}
                    >
                      {airport.city} (
                      {airport.airportCode})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="departureTime">
                Departure Time
              </label>
              <input
                id="departureTime"
                name="departureTime"
                type="datetime-local"
                value={form.departureTime}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="arrivalTime">
                Arrival Time
              </label>
              <input
                id="arrivalTime"
                name="arrivalTime"
                type="datetime-local"
                value={form.arrivalTime}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="durationMinutes">
                Duration (minutes)
              </label>
              <input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                min="1"
                value={form.durationMinutes}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="price">Price (₹)</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="totalSeats">
                Total Seats
              </label>
              <input
                id="totalSeats"
                name="totalSeats"
                type="number"
                min="1"
                value={form.totalSeats}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="availableSeats">
                Available Seats
              </label>
              <input
                id="availableSeats"
                name="availableSeats"
                type="number"
                min="0"
                max={form.totalSeats}
                value={form.availableSeats}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="aircraftType">
                Aircraft Type
              </label>
              <input
                id="aircraftType"
                name="aircraftType"
                value={form.aircraftType}
                onChange={handleChange}
                placeholder="e.g. Airbus A320neo"
                required
              />
            </div>

            <div>
              <label htmlFor="flightStatus">
                Flight Status
              </label>
              <select
                id="flightStatus"
                name="flightStatus"
                value={form.flightStatus}
                onChange={handleChange}
                required
              >
                <option value="SCHEDULED">
                  SCHEDULED
                </option>
                <option value="DELAYED">DELAYED</option>
                <option value="CANCELLED">
                  CANCELLED
                </option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="create-flight-button"
            disabled={loading || airportsLoading}
          >
            {loading ? "Creating Flight..." : "Create Flight"}
          </button>
        </form>

        {message && (
          <div
            className={`flight-message ${messageType}`}
            role="status"
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateFlight;
