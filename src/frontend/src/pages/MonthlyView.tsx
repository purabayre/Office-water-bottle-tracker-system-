
import { useEffect, useState } from "react";
import API from "../api";
import MonthSelector from "../components/MonthSelector";
import { IoPrint } from "react-icons/io5";
import { GrPrevious, GrNext } from "react-icons/gr";

type Entry = {
  _id: string;
  date: string;
  bottle_count: number;
  price_per_bottle: number;
  amount: number;
};

const getPageNumbers = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages = [];
  if (currentPage <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...");
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(1);
    pages.push("...");
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("...");
    for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
    pages.push("...");
    pages.push(totalPages);
  }
  return pages;
};

const MonthlyView = () => {
  const [data, setData] = useState<Entry[]>([]);
  const [summary, setSummary] = useState({
    total_bottles: 0,
    total_amount: 0,
    delivery_days: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/entries/month?month=${month}&year=${year}`);
      setData(res.data.entries || []);
      setSummary(res.data.summary || {});
      setCurrentPage(1);

    } catch (err: any) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);
  const start = data.length === 0 ? 0 : startIndex + 1;
  const end = Math.min(currentPage * itemsPerPage, data.length);

  const monthName = new Date(year, month - 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="main">
      <div className="header">
        <div className="analysis">
          <h1>{monthName} Analysis</h1>
          <p>Detailed hydration records and consumption patterns for Office A.</p>
        </div>
        <div className="header-actions">
          <MonthSelector
            month={month}
            year={year}
            onChange={(m, y) => {
              setMonth(m);
              setYear(y);
            }}
          />
          <button
            className="btn"
            onClick={() =>
              window.open(
                `${API.defaults.baseURL}/pdf/monthly?month=${month}&year=${year}`,
                "_blank"
              )
            }
          >
            <IoPrint /> Print PDF
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="summary-card">
        <div className="summary-cell">
          <p>Total Bottles</p>
          <h3>
            {loading ? (
              <span className="mini-loader" style={{ width: "40px" }} />
            ) : (
              summary.total_bottles || 0
            )}
          </h3>
        </div>

        <div className="summary-cell">
          <p>Delivery Days</p>
          <h3>
            {loading ? (
              <span className="mini-loader" style={{ width: "40px" }} />
            ) : (
              summary.delivery_days || 0
            )}
          </h3>
        </div>

        <div className="summary-cell">
          <p>Total Amount</p>
          <h3>
            {loading ? (
              <span className="mini-loader" style={{ width: "70px" }} />
            ) : (
              `Rs. ${Number(summary.total_amount || 0).toFixed(2)}`
            )}
          </h3>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <p className="table-hading">Daily Entry List</p>

        {loading ? (
          <div className="empty-state">
            <div className="loader"></div>
            Loading...
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bottles</th>
                  <th>Price</th>
                  <th>Total Amount</th>
                </tr>
              </thead>

              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No Data Found</td>
                  </tr>
                ) : (
                  currentData.map((item) => (
                    <tr key={item._id} className="daily-list">
                      <td>
                        {new Date(item.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td>{item.bottle_count}</td>
                      <td>Rs. {Number(item.price_per_bottle).toFixed(2)}</td>
                      <td>Rs. {Number(item.amount).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="page-buttons">
              <p>
                Showing {start} to {end} of {data.length}
              </p>

              <div className="next-prev">
                {/* PREVIOUS */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <GrPrevious />
                </button>

                {/* PAGE NUMBERS */}
                {getPageNumbers(currentPage, totalPages).map((page, i) =>
                  page === "..." ? (
                    <span key={i}>...</span>
                  ) : (
                    <button
                      key={i}
                      className={currentPage === page ? "active" : ""}
                      onClick={() => setCurrentPage(page as number)}
                    >
                      {page}
                    </button>
                  )
                )}

                {/* NEXT */}
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <GrNext />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyView;
