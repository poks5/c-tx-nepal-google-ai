import React, { useState } from 'react';
import type { Patient } from '../types';
import Button from './ui/Button';
import { X, GitCommitHorizontal } from 'lucide-react';

interface CreatePairModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDonors: Patient[];
  availableRecipients: Patient[];
  onCreate: (donorId: string, recipientId: string) => void;
}

const CreatePairModal: React.FC<CreatePairModalProps> = ({ isOpen, onClose, availableDonors, availableRecipients, onCreate }) => {
  const [selectedDonorId, setSelectedDonorId] = useState('');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonorId || !selectedRecipientId) {
      setError('Please select both a donor and a recipient.');
      return;
    }
    setError('');
    onCreate(selectedDonorId, selectedRecipientId);
  };
  
  const handleClose = () => {
      setSelectedDonorId('');
      setSelectedRecipientId('');
      setError('');
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <GitCommitHorizontal className="mr-2 h-5 w-5 text-primary-600" />
            Create New Donor-Recipient Pair
          </h2>
          <button onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Close modal">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="donor" className="block text-sm font-medium text-gray-700">Select Donor</label>
              <select
                id="donor"
                value={selectedDonorId}
                onChange={(e) => setSelectedDonorId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">-- Available Donors --</option>
                {availableDonors.map(d => <option key={d.id} value={d.id}>{d.name} (ID: {d.id})</option>)}
              </select>
               {availableDonors.length === 0 && <p className="text-xs text-gray-500 mt-1">No unpaired donors available.</p>}
            </div>
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">Select Recipient</label>
              <select
                id="recipient"
                value={selectedRecipientId}
                onChange={(e) => setSelectedRecipientId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">-- Available Recipients --</option>
                {availableRecipients.map(r => <option key={r.id} value={r.id}>{r.name} (ID: {r.id})</option>)}
              </select>
               {availableRecipients.length === 0 && <p className="text-xs text-gray-500 mt-1">No unpaired recipients available.</p>}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-2 rounded-b-xl">
            <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={!selectedDonorId || !selectedRecipientId}>Create Pair</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePairModal;