import React from 'react';
import {
  Users,
  Layers,
  FileText,
  AlertTriangle,
  TrendingUp,
  Heart,
  Droplet,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Building2,
  Plus
} from 'lucide-react';
import {
  BloodInventoryItem,
  BloodRequest,
  Donor
} from '../types/bloodbank';
import { MONTHLY_COLLECTION_DATA } from '../data/mockData';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  donors: Donor[];
  inventory: BloodInventoryItem[];
  requests: BloodRequest[];
  onNavigate: (tab: NavTab) => void;
  onOpenAddDonor: () => void;
  onOpenAddCollection: () => void;
  onOpenCreateRequest: () => void;
  onSelectRequestForMatch: (req: BloodRequest) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  donors,
  inventory,
  requests,
  onNavigate,
  onOpenAddDonor,
  onOpenAddCollection,
  onOpenCreateRequest,
  onSelectRequestForMatch
}) => {
  const totalDonors = donors.length;
  const availableDonors = donors.filter((d) => d.availabilityStatus === 'AVAILABLE').length;
  const totalUnits = inventory.reduce((sum, item) => sum + item.availableUnits, 0);
  const pendingRequests = requests.filter((r) => r.status === 'PENDING' || r.status === 'PROCESSING');
  const criticalRequests = requests.filter(
    (r) => (r.status === 'PENDING' || r.status === 'PROCESSING') && r.priority === 'CRITICAL'
  );
  const criticalShortages = inventory.filter((item) => item.availableUnits <= item.criticalThreshold);
  const lowStockItems = inventory.filter(
    (item) => item.availableUnits > item.criticalThreshold && item.availableUnits <= item.minimumThreshold
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Notice */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold mb-2 border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              Live Operational Readiness Engine
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              BloodLink AI Dashboard
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Smart Blood Inventory. Faster Donor Connections. Better Preparedness.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddDonor}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-600 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-red-400" />
              <span>Register Donor</span>
            </button>
            <button
              onClick={onOpenAddCollection}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-600 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Droplet className="w-3.5 h-3.5 text-red-400" />
              <span>Log Collection</span>
            </button>
            <button
              onClick={onOpenCreateRequest}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Emergency Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Registered Donors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Donors
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalDonors}</span>
            <span className="text-xs font-medium text-emerald-600">
              {availableDonors} Available
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Verified medical records</span>
            <button
              onClick={() => onNavigate('donors')}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Manage &rarr;
            </button>
          </div>
        </div>

        {/* Card 2: Inventory Units */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Stock Units
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalUnits}</span>
            <span className="text-xs font-medium text-slate-500">Units in Central Bank</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>8 Blood Groups</span>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-red-600 hover:underline font-semibold cursor-pointer"
            >
              Inspect &rarr;
            </button>
          </div>
        </div>

        {/* Card 3: Pending Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{pendingRequests.length}</span>
            <span className="text-xs font-bold text-red-600">
              {criticalRequests.length} Critical
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Hospital requisitions</span>
            <button
              onClick={() => onNavigate('requests')}
              className="text-amber-600 hover:underline font-semibold cursor-pointer"
            >
              Review &rarr;
            </button>
          </div>
        </div>

        {/* Card 4: Critical Shortages */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Critical Shortages
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center animate-bounce">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-600">
              {criticalShortages.length}
            </span>
            <span className="text-xs text-slate-500">
              {criticalShortages.map((i) => i.bloodGroup).join(', ') || 'None'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="text-red-600 font-semibold">Immediate action needed</span>
            <button
              onClick={() => onNavigate('matching')}
              className="text-red-700 hover:underline font-bold cursor-pointer"
            >
              Match &rarr;
            </button>
          </div>
        </div>

        {/* Card 5: Low-Stock Warnings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Low Stock Alert
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-orange-600">{lowStockItems.length}</span>
            <span className="text-xs text-slate-500">
              {lowStockItems.map((i) => i.bloodGroup).join(', ') || 'Stable'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Below safety margin</span>
            <button
              onClick={() => onNavigate('forecasting')}
              className="text-orange-600 hover:underline font-semibold cursor-pointer"
            >
              Forecast &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Critical Shortage Alert Banner (if any) */}
      {criticalShortages.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-900">
                  CRITICAL DEFICIT DETECTED:{' '}
                  {criticalShortages.map((c) => `${c.bloodGroup} (${c.availableUnits} units)`).join(' and ')}
                </h3>
                <p className="text-xs text-red-700 mt-0.5">
                  Universal O- and B- reserves have dipped below minimum emergency safe thresholds.
                  Automated donor matching is queued.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('matching')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Initiate Emergency Donor Match</span>
            </button>
          </div>
        </div>
      )}

      {/* Middle Section: Inventory Breakdown & Monthly Collection Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Blood Group Distribution Table/Bars */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Blood Inventory Distribution</h2>
              <p className="text-xs text-slate-500">Real-time status across all 8 major blood classifications</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
              Capacity: 400 Units
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {inventory.map((item) => {
              const percentage = Math.min(100, Math.round((item.availableUnits / 50) * 100));
              const isCritical = item.availableUnits <= item.criticalThreshold;
              const isLow = !isCritical && item.availableUnits <= item.minimumThreshold;

              return (
                <div
                  key={item.bloodGroup}
                  className={`p-3 rounded-xl border transition ${
                    isCritical
                      ? 'border-red-300 bg-red-50/50'
                      : isLow
                      ? 'border-amber-200 bg-amber-50/40'
                      : 'border-slate-100 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-black text-slate-900">{item.bloodGroup}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
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

                  <div className="flex items-baseline gap-1 mt-1">
                    <span
                      className={`text-2xl font-black ${
                        isCritical ? 'text-red-700' : isLow ? 'text-amber-700' : 'text-slate-800'
                      }`}
                    >
                      {item.availableUnits}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">units</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isCritical ? 'bg-red-600' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                    <span>Min: {item.minimumThreshold}</span>
                    <span>Res: {item.reservedUnits}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Atomic transaction locks active via Spring Data JPA Hibernate
            </span>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Detailed Inventory Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Monthly Collection Trends & AI Forecast Teaser */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-900 text-base">Blood Collection Trends</h2>
                <p className="text-xs text-slate-500">Monthly units collected vs. hospital dispatches</p>
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                AI Forecast Ready
              </span>
            </div>

            {/* Visual SVG Bar Comparison */}
            <div className="space-y-3 my-2">
              {MONTHLY_COLLECTION_DATA.map((row) => {
                const maxVal = 200;
                const collPct = Math.round((row.collections / maxVal) * 100);
                const dispPct = Math.round((row.dispatches / maxVal) * 100);

                return (
                  <div key={row.month} className="text-xs">
                    <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                      <span>{row.month}</span>
                      <div className="flex gap-3 text-[10px]">
                        <span className="text-emerald-700 font-bold">In: {row.collections}</span>
                        <span className="text-red-700 font-bold">Out: {row.dispatches}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 h-2">
                      <div className="bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${collPct}%` }}
                        />
                      </div>
                      <div className="bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="bg-red-500 h-full rounded-full"
                          style={{ width: `${dispPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 bg-purple-50/60 rounded-xl p-3 border border-purple-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Next 14 Days Demand Forecast
              </span>
              <span className="text-[10px] text-purple-700 font-semibold bg-white px-1.5 py-0.5 rounded border border-purple-200">
                Confidence: 89.5%
              </span>
            </div>
            <p className="text-[11px] text-purple-800 leading-snug">
              Anticipated surge of <strong>+18%</strong> in O- and B- due to regional trauma incidents.
            </p>
            <div className="mt-2 text-right">
              <button
                onClick={() => onNavigate('forecasting')}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
              >
                Open Full AI Forecasting Engine &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Emergency Requests Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Active Hospital Blood Requisitions</h2>
            <p className="text-xs text-slate-500">
              Live queue prioritized by clinical urgency (Critical &gt; Urgent &gt; Normal)
            </p>
          </div>
          <button
            onClick={() => onNavigate('requests')}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({requests.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Request ID</th>
                <th className="py-2.5 px-3">Hospital / Center</th>
                <th className="py-2.5 px-3">Blood Group</th>
                <th className="py-2.5 px-3">Required</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Emergency Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {requests.slice(0, 4).map((req) => {
                const isCritical = req.priority === 'CRITICAL';
                const isUrgent = req.priority === 'URGENT';
                const isFulfilled = req.status === 'FULFILLED';

                return (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{req.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{req.hospitalName}</div>
                      <div className="text-[11px] text-slate-500">{req.contactPerson}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-black text-sm bg-red-100 text-red-800">
                        {req.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {req.unitsRequired} units
                      {req.unitsDispatched > 0 && (
                        <div className="text-[10px] text-emerald-600">
                          ({req.unitsDispatched} dispatched)
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{req.city}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
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
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isFulfilled
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'PROCESSING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {!isFulfilled ? (
                        <button
                          onClick={() => {
                            onSelectRequestForMatch(req);
                            onNavigate('matching');
                          }}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Find Matching Donors</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Dispatched
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
