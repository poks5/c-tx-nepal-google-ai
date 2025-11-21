
import React, { useState, useMemo } from 'react';
// FIX: Change import style for react-router-dom to work around potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Patient, PatientType, Recipient, Donor } from '../types';
import { registerNewPatient } from '../services/backendService';
import { BLOOD_TYPES } from '../constants';
import { CheckCircle, AlertCircle } from 'lucide-react';

const InputField = ({ label, name, value, onChange, required = false, type = "text", children, ...props }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        {children ? (
            <select name={name} id={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" {...props}>
                {children}
            </select>
        ) : (
            <input type={type} name={name} id={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" {...props} />
        )}
    </div>
);

const TextAreaField = ({ label, name, value, onChange, rows = 3, ...props }: any) => (
    <div className="md:col-span-2">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea name={name} id={name} rows={rows} value={value} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" {...props}></textarea>
    </div>
);

const Notification: React.FC<{ type: 'success' | 'error'; message: string }> = ({ type, message }) => {
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
    const borderColor = isSuccess ? 'border-green-400' : 'border-red-400';
    const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
    const Icon = isSuccess ? CheckCircle : AlertCircle;

    if (!message) return null;

    return (
        <div className={`p-4 border-l-4 ${borderColor} ${bgColor} rounded-md`} role="alert">
            <div className="flex">
                <div className="flex-shrink-0">
                    <Icon className={`h-5 w-5 ${textColor}`} aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <p className={`text-sm ${textColor}`}>{message}</p>
                </div>
            </div>
        </div>
    );
};

const RecipientForm: React.FC<{ formData: any, handleChange: any, bmi: string }> = ({ formData, handleChange, bmi }) => (
    <>
        <Card>
            <CardHeader><CardTitle>Physical Measurements</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Weight (kg)" name="weightKg" value={formData.weightKg} onChange={handleChange} type="number" step="0.1" />
                <InputField label="Height (cm)" name="heightCm" value={formData.heightCm} onChange={handleChange} type="number" />
                <InputField label="BMI" name="bmi" value={bmi} readOnly disabled />
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Medical Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Primary Kidney Disease" name="primaryKidneyDisease" value={formData.primaryKidneyDisease} onChange={handleChange} />
                <InputField label="Mode of Dialysis" name="dialysisMode" value={formData.dialysisMode} onChange={handleChange}>
                    <option value="HD">HD (Hemodialysis)</option>
                    <option value="PD">PD (Peritoneal Dialysis)</option>
                    <option value="Preemptive">Preemptive transplant</option>
                </InputField>
                 <TextAreaField label="Medical History (comma-separated)" name="medicalHistoryStr" value={formData.medicalHistoryStr} onChange={handleChange} />
                 <TextAreaField label="Current Medications (comma-separated)" name="medicationsStr" value={formData.medicationsStr} onChange={handleChange} rows={2} />
                 <TextAreaField label="Allergies (comma-separated)" name="allergiesStr" value={formData.allergiesStr} onChange={handleChange} rows={2} />
            </CardContent>
        </Card>
    </>
);

const DonorForm: React.FC<{ formData: any, handleChange: any, bmi: string }> = ({ formData, handleChange, bmi }) => (
    <>
        <Card>
            <CardHeader><CardTitle>Physical Measurements</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Weight (kg)" name="weightKg" value={formData.weightKg} onChange={handleChange} type="number" step="0.1" />
                <InputField label="Height (cm)" name="heightCm" value={formData.heightCm} onChange={handleChange} type="number" />
                <InputField label="BMI" name="bmi" value={bmi} readOnly disabled />
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Donor Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Relationship to Recipient" name="relationshipToRecipient" value={formData.relationshipToRecipient} onChange={handleChange} />
                <div />
                <TextAreaField label="Motivation for Donation" name="motivationForDonation" value={formData.motivationForDonation} onChange={handleChange} rows={4} />
                <TextAreaField label="Comprehensive Medical History" name="medicalHistoryStr" value={formData.medicalHistoryStr} onChange={handleChange} />
                <TextAreaField label="Current Medications & Supplements" name="medicationsStr" value={formData.medicationsStr} onChange={handleChange} rows={2} />
                <TextAreaField label="Allergies & Reactions" name="allergiesStr" value={formData.allergiesStr} onChange={handleChange} rows={2} />
            </CardContent>
        </Card>
    </>
);


const RegisterPatientPage: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const [patientType, setPatientType] = useState<PatientType>(PatientType.Recipient);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        bloodType: 'A+',
        phone: '',
        email: '',
        address: '',
        weightKg: '',
        heightCm: '',
        primaryKidneyDisease: '',
        dialysisMode: 'HD',
        relationshipToRecipient: '',
        motivationForDonation: '',
        medicalHistoryStr: '',
        medicationsStr: '',
        allergiesStr: '',
    });

    const bmi = useMemo(() => {
        const weight = parseFloat(formData.weightKg);
        const height = parseFloat(formData.heightCm);
        if (weight > 0 && height > 0) {
            const heightInMeters = height / 100;
            return (weight / (heightInMeters * heightInMeters)).toFixed(2);
        }
        return '';
    }, [formData.weightKg, formData.heightCm]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setNotification(null);
        
        const commonData = {
            name: formData.name,
            age: parseInt(formData.age, 10),
            gender: formData.gender as 'Male' | 'Female' | 'Other',
            bloodType: formData.bloodType,
            type: patientType,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            medicalHistory: formData.medicalHistoryStr.split(',').map(s => s.trim()).filter(Boolean),
            medications: formData.medicationsStr.split(',').map(s => s.trim()).filter(Boolean),
            allergies: formData.allergiesStr.split(',').map(s => s.trim()).filter(Boolean),
        };

        try {
            if (patientType === PatientType.Recipient) {
                const newPatientData: Omit<Recipient, 'id' | 'registrationDate'> = {
                    ...commonData,
                    type: PatientType.Recipient,
                    weightKg: parseFloat(formData.weightKg) || undefined,
                    heightCm: parseFloat(formData.heightCm) || undefined,
                    bmi: parseFloat(bmi) || undefined,
                    primaryKidneyDisease: formData.primaryKidneyDisease,
                    dialysisMode: formData.dialysisMode as 'HD' | 'PD' | 'Preemptive',
                };
                await registerNewPatient(newPatientData);
            } else { // Donor
                const newPatientData: Omit<Donor, 'id' | 'registrationDate'> = {
                    ...commonData,
                    type: PatientType.Donor,
                    weightKg: parseFloat(formData.weightKg) || undefined,
                    heightCm: parseFloat(formData.heightCm) || undefined,
                    bmi: parseFloat(bmi) || undefined,
                    relationshipToRecipient: formData.relationshipToRecipient,
                    motivationForDonation: formData.motivationForDonation,
                };
                await registerNewPatient(newPatientData);
            }
            setNotification({ type: 'success', message: 'Patient registered successfully. Redirecting...' });
            setTimeout(() => navigate('/patients'), 2000);
        } catch (error) {
            console.error("Failed to register patient:", error);
            setNotification({ type: 'error', message: 'An error occurred during registration. Please check the details and try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Register New Patient</h1>
                <p className="text-gray-500 mt-1">Select the patient type and enter their details.</p>
            </div>

            <div className="flex bg-primary-100 p-1 rounded-lg">
                <button
                    type="button"
                    onClick={() => setPatientType(PatientType.Recipient)}
                    className={`w-1/2 p-2 rounded-md font-semibold text-center transition-colors ${patientType === PatientType.Recipient ? 'bg-white text-primary-700 shadow' : 'text-primary-600'}`}
                >
                    Recipient
                </button>
                <button
                    type="button"
                    onClick={() => setPatientType(PatientType.Donor)}
                    className={`w-1/2 p-2 rounded-md font-semibold text-center transition-colors ${patientType === PatientType.Donor ? 'bg-white text-primary-700 shadow' : 'text-blue-600'}`}
                >
                    Donor
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Please fill out all the required fields.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                        <InputField label="Age" name="age" value={formData.age} onChange={handleChange} type="number" required />
                        <InputField label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                            <option>Male</option><option>Female</option><option>Other</option>
                        </InputField>
                        <InputField label="Blood Type" name="bloodType" value={formData.bloodType} onChange={handleChange}>
                            {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                        </InputField>
                        <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                        <InputField label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" />
                        <TextAreaField label="Physical Address" name="address" value={formData.address} onChange={handleChange} />
                    </CardContent>
                </Card>

                {patientType === PatientType.Recipient ? <RecipientForm formData={formData} handleChange={handleChange} bmi={bmi} /> : <DonorForm formData={formData} handleChange={handleChange} bmi={bmi} />}

                <div className="p-6 bg-gray-50 rounded-b-lg border-t space-y-4">
                    {notification && <Notification type={notification.type} message={notification.message} />}
                    <div className="text-right">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Registering...' : 'Register Patient'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RegisterPatientPage;
