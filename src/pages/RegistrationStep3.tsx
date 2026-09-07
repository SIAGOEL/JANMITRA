import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function RegistrationStep3() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isPasswordValid = /^\d{8}$/.test(password);
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length === 8;

  const canSubmit = isPasswordValid && passwordsMatch && !loading;

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!isPasswordValid) {
      setError("Password must contain exactly 8 digits.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    // Get Step 1 data
    const step1Data = sessionStorage.getItem("registrationStep1");

    // Get Step 2 data
    const step2Data = sessionStorage.getItem("registrationStep2");

    if (!step1Data || !step2Data) {
      setError(
        "Registration information is missing. Please complete Step 1 and Step 2 again."
      );
      return;
    }

    let step1;
    let step2;

    try {
      step1 = JSON.parse(step1Data);
      step2 = JSON.parse(step2Data);
    } catch {
      setError(
        "Registration information is invalid. Please restart registration."
      );
      return;
    }

    const fullName = String(step1.fullName || "").trim();
    const email = String(step2.officialEmail || "")
      .trim()
      .toLowerCase();

    if (!fullName) {
      setError("Full name is missing from Step 1.");
      return;
    }

    if (!email) {
      setError("Official email is missing from Step 2.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create your account."
        );
      }

      // Store authentication token exactly like Login does.
      if (data.token) {
        sessionStorage.setItem("token", data.token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Registration data is no longer needed.
      sessionStorage.removeItem("registrationStep1");
      sessionStorage.removeItem("registrationStep2");

      setSuccess("Account created successfully.");

      // Small delay so the success message is visible.
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 8);

    setPassword(digitsOnly);
    setError("");
    setSuccess("");
  };

  const handleConfirmPasswordChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 8);

    setConfirmPassword(digitsOnly);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-900">
            Create Official Account
          </h1>

          <p className="text-sm text-gray-600 mt-1">
            Set your secure 8-digit login password.
          </p>
        </div>

        {/* PROGRESS */}
        <div className="w-full max-w-[400px] border border-gray-300 rounded-xl p-3">
          <div className="flex items-center justify-between">

            <ProgressStep
              number="1"
              label="Basic Info"
              completed
            />

            <div className="h-px bg-green-800 flex-1 mx-3" />

            <ProgressStep
              number="2"
              label="Official Info"
              completed
            />

            <div className="h-px bg-green-800 flex-1 mx-3" />

            <ProgressStep
              number="3"
              label="Security"
              active
            />

          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

          {/* LEFT SIDE */}
          <div className="border border-gray-300 rounded-xl p-5">

            {/* SKIPPED VERIFICATIONS */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Identity Verification
              </h2>

              <div className="space-y-3">

                <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Facial Verification
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Skipped for now
                    </p>
                  </div>

                  <span className="text-xs font-medium text-gray-500">
                    SKIPPED
                  </span>
                </div>

                <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Device Biometric
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Skipped for now
                    </p>
                  </div>

                  <span className="text-xs font-medium text-gray-500">
                    SKIPPED
                  </span>
                </div>

              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-5 h-5 text-green-900" />

                <label className="text-sm font-semibold text-gray-800">
                  Create 8-Digit Password
                </label>
              </div>

              <p className="text-xs text-gray-500 mb-3">
                Your password must contain exactly 8 digits.
              </p>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={8}
                  value={password}
                  onChange={(e) =>
                    handlePasswordChange(e.target.value)
                  }
                  placeholder="Enter 8-digit password"
                  className="w-full px-4 py-3 pr-20 rounded-lg border border-gray-300 focus:border-green-900 focus:ring-1 focus:ring-green-900 outline-none text-sm tracking-[0.35em]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 hover:text-green-900"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="flex gap-2 mt-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <span
                    key={index}
                    className={`w-3 h-3 rounded-full border border-gray-500 ${
                      index < password.length
                        ? "bg-green-900"
                        : "bg-white"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={8}
                  value={confirmPassword}
                  onChange={(e) =>
                    handleConfirmPasswordChange(e.target.value)
                  }
                  placeholder="Re-enter 8-digit password"
                  className="w-full px-4 py-3 pr-20 rounded-lg border border-gray-300 focus:border-green-900 focus:ring-1 focus:ring-green-900 outline-none text-sm tracking-[0.35em]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 hover:text-green-900"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {confirmPassword.length > 0 &&
                password === confirmPassword &&
                password.length === 8 && (
                  <p className="mt-2 text-xs text-green-700">
                    ✓ Passwords match
                  </p>
                )}

              {confirmPassword.length > 0 &&
                password !== confirmPassword && (
                  <p className="mt-2 text-xs text-red-600">
                    Passwords do not match
                  </p>
                )}
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="border border-gray-300 rounded-xl p-5 min-h-[360px] flex flex-col">

            <div className="flex-1 flex flex-col items-center justify-center">

              <div className="w-16 h-16 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-5">
                <KeyRound className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                Account Security
              </h2>

              <p className="text-sm text-gray-500 text-center max-w-sm mt-2">
                This password will be used with your official
                email address to sign in to Janmitra.
              </p>

              <div className="w-full max-w-md mt-6">

                <InfoRow
                  label="Official Email"
                  value={
                    (() => {
                      try {
                        const data = sessionStorage.getItem(
                          "registrationStep2"
                        );

                        if (!data) return "Not available";

                        const parsed = JSON.parse(data);

                        return (
                          parsed.officialEmail ||
                          "Not available"
                        );
                      } catch {
                        return "Not available";
                      }
                    })()
                  }
                />

                <InfoRow
                  label="Password"
                  value={
                    password.length === 8
                      ? "8-digit password set"
                      : `${password.length}/8 digits`
                  }
                />

                <InfoRow
                  label="Face Scan"
                  value="Skipped for now"
                />

                <InfoRow
                  label="Biometric"
                  value="Skipped for now"
                />

              </div>

              {error && (
                <div className="w-full max-w-md mt-5 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="w-full max-w-md mt-5 p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-5 h-5" />

                    <p className="text-sm font-medium">
                      {success}
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* BOTTOM BUTTONS */}
        <div className="flex justify-between mt-5">

          <button
            type="button"
            onClick={() => navigate("/register/step2")}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
              canSubmit
                ? "bg-green-900 text-white hover:bg-green-800"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Creating Account..." : "Submit Registration"}

            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
}

function ProgressStep({
  number,
  label,
  completed = false,
  active = false,
}: {
  number: string;
  label: string;
  completed?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center min-w-[65px]">

      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center text-sm font-semibold ${
          completed || active
            ? "bg-green-900 text-white"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {completed && !active ? "✓" : number}
      </div>

      <span
        className={`text-xs mt-1 ${
          completed || active
            ? "text-green-900"
            : "text-gray-500"
        }`}
      >
        {label}
      </span>

    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 py-3 text-sm">

      <span className="font-medium text-gray-700">
        {label}
      </span>

      <span className="text-gray-600 text-right">
        {value}
      </span>

    </div>
  );
}