
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, GitCommitHorizontal, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { getPatients, getPairs } from '../services/backendService';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description, isLoading }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
      <p className="text-xs text-gray-500">{description}</p>
    </CardContent>
  </Card>
);

const completionRates = [
  { name: 'Phase 1', completed: 80, in_progress: 20 },
  { name: 'Phase 2', completed: 65, in_progress: 25 },
  { name: 'Phase 3', completed: 50, in_progress: 15 },
  { name: 'Phase 4', completed: 30, in_progress: 10 },
  { name: 'Phase 5', completed: 15, in_progress: 5 },
];

const DashboardPage: React.FC = () => {
  const [totalPatients, setTotalPatients] = useState(0);
  const [activePairs, setActivePairs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // These are simulated values
  const completedEvaluations = 2; 
  const averageDays = 95;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [patients, pairs] = await Promise.all([getPatients(), getPairs()]);
        setTotalPatients(patients.length);
        setActivePairs(pairs.length);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Patients" value={totalPatients.toString()} icon={<Users className="h-4 w-4 text-gray-500" />} description="Donors & Recipients" isLoading={isLoading} />
        <StatCard title="Active Pairs" value={activePairs.toString()} icon={<GitCommitHorizontal className="h-4 w-4 text-gray-500" />} description="Donor-Recipient Pairs" isLoading={isLoading} />
        <StatCard title="Completed Evals" value={completedEvaluations.toString()} icon={<CheckCircle className="h-4 w-4 text-gray-500" />} description="In the last 6 months" />
        <StatCard title="Avg. Eval Time" value={`${averageDays} days`} icon={<Clock className="h-4 w-4 text-gray-500" />} description="From start to finish" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evaluation Phase Completion</CardTitle>
            <CardDescription>Progress of all active patients through the evaluation workflow.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completionRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#2c8e82" name="Completed (%)" />
                <Bar dataKey="in_progress" stackId="a" fill="#87d5cf" name="In Progress (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-800">John Doe completed Phase 1</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                 <GitCommitHorizontal className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-800">New pair created: Smith/Doe</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </li>
               <li className="flex items-start space-x-3">
                 <Users className="w-5 h-5 text-primary-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-800">New patient registered: Emily White</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </li>
                 <li className="flex items-start space-x-3">
                 <Clock className="w-5 h-5 text-yellow-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Robert Johnson started Phase 1</p>
                  <p className="text-xs text-gray-500">4 days ago</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;