import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Droplet,
  Edit2,
  Eye,
  Shield,
  Activity,
  Sparkles
} from 'lucide-react';
import {
  Donor,
  BloodGroup,
  AvailabilityStatus,
  EligibilityStatus,
  UserRole
} from '../types/bloodbank';
import { CITIES_LIST } from '../data/mockData';
import { exportDonorsToCsv } from '../services/exportService';

interface DonorManagementViewProps {
  donors: Donor[];
  userRole: UserRole;
  onAddDonor: (donor: Omit<Donor, 'id' | 'registrationDate' | 'totalDonationsCount'>) => void;
  onUpdateDonor: (donor: Donor) => void;
  onToggleAvailability: (donorId: string) => void;
  onVerifyEligibility: (donorId: string, status: EligibilityStatus) => void;
}

export const DonorManagementView: React.FC<DonorManagementViewProps> = ({
  donors,
  userRole,
  onAddDonor,
  onUpdateDonor,
  onToggleAvailability,
  onVerifyEligibility
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('ALL');
  const [selectedEligibility, setSelectedEligibility] = useState<string>('ALL');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [inspectingDonor, setInspectingDonor] = useState<Donor | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '1998-05-15',
    age: 28,
    contactNumber: '',
    email: '',
    bloodGroup: 'O+' as BloodGroup,
    city: 'Metro Central',
    availabilityStatus: 'AVAILABLE' as AvailabilityStatus,
    eligibilityStatus: 'ELIGIBLE' as EligibilityStatus,
    weightKg: 65,
    medicalClearanceNotes: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const canEdit = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_STAFF';

  // Filtered donors
  const filteredDonors = useMemo(() => {
    return donors.filter((d) => {
      const matchSearch =
        d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.contactNumber.includes(searchTerm);

      const matchBlood = selectedBloodGroup === 'ALL' || d.bloodGroup === selectedBloodGroup;
      const matchCity = selectedCity === 'ALL' || d.city === selectedCity;
      const matchAvail =
        selectedAvailability === 'ALL' || d.availabilityStatus === selectedAvailability;
      const matchElig =
        selectedEligibility === 'ALL' || d.eligibilityStatus === selectedEligibility;

      return matchSearch && matchBlood && matchCity && matchAvail && matchElig;
    });
  }, [donors, searchTerm, selectedBloodGroup, selectedCity, selectedAvailability, selectedEligibility]);

  const handleOpenRegister = () => {
    setFormData({
      fullName: '',
      dateOfBirth: '1998-05-15',
      age: 28,
      contactNumber: '+1 (555) ',
      email: '',
      bloodGroup: 'O+',
      city: 'Metro Central',
      availabilityStatus: 'AVAILABLE',
      eligibilityStatus: 'ELIGIBLE',
      weightKg: 65,
      medicalClearanceNotes: 'Clinically verified hemoglobin >= 13.0 g/dL'
    });
    setFormError(null);
    setIsRegisterOpen(true);
  };

  const handleOpenEdit = (donor: Donor) => {
    setEditingDonor(donor);
    setFormData({
      fullName: donor.fullName,
      dateOfBirth: donor.dateOfBirth,
      age: donor.age,
      contactNumber: donor.contactNumber,
      email: donor.email,
      bloodGroup: donor.bloodGroup,
      city: donor.city,
      availabilityStatus: donor.availabilityStatus,
      eligibilityStatus: donor.eligibilityStatus,
      weightKg: donor.weightKg || 65,
      medicalClearanceNotes: donor.medicalClearanceNotes || ''
    });
    setFormError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setFormError('Please enter full legal name');
      return;
    }
    if (formData.age < 18 || formData.age > 65) {
      setFormError('Donor must be between 18 and 65 years of age according to blood safety guidelines');
      return;
    }
    if (formData.weightKg < 50) {
      setFormError('Minimum body weight requirement is 50 kg for whole blood donation');
      return;
    }
    if (!formData.contactNumber.trim() || formData.contactNumber.length < 8) {
      setFormError('Please provide a valid contact telephone number');
      return;
    }

    if (editingDonor) {
      onUpdateDonor({
        ...editingDonor,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        age: Number(formData.age),
        contactNumber: formData.contactNumber,
        email: formData.email,
        bloodGroup: formData.bloodGroup,
        city: formData.city,
        availabilityStatus: formData.availabilityStatus,
        eligibilityStatus: formData.eligibilityStatus,
        weightKg: Number(formData.weightKg),
        medicalClearanceNotes: formData.medicalClearanceNotes
      });
      setEditingDonor(null);
    } else {
      onAddDonor({
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        age: Number(formData.age),
        contactNumber: formData.contactNumber,
        email: formData.email,
        bloodGroup: formData.bloodGroup,
        city: formData.city,
        lastDonationDate: null,
        availabilityStatus: formData.availabilityStatus,
        eligibilityStatus: formData.eligibilityStatus,
        weightKg: Number(formData.weightKg),
        medicalClearanceNotes: formData.medicalClearanceNotes
      });
      setIsRegisterOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Donor Management</h1>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200">
              {donors.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain volunteer registries, medical eligibility status, and emergency availability rosters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportDonorsToCsv(donors)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {canEdit && (
            <button
              onClick={handleOpenRegister}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Donor</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search donor name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 bg-slate-50/50"
            />
          </div>

          {/* Blood Group Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 bg-slate-50/50"
            >
              <option value="ALL">Blood: All Types</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>
                  Blood: {bg}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 bg-slate-50/50"
            >
              <option value="ALL">City: All Areas</option>
              {CITIES_LIST.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 bg-slate-50/50"
            >
              <option value="ALL">Availability: All</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          {/* Eligibility Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedEligibility}
              onChange={(e) => setSelectedEligibility(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 bg-slate-50/50"
            >
              <option value="ALL">Medical: All</option>
              <option value="ELIGIBLE">Eligible</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="INELIGIBLE">Ineligible</option>
            </select>
          </div>
        </div>

        {/* Quick count indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>
            Showing <strong>{filteredDonors.length}</strong> of {donors.length} registered donors
          </span>
          {(searchTerm ||
            selectedBloodGroup !== 'ALL' ||
            selectedCity !== 'ALL' ||
            selectedAvailability !== 'ALL' ||
            selectedEligibility !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBloodGroup('ALL');
                setSelectedCity('ALL');
                setSelectedAvailability('ALL');
                setSelectedEligibility('ALL');
              }}
              className="text-red-600 hover:underline font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Donors Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Donor ID</th>
                <th className="py-3 px-4">Full Name &amp; Age</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">City / Region</th>
                <th className="py-3 px-4">Last Donation</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Medical Clearance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No donor records match criteria</p>
                    <p className="text-[11px] text-slate-400">Try loosening your search terms or filters</p>
                  </td>
                </tr>
              ) : (
                filteredDonors.map((donor) => {
                  const isAvailable = donor.availabilityStatus === 'AVAILABLE';
                  const isOnHold = donor.availabilityStatus === 'ON_HOLD';
                  const isEligible = donor.eligibilityStatus === 'ELIGIBLE';
                  const isPending = donor.eligibilityStatus === 'PENDING_REVIEW';

                  return (
                    <tr key={donor.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {donor.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{donor.fullName}</div>
                        <div className="text-[11px] text-slate-400">
                          {donor.age} yrs • {donor.contactNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md font-black text-sm bg-red-100 text-red-800">
                          {donor.bloodGroup}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-700">{donor.city}</span>
                      </td>
                      <td className="py-3 px-4">
                        {donor.lastDonationDate ? (
                          <div className="text-slate-700 font-medium">{donor.lastDonationDate}</div>
                        ) : (
                          <span className="text-slate-400 italic">None logged</span>
                        )}
                        <div className="text-[10px] text-slate-400">
                          {donor.totalDonationsCount} prior donations
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOnHold
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isAvailable ? (
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                          )}
                          {donor.availabilityStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isEligible
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {donor.eligibilityStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingDonor(donor)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canEdit && (
                            <>
                              <button
                                onClick={() => onToggleAvailability(donor.id)}
                                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                                  isAvailable
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                                title="Toggle availability"
                              >
                                {isAvailable ? 'Hold' : 'Make Ready'}
                              </button>

                              <button
                                onClick={() => handleOpenEdit(donor)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Edit Record"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register / Edit Donor Modal */}
      {(isRegisterOpen || editingDonor) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingDonor ? `Edit Donor ${editingDonor.id}` : 'Register New Volunteer Donor'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsRegisterOpen(false);
                  setEditingDonor(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g., Jonathan Vance"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Blood Group *
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City / Service Region *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20"
                  >
                    {CITIES_LIST.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age (18-65) *</label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    min="45"
                    max="200"
                    required
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="donor@example.org"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Availability Status</label>
                  <select
                    value={formData.availabilityStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availabilityStatus: e.target.value as AvailabilityStatus
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="AVAILABLE">AVAILABLE (On Call)</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                    <option value="ON_HOLD">ON_HOLD (Pending Verification)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Medical Eligibility</label>
                  <select
                    value={formData.eligibilityStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eligibilityStatus: e.target.value as EligibilityStatus
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="ELIGIBLE">ELIGIBLE (Clearance Approved)</option>
                    <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                    <option value="INELIGIBLE">INELIGIBLE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical Notes / Health Screening
                </label>
                <textarea
                  rows={2}
                  value={formData.medicalClearanceNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, medicalClearanceNotes: e.target.value })
                  }
                  placeholder="Hemoglobin level, blood pressure, vein check..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterOpen(false);
                    setEditingDonor(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  {editingDonor ? 'Save Updates' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Donor Details Modal */}
      {inspectingDonor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  {inspectingDonor.id}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-1">{inspectingDonor.fullName}</h3>
              </div>
              <button
                onClick={() => setInspectingDonor(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="text-[11px] text-slate-500">Blood Group</div>
                  <div className="text-xl font-black text-red-700">{inspectingDonor.bloodGroup}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Total Donations</div>
                  <div className="text-xl font-black text-slate-900">
                    {inspectingDonor.totalDonationsCount}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="p-2 border border-slate-100 rounded-lg">
                  <div className="text-[10px] text-slate-400">Date of Birth &amp; Age</div>
                  <div className="font-semibold">
                    {inspectingDonor.dateOfBirth} ({inspectingDonor.age} yrs)
                  </div>
                </div>
                <div className="p-2 border border-slate-100 rounded-lg">
                  <div className="text-[10px] text-slate-400">Service Area</div>
                  <div className="font-semibold">{inspectingDonor.city}</div>
                </div>
                <div className="p-2 border border-slate-100 rounded-lg">
                  <div className="text-[10px] text-slate-400">Contact Telephone</div>
                  <div className="font-semibold">{inspectingDonor.contactNumber}</div>
                </div>
                <div className="p-2 border border-slate-100 rounded-lg">
                  <div className="text-[10px] text-slate-400">Last Donation Date</div>
                  <div className="font-semibold">
                    {inspectingDonor.lastDonationDate || 'First-time registration'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                <div className="font-semibold text-blue-900 mb-0.5">Clinical Clearance Notes</div>
                <p className="text-[11px] text-blue-800">
                  {inspectingDonor.medicalClearanceNotes || 'Standard clearance verified by staff.'}
                </p>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Registered: {inspectingDonor.registrationDate}</span>
                <span className="text-emerald-600 font-semibold">Protected Record</span>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setInspectingDonor(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
