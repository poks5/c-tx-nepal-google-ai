
import React, { useState, useEffect, useMemo } from 'react';
// FIX: Change import style for react-router-dom to work around potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { getPairs, getPatients, createPair } from '../services/backendService';
import type { DonorRecipientPair, Patient } from '../types';
import { PatientType } from '../types';
import CreatePairModal from '../components/CreatePairModal';
import { GitCommitHorizontal } from 'lucide-react';

const PairsTable: React.FC<{ pairs: DonorRecipientPair[], patients: Patient[] }> = ({ pairs, patients }) => {
  const navigate = ReactRouterDOM.useNavigate();

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'N/A';
  const getCompatibilityColor = (status: string) => {
    if (status === 'Compatible') return 'green' as const;
    if (status === 'Incompatible') return 'red' as const;
    return 'yellow' as const;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pair ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compatibility</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pairs.map((pair) => (
            <tr key={pair.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pair.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getPatientName(pair.donorId)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getPatientName(pair.recipientId)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                 <Badge color={getCompatibilityColor(pair.compatibilityStatus)}>{pair.compatibilityStatus}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pair.creationDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/pairs/${pair.id}`)}>View Workflow</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PairsListPage: React.FC = () => {
  const [pairs, setPairs] = useState<DonorRecipientPair[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [pairsData, patientsData] = await Promise.all([getPairs(), getPatients()]);
        setPairs(pairsData);
        setPatients(patientsData);
      } catch (error) {
        console.error("Failed to fetch pairs data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const { availableDonors, availableRecipients } = useMemo(() => {
    const pairedPatientIds = new Set(pairs.flatMap(p => [p.donorId, p.recipientId]));
    const available = patients.filter(p => !pairedPatientIds.has(p.id));
    return {
      availableDonors: available.filter(p => p.type === PatientType.Donor),
      availableRecipients: available.filter(p => p.type === PatientType.Recipient),
    };
  }, [patients, pairs]);
  
  const handleCreatePair = async (donorId: string, recipientId: string) => {
    try {
      const newPair = await createPair(donorId, recipientId);
      setPairs(prevPairs => [...prevPairs, newPair]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create pair:", error);
    }
  };

  return (
    <>
      <CreatePairModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableDonors={availableDonors}
        availableRecipients={availableRecipients}
        onCreate={handleCreatePair}
      />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Donor-Recipient Pairs</h1>
              <p className="text-gray-500 mt-1">Manage all active transplant pairs and their synchronized workflows.</p>
            </div>
             <Button onClick={() => setIsModalOpen(true)} leftIcon={<GitCommitHorizontal size={18}/>}>
              Create New Pair
            </Button>
        </div>
        
        <Card>
            <CardContent className="p-0">
              {isLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading pairs...</div>
              ) : (
                  <PairsTable pairs={pairs} patients={patients} />
              )}
            </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PairsListPage;
