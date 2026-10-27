import React, { useState, useMemo } from 'react';
import {
  Target,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  Info,
  Calendar,
  Building2,
  FileCheck
} from 'lucide-react';
import {
  BloodGroup,
  BloodRequest,
  Donor,
  DonorMatchCandidate,
  UserRole
} from '../types/bloodbank';
import { COMPATIBLE_DONORS_MAP, rankEmergencyDonors } from '../services/matchingAlgorithm';
import { CITIES_LIST } from '../data/mockData';

interface EmergencyMatchingViewProps {
  donors: Donor[];
  requests: BloodRequest[];
  selectedRequestFromNav: BloodRequest | null;
  userRole: UserRole;
  onLogDonorContact: (donorId: string, notes: string) => void;
}

export const EmergencyMatchingView: React.FC<EmergencyMatchingViewProps> = ({
  donors,
  requests,
  selectedRequestFromNav,
  userRole,
  onLogDonorContact
}) => {
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    selectedRequestFromNav ? selectedRequestFromNav.id : requests[0]?.id || 'CUSTOM'
  );

  const [customBloodGroup, setCustomBloodGroup] = useState<BloodGroup>(
    selectedRequestFromNav ? selectedRequestFromNav.bloodGroup : 'O-'
  );
  const [customCity, setCustomCity] = useState<string>(
    selectedRequestFromNav ? selectedRequestFromNav.city : 'Metro Central'
  );

  // Follow-up action modal
  const [activeCandidate, setActiveCandidate] = useState<DonorMatchCandidate | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Find selected request if any
  const currentRequest = requests.find((r) => r.id === selectedRequestId);

  const targetBloodGroup = currentRequest ? currentRequest.bloodGroup : customBloodGroup;
  const targetCity = currentRequest ? currentRequest.city : customCity;

  // Run the ranking algorithm
  const rankedCandidates = useMemo(() => {
    return rankEmergencyDonors(donors, targetBloodGroup, targetCity);
  }, [donors, targetBloodGroup, targetCity]);

  const compatibleDonorGroups = COMPATIBLE_DONORS_MAP[targetBloodGroup] || [];

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCandidate) return;

    onLogDonorContact(
      activeCandidate.donor.id,
      actionNotes || 'Emergency dispatch call placed. Donor agreed to arrive within 45 minutes.'
    );
    setActionSuccess(`Emergency call logged for donor ${activeCandidate.donor.fullName}`);
    setActiveCandidate(null);
    setActionNotes('');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionSuccess && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-slate-700 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Emergency Donor Matching Engine
            </h1>
            <span className="text-xs bg-red-600 text-white font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3" />
              Algorithmic Heuristic Ranking
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Java-compatible compatibility rules, proximity calculations, and medical clearance ranking.
          </p>
        </div>
      </div>

      {/* Clinical Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Medical Safety &amp; Legal Protocol:</strong> The algorithmic
          donor rankings presented here serve as decision-support heuristics for blood bank
          coordinators. All transfusion eligibility, infectious disease screening, and serological
          crossmatch tests must be physically verified by qualified medical laboratory personnel prior
          to transfusion.
        </div>
      </div>

      {/* Target Selection Workbench */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Target className="w-4 h-4 text-red-600" />
            <span>Select Matching Target Context</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Link to an open hospital requisition or query custom parameters
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Link to Active Hospital Requisition
            </label>
            <select
              value={selectedRequestId}
              onChange={(e) => {
                setSelectedRequestId(e.target.value);
                const match = requests.find((r) => r.id === e.target.value);
                if (match) {
                  setCustomBloodGroup(match.bloodGroup);
                  setCustomCity(match.city);
                }
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
            >
              <option value="CUSTOM">-- Custom Parameters Search --</option>
              {requests
                .filter((r) => r.status !== 'FULFILLED')
                .map((req) => (
                  <option key={req.id} value={req.id}>
                    [{req.priority}] {req.id} - {req.hospitalName} ({req.bloodGroup}, {req.unitsRequired}u)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recipient Blood Group Target
            </label>
            <select
              value={targetBloodGroup}
              disabled={selectedRequestId !== 'CUSTOM'}
              onChange={(e) => setCustomBloodGroup(e.target.value as BloodGroup)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-500"
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg} Recipient
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Hospital City / Service Zone
            </label>
            <select
              value={targetCity}
              disabled={selectedRequestId !== 'CUSTOM'}
              onChange={(e) => setCustomCity(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-500"
            >
              {CITIES_LIST.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Biological Compatibility Matrix visualizer */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800">
              Biologically Compatible Donor Groups for Recipient {targetBloodGroup}:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {compatibleDonorGroups.map((grp) => (
                <span
                  key={grp}
                  className={`px-2.5 py-0.5 rounded-md font-black text-xs ${
                    grp === targetBloodGroup
                      ? 'bg-red-600 text-white'
                      : grp === 'O-'
                      ? 'bg-purple-600 text-white'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {grp} {grp === targetBloodGroup ? '(Exact)' : grp === 'O-' ? '(Universal)' : ''}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-500 shrink-0">
            <span>Red Cell Antigen Crossmatch Rule applied</span>
          </div>
        </div>
      </div>

      {/* Ranked Candidate Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">
            Ranked Emergency Donor Candidates ({rankedCandidates.length} Compatible Found)
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Ranking Factors: Compatibility (40%) • Availability (30%) • Clearance (20%) • Proximity (10%)
          </span>
        </div>

        {rankedCandidates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800">No compatible donors in active registry</p>
            <p className="text-xs text-slate-400 mt-1">
              Consider expanding geographic radius or triggering a targeted community blood drive.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rankedCandidates.map((candidate, index) => {
              const { donor, matchScore, matchReasons, recommendedPriority } = candidate;
              const isTop = index === 0 && matchScore >= 80;

              return (
                <div
                  key={donor.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition hover:shadow-md relative overflow-hidden ${
                    isTop
                      ? 'border-red-400 ring-2 ring-red-500/10'
                      : matchScore >= 75
                      ? 'border-emerald-300'
                      : 'border-slate-200'
                  }`}
                >
                  {isTop && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-extrabold px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
                      Optimal Match
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-700 font-black text-xl flex items-center justify-center shrink-0">
                        {donor.bloodGroup}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {donor.id}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {donor.city}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-0.5">{donor.fullName}</h3>
                        <p className="text-[11px] text-slate-500">
                          {donor.age} yrs • {donor.contactNumber}
                        </p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="text-right shrink-0">
                      <div
                        className={`text-2xl font-black ${
                          matchScore >= 80
                            ? 'text-emerald-600'
                            : matchScore >= 60
                            ? 'text-blue-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {matchScore}%
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Match Score</div>
                    </div>
                  </div>

                  {/* Reasons list */}
                  <div className="space-y-1 mb-4 text-[11px]">
                    {matchReasons.map((reason, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-1.5 text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 gap-2">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          donor.availabilityStatus === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {donor.availabilityStatus}
                      </span>
                      <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-100">
                        {donor.eligibilityStatus}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveCandidate(candidate)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Contact / Dispatch</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Staff Action Dialog */}
      {activeCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Emergency Donor Dispatch Contact
                </h3>
              </div>
              <button
                onClick={() => setActiveCandidate(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">{activeCandidate.donor.fullName}</span>
                  <span className="font-black text-red-700">{activeCandidate.donor.bloodGroup}</span>
                </div>
                <div className="text-slate-600">Telephone: {activeCandidate.donor.contactNumber}</div>
                <div className="text-slate-500">Service Area: {activeCandidate.donor.city}</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  Algorithmic Score: {activeCandidate.matchScore}%
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Coordinator Action Notes / Response Log
                </label>
                <textarea
                  rows={3}
                  required
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Contacted via emergency hotline. Donor confirmed departure to hospital center within 30 mins..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-800">
                Notice: Donor contact details are restricted to authorized personnel and logged in
                the database security audit trail.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCandidate(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  Log Follow-up Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
