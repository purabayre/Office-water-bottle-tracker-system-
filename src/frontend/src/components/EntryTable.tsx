import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import type { Entry } from "../types";

type Props = {
  data?: Entry[];
  onEdit: (item: Entry) => void;
  onDelete: (id: string) => void;
  deleteLoadingId: string | null;
  loading: boolean;
};

const EntryTable = ({
  data = [],
  onEdit,
  onDelete,
  deleteLoadingId,
  loading,
}: Props) => {
  const [showAll, setShowAll] = useState<boolean>(false);

  const visibleData = showAll ? data : data.slice(0, 4);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <>
      <div className="table-header">
        <h2>Recent Activity</h2>
      </div>

      <div className="cards" style={{ marginBottom: "80px" }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Bottles</th>
              <th>Price</th>
              <th>Total Amount</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {/* ✅ LOADER */}
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <div className="loader"></div>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : visibleData.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  No Data Found
                </td>
              </tr>
            ) : (
              visibleData.map((item) => (
                <tr key={item._id}>
                  <td className="det">{formatDate(item.date)}</td>

                  <td>
                    <span className="badge">{item.bottle_count}</span>
                  </td>

                  <td className="prices">
                    Rs. {item.price_per_bottle.toFixed(2)}
                  </td>

                  <td className="amount">
                    Rs. {item.amount.toFixed(2)}
                  </td>

                  <td className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => onEdit(item)}
                    >
                      <FaEdit />
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => onDelete(item._id)}
                      disabled={deleteLoadingId === item._id}
                    >
                      {deleteLoadingId === item._id
                        ? "Deleting..."
                        : <FaTrash />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data.length > 4 && !loading && (
          <p className="view-all" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show Less" : "View All Transaction History"}
          </p>
        )}
      </div>
    </>
  );
};

export default EntryTable;
