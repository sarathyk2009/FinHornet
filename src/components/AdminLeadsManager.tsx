import React, { useState } from 'react';
import {
  PhoneCall,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Filter,
  Save,
} from 'lucide-react';
import {
  CallbackLead,
  updateCallbackLeadStatus,
  deleteCallbackLead,
} from '../services/leadService';

interface Props {
  leads: CallbackLead[];
  onRefreshLeads: () => Promise<void> | void;
  isDark?: boolean;
}

export const AdminLeadsManager: React.FC<Props> = ({
  leads,
  onRefreshLeads,
  isDark,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'contacted'>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const filteredLeads = leads.filter((l) => {
    if (filterStatus === 'all') return true;
    return l.status === filterStatus;
  });

  const pendingCount = leads.filter((l) => l.status === 'pending').length;

  const handleToggleStatus = async (lead: CallbackLead) => {
    setIsBusy(true);
    const newStatus = lead.status === 'pending' ? 'contacted' : 'pending';
    try {
      await updateCallbackLeadStatus(lead.id, newStatus);
      await onRefreshLeads();
    } catch (e) {
      console.error(e);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveNotes = async (id: string) => {
    setIsBusy(true);
    try {
      await updateCallbackLeadStatus(id, undefined as any, tempNotes);
      await onRefreshLeads();
      setEditingNotesId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete callback request from "${name}"?`)) return;
    setIsBusy(true);
    try {
      await deleteCallbackLead(id);
      await onRefreshLeads();
    } catch (e) {
      console.error(e);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div
        className="p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Candidate Callback Requests (Leads)
            </h2>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Submitted from the public "Talk to Us" form directly into Firestore (`callback_requests` collection).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({leads.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('contacted')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'contacted'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Contacted ({leads.length - pendingCount})
            </button>
          </div>

          <button
            onClick={() => onRefreshLeads()}
            disabled={isBusy}
            title="Refresh leads"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isBusy ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div
        className="rounded-3xl border shadow-sm overflow-hidden"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No callback requests match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Exam Window & Query</th>
                  <th className="py-3 px-4">Status & Action</th>
                  <th className="py-3 px-4">Admin Notes</th>
                  <th className="py-3 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    {/* Candidate Name & Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        {lead.fullName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{lead.submittedAt}</span>
                      </span>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4 whitespace-nowrap space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-mono font-medium">
                        <Phone className="w-3 h-3 text-emerald-500" />
                        <span>{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                        <Mail className="w-3 h-3 text-blue-500" />
                        <span>{lead.email}</span>
                      </div>
                    </td>

                    {/* Exam Window & Query */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono">
                        {lead.examWindow}
                      </span>
                      {lead.message && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 italic">
                          "{lead.message}"
                        </p>
                      )}
                    </td>

                    {/* Status & Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(lead)}
                        disabled={isBusy}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                          lead.status === 'contacted'
                            ? 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300'
                        }`}
                        title="Click to toggle status"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lead.status === 'contacted' ? 'Contacted ✓' : 'Mark as Contacted'}</span>
                      </button>
                    </td>

                    {/* Admin Follow-up Notes */}
                    <td className="py-3.5 px-4 min-w-[200px]">
                      {editingNotesId === lead.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            placeholder="e.g. Called, scheduled demo"
                            className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                          <button
                            onClick={() => handleSaveNotes(lead.id)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNotesId(lead.id);
                            setTempNotes(lead.notes || '');
                          }}
                          className="cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-[11px] truncate"
                          title="Click to edit notes"
                        >
                          {lead.notes || <span className="italic text-slate-400">+ Add note</span>}
                        </div>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(lead.id, lead.fullName)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete lead"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
