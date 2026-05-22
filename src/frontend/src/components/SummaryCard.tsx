type Props = {
  totalBottles: number;
  totalAmount: number;
  days: number;
  price: number;
  loading: boolean;
};

const SummaryCard = ({
  totalBottles,
  totalAmount,
  days,
  price,
  loading,
}: Props) => {
  const currentMonth = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="analytics-wrapper">
      <p className="para">MONTHLY ANALYTICS</p>

      <div className="analytics-card">
        <div className="analytics-cell">
          <p>CURRENT <br /> MONTH</p>
          <h3>{currentMonth}</h3>
        </div>

        <div className="analytics-cell">
          <p>Total <br /> Bottles</p>
          <h3>
            {loading ? <span className="mini-loader"></span> : totalBottles}
          </h3>
        </div>

        <div className="analytics-cell">
          <p>Delivery <br /> Days</p>
          <h3>
            {loading ? <span className="mini-loader"></span> : days}
          </h3>
        </div>

        <div className="analytics-cell">
          <p>Price / <br /> Bottle</p>
          <h3>
            {loading ? <span className="mini-loader"></span> : `Rs. ${price}`}
          </h3>
        </div>

        <div className="analytics-cell">
          <p>Total <br /> Amount</p>
          <h3>
            {loading ? (
              <span className="mini-loader"></span>
            ) : (
              `Rs. ${totalAmount.toFixed(2)}`
            )}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
