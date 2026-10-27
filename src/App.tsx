import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_USERS,
  INITIAL_DONORS,
  INITIAL_INVENTORY,
  INITIAL_REQUESTS,
  INITIAL_TRANSACTIONS,
  INITIAL_ALERTS
} from './data/mockData';
import {
  UserAccount,
  Donor,
  BloodInventoryItem,
  BloodRequest,
  InventoryTransaction,
  AlertItem,
  BloodGroup,
  EligibilityStatus,
  RequestStatus
} from './types/bloodbank';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DonorManagementView } from './components/DonorManagementView';
import { InventoryView } from './components/InventoryView';
import { BloodRequestView } from './components/BloodRequestView';
import { EmergencyMatchingView } from './components/EmergencyMatchingView';
import { ForecastingView } from './components/ForecastingView';
import { AlertsView } from './components/AlertsView';
import { ReportsView } from './components/ReportsView';
import { SourceCodeHubView } from './components/SourceCodeHubView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Application State
  const [donors, setDonors] = useState<Donor[]>(INITIAL_DONORS);
  const [inventory, setInventory] = useState<BloodInventoryItem[]>(INITIAL_INVENTORY);
  const [requests, setRequests] = useState<BloodRequest[]>(INITIAL_REQUESTS);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(INITIAL_TRANSACTIONS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  // Selected request passed to Emergency Match view
  const [matchSelectedRequest, setMatchSelectedRequest] = useState<BloodRequest | null>(null);

  // Quick modals triggers from dashboard
  const [quickAddDonorTrigger, setQuickAddDonorTrigger] = useState(false);

  // Role Switching Guard
  const handleSwitchUser = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'ROLE_DONOR') {
      if (['inventory', 'requests', 'matching', 'forecasting', 'reports'].includes(currentTab)) {
        setCurrentTab('dashboard');
      }
    }
  };

  // 1. DONOR HANDLERS
  const handleAddDonor = (newDonorData: Omit<Donor, 'id' | 'registrationDate' | 'totalDonationsCount'>) => {
    const nextCode = `BL-D10${donors.length + 1}`;
    const newDonor: Donor = {
      ...newDonorData,
      id: nextCode,
      registrationDate: new Date().toISOString().slice(0, 10),
      totalDonationsCount: 0
    };
    setDonors([newDonor, ...donors]);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  const handleUpdateDonor = (updated: Donor) => {
    setDonors(donors.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleToggleAvailability = (donorId: string) => {
    setDonors(
      donors.map((d) => {
        if (d.id === donorId) {
          const nextStatus = d.availabilityStatus === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
          return { ...d, availabilityStatus: nextStatus };
        }
        return d;
      })
    );
  };

  const handleVerifyEligibility = (donorId: string, status: EligibilityStatus) => {
    setDonors(donors.map((d) => (d.id === donorId ? { ...d, eligibilityStatus: status } : d)));
  };

  // 2. INVENTORY & TRANSACTION HANDLERS
  const handleRecordCollection = (
    bloodGroup: BloodGroup,
    units: number,
    donorCode: string,
    notes: string
  ) => {
    const txnId = `TXN-${9050 + transactions.length}`;
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    // Update inventory atomically
    setInventory((prev) =>
      prev.map((item) => {
        if (item.bloodGroup === bloodGroup) {
          const newUnits = item.availableUnits + units;
          let stockStatus: 'NORMAL' | 'LOW' | 'CRITICAL' = 'NORMAL';
          if (newUnits <= item.criticalThreshold) stockStatus = 'CRITICAL';
          else if (newUnits <= item.minimumThreshold) stockStatus = 'LOW';

          return {
            ...item,
            availableUnits: newUnits,
            stockStatus,
            lastUpdatedDate: nowStr
          };
        }
        return item;
      })
    );

    // Record transaction
    const newTxn: InventoryTransaction = {
      id: txnId,
      bloodGroup,
      units,
      type: 'COLLECTION',
      date: nowStr,
      performedBy: currentUser.fullName,
      reason: notes || `Collection from registered donor ${donorCode}`,
      referenceId: donorCode,
      batchNumber: `${bloodGroup.replace('+', 'POS').replace('-', 'NEG')}-B${Date.now().toString().slice(-4)}`
    };
    setTransactions([newTxn, ...transactions]);

    // Update donor donation count if recognized
    setDonors((prev) =>
      prev.map((d) =>
        d.id === donorCode
          ? {
              ...d,
              totalDonationsCount: d.totalDonationsCount + 1,
              lastDonationDate: nowStr.slice(0, 10)
            }
          : d
      )
    );

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
  };

  const handleRecordDispatch = (
    bloodGroup: BloodGroup,
    units: number,
    hospitalRequestId: string,
    notes: string
  ): boolean => {
    const item = inventory.find((i) => i.bloodGroup === bloodGroup);
    if (!item || item.availableUnits < units) {
      return false; // Atomic guard
    }

    const txnId = `TXN-${9050 + transactions.length}`;
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    setInventory((prev) =>
      prev.map((inv) => {
        if (inv.bloodGroup === bloodGroup) {
          const newUnits = inv.availableUnits - units;
          let stockStatus: 'NORMAL' | 'LOW' | 'CRITICAL' = 'NORMAL';
          if (newUnits <= inv.criticalThreshold) stockStatus = 'CRITICAL';
          else if (newUnits <= inv.minimumThreshold) stockStatus = 'LOW';

          // Trigger automated alert if dropped below critical
          if (newUnits <= inv.criticalThreshold) {
            const alertId = `ALT-${Date.now().toString().slice(-4)}`;
            setAlerts((aPrev) => [
              {
                id: alertId,
                title: `CRITICAL SHORTAGE: ${bloodGroup} Reserve Depleted`,
                message: `Stock for blood group ${bloodGroup} dipped to ${newUnits} units following dispatch to ${hospitalRequestId}.`,
                type: 'CRITICAL_SHORTAGE',
                severity: 'critical',
                timestamp: nowStr,
                isRead: false,
                linkTab: 'inventory',
                referenceId: bloodGroup
              },
              ...aPrev
            ]);
          }

          return {
            ...inv,
            availableUnits: newUnits,
            stockStatus,
            lastUpdatedDate: nowStr
          };
        }
        return inv;
      })
    );

    const newTxn: InventoryTransaction = {
      id: txnId,
      bloodGroup,
      units,
      type: 'DISPATCH',
      date: nowStr,
      performedBy: currentUser.fullName,
      reason: notes || `Hospital requisition dispatch for ${hospitalRequestId}`,
      referenceId: hospitalRequestId,
      batchNumber: `${bloodGroup.replace('+', 'POS').replace('-', 'NEG')}-REL${Date.now().toString().slice(-4)}`
    };
    setTransactions([newTxn, ...transactions]);

    return true;
  };

  // 3. BLOOD REQUEST HANDLERS
  const handleCreateRequest = (
    newReqData: Omit<BloodRequest, 'id' | 'unitsDispatched' | 'status' | 'requestDateTime'>
  ) => {
    const nextId = `BL-REQ-${8910 + requests.length}`;
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const newReq: BloodRequest = {
      ...newReqData,
      id: nextId,
      unitsDispatched: 0,
      status: 'PENDING',
      requestDateTime: nowStr
    };

    setRequests([newReq, ...requests]);

    // If critical, trigger alert
    if (newReqData.priority === 'CRITICAL') {
      const alertId = `ALT-${Date.now().toString().slice(-4)}`;
      setAlerts((prev) => [
        {
          id: alertId,
          title: `EMERGENCY TRAUMA REQUISITION: ${newReq.hospitalName}`,
          message: `${newReq.hospitalName} requested ${newReq.unitsRequired} units of ${newReq.bloodGroup} urgently!`,
          type: 'EMERGENCY_REQUEST',
          severity: 'critical',
          timestamp: nowStr,
          isRead: false,
          linkTab: 'requests',
          referenceId: nextId
        },
        ...prev
      ]);
    }
  };

  const handleUpdateRequestStatus = (requestId: string, newStatus: RequestStatus) => {
    setRequests(requests.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r)));
  };

  const handleFulfillRequest = (requestId: string, unitsToDispatch: number): boolean => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return false;

    const ok = handleRecordDispatch(
      req.bloodGroup,
      unitsToDispatch,
      req.id,
      `Cold-chain release for ${req.hospitalName}`
    );

    if (ok) {
      const updatedDispatched = req.unitsDispatched + unitsToDispatch;
      const isComplete = updatedDispatched >= req.unitsRequired;
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

      setRequests(
        requests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                unitsDispatched: updatedDispatched,
                status: isComplete ? 'FULFILLED' : 'PROCESSING',
                fulfilledAt: isComplete ? nowStr : undefined
              }
            : r
        )
      );

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      return true;
    }
    return false;
  };

  // 4. EMERGENCY MATCH & ALERTS
  const handleLogDonorContact = (donorId: string, notes: string) => {
    const alertId = `ALT-${Date.now().toString().slice(-4)}`;
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setAlerts((prev) => [
      {
        id: alertId,
        title: `Donor Callout Logged: ${donorId}`,
        message: `${currentUser.fullName} contacted donor ${donorId}: "${notes}"`,
        type: 'INVENTORY_UPDATE',
        severity: 'info',
        timestamp: nowStr,
        isRead: false,
        referenceId: donorId
      },
      ...prev
    ]);
  };

  const handleMarkAlertRead = (alertId: string) => {
    setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)));
  };

  const handleMarkAllAlertsRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, isRead: true })));
  };

  const pendingRequestsCount = requests.filter(
    (r) => r.status === 'PENDING' || r.status === 'PROCESSING'
  ).length;

  const criticalShortageCount = inventory.filter((i) => i.availableUnits <= i.criticalThreshold).length;

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Universal Header with Role Switcher & Emergency Beacon */}
      <Header
        currentUser={currentUser}
        allUsers={INITIAL_USERS}
        onSwitchUser={handleSwitchUser}
        alerts={alerts}
        onOpenAlerts={() => setCurrentTab('alerts')}
        onOpenEmergencyMatch={() => {
          setMatchSelectedRequest(requests.find((r) => r.priority === 'CRITICAL') || requests[0]);
          setCurrentTab('matching');
        }}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          userRole={currentUser.role}
          pendingRequestsCount={pendingRequestsCount}
          criticalShortageCount={criticalShortageCount}
          unreadAlertsCount={unreadAlertsCount}
        />

        {/* View Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              donors={donors}
              inventory={inventory}
              requests={requests}
              onNavigate={setCurrentTab}
              onOpenAddDonor={() => setCurrentTab('donors')}
              onOpenAddCollection={() => setCurrentTab('inventory')}
              onOpenCreateRequest={() => setCurrentTab('requests')}
              onSelectRequestForMatch={(req) => {
                setMatchSelectedRequest(req);
                setCurrentTab('matching');
              }}
            />
          )}

          {currentTab === 'donors' && (
            <DonorManagementView
              donors={donors}
              userRole={currentUser.role}
              onAddDonor={handleAddDonor}
              onUpdateDonor={handleUpdateDonor}
              onToggleAvailability={handleToggleAvailability}
              onVerifyEligibility={handleVerifyEligibility}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              transactions={transactions}
              userRole={currentUser.role}
              onRecordCollection={handleRecordCollection}
              onRecordDispatch={handleRecordDispatch}
            />
          )}

          {currentTab === 'requests' && (
            <BloodRequestView
              requests={requests}
              inventory={inventory}
              userRole={currentUser.role}
              onCreateRequest={handleCreateRequest}
              onUpdateRequestStatus={handleUpdateRequestStatus}
              onFulfillRequest={handleFulfillRequest}
              onNavigateToMatch={(req) => {
                setMatchSelectedRequest(req);
                setCurrentTab('matching');
              }}
            />
          )}

          {currentTab === 'matching' && (
            <EmergencyMatchingView
              donors={donors}
              requests={requests}
              selectedRequestFromNav={matchSelectedRequest}
              userRole={currentUser.role}
              onLogDonorContact={handleLogDonorContact}
            />
          )}

          {currentTab === 'forecasting' && <ForecastingView inventory={inventory} />}

          {currentTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onMarkRead={handleMarkAlertRead}
              onMarkAllRead={handleMarkAllAlertsRead}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              donors={donors}
              inventory={inventory}
              requests={requests}
              transactions={transactions}
            />
          )}

          {currentTab === 'codehub' && <SourceCodeHubView />}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <strong className="text-slate-800">BloodLink AI</strong>
          <span>•</span>
          <span>Smart Blood Inventory. Faster Donor Connections. Better Preparedness.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-emerald-700 font-semibold">Java 17 / Spring Boot 3.2.4</span>
          <span>•</span>
          <span>MySQL Relational Storage</span>
          <span>•</span>
          <button
            onClick={() => setCurrentTab('codehub')}
            className="text-red-600 hover:underline font-bold cursor-pointer"
          >
            Inspect Source Code &amp; Eclipse Export &rarr;
          </button>
        </div>
      </footer>
    </div>
  );
}
