
import { useState } from "react";
import "./CreateAirport.css";

function CreateAirport() {
  const [airportCode, setAirportCode] = useState("");
  const [airportName, setAirportName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const response = await fetch(
       "https://sleeve-highway-significance-forum.trycloudflare.com/api/airports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            airportCode: airportCode.trim().toUpperCase(),
            airportName: airportName.trim(),
            city: city.trim(),
            country: country.trim(),
          }),
        }
      );

      const result = await response.text();

      if (!response.ok) {
        let errorMessage = result;

        try {
          const errorData = JSON.parse(result);
          errorMessage =
            errorData.message || errorData.error || result;
        } catch {
          // Keep the original response if it is not JSON.
        }

        if (
          response.status === 409 ||
          /already exists|duplicate/i.test(errorMessage)
        ) {
          throw new Error("Airport code already exists!");
        }

        throw new Error(
          errorMessage || "Failed to create airport."
        );
      }

      setMessage("Airport created successfully!");
      setMessageType("success");

      setAirportCode("");
      setAirportName("");
      setCity("");
      setCountry("");
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? "Unable to connect to the server. Check that the backend is running."
          : error.message
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-airport-page">
      <div className="create-airport-card">
        <h2>Create Airport</h2>

        <form
          className="create-airport-form"
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="airportCode">Airport Code</label>
            <input
              id="airportCode"
              type="text"
              placeholder="e.g. HYD"
              value={airportCode}
              onChange={(e) =>
                setAirportCode(e.target.value.toUpperCase())
              }
              maxLength={10}
              required
            />
          </div>

          <div>
            <label htmlFor="airportName">Airport Name</label>
            <input
              id="airportName"
              type="text"
              placeholder="e.g. Rajiv Gandhi International Airport"
              value={airportName}
              onChange={(e) => setAirportName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              placeholder="e.g. Hyderabad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="country">Country</label>
            <input
              id="country"
              type="text"
              placeholder="e.g. India"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="create-airport-button"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Airport"}
          </button>
        </form>

        {message && (
          <div
            className={`airport-message ${messageType}`}
            role="status"
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateAirport;
