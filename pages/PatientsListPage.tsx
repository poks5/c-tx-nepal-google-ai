
import React, { useState, useEffect } from 'react';
// FIX: Change import style for react-router-dom to work around potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { getPatients } from '../services/backendService';
import type { Patient } from '../types';
import { PatientType } from '../types';

const PatientsTable: React.FC<{ patients: Patient[] }> = ({ patients }) => {
  const navigate = ReactRouterDOM.useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {patients.map((patient) => (
            <tr
              key={patient.id}
              className="hover:bg-primary-50 cursor-pointer transition-colors duration-150"
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Badge color={patient.type === PatientType.Donor ? 'blue' : 'green'}>{patient.type}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.bloodType}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.registrationDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PatientsListPage: React.FC = () => {
  const navigate = ReactRouterDOM.useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getPatients();
        setPatients(data);
      } catch (error) {
        console.error("Failed to fetch patients", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Patients</h1>
            <p className="text-gray-500 mt-1">Manage all registered donors and recipients.</p>
        </div>
        <Button onClick={() => navigate('/register')} leftIcon={<UserPlus size={18}/>}>
          Register New Patient
        </Button>
      </div>
      
      <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading patients...</div>
            ) : (
              <PatientsTable patients={patients} />
            )}
          </CardContent>
      </Card>
    </div>
  );
};

export default PatientsListPage;
