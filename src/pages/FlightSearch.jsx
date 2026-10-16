
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlightSearch.css';

const API_URL = 'https://governor-set-element-maximize.trycloudflare.com/api/flights/search';

function FlightSearch() {
  const navigate = useNavigate();

  const [source, setSource] = useState('HYD');
  const [destination, setDestination] = useState('DEL');
  const [departureDate, setDepartureDate] = useState('');
  const [passengers, setPassengers] = useState(1);

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSwap = () => {
    setSource(destination);
    setDestination(source);
  };

  
 
const handleBookFlight = (flight) => {
  const isLoggedIn =
    localStorage.getItem('skybookerLogin') === 'true';

  if (!isLoggedIn) {
    navigate('/login', {
      state: {
        from: '/booking',
        flight: flight,
        passengers: passengers,
        message: 'Please log in first to book your flight.',
      },
    });
    return;
  }

  navigate('/booking', {
    state: {
      flight: flight,
      passengers: passengers,
    },
  });
};


  const handleSearch = async (event) => {
    event.preventDefault();

    setError('');
    setFlights([]);

    if (!source.trim() || !destination.trim() || !departureDate) {
      setError('Please enter both airport codes and select a date.');
      return;
    }

    if (source.trim().toUpperCase() === destination.trim().toUpperCase()) {
      setError('Source and destination cannot be the same.');
      return;
    }

    const searchRequest = {
      source: source.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      departureDate,
      numberOfPassengers: passengers,
    };

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchRequest),
      });

      if (!response.ok) {
        throw new Error(`Search failed. HTTP status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Unexpected response from the server.');
      }

      setFlights(data);

      if (data.length === 0) {
        setError('No flights found for this route and date.');
      }
    } catch (err) {
      console.error('Flight search error:', err);
      setError(
        'Unable to search flights. Check that the backend is running and the API URL is correct.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flight-search-page">
      <nav className="search-navbar">
        <div className="search-logo">
          <span>✈</span> SkyBooker
        </div>

        <button
          type="button"
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← Home
        </button>
      </nav>

      <main className="search-content">
        <div className="search-heading">
          <p>✦ FIND YOUR JOURNEY</p>
          <h1>Search Flights</h1>
          <span>Find the perfect flight for your next adventure.</span>
        </div>

        <form className="search-card" onSubmit={handleSearch}>
          <div className="input-group">
            <label htmlFor="source">FROM</label>
            <div className="input-box">
              <span className="input-icon">✈</span>
              <input
                id="source"
                type="text"
                placeholder="Airport code (e.g. HYD)"
                value={source}
                onChange={(e) => setSource(e.target.value.toUpperCase())}
                maxLength={3}
                required
              />
            </div>
          </div>

          <button
            type="button"
            className="swap-button"
            onClick={handleSwap}
            aria-label="Swap source and destination"
          >
            ⇄
          </button>

          <div className="input-group">
            <label htmlFor="destination">TO</label>
            <div className="input-box">
              <span className="input-icon">📍</span>
              <input
                id="destination"
                type="text"
                placeholder="Airport code (e.g. DEL)"
                value={destination}
                onChange={(e) =>
                  setDestination(e.target.value.toUpperCase())
                }
                maxLength={3}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="departureDate">DEPARTURE DATE</label>
            <div className="input-box">
              <span className="input-icon">📅</span>
              <input
                id="departureDate"
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>PASSENGERS</label>
            <div className="passenger-box">
              <button
                type="button"
                onClick={() =>
                  setPassengers((count) => Math.max(1, count - 1))
                }
                disabled={passengers <= 1}
                aria-label="Decrease passengers"
              >
                −
              </button>

              <span>
                {passengers} {passengers === 1 ? 'Passenger' : 'Passengers'}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPassengers((count) => Math.min(9, count + 1))
                }
                disabled={passengers >= 9}
                aria-label="Increase passengers"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="flight-search-button"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Flights'}
            <span>→</span>
          </button>
        </form>

        {error && (
          <div
            className={`search-message ${
              flights.length === 0 ? 'no-flights' : ''
            }`}
            role="status"
          >
            <span className="message-icon">✈</span>
            <div>
              <strong>
                {error.startsWith('No flights') ? 'No flights available' : 'Notice'}
              </strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {flights.length > 0 && (
          <section className="flight-results">
            <h2>Available Flights</h2>
            <p>
              {flights.length} flight{flights.length === 1 ? '' : 's'} found
              for {source} → {destination}
            </p>

            {flights.map((flight) => (
              <article className="flight-result-card" key={flight.flightId}>
                <div className="flight-result-top">
                  <div>
                    <h3>{flight.airlineName}</h3>
                    <span>{flight.flightNumber}</span>
                  </div>

                  <span className="flight-status">
                    {flight.flightStatus}
                  </span>
                </div>

                <div className="flight-route">
                  <div>
                    <strong>
                      {new Date(flight.departureTime).toLocaleTimeString(
                        'en-IN',
                        { hour: '2-digit', minute: '2-digit', hour12: true }
                      )}
                    </strong>
                    <span>{flight.sourceAirport}</span>
                  </div>

                  <div className="flight-duration">
                    <span>{flight.durationMinutes} min</span>
                    <div className="flight-route-line">✈ ──────</div>
                  </div>

                  <div>
                    <strong>
                      {new Date(flight.arrivalTime).toLocaleTimeString(
                        'en-IN',
                        { hour: '2-digit', minute: '2-digit', hour12: true }
                      )}
                    </strong>
                    <span>{flight.destinationAirport}</span>
                  </div>
                </div>

                <div className="flight-result-bottom">
                  <span>
                    {flight.availableSeats} seats available
                  </span>

                  <strong>
                    ₹{Number(flight.price).toLocaleString('en-IN')}
                  </strong>
                </div>

                <button
                  type="button"
                  className="flight-search-button"
                  onClick={() => handleBookFlight(flight)}
                >
                  Book Flight <span>→</span>
                </button>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default FlightSearch;
