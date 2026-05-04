"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Phone, ShieldCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "@/utils/api";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.push("/dashboard");
  }, [router]);

  const sendOtp = async (e) => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Valid 10 digit phone number daal bro");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/send-otp", { phone });
      toast.success("OTP sent: 123456");
      setStep("otp");
    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP send failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("6 digit OTP daal bro");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/auth/verify-otp", {
        phone,
        otp,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login successful");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] px-4 py-6 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-[#eadcc5] bg-white shadow-2xl lg:grid-cols-2">
          
          {/* LEFT PANEL */}
          <section className="relative hidden min-h-[620px] bg-[#071726] p-10 text-white lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#b8862b55,transparent_35%),linear-gradient(135deg,#071726,#102b45)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-[#b8862b]/40 bg-white/10 text-2xl font-black text-[#f3d78d]">
                  TV
                </div>

                <h1 className="text-4xl font-semibold leading-tight">
                  The Traditional Villa
                </h1>

                <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
                  Manage villa bookings, payments, expenses, calendar and P&L
                  from one clean admin panel.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-white/70">Admin Panel</p>
                <p className="mt-2 text-2xl font-semibold text-[#f3d78d]">
                  Bookings • Calendar • P&L
                </p>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <section className="flex min-h-[620px] items-center justify-center p-5 sm:p-8 lg:p-12">
            <div className="w-full max-w-md">
              
              {/* HEADER */}
              <div className="mb-8 text-center lg:text-left">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#071726] text-xl font-black text-[#f3d78d] lg:mx-0">
                  TV
                </div>

                <h2 className="text-3xl font-semibold text-[#071726]">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm text-[#6b7280]">
                  Login with phone number and OTP.
                </p>
              </div>

              {/* PHONE STEP */}
              {step === "phone" ? (
                <form onSubmit={sendOtp} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#071726]">
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#b8862b]" />

                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="9876543210"
                        className="input !pl-12"
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                
                /* OTP STEP */
                <form onSubmit={verifyOtp} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#071726]">
                      Enter OTP
                    </label>

                    <div className="relative">
                      <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#b8862b]" />

                      <input
                        type="tel"
                        maxLength={6}
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="123456"
                        className="input !pl-12 tracking-[0.3em]"
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Verifying..." : "Verify & Login"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                    }}
                    className="w-full text-sm font-medium text-[#b8862b]"
                  >
                    Change phone number
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}