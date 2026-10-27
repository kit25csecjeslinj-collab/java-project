import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  Droplet,
  FileSpreadsheet,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import {
  BloodInventoryItem,
  BloodGroup,
  InventoryTransaction,
  UserRole
} from '../types/bloodbank';
import { exportInventoryToCsv, exportTransactionsToCsv } from '../services/exportService';

interface InventoryViewProps {
  inventory: BloodInventoryItem[];
  transactions: InventoryTransaction[];
  userRole: UserRole;
  onRecordCollection: (bloodGroup: BloodGroup, units: number, donorCode: string, notes: string) => void;
  onRecordDispatch: (
    bloodGroup: BloodGroup,
    units: number,
    hospitalRequestId: string,
    notes: string
  ) => boolean;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  transactions,
  userRole,
  onRecordCollection,
  onRecordDispatch
}) => {
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');

  // Form states
  const [collectionForm, setCollectionForm] = useState({
    bloodGroup: 'O+' as BloodGroup,
    units: 1,
    donorCode: 'BL-D1001',
    batchBarcode: 'BC-2026-X99',
    notes: 'Standard voluntary blood drive collection'
  });

  const [dispatchForm, setDispatchForm] = useState({
    bloodGroup: 'O-' as BloodGroup,
    units: 2,
    hospitalRequestId: 'BL-REQ-8901',
    destinationHospital: 'St. Jude Metropolitan Trauma Center',
    notes: 'Emergency surgical dispatch approved'
  });

  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const canMutate = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_STAFF';

  const handleCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecordCollection(
      collectionForm.bloodGroup,
      Number(collectionForm.units),
      collectionForm.donorCode,
      collectionForm.notes
    );
    setCollectionModalOpen(false);
    setSuccessToast(`Successfully recorded +${collectionForm.units} unit(s) of ${collectionForm.bloodGroup}`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchError(null);

    const success = onRecordDispatch(
      dispatchForm.bloodGroup,
      Number(dispatchForm.units),
      dispatchForm.hospitalRequestId,
      dispatchForm.notes
    );

    if (success) {
      setDispatchModalOpen(false);
      setSuccessToast(`Successfully dispatched ${dispatchForm.units} unit(s) of ${dispatchForm.bloodGroup}`);
      setTimeout(() => setSuccessToast(null), 4000);
    } else {
      setDispatchError(
        `Atomic safety violation: Insufficient ${dispatchForm.bloodGroup} inventory units in stock. Cannot dispatch more than available.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-slate-700 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Blood Inventory Management</h1>
            <span className="text-xs bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded-full">
              Safe Cold-Chain Bank
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time blood stock surveillance, atomic dispatch guards, and chronological transaction auditing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportInventoryToCsv(inventory)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Inventory</span>
          </button>

          {canMutate && (
            <>
              <button
                onClick={() => setCollectionModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Collect Blood</span>
              </button>
              <button
                onClick={() => setDispatchModalOpen(true)}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch / Issue Blood</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 8 Blood Groups Inventory Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {inventory.map((item) => {
          const isCritical = item.availableUnits <= item.criticalThreshold;
          const isLow = !isCritical && item.availableUnits <= item.minimumThreshold;
          const maxCapacity = 50;
          const fillPercentage = Math.min(100, Math.round((item.availableUnits / maxCapacity) * 100));

          return (
            <div
              key={item.bloodGroup}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition hover:shadow-md ${
                isCritical
                  ? 'border-red-400 ring-2 ring-red-500/10'
                  : isLow
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-10 h-10 rounded-xl bg-red-50 text-red-700 font-black text-lg flex items-center justify-center border border-red-100">
                    {item.bloodGroup}
                  </span>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Blood Type</div>
                    <div className="text-xs font-bold text-slate-700">Lot Reserve</div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-red-600 text-white animate-pulse'
                      : isLow
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.stockStatus}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-2">
                <div>
                  <span
                    className={`text-3xl font-black ${
                      isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                    }`}
                  >
                    {item.availableUnits}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold ml-1.5">units</span>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <div>Min Safe: {item.minimumThreshold}</div>
                  <div>Critical: {item.criticalThreshold}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCritical ? 'bg-red-600' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Updated: {item.lastUpdatedDate}</span>
                <span>Reserved: {item.reservedUnits}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Inventory Transaction Ledger</h2>
            <p className="text-xs text-slate-500">
              Immutable audit history of all blood collections, clinical dispatches, and quality inspections
            </p>
          </div>
          <button
            onClick={() => exportTransactionsToCsv(transactions)}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Txn ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Units</th>
                <th className="py-3 px-4">Batch Barcode</th>
                <th className="py-3 px-4">Authorized By</th>
                <th className="py-3 px-4">Clinical Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {transactions.map((txn) => {
                const isCollection = txn.type === 'COLLECTION';
                const isDispatch = txn.type === 'DISPATCH';

                return (
                  <tr key={txn.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{txn.id}</td>
                    <td className="py-3 px-4 text-slate-600">{txn.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCollection
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDispatch
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isCollection ? (
                          <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-red-600" />
                        )}
                        {txn.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {txn.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {isCollection ? `+${txn.units}` : `-${txn.units}`} units
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {txn.batchNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{txn.performedBy}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={txn.reason}>
                      {txn.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Blood Collection Modal */}
      {collectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Droplet className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Record Blood Collection</h3>
              </div>
              <button
                onClick={() => setCollectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCollectionSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={collectionForm.bloodGroup}
                    onChange={(e) =>
                      setCollectionForm({
                        ...collectionForm,
                        bloodGroup: e.target.value as BloodGroup
                      })
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
                  <label className="block font-semibold text-slate-700 mb-1">
                    Units Collected *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={collectionForm.units}
                    onChange={(e) =>
                      setCollectionForm({ ...collectionForm, units: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Associated Donor Code
                </label>
                <input
                  type="text"
                  required
                  value={collectionForm.donorCode}
                  onChange={(e) =>
                    setCollectionForm({ ...collectionForm, donorCode: e.target.value })
                  }
                  placeholder="e.g. BL-D1001"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cold-Chain Batch Barcode
                </label>
                <input
                  type="text"
                  required
                  value={collectionForm.batchBarcode}
                  onChange={(e) =>
                    setCollectionForm({ ...collectionForm, batchBarcode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Phlebotomy Log</label>
                <textarea
                  rows={2}
                  value={collectionForm.notes}
                  onChange={(e) =>
                    setCollectionForm({ ...collectionForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCollectionModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  Record Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Blood Dispatch Modal */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Record Blood Dispatch</h3>
              </div>
              <button
                onClick={() => setDispatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {dispatchError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{dispatchError}</span>
              </div>
            )}

            <form onSubmit={handleDispatchSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={dispatchForm.bloodGroup}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, bloodGroup: e.target.value as BloodGroup })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    {inventory.map((item) => (
                      <option key={item.bloodGroup} value={item.bloodGroup}>
                        {item.bloodGroup} ({item.availableUnits} in stock)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Units to Issue *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={dispatchForm.units}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, units: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hospital Requisition ID *
                </label>
                <input
                  type="text"
                  required
                  value={dispatchForm.hospitalRequestId}
                  onChange={(e) =>
                    setDispatchForm({ ...dispatchForm, hospitalRequestId: e.target.value })
                  }
                  placeholder="e.g. BL-REQ-8901"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Receiving Hospital / Center *
                </label>
                <input
                  type="text"
                  required
                  value={dispatchForm.destinationHospital}
                  onChange={(e) =>
                    setDispatchForm({ ...dispatchForm, destinationHospital: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Courier / Cold-Chain Seals
                </label>
                <textarea
                  rows={2}
                  value={dispatchForm.notes}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
                  placeholder="Temperature monitored box ID #908, courier release confirmed..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDispatchModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
