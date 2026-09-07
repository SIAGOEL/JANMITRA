import { useState } from "react";
import {
  ChevronRight,
  CircleAlert,
  Lock,
  SlidersHorizontal,
  Shield,
  Download,
} from "lucide-react";

type SettingsSection =
  | "account"
  | "security"
  | "preferences"
  | "privacy";

export default function Settings() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("account");

  const [textSize, setTextSize] = useState<
    "Small" | "Medium" | "Large"
  >("Medium");

  const [highContrast, setHighContrast] = useState(false);

  const [language, setLanguage] = useState("English (US)");

  const sections = [
    {
      id: "account" as SettingsSection,
      label: "Account Information",
    },
    {
      id: "security" as SettingsSection,
      label: "Security",
    },
    {
      id: "preferences" as SettingsSection,
      label: "Preferences",
    },
    {
      id: "privacy" as SettingsSection,
      label: "Data & Privacy",
    },
  ];

  return (
    <div
      className={`min-h-full ${
        highContrast ? "contrast-125" : ""
      }`}
    >
      {/* PAGE TITLE */}
      <div className="mb-4">
        <h1 className="text-[22px] font-semibold text-gray-900">
          Settings
        </h1>
      </div>

      <div className="flex w-full gap-5">
        {/* LEFT SETTINGS MENU */}
        <aside className="w-[180px] shrink-0">
          <div className="space-y-1">
            {sections.map((section) => {
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() =>
                    setActiveSection(section.id)
                  }
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[12px] font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>{section.label}</span>

                  {isActive && (
                    <ChevronRight
                      size={14}
                      strokeWidth={2}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <main className="min-w-0 flex-1">
          {activeSection === "account" && (
            <AccountInformation />
          )}

          {activeSection === "security" && (
            <SecuritySettings />
          )}

          {activeSection === "preferences" && (
            <PreferencesSettings
              language={language}
              setLanguage={setLanguage}
              textSize={textSize}
              setTextSize={setTextSize}
              highContrast={highContrast}
              setHighContrast={setHighContrast}
            />
          )}

          {activeSection === "privacy" && (
            <DataPrivacy />
          )}
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   SCREEN 10 — ACCOUNT INFORMATION
========================================================= */

function AccountInformation() {
  return (
    <section className="max-w-[720px] rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <CircleAlert
          size={15}
          className="text-gray-700"
        />

        <h2 className="text-[15px] font-semibold text-gray-900">
          Account Information
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
        {/* FULL NAME */}
        <div>
          <p className="text-[15px] font-semibold text-gray-800">
            Full Name
          </p>

          <p className="mt-1 text-[15px] text-gray-600">
            Johnathan Doe
          </p>
        </div>

        {/* EMAIL */}
        <div>
          <p className="text-[15px] font-semibold text-gray-800">
            Email Address
          </p>

          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-[15px] text-gray-600">
              joh****@example.com
            </p>

            <button className="text-[15px] font-medium text-blue-600 underline hover:text-blue-700">
              Update
            </button>
          </div>
        </div>

        {/* ROLE */}
        <div>
          <p className="text-[15px] font-semibold text-gray-800">
            System Role
          </p>

          <p className="mt-1 text-[15px] text-gray-600">
            Citizen / Complainant
          </p>
        </div>

        {/* MOBILE */}
        <div>
          <p className="text-[15px] font-semibold text-gray-800">
            Mobile Number
          </p>

          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-[15px] text-gray-600">
              +1 (***) ***-4589
            </p>

            <button className="text-[15px] font-medium text-blue-600 underline hover:text-blue-700">
              Update
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SCREEN 11 — SECURITY SETTINGS
========================================================= */

function SecuritySettings() {
  return (
    <section className="max-w-[720px] rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <Lock
          size={15}
          className="text-gray-700"
        />

        <h2 className="text-[15px] font-semibold text-gray-900">
          Security Settings
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
        {/* PASSWORD */}
        <div>
          <p className="text-[15px] font-semibold text-gray-800">
            Password
          </p>

          <div className="mt-1 flex items-center justify-between">
            <p className="text-[15px] text-gray-600">
              ********
            </p>

            <button className="text-[15px] font-medium text-blue-600 underline">
              Update
            </button>
          </div>
        </div>

        {/* TRUSTED DEVICE */}
        <div>
          <p className="text-[15px] font-semibold text-gray-800">
            Trusted Devices
          </p>

          <p className="mt-1 text-[15px] font-medium text-gray-800">
            MacBook Pro - Chrome (London, UK)
          </p>

          <div className="mt-1 flex items-center justify-between">
            <p className="text-[15px] text-gray-500">
              Oct 29, 2025
            </p>

            <button className="text-[15px] font-medium text-red-500 underline">
              Remove
            </button>
          </div>
        </div>

        {/* TWO FACTOR */}
        <div>
          <p className="text-[15px] font-semibold text-gray-800">
            Two-Factor Authentication
          </p>

          <p className="mt-1 text-[15px] font-medium text-gray-700">
            Method: OTP via registered mobile
          </p>

          <p className="mt-1 text-[15px] text-gray-500">
            Last verified: Oct 24, 2023
          </p>
        </div>

        {/* ACTIVE SESSION */}
        <div>
          <p className="text-[15px] font-semibold text-gray-800">
            Active Sessions
          </p>

          <p className="mt-1 text-[15px] font-medium text-gray-700">
            Active Session
          </p>

          <p className="mt-1 text-[15px] text-gray-500">
            Current Session: MacBook Pro - Chrome
          </p>

          <button className="mt-2 w-full rounded border border-gray-300 px-3 py-1.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50">
            Sign Out of All Other Sessions
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SCREEN 12 — PREFERENCES
========================================================= */

type PreferencesProps = {
  language: string;
  setLanguage: (value: string) => void;
  textSize: "Small" | "Medium" | "Large";
  setTextSize: (
    value: "Small" | "Medium" | "Large"
  ) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
};

function PreferencesSettings({
  language,
  setLanguage,
  textSize,
  setTextSize,
  highContrast,
  setHighContrast,
}: PreferencesProps) {
  return (
    <section className="max-w-[720px] rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <SlidersHorizontal
          size={15}
          className="text-gray-700"
        />

        <h2 className="text-[15px] font-semibold text-gray-900">
          Preferences
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-x-10 gap-y-4">
        {/* LANGUAGE */}
        <div>
          <label className="mb-1 block text-[15px] font-semibold text-gray-700">
            Display Language
          </label>

          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value)
            }
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-[15px] outline-none focus:border-blue-500"
          >
            <option>English (US)</option>
            <option>English (UK)</option>
            <option>Hindi</option>
          </select>
        </div>

        {/* TEXT SIZE */}
        <div>
          <p className="mb-1 text-[15px] font-semibold text-gray-700">
            Text Size
          </p>

          <div className="flex overflow-hidden rounded-md border border-gray-300">
            {(["Small", "Medium", "Large"] as const).map(
              (size) => (
                <button
                  key={size}
                  onClick={() =>
                    setTextSize(size)
                  }
                  className={`flex-1 px-2 py-1.5 text-[15px] font-medium transition ${
                    textSize === size
                      ? "bg-gray-100 text-gray-900"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {size}
                </button>
              ),
            )}
          </div>
        </div>

        {/* HIGH CONTRAST */}
        <div className="col-span-2 flex items-center justify-between">
          <span className="text-[15px] font-semibold text-gray-700">
            High Contrast
          </span>

          <button
            onClick={() =>
              setHighContrast(!highContrast)
            }
            className={`relative h-5 w-9 rounded-full transition ${
              highContrast
                ? "bg-blue-600"
                : "bg-gray-200"
            }`}
          >
            <span
              className={`absolute top-[2px] h-4 w-4 rounded-full bg-white shadow-sm transition ${
                highContrast
                  ? "left-[18px]"
                  : "left-[2px]"
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SCREEN 13 — DATA & PRIVACY
========================================================= */

function DataPrivacy() {
  return (
    <section className="max-w-[720px] rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <Shield
          size={15}
          className="text-gray-700"
        />

        <h2 className="text-[15px] font-semibold text-gray-900">
          Data & Privacy
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-x-10 gap-y-5">
        {/* DOWNLOAD MY DATA */}
        <div>
          <p className="text-[15px] font-semibold text-gray-800">
            Download My Data
          </p>

          <p className="mt-1 max-w-[250px] text-[15px] leading-4 text-gray-500">
            Request a copy of your account and case
            history records.
          </p>

          <button className="mt-2 flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-[15px] font-medium text-white hover:bg-blue-700">
            <Download size={12} />
            Request Download
          </button>
        </div>

        {/* PRIVACY POLICY + TERMS */}
        <div>
          <button className="flex w-full items-center justify-between border-b border-gray-200 pb-2 text-left">
            <span className="text-[15px] font-medium text-gray-800">
              View Privacy Policy
            </span>

            <ChevronRight
              size={14}
              className="text-gray-500"
            />
          </button>

          <button className="flex w-full items-center justify-between border-b border-gray-200 py-2 text-left">
            <span className="text-[15px] font-medium text-gray-800">
              View Terms of Service
            </span>

            <ChevronRight
              size={14}
              className="text-gray-500"
            />
          </button>

          {/* RETENTION */}
          <div className="pt-3">
            <p className="text-[15px] font-semibold text-gray-800">
              Data Retention
            </p>

            <p className="mt-1 max-w-[270px] text-[12px] leading-4 text-gray-500">
              Case records are subject to legal
              retention requirements and cannot be
              deleted manually.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}