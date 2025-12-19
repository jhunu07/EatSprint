import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackedOrderId, setTrackedOrderId] = useState(null);

  const fetchOrders = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${url}/api/order/user-orders`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setData(response.data.data);
      } else {
        console.error("Failed to fetch orders:", response.data.message);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Set up periodic refresh
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="my-orders">
        <h2>My Orders</h2>
        <div className="container">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>
      <div className='container'>
        {data.length === 0 ? (
          <p>No orders found. Start shopping to place your first order!</p>
        ) : (
          data.map((order) => (
            <div key={order._id} className='my-orders-order'>
              <img src={assets.parcel_icon} alt="" />
              <div className="order-details">
                <p className="order-items">
                  {order.items.map((item, i) => (
                    <span key={i}>
                      {item.name} x {item.quantity}
                      {i < order.items.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
                <p className="order-amount">₹{order.amount.toFixed(2)}</p>
                <p className="order-date">
                  {new Date(order.date).toLocaleDateString()}
                </p>
                <div className="order-status">
                  {trackedOrderId === order._id && (
                    <>
                      <div className="progress-steps">
                        {(() => {
                          const steps = [
                            'Placed',
                            'Confirmed',
                            'Prepared',
                            'Out for delivery',
                            'Delivered'
                          ];
                          const idx = (() => {
                            const s = (order.status || '').toLowerCase();
                            if (s.includes('deliver') && !s.includes('delivered')) return 3;
                            if (s.includes('delivered')) return 4;
                            if (s.includes('prepared')) return 2;
                            if (s.includes('confirmed')) return 1;
                            if (s.includes('food processing') || s.includes('placed') || s.includes('cod')) return 0;
                            return 0;
                          })();

                          return steps.map((step, i) => (
                            <div key={step} className={`step ${i <= idx ? 'done' : ''}`}>
                              <div className="step-dot">{i <= idx ? '✓' : i + 1}</div>
                              <div className="step-label">{step}</div>
                            </div>
                          ));
                        })()}
                      </div>
                      <div style={{ marginTop: 8 }}><b>{order.status}</b></div>
                    </>
                  )}
                </div>
              </div>
              <button
                className={`track-button ${order.status.toLowerCase()}`}
                disabled={order.status === "Delivered"}
                onClick={() => setTrackedOrderId(trackedOrderId === order._id ? null : order._id)}
              >
                {trackedOrderId === order._id ? 'Hide Track' : (order.status === 'Delivered' ? 'Delivered' : 'Track Order')}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;