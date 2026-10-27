import { BloodInventoryItem, BloodRequest, Donor, InventoryTransaction } from '../types/bloodbank';

function downloadCsvFile(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportDonorsToCsv(donors: Donor[]) {
  const headers = [
    'Donor ID',
    'Full Name',
    'Age',
    'DOB',
    'Blood Group',
    'Contact Number',
    'Email',
    'City',
    'Last Donation Date',
    'Availability Status',
    'Eligibility Status',
    'Total Donations',
    'Registration Date'
  ];

  const rows = donors.map((d) => [
    `"${d.id}"`,
    `"${d.fullName}"`,
    d.age,
    `"${d.dateOfBirth}"`,
    `"${d.bloodGroup}"`,
    `"${d.contactNumber}"`,
    `"${d.email}"`,
    `"${d.city}"`,
    `"${d.lastDonationDate || 'N/A'}"`,
    `"${d.availabilityStatus}"`,
    `"${d.eligibilityStatus}"`,
    d.totalDonationsCount,
    `"${d.registrationDate}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCsvFile(csvContent, `BloodLink_Donors_Export_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportInventoryToCsv(inventory: BloodInventoryItem[]) {
  const headers = [
    'Blood Group',
    'Available Units',
    'Minimum Threshold',
    'Critical Threshold',
    'Stock Status',
    'Reserved Units',
    'Last Updated'
  ];

  const rows = inventory.map((i) => [
    `"${i.bloodGroup}"`,
    i.availableUnits,
    i.minimumThreshold,
    i.criticalThreshold,
    `"${i.stockStatus}"`,
    i.reservedUnits,
    `"${i.lastUpdatedDate}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCsvFile(csvContent, `BloodLink_Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportRequestsToCsv(requests: BloodRequest[]) {
  const headers = [
    'Request ID',
    'Hospital / Facility',
    'Blood Group',
    'Units Required',
    'Units Dispatched',
    'City',
    'Priority',
    'Status',
    'Request Date',
    'Contact Person',
    'Contact Phone',
    'Fulfilled Date'
  ];

  const rows = requests.map((r) => [
    `"${r.id}"`,
    `"${r.hospitalName}"`,
    `"${r.bloodGroup}"`,
    r.unitsRequired,
    r.unitsDispatched,
    `"${r.city}"`,
    `"${r.priority}"`,
    `"${r.status}"`,
    `"${r.requestDateTime}"`,
    `"${r.contactPerson}"`,
    `"${r.contactPhone}"`,
    `"${r.fulfilledAt || 'Pending'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCsvFile(csvContent, `BloodLink_Requests_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportTransactionsToCsv(transactions: InventoryTransaction[]) {
  const headers = [
    'Transaction ID',
    'Date & Time',
    'Blood Group',
    'Type',
    'Units',
    'Batch Barcode',
    'Staff Performed',
    'Reference ID',
    'Reason'
  ];

  const rows = transactions.map((t) => [
    `"${t.id}"`,
    `"${t.date}"`,
    `"${t.bloodGroup}"`,
    `"${t.type}"`,
    t.units,
    `"${t.batchNumber}"`,
    `"${t.performedBy}"`,
    `"${t.referenceId || 'N/A'}"`,
    `"${t.reason.replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCsvFile(csvContent, `BloodLink_Audit_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
}
