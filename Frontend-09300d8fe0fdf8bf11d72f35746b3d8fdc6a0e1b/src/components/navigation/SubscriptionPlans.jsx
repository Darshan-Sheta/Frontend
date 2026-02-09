import React, { useState } from "react";
import { useActionData, useNavigate } from "react-router-dom";
import axios from "axios";
import PaymentSuccessCard from "./PaymentSuccess";
import { useAuth } from "../../context/AuthContext";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { username, userId, status } = useAuth();
  // const username = localStorage.getItem("username");
  // const githubUserName = localStorage.getItem("githubUsername");
  // const userId = localStorage.getItem("userId");
  // const status = localStorage.getItem("status");
  const [showPaymentSuccessCard, setShowPaymentSuccessCard] = useState(false);

  // Create order for payment
  const paymentOrder = async () => {
    const amount = 479;
    const API_URL = `${API_BASE}/api/users/create_order`;

    try {
      const response = await axios.post(
        API_URL,
        { amount, username, userId, info: "order_request" },
        {
          withCredentials: true, // <-- Ensures JWT cookie is sent!
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "created") {
        const options = {
          key: "rzp_test_LADJfV2vRiNrkZ",
          amount: response.data.amount,
          currency: "INR",
          name: "Payment Demo",
          description: "Demo Payment",
          order_id: response.data.id,
          handler: function (rzpResponse) {
            updatePaymentOnServer(
              rzpResponse.razorpay_payment_id,
              rzpResponse.razorpay_order_id,
              username,
              "paid"
            );
            setShowPaymentSuccessCard(true);
            localStorage.setItem("paymentJustMade", Date.now());
            window.dispatchEvent(new CustomEvent("paymentSuccess"));
          },
          prefill: { name: "", email: "", contact: "" },
          notes: { address: "Demo Razorpay Payment" },
          theme: { color: "#3399cc" },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => alert("Oops!! Payment Failed"));
        rzp.open();
      }
    } catch (error) {
      alert("Something went wrong !!");
    }
  };

  // Update payment status on server
  const updatePaymentOnServer = async (payment_id, order_id, username, status) => {
    const API_URL = `${API_BASE}/api/users/update_order`;
    try {
      const response = await axios.post(
        API_URL,
        { payment_id, order_id, username, userId, status },
        {
          withCredentials: true, // <-- Ensures JWT cookie is sent!
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setShowPaymentSuccessCard(true);
      localStorage.setItem("paymentJustMade", Date.now());
      // localStorage.setItem("status", response.data.status || "paid");
      window.localStorage.setItem("paymentJustMade", Date.now());
      window.dispatchEvent(new CustomEvent("paymentSuccess"));
    } catch (error) {
      alert("Failed! Payment was successful but not updated on server.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-10 flex justify-center items-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-orange-200/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl w-full z-10">
        {/* Free Plan */}
        <div className="glass-card rounded-2xl p-8 border border-border flex flex-col hover:scale-[1.02] transition-transform duration-300">
          <h2 className="text-3xl font-display font-bold text-text-main mb-4">Free Plan</h2>
          <div className="text-4xl font-bold text-text-muted mb-6">₹0<span className="text-lg font-normal text-text-muted/70">/month</span></div>
          <ul className="mb-8 space-y-4 flex-1">
            <li className="flex items-center text-text-muted"><span className="mr-2 text-green-500">✅</span> Limited Chat Access</li>
            <li className="flex items-center text-text-muted"><span className="mr-2 text-green-500">✅</span> Hackathon Viewing</li>
            <li className="flex items-center text-text-muted/50"><span className="mr-2 grayscale opacity-50">🚫</span> No Team Matching</li>
            <li className="flex items-center text-text-muted/50"><span className="mr-2 grayscale opacity-50">🚫</span> No Premium Chat</li>
          </ul>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-4 bg-surface border border-border hover:bg-white text-text-main font-semibold rounded-xl w-full transition-all"
          >
            Continue Free
          </button>
        </div>

        {/* Premium Plan */}
        <div className="glass-card rounded-2xl p-8 border-2 border-accent/50 relative flex flex-col transform md:scale-105 shadow-xl hover:scale-[1.07] transition-transform duration-300">
          <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POPULAR</div>
          <h2 className="text-3xl font-display font-bold text-text-main mb-4">Premium Plan</h2>
          <div className="text-4xl font-bold text-accent mb-6">₹479<span className="text-lg font-normal text-text-muted">/lifetime</span></div>
          <ul className="mb-8 space-y-4 flex-1">
            <li className="flex items-center text-text-main font-medium"><span className="mr-2 text-accent">✅</span> Full Chat Access</li>
            <li className="flex items-center text-text-main font-medium"><span className="mr-2 text-accent">✅</span> Hackathon Participation</li>
            <li className="flex items-center text-text-main font-medium"><span className="mr-2 text-accent">✅</span> AI-Based Team Matching</li>
            <li className="flex items-center text-text-main font-medium"><span className="mr-2 text-accent">✅</span> Premium Support</li>
          </ul>
          <button
            onClick={paymentOrder}
            className="px-6 py-4 bg-gradient-to-r from-accent to-orange-400 hover:shadow-lg text-white font-bold rounded-xl w-full transition-all"
          >
            Get Premium Access
          </button>
        </div>
      </div>
      {showPaymentSuccessCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-8 rounded-2xl shadow-2xl max-w-md w-full text-center animate-fade-in-up">
            <PaymentSuccessCard />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
