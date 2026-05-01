// components/PaymentButton.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, CheckCircle } from "lucide-react";
import {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
} from "../features/api/purchaseApi";

const PaymentButton = ({ courseId, coursePrice, courseTitle, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [createOrder] = useCreateOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("Failed to load payment gateway. Please try again.");
        setLoading(false);
        return;
      }

      // Create order
      const orderResponse = await createOrder({ courseId }).unwrap();

      if (!orderResponse.success) {
        alert(orderResponse.message || "Failed to create order");
        setLoading(false);
        return;
      }

      const { orderId, amount, key, course } = orderResponse.data;

      // Razorpay options
      const options = {
        key: key,
        amount: amount,
        currency: "INR",
        name: "LMS Platform",
        description: `Purchase: ${course.title}`,
        image: course.thumbnail,
        order_id: orderId,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              courseId: courseId,
              amount: amount,
            }).unwrap();

            if (verifyResponse.success) {
              alert("Payment successful! You are now enrolled in the course.");
              if (onSuccess) onSuccess();
              navigate(`/course/${courseId}`);
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: localStorage.getItem("userName") || "",
          email: localStorage.getItem("userEmail") || "",
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader className="w-5 h-5 animate-spin" />
          Processing...
        </span>
      ) : (
        `Enroll Now - $${coursePrice}`
      )}
    </button>
  );
};

export default PaymentButton;
