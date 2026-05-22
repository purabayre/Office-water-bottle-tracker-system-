const crypto = require("node:crypto");

const DEFAULT_PRICE = 5;

const state = {
  entries: [],
  prices: [],
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const isDbConnected = (mongoose) => mongoose.connection.readyState === 1;

const getActivePrice = () => {
  const active = state.prices.find((price) => price.status === "ACTIVE");

  if (!active) {
    return {
      price: DEFAULT_PRICE,
      effective_from: null,
      status: "DEFAULT",
    };
  }

  return clone(active);
};

const getPriceHistory = () => {
  const history = clone(state.prices).sort(
    (a, b) => new Date(b.effective_from) - new Date(a.effective_from),
  );

  return [
    ...history,
    {
      price: DEFAULT_PRICE,
      effective_from: null,
      status: "DEFAULT",
      message: "System default price",
    },
  ];
};

const setPrice = (price) => {
  state.prices = state.prices.map((row) => ({
    ...row,
    status: "ARCHIVED",
  }));

  const next = {
    _id: crypto.randomUUID(),
    price,
    effective_from: new Date().toISOString(),
    status: "ACTIVE",
  };

  state.prices.unshift(next);

  return clone(next);
};

const getEntriesByMonth = (month, year) =>
  clone(
    state.entries
      .filter((entry) => entry.month === month && entry.year === year)
      .sort((a, b) => new Date(a.date) - new Date(b.date)),
  );

const getSummary = (month, year) => {
  const entries = getEntriesByMonth(month, year);

  return {
    month,
    year,
    total_bottles: entries.reduce((sum, entry) => sum + entry.bottle_count, 0),
    total_amount: entries.reduce((sum, entry) => sum + entry.amount, 0),
    delivery_days: entries.length,
  };
};

const addEntry = ({ date, bottle_count }) => {
  if (state.entries.some((entry) => entry.date === date)) {
    return null;
  }

  const entryDate = new Date(date);
  const currentPrice = getActivePrice().price;
  const entry = {
    _id: crypto.randomUUID(),
    date,
    bottle_count,
    price_per_bottle: currentPrice,
    amount: bottle_count * currentPrice,
    month: entryDate.getUTCMonth() + 1,
    year: entryDate.getUTCFullYear(),
  };

  state.entries.push(entry);

  return clone(entry);
};

const updateEntry = (id, bottle_count) => {
  const index = state.entries.findIndex((entry) => entry._id === id);

  if (index === -1) return null;

  const entry = state.entries[index];
  state.entries[index] = {
    ...entry,
    bottle_count,
    amount: bottle_count * entry.price_per_bottle,
  };

  return clone(state.entries[index]);
};

const deleteEntry = (id) => {
  const index = state.entries.findIndex((entry) => entry._id === id);

  if (index === -1) return null;

  const [entry] = state.entries.splice(index, 1);

  return clone(entry);
};

module.exports = {
  addEntry,
  deleteEntry,
  getActivePrice,
  getEntriesByMonth,
  getPriceHistory,
  getSummary,
  isDbConnected,
  setPrice,
  updateEntry,
};
