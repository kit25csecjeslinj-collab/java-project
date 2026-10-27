import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpDown,
  Building2,
  Phone,
  Layers,
  Send,
  Eye,
  ShieldAlert
} from 'lucide-react';
import {
  BloodRequest,
  BloodGroup,
  RequestPriority,
  RequestStatus,
  BloodInventoryItem,
  UserRole
} from '../types/bloodbank';
import { CITIES_LIST } from '../data/mockData';
import { exportRequestsToCsv } from '../services/exportService';

interface BloodRequestViewProps {
  requests: BloodRequest[];
  inventory: BloodInventoryItem[];
  userRole: UserRole;
  onCreateRequest: (req: Omit<BloodRequest, 'id' | 'unitsDispatched' | 'status' | 'requestDateTime'>) => void;
  onUpdateRequestStatus: (requestId: string, newStatus: RequestStatus) => void;
  onFulfillRequest: (requestId: string, unitsToDispatch: number) => boolean;
  onNavigateToMatch: (req: BloodRequest) => void;
}

export const BloodRequestView: React.FC<BloodRequestViewProps> = ({
  requests,
  inventory,
  userRole,
  onCreateRequest,
  onUpdateRequestStatus,
  onFulfillRequest,
  onNavigateToMatch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortByPriority, setSortByPriority] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [fulfillModalReq, setFulfillModalReq] = useState<BloodRequest | null>(null);
  const [fulfillUnits, setFulfillUnits] = useState(1);
  const [fulfillError, setFulfillError] = useState<string | null>(null);

  // Create Form State
  const [formData, setFormData] = useState({
    hospitalName: '',
    bloodGroup: 'O-' as BloodGroup,
    unitsRequired: 2,
    city: 'Metro Central',
    priority: 'CRITICAL' as RequestPriority,
    contactPerson: '',
    contactPhone: '',
    patientCondition: '',
    notes: ''
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const canManage = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_STAFF';

  // Filter & sort
  const filteredRequests = useMemo(() => {
    let result = requests.filter((r) => {
      const matchSearch =
        r.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;

      return matchSearch && matchPriority && matchStatus;
    });

    if (sortByPriority) {
      const priorityOrder: Record<RequestPriority, number> = {
        CRITICAL: 1,
        URGENT: 2,
        NORMAL: 3
      };
      result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    return result;
  }, [requests, searchTerm, priorityFilter, statusFilter, sortByPriority]);

  const handleOpenCreate = () => {
    setFormData({
      hospitalName: '',
      bloodGroup: 'O-',
      unitsRequired: 2,
      city: 'Metro Central',
      priority: 'CRITICAL',
      contactPerson: '',
      contactPhone: '+1 (555) ',
      patientCondition: 'Emergency trauma resuscitation',
      notes: ''
    });
    setCreateError(null);
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hospitalName.trim()) {
      setCreateError('Please enter hospital / clinic name');
      return;
    }
    if (!formData.contactPerson.trim()) {
      setCreateError('Please enter authorized contact doctor / nurse name');
      return;
    }
    if (!formData.contactPhone.trim()) {
      setCreateError('Please enter contact telephone number');
      return;
    }

    onCreateRequest({
      hospitalName: formData.hospitalName,
      bloodGroup: formData.bloodGroup,
      unitsRequired: Number(formData.unitsRequired),
      city: formData.city,
      priority: formData.priority,
      contactPerson: formData.contactPerson,
      contactPhone: formData.contactPhone,
      patientCondition: formData.patientCondition,
      notes: formData.notes
    });

    setCreateModalOpen(false);
  };

  const handleOpenFulfill = (req: BloodRequest) => {
    setFulfillModalReq(req);
    const needed = req.unitsRequired - req.unitsDispatched;
    const inv = inventory.find((i) => i.bloodGroup === req.bloodGroup);
    const available = inv ? inv.availableUnits : 0;
    setFulfillUnits(Math.min(needed, available > 0 ? available : 1));
    setFulfillError(null);
  };

  const handleFulfillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fulfillModalReq) return;

    const ok = onFulfillRequest(fulfillModalReq.id, Number(fulfillUnits));
    if (ok) {
      setFulfillModalReq(null);
    } else {
      setFulfillError(
        `Insufficient units in blood bank. Available: ${
          inventory.find((i) => i.bloodGroup === fulfillModalReq.bloodGroup)?.availableUnits || 0
        } units.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Blood Requests Management</h1>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
              Hospital Requisitions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track urgent hospital orders, coordinate cold courier dispatches, and trigger emergency donor callouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportRequestsToCsv(requests)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Requests</span>
          </button>

          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Blood Request</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search hospital, request ID, doctor, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-slate-50/50"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical (Immediate Emergency)</option>
              <option value="URGENT">Urgent (Within 4 Hours)</option>
              <option value="NORMAL">Normal (Elective / Scheduled)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center justify-end">
            <button
              onClick={() => setSortByPriority(!sortByPriority)}
              className={`w-full py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                sortByPriority
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortByPriority ? 'Priority Sorted' : 'Date Sorted'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>
            Displaying <strong>{filteredRequests.length}</strong> active requisitions
          </span>
          <span className="text-slate-400">
            Note: Matching donors found does not auto-fulfill; staff physical confirmation required.
          </span>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Hospital &amp; Location</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Required</th>
                <th className="py-3 px-4">Bank Stock</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRequests.map((req) => {
                const isCritical = req.priority === 'CRITICAL';
                const isUrgent = req.priority === 'URGENT';
                const isFulfilled = req.status === 'FULFILLED';
                const invItem = inventory.find((i) => i.bloodGroup === req.bloodGroup);
                const availableInBank = invItem ? invItem.availableUnits : 0;
                const canFulfillNow = availableInBank >= (req.unitsRequired - req.unitsDispatched);

                return (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      <div>{req.id}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{req.requestDateTime}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{req.hospitalName}</div>
                      <div className="text-[11px] text-slate-500">
                        {req.city} • Contact: {req.contactPerson} ({req.contactPhone})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md font-black text-sm bg-red-100 text-red-800">
                        {req.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {req.unitsRequired} units
                      {req.unitsDispatched > 0 && (
                        <div className="text-[10px] text-emerald-600 font-normal">
                          {req.unitsDispatched} dispatched
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div
                        className={`text-xs font-bold ${
                          canFulfillNow
                            ? 'text-emerald-700'
                            : availableInBank === 0
                            ? 'text-red-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {availableInBank} units available
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {canFulfillNow ? 'In stock' : 'Shortfall detected'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-red-600 text-white animate-pulse'
                            : isUrgent
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isFulfilled
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'PROCESSING'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'CANCELLED'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {!isFulfilled && (
                          <>
                            {canManage && (
                              <button
                                onClick={() => handleOpenFulfill(req)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Fulfill and dispatch stock"
                              >
                                <Send className="w-3 h-3" />
                                <span>Fulfill</span>
                              </button>
                            )}

                            <button
                              onClick={() => onNavigateToMatch(req)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Match compatible emergency donors"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Match Donors</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Request Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Create Hospital Blood Request</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {createError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hospital / Medical Center Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  placeholder="e.g. Metro University Trauma Pavilion"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Units Required *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={formData.unitsRequired}
                    onChange={(e) =>
                      setFormData({ ...formData, unitsRequired: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Urgency Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as RequestPriority })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="CRITICAL">CRITICAL (Immediate)</option>
                    <option value="URGENT">URGENT (&lt; 4h)</option>
                    <option value="NORMAL">NORMAL (Scheduled)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Region *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    {CITIES_LIST.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Authorized Contact Doctor / Nurse *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Dr. Jordan Hayes"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Patient Condition</label>
                <textarea
                  rows={2}
                  value={formData.patientCondition}
                  onChange={(e) => setFormData({ ...formData, patientCondition: e.target.value })}
                  placeholder="Trauma surgery, internal hemorrhage, ICU transfusion..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  Submit Blood Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fulfill / Dispatch Modal */}
      {fulfillModalReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Fulfill Request {fulfillModalReq.id}
                </h3>
              </div>
              <button
                onClick={() => setFulfillModalReq(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {fulfillError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{fulfillError}</span>
              </div>
            )}

            <form onSubmit={handleFulfillSubmit} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="font-bold text-slate-900">{fulfillModalReq.hospitalName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Target Group: <strong>{fulfillModalReq.bloodGroup}</strong> • Needed:{' '}
                  {fulfillModalReq.unitsRequired - fulfillModalReq.unitsDispatched} units
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  Available in Blood Bank:{' '}
                  {inventory.find((i) => i.bloodGroup === fulfillModalReq.bloodGroup)?.availableUnits ||
                    0}{' '}
                  units
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Units to Dispatch Now *
                </label>
                <input
                  type="number"
                  min="1"
                  max={fulfillModalReq.unitsRequired - fulfillModalReq.unitsDispatched}
                  required
                  value={fulfillUnits}
                  onChange={(e) => setFulfillUnits(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[11px] text-blue-800">
                Atomic database transaction will deduct stock and log cold-chain release to audit table.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillModalReq(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  Confirm &amp; Dispatch Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">{selectedRequest.id}</span>
                <h3 className="font-bold text-slate-900 text-base">{selectedRequest.hospitalName}</h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Blood Required</span>
                  <div className="text-xl font-black text-red-700">{selectedRequest.bloodGroup}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Units Ordered</span>
                  <div className="text-xl font-black text-slate-900">
                    {selectedRequest.unitsRequired} ({selectedRequest.unitsDispatched} dispatched)
                  </div>
                </div>
              </div>

              <div className="p-3 border border-slate-100 rounded-xl space-y-1">
                <div className="text-[11px] font-bold text-slate-700">Patient Clinical Context</div>
                <p className="text-slate-600">{selectedRequest.patientCondition || 'Emergency trauma'}</p>
              </div>

              <div className="p-3 border border-slate-100 rounded-xl space-y-1">
                <div className="text-[11px] font-bold text-slate-700">Contact Personnel</div>
                <p className="text-slate-600">
                  {selectedRequest.contactPerson} ({selectedRequest.contactPhone})
                </p>
                <div className="text-[10px] text-slate-400">{selectedRequest.city}</div>
              </div>

              {selectedRequest.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600">
                  <span className="font-bold text-slate-700">Log Notes:</span> {selectedRequest.notes}
                </div>
              )}
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
