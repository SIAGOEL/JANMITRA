export const getCases = () => {
  const stored = localStorage.getItem('kora_cases');
  if (stored) return JSON.parse(stored);
  
  const defaultCases = [
    { id: 'FIR-2023-089', title: 'Property Dispute - Sector 4', date: 'Oct 12, 2023', status: 'Active' },
    { id: 'CMP-2023-112', title: 'Noise Complaint - Nighttime', date: 'Oct 28, 2023', status: 'Active' },
    { id: 'CMP-2023-113', title: 'Noise Complaint - Nighttime', date: 'Oct 28, 2023', status: 'Pending' },
    { id: 'CMP-2023-114', title: 'Vehicle Theft - Sector 1', date: 'Oct 29, 2023', status: 'Active' },
    { id: 'CMP-2023-115', title: 'Fraud - Online Transaction', date: 'Nov 01, 2023', status: 'Pending' },
    { id: 'CMP-2023-088', title: 'Property Dispute - Sector 14', date: 'Nov 12, 2023', status: 'Pending' },
    { id: 'FIR-2023-090', title: 'Assault - Downtown', date: 'Nov 15, 2023', status: 'Closed' },
  ];
  
  localStorage.setItem('kora_cases', JSON.stringify(defaultCases));
  return defaultCases;
};

export const addCase = (newCase: any) => {
  const cases = getCases();
  cases.unshift(newCase);
  localStorage.setItem('kora_cases', JSON.stringify(cases));
};

export const getDraft = () => {
  const stored = localStorage.getItem('kora_draft');
  if (stored) return JSON.parse(stored);
  return {
    title: '', date: '', time: '', location: '', category: '', description: '',
    people: [], documents: []
  };
};

export const saveDraft = (draft: any) => {
  localStorage.setItem('kora_draft', JSON.stringify(draft));
};

export const clearDraft = () => {
  localStorage.removeItem('kora_draft');
};
