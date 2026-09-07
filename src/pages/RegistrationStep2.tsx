import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function RegistrationStep2() {
  const navigate = useNavigate();

  // Step 2 form fields
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");
  const [supervisingOfficer, setSupervisingOfficer] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [officialPhone, setOfficialPhone] = useState("");

  // OTP
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  //Phone
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Continue is enabled ONLY when everything is complete
  const isStep2Complete =
    department.trim() !== "" &&
    designation.trim() !== "" &&
    employeeId.trim() !== "" &&
    jurisdiction !== "" &&
    dateOfJoining !== "" &&
    supervisingOfficer.trim() !== "" &&
    officialEmail.trim() !== "" &&
    officialPhone.trim() !== "" &&
    emailVerified;
    phoneVerified;

  // Send OTP
  const handleSendOTP = async () => {
    setError("");
    setMessage("");

    const email = officialEmail.trim().toLowerCase();

    if (!email) {
      setError("Please enter your official email.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/otp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      setOtpSent(true);
      setEmailVerified(false);
      setOtp("");

      setMessage("OTP sent successfully. Please check your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: officialEmail.trim().toLowerCase(),
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP.");
      }

      setEmailVerified(true);
      setMessage("Email verified successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOTP = async () => {
    setError("");
    setMessage("");

    const phone = officialPhone.trim();

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/phone-otp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send phone OTP.");
      }

      setPhoneOtpSent(true);
      setPhoneVerified(false);
      setPhoneOtp("");

      setMessage("Phone OTP sent successfully. Please check your phone.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send phone OTP.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOTP = async () => {
    setError("");
    setMessage("");

    if (phoneOtp.length !== 6) {
      setError("Please enter the 6-digit phone OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/phone-otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: officialPhone.trim(),
          otp: phoneOtp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid phone OTP.");
      }

      setPhoneVerified(true);
      setMessage("Phone number verified successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Phone OTP verification failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Continue to Step 3
  const handleContinue = () => {
    if (!isStep2Complete) {
      setError("Please complete all required fields and verify your email.");
      return;
    }

    // Save ALL Step 2 information
    sessionStorage.setItem(
      "registrationStep2",
      JSON.stringify({
        department: department.trim(),
        designation: designation.trim(),
        employeeId: employeeId.trim(),
        jurisdiction,
        dateOfJoining,
        supervisingOfficer: supervisingOfficer.trim(),
        officialEmail: officialEmail.trim().toLowerCase(),
        officialPhone: officialPhone.trim(),
      }),
    );

    navigate("/register/step3");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-100 to-amber-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl p-8">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-green-900">
            Create Official Account
          </h1>

          <p className="text-sm text-gray-600 mt-1">
            Please provide your legal information exactly as it
            <br />
            appears on official documents.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="w-full max-w-md border border-gray-300 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-md bg-green-900 text-white flex items-center justify-center text-sm font-medium">
                1
              </div>

              <span className="text-xs text-green-900 mt-1">Basic Info</span>
            </div>

            <div className="h-px bg-green-900 w-20" />

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-md bg-green-900 text-white flex items-center justify-center text-sm font-medium">
                2
              </div>

              <span className="text-xs text-green-900 mt-1">Official Info</span>
            </div>

            <div className="h-px bg-gray-300 w-20" />

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-md bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium">
                3
              </div>

              <span className="text-xs text-gray-500 mt-1">Evidence</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="border border-gray-300 rounded-2xl p-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Department / Agency Name
              </label>

              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Federal Bureau of Investigation"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-green-900 focus:ring-1 focus:ring-green-900 outline-none text-sm"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Designation / Rank
              </label>

              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Special Agent"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-green-900 focus:ring-1 focus:ring-green-900 outline-none text-sm"
              />
            </div>

            {/* Employee ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Employee / Badge ID
              </label>

              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter official ID number"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-green-900 focus:ring-1 focus:ring-green-900 outline-none text-sm"
              />
            </div>

            {/* Jurisdiction */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Jurisdiction / Location
              </label>

              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-green-900 focus:ring-1 focus:ring-green-900 outline-none text-sm text-gray-500"
              >
                <option value="">Select jurisdiction level</option>
                <option value="National">National</option>
                <option value="State">State</option>
                <option value="District">District</option>
                <option value="Local">Local</option>
              </select>
            </div>

            {/* Date of Joining */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Date of Joining
              </label>

              <input
                type="date"
                value={dateOfJoining}
                onChange={(e) => setDateOfJoining(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-green-900 focus:ring-1 focus:ring-green-900 outline-none text-sm"
              />
            </div>

            {/* Supervising Officer */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Supervising Officer
              </label>

              <input
                type="text"
                value={supervisingOfficer}
                onChange={(e) => setSupervisingOfficer(e.target.value)}
                placeholder="Name or Title"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-green-900 focus:ring-1 focus:ring-green-900 outline-none text-sm"
              />
            </div>

            {/* Official Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Official Email
              </label>

              <div className="flex gap-2">
                <input
                  type="email"
                  value={officialEmail}
                  onChange={(e) => {
                    setOfficialEmail(e.target.value);
                    setEmailVerified(false);
                    setOtpSent(false);
                    setOtp("");
                    setMessage("");
                    setError("");
                  }}
                  placeholder="Enter Email"
                  disabled={emailVerified}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 focus:border-green-900 focus:ring-1 focus:ring-green-900 outline-none text-sm disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading || !officialEmail.trim() || emailVerified}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                    loading || !officialEmail.trim() || emailVerified
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-green-900 text-white hover:bg-green-800"
                  }`}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </div>

            {/* Official Phone */}
            {/* Official Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Official Phone
              </label>

              <div className="flex gap-2">
                <input
                  type="tel"
                  inputMode="numeric"
                  value={officialPhone}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setOfficialPhone(value);
                    setPhoneVerified(false);
                    setPhoneOtpSent(false);
                    setPhoneOtp("");
                    setMessage("");
                    setError("");
                  }}
                  placeholder="Enter 10-digit phone no."
                  disabled={phoneVerified}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 focus:border-green-900 focus:ring-1 focus:ring-green-900 outline-none text-sm disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={handleSendPhoneOTP}
                  disabled={
                    loading || !/^\d{10}$/.test(officialPhone) || phoneVerified
                  }
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                    loading || !/^\d{10}$/.test(officialPhone) || phoneVerified
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-green-900 text-white hover:bg-green-800"
                  }`}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </div>
          </div>

          {/* OTP Section */}
          {otpSent && !emailVerified && (
            <div className="mt-6 p-4 rounded-xl border border-green-200 bg-green-50">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Enter 6-Digit OTP
              </label>

              <div className="flex gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter OTP"
                  className="w-48 px-3 py-2.5 rounded-lg border border-gray-300 focus:border-green-900 focus:ring-1 focus:ring-green-900 outline-none text-sm tracking-widest"
                />

                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium ${
                    loading || otp.length !== 6
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-green-900 text-white hover:bg-green-800"
                  }`}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </div>
          )}

          {/* Verification Status */}
          {emailVerified && (
            <div className="mt-6 p-4 rounded-xl border border-green-200 bg-green-50">
              <div className="flex items-center gap-2 text-green-800 text-sm font-medium">
                <span className="text-lg">✓</span>
                Email verified successfully
              </div>
            </div>
          )}

          {/* Phone OTP Section */}
          {phoneOtpSent && !phoneVerified && (
            <div className="mt-6 p-4 rounded-xl border border-green-200 bg-green-50">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Enter 6-Digit Phone OTP
              </label>

              <div className="flex gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={phoneOtp}
                  onChange={(e) =>
                    setPhoneOtp(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter OTP"
                  className="w-48 px-3 py-2.5 rounded-lg border border-gray-300 focus:border-green-900 focus:ring-1 focus:ring-green-900 outline-none text-sm tracking-widest"
                />

                <button
                  type="button"
                  onClick={handleVerifyPhoneOTP}
                  disabled={loading || phoneOtp.length !== 6}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium ${
                    loading || phoneOtp.length !== 6
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-green-900 text-white hover:bg-green-800"
                  }`}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </div>
          )}

          {/* Phone Verification Status */}
          {phoneVerified && (
            <div className="mt-6 p-4 rounded-xl border border-green-200 bg-green-50">
              <div className="flex items-center gap-2 text-green-800 text-sm font-medium">
                <span className="text-lg">✓</span>
                Phone number verified successfully
              </div>
            </div>
          )}

          {/* Messages */}
          {message && <p className="mt-4 text-sm text-green-700">{message}</p>}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-7">
            <button
              type="button"
              onClick={() => navigate("/register/step1")}
              className="px-5 py-2.5 rounded-lg border border-gray-400 bg-white text-gray-800 text-sm font-medium hover:bg-gray-100 transition"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!isStep2Complete}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                isStep2Complete
                  ? "bg-green-900 text-white hover:bg-green-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
