type Props = {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
};

const MonthSelector = ({ month, year, onChange }: Props) => {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [m, y] = e.target.value.split("-");
    onChange(Number(m), Number(y));
  };

  return (
    <select value={`${month}-${year}`} onChange={handleChange}>
      {years.map((y) =>
        months.map((name, idx) => {
          const m = idx + 1;
          return (
            <option key={`${m}-${y}`} value={`${m}-${y}`}>
              {name} {y}
            </option>
          );
        })
      )}
    </select>
  );
};

export default MonthSelector;