import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import eventsData from '../../data/Events.json';

const DataMigration = () => {
    const [status, setStatus] = useState('Idle');
    const [progress, setProgress] = useState({ current: 0, total: eventsData.length });
    const [errors, setErrors] = useState([]);

    const handleMigration = async () => {
        setStatus('Migrating...');
        setErrors([]);
        setProgress({ current: 0, total: eventsData.length });

        let successCount = 0;
        const currentErrors = [];

        for (const event of eventsData) {
            try {
                // Use the explicit ID from the JSON if available, otherwise let Firestore generate one
                const docRef = event.id
                    ? doc(db, 'events', event.id)
                    : doc(collection(db, 'events'));

                // Convert any dates to standard formats if necessary. 
                // Here we just push the raw data object straight to Firestore
                await setDoc(docRef, event);

                successCount++;
                setProgress(prev => ({ ...prev, current: successCount }));
            } catch (err) {
                console.error(`Error migrating event ${event.id}: `, err);
                currentErrors.push(`Failed to migrate ${event.title || event.id}: ${err.message}`);
            }
        }

        if (currentErrors.length > 0) {
            setErrors(currentErrors);
            setStatus(`Completed with errors. Successfully migrated ${successCount}/${eventsData.length} events.`);
        } else {
            setStatus(`Successfully migrated all ${successCount} events to Firebase!`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Database Migration Utility</h1>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded text-blue-800">
                <h2 className="font-semibold text-lg mb-2">Events.json to Firestore</h2>
                <p className="mb-2">
                    This utility will upload all <strong>{eventsData.length}</strong> events from your local
                    <code> src/data/Events.json</code> file into your Google Firebase Firestore database.
                </p>
                <p className="text-sm font-medium">Important: Do not close this page while migration is in progress.</p>
            </div>

            <div className="flex flex-col items-start gap-4 mb-8">
                <button
                    onClick={handleMigration}
                    disabled={status === 'Migrating...'}
                    className={`px-6 py-2 rounded font-medium text-white shadow-sm transition-colors
            ${status === 'Migrating...'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[var(--primary)] hover:bg-[var(--deep-accent)]'}`}
                >
                    {status === 'Migrating...' ? 'Uploading Data...' : 'Start Migration'}
                </button>

                <div className="w-full">
                    <div className="flex justify-between mb-1 pb-1">
                        <span className="text-sm font-medium text-gray-700">Status: {status}</span>
                        <span className="text-sm font-medium text-gray-700">
                            {progress.current} / {progress.total}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                    <h3 className="text-red-800 font-semibold mb-2">Errors Encountered:</h3>
                    <ul className="list-disc pl-5 text-sm text-red-700">
                        {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DataMigration;
