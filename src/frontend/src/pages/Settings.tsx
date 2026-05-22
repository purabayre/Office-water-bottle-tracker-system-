import { useState, useEffect } from "react";
import API from "../api";
import { GiMoneyStack } from "react-icons/gi";

type PriceHistory = {
  _id: string;
  price: number;
  effective_from: string | null;
  status: string;
};

const Settings = () => {
  const [price, setPrice] = useState<string>("");
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [pageLoading, setPageLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const fetchPrice = async () => {
    try {
      setPageLoading(true);

      const currentRes = await API.get("/price/current");
      setPrice(currentRes.data.currentPrice?.price?.toString() || "");

      let historyRes = { data: [] as any[] };

      try {
        historyRes = await API.get("/price/history");
      } catch {
        console.log("History API not found");
      }

      const sorted: PriceHistory[] = (historyRes.data || [])
        .map((row: any, index: number) => ({
          _id: row._id || row.id || `price-${index}`,
          price: Number(row.price) || 0,
          effective_from: row.effective_from || null,
          status: (row.status || "archived").toLowerCase(),
        }))
        .sort(
          (a, b) =>
            new Date(b.effective_from || 0).getTime() -
            new Date(a.effective_from || 0).getTime()
        );

      setHistory(sorted);
    } catch (err: any) {
      console.log(err.message);
      showToast("Failed to fetch price");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleUpdate = async () => {
    const parsed = parseFloat(price);

    if (isNaN(parsed) || parsed <= 0) {
      showToast("Enter valid price");
      return;
    }

    try {
      setUpdateLoading(true);

      await API.post("/price/set", { price: parsed });

      showToast("Price updated");

      const newEntry: PriceHistory = {
        _id: `price-${Date.now()}`,
        price: parsed,
        effective_from: new Date().toISOString(),
        status: "active",
      };

      const updated = history.map((h) =>
        h.status === "active" ? { ...h, status: "archived" } : h
      );

      setHistory([newEntry, ...updated]);
    } catch {
      showToast("Update failed");
    } finally {
      setUpdateLoading(false);
    }
  };

  const visibleHistory = showAll ? history : history.slice(0, 4);

  return (
    <>
      <div className="main">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage global system configurations and pricing logic.</p>
        </div>

        <div className="card" style={{ padding: "20px 24px", marginTop: 40 }}>
          <div className="price-settings-grid">
            <div className="label-desc">
              <div className="card-label">
                <GiMoneyStack style={{ color: "#3b82f6", fontSize: "25px" }} />
                {" "}Price Settings
              </div>
              <p className="card-desc">
                Define the standard cost per bottle of water.
              </p>
            </div>

            <div className="price-right">
              <div className="price-input-label">Price per Bottle (Rs.)</div>

              <div className="price-input-wrapper">
                <span className="price-symbol">Rs.</span>
                <input
                  className="price-input"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                />
              </div>

              <button
                className="btn-primary"
                onClick={handleUpdate}
                disabled={updateLoading}
              >
                {updateLoading ? "Updating..." : "Update Price"}
              </button>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 60 }}>
          <div className="section-title">Price History</div>

          {pageLoading ? (
            <div className="empty-state">
              <div className="loader"></div>
              Loading...
            </div>
          ) : (
            <>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleHistory.length === 0 ? (
                    <tr>
                      <td colSpan={3}>No Data</td>
                    </tr>
                  ) : (
                    visibleHistory.map((row) => {
                      const isActive = row.status === "active";

                      return (
                        <tr key={row._id}>
                          <td>{formatDate(row.effective_from || "")}</td>
                          <td>Rs. {row.price}</td>
                          <td>
                            <span
                              style={{
                                background: isActive ? "#3b82f6" : "#ccc",
                                color: "#fff",
                                padding: "4px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              {isActive ? "Active" : "Archived"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {history.length > 4 && (
                <p className="view-all" onClick={() => setShowAll(!showAll)}>
                  {showAll ? "Show Less" : "View All Transaction History"}
                </p>
              )}
            </>
          )}
        </div>

        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-label">Total Changes</div>
            <div className="stat-value">
              {pageLoading ? (
                <span className="mini-loader" style={{ width: "40px" }} />
              ) : (
                history.length
              )}
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Last Update</div>
            <div className="stat-value">
              {pageLoading ? (
                <span className="mini-loader" style={{ width: "90px" }} />
              ) : history[0] ? (
                formatDate(history[0].effective_from || "")
              ) : (
                "-"
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
};

export default Settings;
