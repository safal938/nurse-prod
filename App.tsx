import React, { useState, useMemo, useEffect } from 'react';
import { Search, Palette, List } from 'lucide-react';
import { Header } from './components/Header';
import { PatientCard } from './components/PatientCard';
import { Pagination } from './components/Pagination';
import { CardShowcase } from './components/CardShowcase';
import { PatientDetail } from './components/PatientDetail'; // Import detail view
import { MOCK_PATIENTS } from './constants';
import { Patient } from './types';

// Show 12 items per page (3 rows of 4 was previous, now 4 rows of 3)
const ITEMS_PER_PAGE = 12;

type ViewMode = 'list' | 'showcase';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter logic
  const filteredPatients = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return MOCK_PATIENTS.filter((p) => {
      const fullName = `${p.firstName} ${p.middleName || ''} ${p.lastName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.diagnosis.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  
  const currentPatients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPatients.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredPatients]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If a patient is selected, show the detail view
  if (selectedPatient) {
    return <PatientDetail patient={selectedPatient} onBack={handleBackToList} />;
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col font-sans text-neutral-900">
      <Header />

      {/* Floating Toggle Hidden */}

      {viewMode === 'showcase' ? (
        <CardShowcase />
      ) : (
        <main className="flex-1 w-[90%] max-w-[1920px] mx-auto py-8">
          {/* Page Title Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-normal text-neutral-900 mb-1">Patient List</h1>
            <p className="text-neutral-600">Manage and view patient status updates.</p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-10 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-white border border-border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-none text-base"
              placeholder="Search by name, ID, or diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Patient Grid - Max 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPatients.length > 0 ? (
              currentPatients.map((patient) => (
                <PatientCard 
                  key={patient.id} 
                  patient={patient} 
                  onClick={handlePatientSelect} 
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center border border-dashed border-border rounded-lg bg-white">
                <p className="text-neutral-600">No patients found matching your search.</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-primary hover:text-primary-hover font-medium text-sm"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredPatients.length > 0 && (
            <div className="mt-4">
              <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
              />
              <div className="mt-6 text-center text-neutral-400 text-xs">
                <p>Showing {currentPatients.length} of {filteredPatients.length} patients</p>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default App;