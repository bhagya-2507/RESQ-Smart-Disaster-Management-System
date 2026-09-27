import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ResourceRequest() {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    resource_id: "",
    quantity: "1",
    location: "",
    city: "",
    state: "",
    urgency: "Medium",
    description: "",
  });

  const token = localStorage.getItem("resq_token");

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError(
            "Please login again before requesting resources."
          );
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/resource-requests/catalog",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load available resources."
          );
        }

        setResources(data.resources || []);
      } catch (err) {
        console.error(
          "Resource catalog error:",
          err
        );

        setError(
          err.message ||
            "Unable to load available resources."
        );
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const selectedResource = resources.find(
    (resource) =>
      resource._id === form.resource_id
  );

  const submitRequest = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.resource_id) {
      setError("Please select a resource.");
      return;
    }

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError(
        "Quantity must be a valid positive number."
      );
      return;
    }

    if (
      selectedResource &&
      quantity > selectedResource.available_quantity
    ) {
      setError(
        `Only ${selectedResource.available_quantity} ${selectedResource.unit} available.`
      );
      return;
    }

    if (form.location.trim().length < 5) {
      setError(
        "Please provide a more specific location."
      );
      return;
    }

    if (form.city.trim().length < 2) {
      setError("Please enter your city.");
      return;
    }

    if (form.state.trim().length < 2) {
      setError("Please enter your state.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "http://localhost:5000/api/resource-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            resource_id: form.resource_id,
            quantity,
            location: form.location.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            urgency: form.urgency,
            description: form.description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit resource request."
        );
      }

      setSuccess(
        "Resource request submitted successfully. Admin response is now pending."
      );

      setForm({
        resource_id: "",
        quantity: "1",
        location: "",
        city: "",
        state: "",
        urgency: "Medium",
        description: "",
      });
    } catch (err) {
      console.error(
        "Resource request submit error:",
        err
      );

      setError(
        err.message ||
          "Unable to submit resource request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="resource-request-page">

      {/* HEADER */}
      <header className="request-header">

        <Link
          to="/citizen-dashboard"
          className="request-brand"
        >
          <div className="request-logo">
            R
          </div>

          <div>
            <strong>RESQ</strong>
            <span>
              CITIZEN RESOURCE CENTER
            </span>
          </div>
        </Link>

        <Link
          to="/citizen-dashboard"
          className="request-back"
        >
          ← Dashboard
        </Link>

      </header>

      <main className="resource-request-container">

        {/* HEADING */}
        <div className="resource-request-heading">

          <span>
            EMERGENCY RESOURCE ASSISTANCE
          </span>

          <h1>
            Request Emergency Resource
          </h1>

          <p>
            Request essential resources from the
            RESQ emergency response network.
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="resource-request-alert error">
            ⚠ {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="resource-request-alert success">
            ✓ {success}
          </div>
        )}

        <form
          className="resource-request-card"
          onSubmit={submitRequest}
        >

          {/* RESOURCE */}
          <section className="resource-request-section">

            <div className="resource-request-section-title">
              <span>01</span>

              <div>
                <h2>Select Resource</h2>
                <p>
                  Choose from currently available emergency resources.
                </p>
              </div>
            </div>

            {loading ? (

              <div className="resource-request-loading">
                Loading available resources...
              </div>

            ) : resources.length === 0 ? (

              <div className="resource-request-empty">
                <span>📦</span>

                <div>
                  <strong>
                    No resources currently available
                  </strong>

                  <p>
                    Please try again later or contact
                    emergency response support.
                  </p>
                </div>
              </div>

            ) : (

              <div className="resource-request-grid">

                <div className="resource-request-field full">

                  <label>
                    Emergency Resource *
                  </label>

                  <select
                    name="resource_id"
                    value={form.resource_id}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select required resource
                    </option>

                    {resources.map((resource) => (
                      <option
                        key={resource._id}
                        value={resource._id}
                      >
                        {resource.resource_name} —{" "}
                        {resource.available_quantity}{" "}
                        {resource.unit} available
                      </option>
                    ))}
                  </select>

                </div>

                {selectedResource && (
                  <div className="resource-selected-info">

                    <div>
                      <span>RESOURCE TYPE</span>
                      <strong>
                        {selectedResource.resource_type}
                      </strong>
                    </div>

                    <div>
                      <span>AVAILABLE</span>
                      <strong>
                        {selectedResource.available_quantity}{" "}
                        {selectedResource.unit}
                      </strong>
                    </div>

                    <div>
                      <span>LOCATION</span>
                      <strong>
                        {selectedResource.city},{" "}
                        {selectedResource.state}
                      </strong>
                    </div>

                  </div>
                )}

                <div className="resource-request-field">

                  <label>
                    Quantity *
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    max={
                      selectedResource
                        ? selectedResource.available_quantity
                        : undefined
                    }
                    value={form.quantity}
                    onChange={handleChange}
                  />

                </div>

                <div className="resource-request-field">

                  <label>
                    Urgency *
                  </label>

                  <select
                    name="urgency"
                    value={form.urgency}
                    onChange={handleChange}
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Critical">
                      Critical
                    </option>
                  </select>

                </div>

              </div>
            )}

          </section>

          {/* LOCATION */}
          <section className="resource-request-section">

            <div className="resource-request-section-title">
              <span>02</span>

              <div>
                <h2>Delivery Location</h2>
                <p>
                  Tell the response team where assistance is required.
                </p>
              </div>
            </div>

            <div className="resource-request-grid">

              <div className="resource-request-field full">

                <label>
                  Full Location *
                </label>

                <input
                  type="text"
                  name="location"
                  placeholder="House / street / landmark"
                  value={form.location}
                  onChange={handleChange}
                />

              </div>

              <div className="resource-request-field">

                <label>City *</label>

                <input
                  type="text"
                  name="city"
                  placeholder="Ghaziabad"
                  value={form.city}
                  onChange={handleChange}
                />

              </div>

              <div className="resource-request-field">

                <label>State *</label>

                <input
                  type="text"
                  name="state"
                  placeholder="Uttar Pradesh"
                  value={form.state}
                  onChange={handleChange}
                />

              </div>

            </div>

          </section>

          {/* DESCRIPTION */}
          <section className="resource-request-section">

            <div className="resource-request-section-title">
              <span>03</span>

              <div>
                <h2>Request Details</h2>
                <p>
                  Add any information that can help responders.
                </p>
              </div>
            </div>

            <div className="resource-request-field">

              <label>
                Description
              </label>

              <textarea
                name="description"
                rows="5"
                placeholder="Explain why the resource is needed, number of people affected, nearby landmark, medical need, etc."
                value={form.description}
                onChange={handleChange}
              />

            </div>

          </section>

          {/* ACTIONS */}
          <div className="resource-request-actions">

            <Link
              to="/citizen-dashboard"
              className="resource-request-cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="resource-request-submit"
              disabled={
                submitting ||
                loading ||
                resources.length === 0
              }
            >
              {submitting
                ? "Submitting Request..."
                : "📦 Submit Resource Request"}
            </button>

          </div>

        </form>

      </main>
    </div>
  );
}

export default ResourceRequest;