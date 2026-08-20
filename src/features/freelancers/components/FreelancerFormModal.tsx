import React, { useState } from 'react';
import { Freelancer, FreelancerCategory } from '@/types';
import { X, User, Phone, Mail, MapPin, Camera, DollarSign, CreditCard, Shield, Plus, Upload, Check } from 'lucide-react';

interface FreelancerFormModalProps {
  existingFreelancer?: Freelancer | null;
  categories: FreelancerCategory[];
  onSave: (freelancer: Freelancer) => void;
  onClose: () => void;
}



export const FreelancerFormModal: React.FC<FreelancerFormModalProps> = ({
  existingFreelancer,
  categories,
  onSave,
  onClose,
}) => {
  // Basic Info States
  const [name, setName] = useState(existingFreelancer?.name || '');
  const [freelancerId, setFreelancerId] = useState(existingFreelancer?.freelancerId || `FL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [profilePhoto, setProfilePhoto] = useState(existingFreelancer?.profilePhoto || '');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfilePhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [mobile, setMobile] = useState(existingFreelancer?.mobile || '');
  const [whatsapp, setWhatsapp] = useState(existingFreelancer?.whatsapp || '');
  const [email, setEmail] = useState(existingFreelancer?.email || '');
  const [address, setAddress] = useState(existingFreelancer?.address || '');
  const [city, setCity] = useState(existingFreelancer?.city || 'Jaipur');
  const [emergencyContact, setEmergencyContact] = useState(existingFreelancer?.emergencyContact || '');
  const [joiningDate, setJoiningDate] = useState(existingFreelancer?.joiningDate || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'active' | 'inactive'>(existingFreelancer?.status || 'active');

  // Professional Info States
  const [mainCategory, setMainCategory] = useState(existingFreelancer?.mainCategory || categories[0]?.name || 'Photographer');
  
  // Available sub-categories based on selected category
  const selectedCatObj = categories.find((c) => c.name === mainCategory);
  const availableSubCats = selectedCatObj ? selectedCatObj.subCategories : ['Candid Photographer', 'Traditional Photographer', 'Operator'];

  const [subCategory, setSubCategory] = useState(existingFreelancer?.subCategory || availableSubCats[0] || 'Candid Photographer');
  const [experienceYears, setExperienceYears] = useState<number>(existingFreelancer?.experienceYears || 3);
  const [skillsStr, setSkillsStr] = useState(existingFreelancer?.skills ? existingFreelancer.skills.join(', ') : 'Candid Shots, Lighting, Color Grading');
  const [equipmentAvailable, setEquipmentAvailable] = useState(existingFreelancer?.equipmentAvailable || '');
  const [cameraDetails, setCameraDetails] = useState(existingFreelancer?.cameraDetails || '');
  const [lensDetails, setLensDetails] = useState(existingFreelancer?.lensDetails || '');
  const [otherEquipment, setOtherEquipment] = useState(existingFreelancer?.otherEquipment || '');

  // Rate Card States (₹)
  const [perDayCharges, setPerDayCharges] = useState<number>(existingFreelancer?.perDayCharges || 10000);
  const [halfDayCharges, setHalfDayCharges] = useState<number>(existingFreelancer?.halfDayCharges || 6000);
  const [eventCharges, setEventCharges] = useState<number>(existingFreelancer?.eventCharges || 12000);
  const [overtimeCharges, setOvertimeCharges] = useState<number>(existingFreelancer?.overtimeCharges || 1000);
  const [extraHourCharges, setExtraHourCharges] = useState<number>(existingFreelancer?.extraHourCharges || 1000);
  const [travelCharges, setTravelCharges] = useState<number>(existingFreelancer?.travelCharges || 0);
  const [otherCharges, setOtherCharges] = useState<number>(existingFreelancer?.otherCharges || 0);
  const [notes, setNotes] = useState(existingFreelancer?.notes || '');

  // Bank Info States
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Other'>(existingFreelancer?.paymentMethod || 'UPI');
  const [upiId, setUpiId] = useState(existingFreelancer?.upiId || '');
  const [bankName, setBankName] = useState(existingFreelancer?.bankName || '');
  const [accountHolderName, setAccountHolderName] = useState(existingFreelancer?.accountHolderName || '');
  const [accountNumber, setAccountNumber] = useState(existingFreelancer?.accountNumber || '');
  const [ifsc, setIfsc] = useState(existingFreelancer?.ifsc || '');
  const [paymentNotes, setPaymentNotes] = useState(existingFreelancer?.paymentNotes || '');

  const handleCategoryChange = (catName: string) => {
    setMainCategory(catName);
    const catObj = categories.find((c) => c.name === catName);
    if (catObj && catObj.subCategories.length > 0) {
      setSubCategory(catObj.subCategories[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const savedData: Freelancer = {
      id: existingFreelancer ? existingFreelancer.id : `fl-${Date.now()}`,
      freelancerId: freelancerId.trim(),
      name: name.trim(),
      profilePhoto,
      mobile: mobile.trim(),
      whatsapp: whatsapp.trim() || mobile.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      emergencyContact: emergencyContact.trim(),
      joiningDate,
      status,
      mainCategory,
      subCategory,
      experienceYears: Number(experienceYears) || 0,
      skills,
      equipmentAvailable: equipmentAvailable.trim(),
      cameraDetails: cameraDetails.trim(),
      lensDetails: lensDetails.trim(),
      otherEquipment: otherEquipment.trim(),
      perDayCharges: Number(perDayCharges) || 0,
      halfDayCharges: Number(halfDayCharges) || 0,
      eventCharges: Number(eventCharges) || 0,
      overtimeCharges: Number(overtimeCharges) || 0,
      extraHourCharges: Number(extraHourCharges) || 0,
      travelCharges: Number(travelCharges) || 0,
      otherCharges: Number(otherCharges) || 0,
      notes: notes.trim(),
      paymentMethod,
      upiId: upiId.trim(),
      bankName: bankName.trim(),
      accountHolderName: accountHolderName.trim() || name.trim(),
      accountNumber: accountNumber.trim(),
      ifsc: ifsc.trim().toUpperCase(),
      paymentNotes: paymentNotes.trim(),
      availabilityStatus: existingFreelancer?.availabilityStatus || 'Available',
      documents: existingFreelancer?.documents || [],
    };

    onSave(savedData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-sm">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {existingFreelancer ? `Edit Freelancer (${existingFreelancer.freelancerId})` : 'Add New Freelancer'}
              </h2>
              <p className="text-xs text-indigo-300">Complete photographer/cinematographer professional profile & rate card</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Section 1: Basic Information */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>1. Basic Personal Information</span>
            </h3>

            {/* Profile Photo Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="relative group flex-shrink-0">
                {profilePhoto && profilePhoto.trim() ? (
                  <img
                    src={profilePhoto}
                    alt="Profile Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-600 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-dashed border-indigo-300 flex items-center justify-center text-indigo-500 font-bold text-xl">
                    <User className="w-8 h-8 text-indigo-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 w-full space-y-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 block">
                    Upload Profile Photo
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Upload image from your device (JPG, PNG, WEBP)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="freelancer-photo-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Photo File</span>
                    <input
                      id="freelancer-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={() => setProfilePhoto('')}
                      className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Freelancer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Kapoor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Freelancer ID
                </label>
                <input
                  type="text"
                  value={freelancerId}
                  onChange={(e) => setFreelancerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono uppercase font-bold text-indigo-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                >
                  <option value="active">Active Freelancer</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 00000"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 00000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="freelancer@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  City / Base Location
                </label>
                <input
                  type="text"
                  placeholder="Jaipur, Udaipur, Delhi..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 99999 (Relation)"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  placeholder="House / Street / Locality address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Professional Information & Equipment */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>2. Category, Experience & Gear Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Main Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={mainCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Sub Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                >
                  {availableSubCats.map((sub, idx) => (
                    <option key={idx} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Key Skills & Highlights (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Candid Shots, Low Light, S-Log3, Gimbal Fly, FPV Drone"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Camera Bodies / Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sony FX3, Sony A7IV x2"
                  value={cameraDetails}
                  onChange={(e) => setCameraDetails(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Lens Set Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. 35mm f/1.4, 85mm f/1.4, 24-70mm f/2.8"
                  value={lensDetails}
                  onChange={(e) => setLensDetails(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Lighting & Gimbal / Other Gear
                </label>
                <input
                  type="text"
                  placeholder="e.g. Godox AD200, DJI RS3 Gimbal, Rode Wireless Mics"
                  value={otherEquipment}
                  onChange={(e) => setOtherEquipment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Overall Equipment Overview
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of complete shooting gear owned"
                  value={equipmentAvailable}
                  onChange={(e) => setEquipmentAvailable(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Rate Card / Charges */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              <span>3. Rate Card & Charges Structure (₹)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Full Event Charges (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={perDayCharges}
                  onChange={(e) => setPerDayCharges(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-bold text-indigo-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Small Event Charges (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={halfDayCharges}
                  onChange={(e) => setHalfDayCharges(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Full Day Event Charges (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={eventCharges}
                  onChange={(e) => setEventCharges(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-4">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Special Rate Card Notes / Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. Requires 30% advance for flight bookings. Food and lodging borne by client."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bank / Payment Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>4. Bank & Payment Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Preferred Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                >
                  <option value="UPI">UPI (GPay/PhonePe/Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Cash">Cash Settlement</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  UPI ID / QR Mobile
                </label>
                <input
                  type="text"
                  placeholder="e.g. name@okicici or 9876500000@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank / ICICI Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  placeholder="Name as per bank passbook"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="Bank Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono uppercase"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Payment Notes / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Accounts department approval required before final clearance."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider transition shadow-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{existingFreelancer ? 'Update Freelancer Profile' : 'Save Freelancer Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
