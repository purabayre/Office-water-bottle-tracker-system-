import { useEffect, useState } from "react";
import API from "../api";
import EntryForm from "../components/EntryForm";
import SummaryCard from "../components/SummaryCard";
import EntryTable from "../components/EntryTable";
import type { Entry, Summary } from "../types";

const Layout = () => {
  const [data, setData] = useState<Entry[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total_bottles: 0,
    total_amount: 0,
    delivery_days: 0,
  });

  const [editItem, setEditItem] = useState<Entry | null>(null);
  const [price, setPrice] = useState<number>(0);

  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(false);

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  // FETCH DATA
  const fetchData = async () => {
    try {
      setPageLoading(true);

      const res = await API.get(`/entries/month?month=${month}&year=${year}`);

      setData(res.data.entries || []);
      setSummary(res.data.summary || {});
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setPageLoading(false);
    }
  };

  // FETCH PRICE
  const fetchPrice = async () => {
    try {
      const res = await API.get("/price/current");
      setPrice(res.data.currentPrice?.price || 0);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPrice();
  }, []);

  // SAVE ENTRY
  const handleSave = async (entry: { date: string; bottle_count: number }) => {
    try {
      setSaveLoading(true);

      const payload = {
        ...entry,
        price_per_bottle: price,
        amount: entry.bottle_count * price,
      };

      if (editItem) {
        await API.put(`/entries/update/${editItem._id}`, payload);
        setEditItem(null);
      } else {
        await API.post("/entries/add", payload);
      }

      fetchData();
    } catch (err: any) {
      alert("Error saving entry");
    } finally {
      setSaveLoading(false);
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this entry?")) return;

    try {
      setDeleteLoadingId(id);
      await API.delete(`/entries/delete/${id}`);
      fetchData();
    } catch {
      alert("Delete failed");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="main">
      <h1>Water Bottle Tracker</h1>

      <EntryForm
        onSave={handleSave}
        editItem={editItem}
        saveLoading={saveLoading}
      />

      <SummaryCard
        totalBottles={summary.total_bottles}
        totalAmount={summary.total_amount}
        days={summary.delivery_days}
        price={price}
        loading={pageLoading}
      />

      <EntryTable
        data={data}
        onEdit={setEditItem}
        onDelete={handleDelete}
        deleteLoadingId={deleteLoadingId}
        loading={pageLoading}
      />
    </div>
  );
};

export default Layout;
