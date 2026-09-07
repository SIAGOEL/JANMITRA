import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCase, updateCase } from '../lib/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getCase(id as string)
      .then((data) => { if (active) setCaseItem(data); })
      .catch(() => { if (active) setCaseItem(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    setUpdating(true);
    try {
      const updated = await updateCase(id, { status });
      setCaseItem(updated);
    } catch {
      /* keep the current view on failure */
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading case ...</div>;
  }

  if (!caseItem) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Case not found</h2>
        <button onClick={() => navigate('/dashboard')} className="text-green-600 hover:underline">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 font-medium flex items-center space-x-2">
        <span>←</span><span>Back</span>
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{caseItem.id}</h1>
          <p className="text-gray-500 mt-1 text-lg">{caseItem.title}</p>
        </div>
        <Badge status={caseItem.status as any} className="px-4 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="p-6 md:col-span-2 space-y-6">
          <h3 className="font-bold text-lg border-b border-gray-100 pb-2">Incident Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Incident Date</p>
              <p className="font-semibold text-gray-900">{caseItem.date || caseItem.incidentDate || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Status</p>
              <p className="font-semibold text-gray-900">{caseItem.status}</p>
            </div>
            {caseItem.category && (
              <div>
                <p className="text-sm text-gray-500 font-medium">Category</p>
                <p className="font-semibold text-gray-900">{caseItem.category}</p>
              </div>
            )}
            {caseItem.location && (
              <div>
                <p className="text-sm text-gray-500 font-medium">Location</p>
                <p className="font-semibold text-gray-900">{caseItem.location}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Description</p>
            <p className="text-gray-900 bg-gray-50 p-4 rounded-lg border border-gray-100">
              {caseItem.description || 'Details for this case are currently being processed by the investigation department. Check back later for a complete chronological narrative and attached evidence.'}
            </p>
          </div>

          {Array.isArray(caseItem.people) && caseItem.people.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 font-medium mb-2">People Involved</p>
              <div className="space-y-2">
                {caseItem.people.map((person: any) => (
                  <div key={person.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-4 py-2">
                    <span className="font-medium text-gray-900">{person.name}</span>
                    <span className="text-xs text-gray-500">{person.relationship}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(caseItem.documents) && caseItem.documents.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 font-medium mb-2">Documents ({caseItem.documents.length})</p>
              <div className="space-y-2">
                {caseItem.documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-4 py-2">
                    <span className="font-medium text-gray-900 truncate max-w-xs">{doc.name}</span>
                    <span className="text-xs text-gray-500">{doc.type}{doc.size ? ` • ${doc.size}` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-6">
          <h3 className="font-bold text-lg border-b border-gray-100 pb-2">Quick Actions</h3>
          <button
            onClick={() => handleStatusChange('Active')}
            disabled={updating || caseItem.status === 'Active'}
            className="w-full py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark as Active
          </button>
          <button className="w-full py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Request Documents
          </button>
          <button
            onClick={() => handleStatusChange('Closed')}
            disabled={updating || caseItem.status === 'Closed'}
            className="w-full py-2 border border-red-200 text-red-600 bg-red-50 font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close Case
          </button>
        </Card>
      </div>
    </div>
  );
}
