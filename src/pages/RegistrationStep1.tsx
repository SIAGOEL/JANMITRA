import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Upload,
  Calendar,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function RegistrationStep1() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    govIdType: "",
    govIdNumber: "",
    address: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const isStep1Complete =
    formData.fullName.trim() !== "" &&
    formData.dateOfBirth !== "" &&
    formData.gender !== "" &&
    formData.govIdType !== "" &&
    formData.govIdNumber.trim() !== "" &&
    formData.address.trim() !== "" &&
    photo !== null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    // Save temporarily in browser.
    // We will replace this with the backend later.
    sessionStorage.setItem(
      "registrationStep1",
      JSON.stringify({
        ...formData,
        photoName: photo?.name || "",
      }),
    );

    navigate("/register/step2");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-100 to-amber-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl p-6 md:p-8">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-3xl md:text-4xl font-bold text-green-900">
            Create Official Account
          </h1>

          <p className="text-sm text-gray-600 mt-1 max-w-md">
            Please provide your legal information exactly as it appears on
            official documents.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="w-full max-w-md border border-gray-300 rounded-2xl p-3 mb-5">
          <div className="flex items-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center min-w-[75px]">
              <div className="w-7 h-7 rounded-md bg-green-900 text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-xs text-green-900 mt-1">Basic Info</span>
            </div>

            <div className="h-px bg-gray-400 flex-1 mx-2 mb-5" />

            {/* Step 2 */}
            <div className="flex flex-col items-center min-w-[75px]">
              <div className="w-7 h-7 rounded-md bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-xs text-gray-500 mt-1">Official Info</span>
            </div>

            <div className="h-px bg-gray-400 flex-1 mx-2 mb-5" />

            {/* Step 3 */}
            <div className="flex flex-col items-center min-w-[75px]">
              <div className="w-7 h-7 rounded-md bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-xs text-gray-500 mt-1">Evidence</span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form
          onSubmit={handleContinue}
          className="border border-gray-300 rounded-2xl p-5"
        >
          {/* Identification Photo */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-lg bg-gray-200 border border-gray-300 flex items-center justify-center">
              {photo ? (
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Identification"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Camera className="w-8 h-8 text-black" />
              )}
            </div>

            <div>
              <h2 className="font-semibold text-green-900">
                Official Identification Photo
              </h2>

              <p className="text-xs text-gray-600">
                Clear, front-facing photo against a plain background.
              </p>

              <label className="flex items-center gap-1 text-xs text-green-900 font-medium mt-1 cursor-pointer hover:underline">
                <Upload className="w-3 h-3" />
                {photo ? "Change Photo" : "Upload"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Legal Name
              </label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="First Middle Last"
                required
                className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 text-sm"
              />
            </div>

            {/* DOB + Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Date of Birth
                </label>

                <div className="relative">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
                  />

                  {/* <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-600 pointer-events-none" /> */}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Legal Gender
                </label>

                <div className="relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="appearance-none w-full h-10 px-3 pr-10 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-700 text-sm text-gray-600"
                  >
                    <option value="">Select gender...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>

                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-700 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Govt ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Govt ID Type
                </label>

                <div className="relative">
                  <select
                    name="govIdType"
                    value={formData.govIdType}
                    onChange={handleChange}
                    required
                    className="appearance-none w-full h-10 px-3 pr-10 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-700 text-sm text-gray-600"
                  >
                    <option value="">Select ID Type...</option>
                    <option value="aadhaar">Aadhaar</option>
                    <option value="pan">PAN</option>
                    <option value="passport">Passport</option>
                    <option value="driving-license">Driving License</option>
                    <option value="voter-id">Voter ID</option>
                  </select>

                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-700 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Govt ID Number
                </label>

                <input
                  type="text"
                  name="govIdNumber"
                  value={formData.govIdNumber}
                  onChange={handleChange}
                  placeholder="ID number"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Primary Residential Address
              </label>

              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street Address, City, State/Province, Postal Code"
                  required
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
                />

                {/* <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-700" /> */}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-7">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-5 py-2 rounded-lg border border-gray-400 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to login
            </button>

            <button
              type="submit"
              disabled={!isStep1Complete}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                isStep1Complete
                  ? "bg-green-900 text-white hover:bg-green-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
