import { useState, useEffect } from "react";
import { IoWater } from "react-icons/io5";
import type { Entry } from "../types";

type Props = {
  onSave: (data: { date: string; bottle_count: number }) => void;
  editItem: Entry | null;
  saveLoading: boolean;
};

const EntryForm = ({ onSave, editItem, saveLoading }: Props) => {
  const [date, setDate] = useState<string>("");
  const [count, setCount] = useState<string>("");

  const getTodayDate = () =>
    new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (editItem) {
      setDate(editItem.date?.substring(0, 10));
      setCount(editItem.bottle_count.toString());
    } else {
      setDate(getTodayDate());
      setCount("");
    }
  }, [editItem]);

  const handleSubmit = () => {
    if (!date || !count) return alert("Fill all fields");

    onSave({
      date,
      bottle_count: Number(count),
    });

    setCount("");
  };

  return (
    <div className="card form">
      <h3>
        <IoWater style={{ color: "#3b82f6", fontSize: "20px" }} />
        {" "}Log Daily Delivery
      </h3>

      <div className="form-row">
        <div className="form-group">
          <p>DELIVERY DATE</p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <p>BOTTLE COUNT</p>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>

        <button
          className="save-btn"
          onClick={handleSubmit}
          disabled={saveLoading}
        >
          {saveLoading ? "Saving..." : editItem ? "Update" : "Save Entry"}
        </button>
      </div>
    </div>
  );
};

export default EntryForm;