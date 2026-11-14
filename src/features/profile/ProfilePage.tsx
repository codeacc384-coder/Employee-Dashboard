import React, { useEffect, useState } from 'react';
import { Lock, Plus, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { usePortalData } from '../../app/PortalDataContext';
import { useToast } from '../../app/ToastContext';
import { ApprovalStatusBadge } from '../../components/ApprovalStatusBadge';
import { FormModal } from '../../components/FormModal';
import { ProfileCard } from '../../components/ProfileCard';
import { formatDate } from '../../utils/formatters';

type ProfileTab =
  | 'personal'
  | 'contact'
  | 'address'
  | 'emergency'
  | 'employment'
  | 'bank'
  | 'statutory'
  | 'reporting'
  | 'documents';

export function ProfilePage() {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const { documents, createTicket } = usePortalData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as ProfileTab) || 'personal';
  const [activeTab, setActiveTab] = useState<ProfileTab>(tabParam);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const changeTab = (t: ProfileTab) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  // Editable personal/contact/address states
  const [firstName, setFirstName] = useState(currentUser?.firstName ?? '');
  const [middleName, setMiddleName] = useState(currentUser?.middleName ?? '');
  const [lastName, setLastName] = useState(currentUser?.lastName ?? '');
  const [dob, setDob] = useState(currentUser?.dob ?? '');
  const [gender, setGender] = useState(currentUser?.gender ?? '');
  const [personalEmail, setPersonalEmail] = useState(currentUser?.personalEmail ?? '');
  const [mobile, setMobile] = useState(currentUser?.mobile ?? '');

  const [presentAddr, setPresentAddr] = useState(currentUser?.presentAddress ?? { line1: '', city: '', state: '', postalCode: '' });
  const [permAddr, setPermAddr] = useState(currentUser?.permanentAddress ?? { line1: '', city: '', state: '', postalCode: '' });

  // Emergency contact modal
  const [ecModalOpen, setEcModalOpen] = useState(false);
  const [ecName, setEcName] = useState('');
  const [ecRel, setEcRel] = useState('');
  const [ecMobile, setEcMobile] = useState('');
  const [ecAlt, setEcAlt] = useState('');

  // Protected field update request modal
  const [requestModal, setRequestModal] = useState<{ open: boolean; fieldGroup: string }>({
    open: false,
    fieldGroup: '',
  });
  const [requestDetails, setRequestDetails] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    setFirstName(currentUser.firstName);
    setMiddleName(currentUser.middleName ?? '');
    setLastName(currentUser.lastName);
    setDob(currentUser.dob);
    setGender(currentUser.gender);
    setPersonalEmail(currentUser.personalEmail);
    setMobile(currentUser.mobile);
    setPresentAddr(currentUser.presentAddress);
    setPermAddr(currentUser.permanentAddress);
  }, [currentUser]);

  if (!currentUser) return null;

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'contact', label: 'Contact Information' },
    { id: 'address', label: 'Address' },
    { id: 'emergency', label: 'Emergency Contacts' },
    { id: 'employment', label: 'Employment Details' },
    { id: 'bank', label: 'Bank Information' },
    { id: 'statutory', label: 'Statutory Information' },
    { id: 'reporting', label: 'Reporting Structure' },
    { id: 'documents', label: 'Documents' },
  ];

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      showToast('First and last name are required', 'error');
      return;
    }
    updateCurrentUserProfile({
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      dob,
      gender,
    });
    showToast('Personal information updated', 'success');
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({ personalEmail: personalEmail.trim(), mobile: mobile.trim() });
    showToast('Contact information saved', 'success');
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({ presentAddress: presentAddr, permanentAddress: permAddr });
    showToast('Address records updated', 'success');
  };

  const handleAddEmergencyContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ecName.trim() || !ecRel.trim() || !ecMobile.trim()) {
      showToast('Please complete required contact fields', 'error');
      return;
    }
    updateCurrentUserProfile({
      emergencyContacts: [
        ...currentUser.emergencyContacts,
        {
          id: `ec-${Date.now()}`,
          name: ecName.trim(),
          relationship: ecRel.trim(),
          mobile: ecMobile.trim(),
          alternateMobile: ecAlt.trim() || undefined,
        },
      ],
    });
    setEcModalOpen(false);
    setEcName('');
    setEcRel('');
    setEcMobile('');
    setEcAlt('');
    showToast('Emergency contact added', 'success');
  };

  const handleProtectedRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestDetails.trim()) {
      showToast('Please describe the requested change', 'error');
      return;
    }
    const ticket = createTicket({
      category: 'Profile Update',
      subject: `Protected Profile Update Request: ${requestModal.fieldGroup}`,
      description: requestDetails.trim(),
      priority: 'Medium',
    });
    if (requestModal.fieldGroup === 'Bank Information') {
      updateCurrentUserProfile({
        bankInfo: { ...currentUser.bankInfo, verificationStatus: 'Pending HR Verification' },
      });
    }
    setRequestModal({ open: false, fieldGroup: '' });
    setRequestDetails('');
    showToast(
      'HR verification request submitted',
      'success',
      `Ticket ${ticket.id} created. Payroll details remain protected until HR verifies.`
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1230]">My Profile</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Manage your personal records and view HR-verified employment and banking information.
        </p>
      </div>

      <ProfileCard employee={currentUser} />

      {/* Horizontal Tab Bar */}
      <div className="flex overflow-x-auto gap-1.5 border-b border-[#E5E7F0] pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => changeTab(t.id)}
            className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === t.id
                ? 'bg-[#7050F5] text-white'
                : 'bg-white text-[#475569] border border-[#E5E7F0] hover:text-[#0B1230]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-xl border border-[#E5E7F0] bg-white p-6">
        {activeTab === 'personal' && (
          <form onSubmit={handleSavePersonal} className="space-y-5 max-w-3xl">
            <div className="flex items-center justify-between border-b border-[#F1F3F9] pb-3">
              <h2 className="text-base font-semibold text-[#0B1230]">Personal Information</h2>
              <button
                type="submit"
                className="rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap"
              >
                Save Changes
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm focus:border-[#7050F5] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Middle Name</label>
                <input
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm focus:border-[#7050F5] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm focus:border-[#7050F5] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm focus:border-[#7050F5] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm focus:border-[#7050F5] focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </form>
        )}

        {activeTab === 'contact' && (
          <form onSubmit={handleSaveContact} className="space-y-5 max-w-2xl">
            <div className="flex items-center justify-between border-b border-[#F1F3F9] pb-3">
              <h2 className="text-base font-semibold text-[#0B1230]">Contact Information</h2>
              <button
                type="submit"
                className="rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap"
              >
                Save Changes
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Work Email (Protected)</label>
                <input
                  disabled
                  value={currentUser.email}
                  className="w-full rounded-lg border border-[#E5E7F0] bg-[#F7F7FC] px-3 py-2 text-sm text-[#64748B]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Personal Email</label>
                <input
                  type="email"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm focus:border-[#7050F5] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Mobile Number</label>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular focus:border-[#7050F5] focus:outline-none"
                />
              </div>
            </div>
          </form>
        )}

        {activeTab === 'address' && (
          <form onSubmit={handleSaveAddress} className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between border-b border-[#F1F3F9] pb-3">
              <h2 className="text-base font-semibold text-[#0B1230]">Residential Addresses</h2>
              <button
                type="submit"
                className="rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap"
              >
                Save Address
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#0B1230]">Present Address</h3>
                <input
                  placeholder="Street / Apartment"
                  value={presentAddr.line1}
                  onChange={(e) => setPresentAddr({ ...presentAddr, line1: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="City"
                    value={presentAddr.city}
                    onChange={(e) => setPresentAddr({ ...presentAddr, city: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="State"
                    value={presentAddr.state}
                    onChange={(e) => setPresentAddr({ ...presentAddr, state: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
                  />
                </div>
                <input
                  placeholder="Postal Code"
                  value={presentAddr.postalCode}
                  onChange={(e) => setPresentAddr({ ...presentAddr, postalCode: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular"
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#0B1230]">Permanent Address</h3>
                <input
                  placeholder="Street / House"
                  value={permAddr.line1}
                  onChange={(e) => setPermAddr({ ...permAddr, line1: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="City"
                    value={permAddr.city}
                    onChange={(e) => setPermAddr({ ...permAddr, city: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="State"
                    value={permAddr.state}
                    onChange={(e) => setPermAddr({ ...permAddr, state: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
                  />
                </div>
                <input
                  placeholder="Postal Code"
                  value={permAddr.postalCode}
                  onChange={(e) => setPermAddr({ ...permAddr, postalCode: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular"
                />
              </div>
            </div>
          </form>
        )}

        {activeTab === 'emergency' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F3F9] pb-3">
              <div>
                <h2 className="text-base font-semibold text-[#0B1230]">Emergency Contacts</h2>
                <p className="text-xs text-[#64748B]">Authorized contacts for workplace or medical emergencies</p>
              </div>
              <button
                type="button"
                onClick={() => setEcModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#7050F5] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Contact
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {currentUser.emergencyContacts.map((c) => (
                <div key={c.id} className="rounded-xl border border-[#E5E7F0] p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#0B1230]">{c.name}</h3>
                    <span className="text-xs font-medium text-[#7050F5]">{c.relationship}</span>
                  </div>
                  <p className="mt-2 text-xs text-[#475569] font-mono-tabular">Primary: {c.mobile}</p>
                  {c.alternateMobile && (
                    <p className="mt-0.5 text-xs text-[#64748B] font-mono-tabular">
                      Alternate: {c.alternateMobile}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'employment' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F3F9] pb-3">
              <div>
                <h2 className="text-base font-semibold text-[#0B1230]">Employment Details</h2>
                <p className="text-xs text-[#64748B] inline-flex items-center gap-1.5 mt-0.5">
                  <Lock className="h-3.5 w-3.5" />
                  Protected employment fields require an HR verification request to modify.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRequestModal({ open: true, fieldGroup: 'Employment Details' })}
                className="rounded-lg border border-[#E5E7F0] px-3.5 py-2 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC] whitespace-nowrap"
              >
                Request HR Update
              </button>
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              {[
                ['Employee ID', currentUser.employeeCode],
                ['Joining Date', formatDate(currentUser.joiningDate)],
                ['Department', currentUser.department],
                ['Designation', currentUser.designation],
                ['Reporting Manager', currentUser.reportingManagerName],
                ['Branch', currentUser.branch],
                ['Work Location', currentUser.workLocation],
                ['Employment Type', currentUser.employmentType],
                ['Probation Status', currentUser.probationStatus],
                ['Contract End Date', currentUser.contractEndDate ? formatDate(currentUser.contractEndDate) : 'Not Applicable'],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg bg-[#F7F7FC] p-3.5">
                  <dt className="text-xs text-[#64748B]">{label}</dt>
                  <dd className="mt-1 font-medium text-[#0B1230]">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F3F9] pb-3">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[#0B1230]">Bank Information</h2>
                  <p className="text-xs text-[#64748B]">
                    Account updates require HR & Payroll verification before salary disbursement.
                  </p>
                </div>
                <ApprovalStatusBadge status={currentUser.bankInfo.verificationStatus} />
              </div>
              <button
                type="button"
                onClick={() => setRequestModal({ open: true, fieldGroup: 'Bank Information' })}
                className="rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap"
              >
                Request Bank Account Update
              </button>
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <div className="rounded-lg bg-[#F7F7FC] p-3.5">
                <dt className="text-xs text-[#64748B]">Bank Name</dt>
                <dd className="mt-1 font-medium text-[#0B1230]">{currentUser.bankInfo.bankName}</dd>
              </div>
              <div className="rounded-lg bg-[#F7F7FC] p-3.5">
                <dt className="text-xs text-[#64748B]">Account Number (Masked)</dt>
                <dd className="mt-1 font-mono-tabular font-medium text-[#0B1230]">
                  {currentUser.bankInfo.accountNumberMasked}
                </dd>
              </div>
              <div className="rounded-lg bg-[#F7F7FC] p-3.5">
                <dt className="text-xs text-[#64748B]">IFSC Code</dt>
                <dd className="mt-1 font-mono-tabular font-medium text-[#0B1230]">
                  {currentUser.bankInfo.ifscCode}
                </dd>
              </div>
              <div className="rounded-lg bg-[#F7F7FC] p-3.5">
                <dt className="text-xs text-[#64748B]">Branch</dt>
                <dd className="mt-1 font-medium text-[#0B1230]">{currentUser.bankInfo.branchName}</dd>
              </div>
              <div className="rounded-lg bg-[#F7F7FC] p-3.5">
                <dt className="text-xs text-[#64748B]">Account Type</dt>
                <dd className="mt-1 font-medium text-[#0B1230]">{currentUser.bankInfo.accountType}</dd>
              </div>
            </dl>
          </div>
        )}

        {activeTab === 'statutory' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F3F9] pb-3">
              <div>
                <h2 className="text-base font-semibold text-[#0B1230]">Statutory Information</h2>
                <p className="text-xs text-[#64748B]">Masked tax and provident fund identifiers</p>
              </div>
              <button
                type="button"
                onClick={() => setRequestModal({ open: true, fieldGroup: 'Statutory Information' })}
                className="rounded-lg border border-[#E5E7F0] px-3.5 py-2 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC] whitespace-nowrap"
              >
                Request Correction
              </button>
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="rounded-lg bg-[#F7F7FC] p-3.5">
                <dt className="text-xs text-[#64748B]">PAN (Masked)</dt>
                <dd className="mt-1 font-mono-tabular font-medium text-[#0B1230]">
                  {currentUser.statutoryInfo.panMasked}
                </dd>
              </div>
              <div className="rounded-lg bg-[#F7F7FC] p-3.5">
                <dt className="text-xs text-[#64748B]">UAN Number</dt>
                <dd className="mt-1 font-mono-tabular font-medium text-[#0B1230]">
                  {currentUser.statutoryInfo.uanNumber}
                </dd>
              </div>
              <div className="rounded-lg bg-[#F7F7FC] p-3.5">
                <dt className="text-xs text-[#64748B]">PF Account</dt>
                <dd className="mt-1 font-mono-tabular font-medium text-[#0B1230]">
                  {currentUser.statutoryInfo.pfAccountNumber}
                </dd>
              </div>
              <div className="rounded-lg bg-[#F7F7FC] p-3.5">
                <dt className="text-xs text-[#64748B]">Selected Tax Regime</dt>
                <dd className="mt-1 font-medium text-[#0B1230]">{currentUser.statutoryInfo.taxRegime}</dd>
              </div>
            </dl>
          </div>
        )}

        {activeTab === 'reporting' && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-[#0B1230] border-b border-[#F1F3F9] pb-3">
              Reporting Structure
            </h2>
            <div className="max-w-lg space-y-4">
              <div className="rounded-xl border border-[#E5E7F0] bg-[#F7F7FC] p-4">
                <p className="text-xs text-[#64748B]">Reporting Manager</p>
                <p className="mt-1 text-sm font-semibold text-[#0B1230]">{currentUser.reportingManagerName}</p>
                <p className="mt-0.5 text-xs text-[#64748B]">{currentUser.department}</p>
              </div>
              <div className="flex justify-center">
                <div className="h-6 w-px bg-[#CBD5E1]" />
              </div>
              <div className="rounded-xl border border-[#7050F5]/40 bg-white p-4">
                <p className="text-xs text-[#7050F5] font-medium">You</p>
                <p className="mt-1 text-sm font-semibold text-[#0B1230]">{currentUser.fullName}</p>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  {currentUser.designation} · {currentUser.employeeCode}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F3F9] pb-3">
              <div>
                <h2 className="text-base font-semibold text-[#0B1230]">Verified Profile Documents</h2>
                <p className="text-xs text-[#64748B]">Private KYC & employment letters</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/documents')}
                className="rounded-lg bg-[#7050F5] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap"
              >
                Open Document Vault
              </button>
            </div>
            <ul className="divide-y divide-[#F1F3F9]">
              {documents.slice(0, 5).map((doc) => (
                <li key={doc.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-[#0B1230]">{doc.name}</p>
                    <p className="text-xs text-[#64748B]">{doc.category} · {doc.fileSize}</p>
                  </div>
                  <ApprovalStatusBadge status={doc.verificationStatus} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Add Emergency Contact Modal */}
      <FormModal
        open={ecModalOpen}
        onClose={() => setEcModalOpen(false)}
        title="Add Emergency Contact"
        subtitle="Provide a trusted contact reachable during emergencies"
      >
        <form onSubmit={handleAddEmergencyContact} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Full Name *</label>
            <input
              required
              value={ecName}
              onChange={(e) => setEcName(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Relationship *</label>
            <input
              required
              placeholder="e.g. Spouse, Parent, Sibling"
              value={ecRel}
              onChange={(e) => setEcRel(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Mobile Number *</label>
            <input
              required
              value={ecMobile}
              onChange={(e) => setEcMobile(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Alternate Mobile</label>
            <input
              value={ecAlt}
              onChange={(e) => setEcAlt(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEcModalOpen(false)}
              className="rounded-lg border border-[#E5E7F0] px-4 py-2 text-xs font-medium text-[#0B1230]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0]"
            >
              Save Contact
            </button>
          </div>
        </form>
      </FormModal>

      {/* Protected Field Update Request Modal */}
      <FormModal
        open={requestModal.open}
        onClose={() => setRequestModal({ open: false, fieldGroup: '' })}
        title={`Request Update — ${requestModal.fieldGroup}`}
        subtitle="Protected records undergo HR & Payroll verification before taking effect"
      >
        <form onSubmit={handleProtectedRequestSubmit} className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-lg bg-[#F7F7FC] p-3 text-xs text-[#475569]">
            <ShieldCheck className="h-4 w-4 text-[#7050F5] shrink-0 mt-0.5" />
            <span>
              Submitting this form creates an audited HR Profile Update ticket. For bank updates, attach a cancelled cheque or bank passbook copy via Support after submission.
            </span>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">
              Describe the exact update required *
            </label>
            <textarea
              required
              rows={4}
              value={requestDetails}
              onChange={(e) => setRequestDetails(e.target.value)}
              placeholder="Specify new bank IFSC / account details or employment record correction..."
              className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm focus:border-[#7050F5] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRequestModal({ open: false, fieldGroup: '' })}
              className="rounded-lg border border-[#E5E7F0] px-4 py-2 text-xs font-medium text-[#0B1230]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0]"
            >
              Submit Verification Request
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
