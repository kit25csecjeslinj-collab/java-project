import React, { useState } from 'react';
import {
  BarChart3,
  Printer,
  Download,
  Calendar,
  Building2,
  Users,
  Layers,
  FileText,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import {
  BloodInventoryItem,
  BloodRequest,
  Donor,
  InventoryTransaction
} from '../types/bloodbank';
import {
  exportDonorsToCsv,
  exportInventoryToCsv,
  exportRequestsToCsv,
  exportTransactionsToCsv
} from '../services/exportService';
import { CITIES_LIST } from '../data/mockData';

interface ReportsViewProps {
  donors: Donor[];
  inventory: BloodInventoryItem[];
  requests: BloodRequest[];
  transactions: InventoryTransaction[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  donors,
  inventory,
  requests,
  transactions
}) => {
  const [dateRange, setDateRange] = useState<'30d' | '90d' | 'ytd' | 'all'>('30d');

  // Aggregations
  const donorsByGroup = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => ({
    group: bg,
    total: donors.filter((d) => d.bloodGroup === bg).length,
    available: donors.filter((d) => d.bloodGroup === bg && d.availabilityStatus === 'AVAILABLE').length
  }));

  const donorsByCity = CITIES_LIST.map((city) => ({
    city,
    total: donors.filter((d) => d.city === city).length,
    available: donors.filter((d) => d.city === city && d.availabilityStatus === 'AVAILABLE').length
  }));

  const totalInventoryUnits = inventory.reduce((sum, item) => sum + item.availableUnits, 0);
  const totalCollections = transactions
    .filter((t) => t.type === 'COLLECTION')
    .reduce((sum, t) => sum + t.units, 0);
  const totalDispatches = transactions
    .filter((t) => t.type === 'DISPATCH')
    .reduce((sum, t) => sum + t.units, 0);

  const completedRequestsCount = requests.filter((r) => r.status === 'FULFILLED').length;
  const criticalRequestsCount = requests.filter((r) => r.priority === 'CRITICAL').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Header (hidden in print or formatted) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Reports &amp; Operational Analytics
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              Audit Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Executive summaries, geographic distribution, cold-chain turnover rates, and regulatory compliance datasets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report View</span>
          </button>

          <div className="dropdown relative inline-block">
            <button
              onClick={() => {
                exportDonorsToCsv(donors);
                exportInventoryToCsv(inventory);
                exportRequestsToCsv(requests);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All Datasets (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 print:border-none print:shadow-none print:p-0">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="text-lg font-black text-slate-900">
              BloodLink AI — Comprehensive Health System Audit Report
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Target Facility: Central Regional Blood Transfusion Authority • Report Date:{' '}
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold text-slate-800">Hospital Accreditation Standard: ISO 15189</div>
            <div className="text-emerald-600 font-semibold">Security Clearance: Cleared</div>
          </div>
        </div>

        {/* 4 Summary Stat Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Active Central Stock</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalInventoryUnits} units</div>
            <span className="text-[10px] text-slate-500">8 Blood types managed</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Registered Volunteers</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{donors.length} donors</div>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {donors.filter((d) => d.availabilityStatus === 'AVAILABLE').length} on standby
            </span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Hospital Dispatches</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalDispatches} units</div>
            <span className="text-[10px] text-slate-500">{completedRequestsCount} orders fulfilled</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Critical Trauma Cases</span>
            <div className="text-2xl font-black text-red-600 mt-1">{criticalRequestsCount} requisitions</div>
            <span className="text-[10px] text-red-600 font-semibold">Immediate response protocol</span>
          </div>
        </div>

        {/* Detailed Breakdown Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Donors by Blood Group Table */}
          <div className="border border-slate-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Donor Demographics by Blood Group
              </h3>
              <button
                onClick={() => exportDonorsToCsv(donors)}
                className="text-[11px] text-red-600 hover:underline font-semibold print:hidden"
              >
                CSV
              </button>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                  <th className="py-2">Blood Group</th>
                  <th className="py-2">Registered</th>
                  <th className="py-2">Available</th>
                  <th className="py-2 text-right">Readiness %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donorsByGroup.map((row) => (
                  <tr key={row.group}>
                    <td className="py-2 font-bold text-slate-800">{row.group}</td>
                    <td className="py-2 text-slate-700">{row.total}</td>
                    <td className="py-2 text-emerald-600 font-semibold">{row.available}</td>
                    <td className="py-2 text-right font-mono text-slate-600">
                      {row.total > 0 ? Math.round((row.available / row.total) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Donors by City Proximity */}
          <div className="border border-slate-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Geographic Service Area Distribution
              </h3>
              <span className="text-[11px] text-slate-400">Metropolitan Radius</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                  <th className="py-2">City / Sector</th>
                  <th className="py-2">Total Donors</th>
                  <th className="py-2">Standby Available</th>
                  <th className="py-2 text-right">Coverage Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donorsByCity.map((row) => (
                  <tr key={row.city}>
                    <td className="py-2 font-semibold text-slate-800">{row.city}</td>
                    <td className="py-2 text-slate-700">{row.total}</td>
                    <td className="py-2 text-emerald-600 font-semibold">{row.available}</td>
                    <td className="py-2 text-right">
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Status Table */}
        <div className="border border-slate-100 rounded-xl p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Cold Bank Lot Inventory &amp; Threshold Audit
            </h3>
            <button
              onClick={() => exportInventoryToCsv(inventory)}
              className="text-[11px] text-red-600 hover:underline font-semibold print:hidden"
            >
              Export CSV
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                <th className="py-2">Group</th>
                <th className="py-2">Stock Units</th>
                <th className="py-2">Min Threshold</th>
                <th className="py-2">Critical Cutoff</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Reserve Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((item) => (
                <tr key={item.bloodGroup}>
                  <td className="py-2 font-black text-slate-900">{item.bloodGroup}</td>
                  <td className="py-2 font-bold text-slate-800">{item.availableUnits} units</td>
                  <td className="py-2 text-slate-600">{item.minimumThreshold}</td>
                  <td className="py-2 text-red-600 font-semibold">{item.criticalThreshold}</td>
                  <td className="py-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.stockStatus === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : item.stockStatus === 'LOW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.stockStatus}
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono text-slate-600">
                    {Math.round((item.availableUnits / item.minimumThreshold) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
