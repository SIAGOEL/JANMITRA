import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Eye,
  Fingerprint,
  Glasses,
  Lightbulb,
  LockKeyhole,
  ScanFace,
  Scale,
  ShieldCheck,
} from "lucide-react";

type VerificationStep = 1 | 2 | 3 | 4;

export default function RegistrationStep3() {
  const navigate = useNavigate();

  const [verificationStep, setVerificationStep] =
    useState<VerificationStep>(1);

  const [faceVerified, setFaceVerified] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [pin, setPin] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleFaceScan = () => {
    setFaceVerified(true);

    setTimeout(() => {
      setVerificationStep(2);
    }, 400);
  };

  const handleBiometricScan = () => {
    setBiometricVerified(true);

    setTimeout(() => {
      setVerificationStep(3);
    }, 400);
  };

  const handleNumberClick = (number: string) => {
    if (pin.length >= 6) return;
    setPin((previous) => previous + number);
  };

  const handlePinDelete = () => {
    setPin((previous) => previous.slice(0, -1));
  };

  const handleSubmitRegistration = () => {
    sessionStorage.setItem(
      "registrationStep3",
      JSON.stringify({
        faceVerified,
        biometricVerified,
        pinCreated: pin.length >= 4,
      }),
    );

    // Submit ke baad Screen 53 open hogi.
    setVerificationStep(4);
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f9fd] text-slate-900">
      {/* ================= HEADER ================= */}
      <header className="flex h-[62px] w-full items-center justify-between border-b border-[#dce6f0] bg-white px-5 lg:px-8">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.jpg"
            alt="JANMITRA Logo"
            className="h-[48px] w-[48px] object-contain"
          />

          <div>
            <h1 className="text-[20px] font-bold leading-none tracking-[0.04em] text-[#123f70]">
              JANMITRA
            </h1>

            <p className="mt-1 text-[9px] leading-none text-[#6b7d91]">
              Legal Investigation System
            </p>
          </div>
        </div>

        <div className="flex h-[30px] items-center gap-1.5 rounded-full bg-green-100 px-3 text-sm font-medium text-green-700">
          <ShieldCheck size={13} />
          Session Encrypted
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div className="flex min-h-[calc(100vh-62px)] w-full">
        {/* ================= LEFT PANEL ================= */}
        <aside className="relative hidden w-[255px] shrink-0 overflow-hidden border-r border-[#dce6f0] bg-gradient-to-b from-[#f5faff] via-[#f1f8ff] to-[#eef8ff] lg:block">
          <div className="relative z-10 px-[32px] pt-[70px]">
            <div className="mb-4 flex h-[31px] w-[31px] items-center justify-center rounded-full bg-[#0B3B78] text-white">
              <Scale size={17} />
            </div>

            <p className="text-sm font-semibold leading-tight text-[#113d6d]">
              Create Your
            </p>

            <h2 className="mt-[2px] text-[22px] font-bold leading-[1.02] text-[#1474e4]">
              Official Account
            </h2>

            <p className="mt-3 max-w-[175px] text-xs leading-[1.4] text-[#596f87]">
              Provide your legal information exactly as it appears on official
              documents.
            </p>
          </div>

          <img
            src="/sidebar-tricolor.png"
            alt=""
            className="absolute bottom-[82px] left-0 w-full object-contain"
          />

          {/* LEFT FOOTER */}
          <div className="absolute bottom-[20px] left-[28px] right-[28px]">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-[2px] w-[42%] rounded-full bg-[#43A96B]" />
              <div className="h-[2px] w-[42%] rounded-full bg-[#F57C00]" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B3B78] text-white">
                <Scale size={16} />
              </div>

              <div>
                <p className="text-xs font-semibold leading-4 text-[#073B7A]">
                  Justice. Integrity. Service.
                </p>

                <p className="text-[10px] leading-4 text-[#4D6FA3]">
                  Protected · Confidential · Trusted
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ================= RIGHT ================= */}
        <main className="flex min-w-0 flex-1 items-start justify-center p-4 lg:px-6 lg:py-4">
          <div className="w-full max-w-[980px] overflow-hidden rounded-[9px] border border-[#c9d5e2] bg-white shadow-sm">
            {/* ================= REGISTRATION STEPPER ================= */}
            <div className="border-b border-[#dce4ed] px-7 py-3">
              <div className="flex items-start">
                <div className="flex min-w-[105px] flex-col items-center">
                  <div className="flex h-[23px] w-[23px] items-center justify-center rounded-full bg-[#1477e5] text-[14px] font-semibold text-white">
                    1
                  </div>

                  <span className="mt-1 text-[12px] font-medium text-[#176bc7]">
                    Basic Information
                  </span>
                </div>

                <div className="mt-[11px] h-px flex-1 bg-[#70aef0]" />

                <div className="flex min-w-[115px] flex-col items-center">
                  <div className="flex h-[23px] w-[23px] items-center justify-center rounded-full bg-[#1477e5] text-[14px] font-semibold text-white">
                    2
                  </div>

                  <span className="mt-1 text-[12px] font-medium text-[#176bc7]">
                    Official Information
                  </span>
                </div>

                <div className="mt-[11px] h-px flex-1 bg-[#70aef0]" />

                <div className="flex min-w-[100px] flex-col items-center">
                  <div className="flex h-[23px] w-[23px] items-center justify-center rounded-full bg-[#1477e5] text-[14px] font-semibold text-white">
                    3
                  </div>

                  <span className="mt-1 text-[12px] font-medium text-[#176bc7]">
                    Identity Proof
                  </span>
                </div>
              </div>
            </div>

            {/* ================= MAIN CONTENT ================= */}
            <div className="grid grid-cols-1 gap-5 px-7 py-5 lg:grid-cols-[0.95fr_1.05fr]">
              {/* ================= LEFT VERIFICATION LIST ================= */}
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Verification Steps
                </h2>

                <p className="mt-1 text-[12px] text-slate-500">
                  Complete all steps to create your official account.
                </p>

                <div className="mt-4 space-y-2.5">
                  {/* FACIAL */}
                  <button
                    type="button"
                    onClick={() => setVerificationStep(1)}
                    className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${
                      verificationStep === 1
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-[#fafcff]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <ScanFace size={17} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-4 w-4 items-center justify-center rounded bg-blue-600 text-[10px] text-white">
                            1
                          </span>

                          <p className="text-xs font-semibold text-slate-900">
                            Facial Verification
                          </p>
                        </div>

                        <p className="mt-1 text-[12px] leading-4 text-slate-500">
                          Verify your identity using real-time
                          <br />
                          facial scan.
                        </p>
                      </div>
                    </div>

                    <ChevronRight size={15} />
                  </button>

                  {/* BIOMETRIC */}
                  <button
                    type="button"
                    onClick={() => setVerificationStep(2)}
                    className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${
                      verificationStep === 2
                        ? "border-green-400 bg-green-50"
                        : "border-slate-200 bg-[#fafcff]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                        <Fingerprint size={17} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-4 w-4 items-center justify-center rounded bg-green-600 text-[10px] text-white">
                            2
                          </span>

                          <p className="text-xs font-semibold text-slate-900">
                            Device Biometric
                          </p>
                        </div>

                        <p className="mt-1 text-[12px] leading-4 text-slate-500">
                          Authenticate using your device
                          <br />
                          biometric security.
                        </p>
                      </div>
                    </div>

                    <ChevronRight size={15} />
                  </button>

                  {/* PASSWORD */}
                  <button
                    type="button"
                    onClick={() => setVerificationStep(3)}
                    className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${
                      verificationStep === 3
                        ? "border-orange-300 bg-orange-50"
                        : "border-slate-200 bg-[#fafcff]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                        <LockKeyhole size={17} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-4 w-4 items-center justify-center rounded bg-orange-500 text-[10px] text-white">
                            3
                          </span>

                          <p className="text-xs font-semibold text-slate-900">
                            Secure Password
                          </p>
                        </div>

                        <p className="mt-1 text-[12px] leading-4 text-slate-500">
                          Create a strong password to secure
                          <br />
                          your account.
                        </p>
                      </div>
                    </div>

                    <ChevronRight size={15} />
                  </button>
                </div>

                {/* WHY THESE STEPS */}
                <div className="mt-4 flex items-start gap-2 rounded-md bg-blue-50 px-3 py-2.5">
                  <ShieldCheck
                    size={14}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>
                    <p className="text-[12px] font-semibold text-blue-700">
                      Why these steps?
                    </p>

                    <p className="mt-0.5 text-[12px] leading-4 text-slate-500">
                      These verification steps help us ensure that your account
                      is secure and protected.
                    </p>
                  </div>
                </div>
              </div>

              {/* ================= RIGHT SCREEN 1: FACIAL ================= */}
              {verificationStep === 1 && (
                <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
                  <div className="text-center">
                    <h3 className="text-sm font-semibold">
                      Facial Verification
                    </h3>

                    <p className="mt-1 text-[12px] text-blue-600">
                      Step 1 of 3
                    </p>
                  </div>

                  <div className="relative mx-auto mt-4 flex h-[205px] max-w-[280px] items-center justify-center rounded-lg border border-slate-200 bg-[#fafcff]">
                    <div className="flex h-[170px] w-[170px] items-center justify-center overflow-hidden rounded-lg">
                      <img
                        src="/face-scan.png"
                        alt="Facial verification"
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="absolute left-5 top-5 h-7 w-7 border-l-2 border-t-2 border-blue-500" />
                    <div className="absolute right-5 top-5 h-7 w-7 border-r-2 border-t-2 border-blue-500" />
                    <div className="absolute bottom-5 left-5 h-7 w-7 border-b-2 border-l-2 border-blue-500" />
                    <div className="absolute bottom-5 right-5 h-7 w-7 border-b-2 border-r-2 border-blue-500" />
                  </div>

                  <p className="mt-2 text-center text-[12px] text-slate-600">
                    Position your face in the frame
                  </p>

                  <div className="mt-3 flex justify-center gap-4 text-[12px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Lightbulb size={10} className="text-blue-600" />
                      Good lighting
                    </span>

                    <span className="flex items-center gap-1">
                      <Eye size={10} className="text-blue-600" />
                      Look Straight
                    </span>

                    <span className="flex items-center gap-1">
                      <Glasses size={10} className="text-blue-600" />
                      No Accessories
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                    <button
                      type="button"
                      onClick={() => navigate("/register/step2")}
                      className="rounded-md border border-slate-300 px-3 py-2 text-xs"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleFaceScan}
                      className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      <ScanFace size={13} />
                      {faceVerified ? "Verified" : "Start Scan"}
                    </button>
                  </div>
                </div>
              )}

              {/* ================= RIGHT SCREEN 2: BIOMETRIC ================= */}
              {verificationStep === 2 && (
                <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
                  <div className="text-center">
                    <h3 className="text-sm font-semibold">
                      Biometric Verification
                    </h3>

                    <p className="mt-1 text-[12px] text-blue-600">
                      Step 2 of 3
                    </p>
                  </div>

                  <div className="mx-auto mt-4 flex h-[205px] max-w-[280px] items-center justify-center rounded-lg border border-slate-200 bg-[#fafcff]">
                    <Fingerprint
                      size={115}
                      strokeWidth={1.2}
                      className="text-blue-500"
                    />
                  </div>

                  <p className="mt-2 text-center text-[12px] text-slate-600">
                    Position your finger on the machine
                  </p>

                  <div className="mt-3 flex justify-center gap-4 text-[12px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Fingerprint size={10} className="text-blue-500" />
                      Fix finger
                    </span>

                    <span className="flex items-center gap-1">
                      <ShieldCheck size={10} className="text-blue-500" />
                      Clean machine
                    </span>

                    <span className="flex items-center gap-1">
                      <Fingerprint size={10} className="text-blue-500" />
                      Finger should be healthy
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                    <button
                      type="button"
                      onClick={() => setVerificationStep(1)}
                      className="rounded-md border border-slate-300 px-3 py-2 text-xs"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleBiometricScan}
                      className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      <Fingerprint size={13} />
                      {biometricVerified ? "Verified" : "Start Scan"}
                    </button>
                  </div>
                </div>
              )}

              {/* ================= RIGHT SCREEN 3: PASSWORD ================= */}
              {verificationStep === 3 && (
                <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
                  <div className="text-center">
                    <h3 className="text-sm font-semibold">Secure Password</h3>

                    <p className="mt-1 text-[12px] text-blue-600">
                      Step 3 of 3
                    </p>
                  </div>

                  <div className="mt-4 flex justify-center gap-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <div
                        key={index}
                        className={`h-2 w-2 rounded-full border ${
                          index < pin.length
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-400 bg-white"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="mx-auto mt-4 grid w-[150px] grid-cols-3 gap-2">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
                      (number) => (
                        <button
                          key={number}
                          type="button"
                          onClick={() => handleNumberClick(number)}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4fb] text-sm font-semibold text-slate-800 transition hover:bg-blue-100"
                        >
                          {number}
                        </button>
                      ),
                    )}

                    <div />

                    <button
                      type="button"
                      onClick={() => handleNumberClick("0")}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4fb] text-sm font-semibold text-slate-800 transition hover:bg-blue-100"
                    >
                      0
                    </button>

                    <button
                      type="button"
                      onClick={handlePinDelete}
                      className="text-[12px] text-slate-500 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-3">
                    <button
                      type="button"
                      onClick={() => setVerificationStep(2)}
                      className="rounded-md border border-slate-300 px-3 py-2 text-xs"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={pin.length < 4}
                      onClick={() => {
                        if (pin.length >= 4) {
                          // PIN ready; final submit neeche se hoga.
                        }
                      }}
                      className="rounded-md bg-blue-600 px-5 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* ================= SCREEN 53: FINAL APPROVED ================= */}
              {verificationStep === 4 && (
                <div className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
                  <div className="text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <ShieldCheck size={20} />
                    </div>

                    <h3 className="mt-3 text-sm font-semibold text-slate-900">
                      Enter on Submit
                    </h3>

                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      Your official identity profile is undergoing final
                      verification.
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-semibold text-slate-700">
                        Official ID
                      </span>

                      <span className="text-[10px] text-slate-800">
                        #REC-2025-88402
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-semibold text-slate-700">
                        Password
                      </span>

                      <span className="text-[10px] text-slate-800">
                        {pin || "••••"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-semibold text-slate-700">
                        Status
                      </span>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-[9px] font-semibold text-green-700">
                        ✓ APPROVED
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="mt-4 w-full rounded-md border border-slate-300 bg-white py-2 text-xs font-medium text-slate-800 hover:bg-slate-50"
                  >
                    GO TO DASHBOARD
                  </button>
                </div>
              )}
            </div>

            {/* ================= PAGE FOOTER ================= */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-7 py-3">
              {verificationStep === 4 ? (
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex h-[34px] items-center gap-1.5 rounded-md border border-slate-400 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft size={13} />
                  Go to Login
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      verificationStep === 1
                        ? navigate("/register/step2")
                        : setVerificationStep(
                            (verificationStep - 1) as VerificationStep,
                          )
                    }
                    className="flex h-[34px] items-center gap-1.5 rounded-md border border-slate-400 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowLeft size={13} />
                    Back
                  </button>

                  {verificationStep < 3 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setVerificationStep(
                          (verificationStep + 1) as VerificationStep,
                        )
                      }
                      className="flex h-[34px] items-center gap-1.5 rounded-md bg-blue-600 px-4 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Continue
                      <ArrowRight size={13} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitRegistration}
                      disabled={
                        !faceVerified ||
                        !biometricVerified ||
                        pin.length < 4
                      }
                      className="flex h-[34px] items-center gap-1.5 rounded-md bg-blue-600 px-4 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Submit Registration
                      <ArrowRight size={13} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
