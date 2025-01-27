import React, { useState } from 'react';

interface JobDescriptionContentProps {
  job: {
    description: string;
    responsibilities: string[];
    qualifications: string[];
  };
}

const JobDescriptionContent = ({ job }: JobDescriptionContentProps) => {
  const [expandedSections, setExpandedSections] = useState({
    description: false,
    responsibilities: false,
    qualifications: false
  });

  return (
    <div className="space-y-8">
      {/* Description */}
      <section>
        <h3 className="text-lg font-medium mb-3">Description</h3>
        <div className={!expandedSections.description ? 'line-clamp-3' : ''}>
          <p className="text-slate-600">{job.description}</p>
        </div>
        {job.description.length > 200 && (
          <button 
            className="text-blue-600 text-sm mt-2"
            onClick={() => setExpandedSections(prev => ({
              ...prev,
              description: !prev.description
            }))}
          >
            {expandedSections.description ? 'Show less' : 'Show more'}
          </button>
        )}
      </section>

      {/* Responsibilities */}
      <section>
        <h3 className="text-lg font-medium mb-3">Responsibilities</h3>
        <div className={!expandedSections.responsibilities ? 'max-h-[200px] overflow-hidden' : ''}>
          <ul className="space-y-2">
            {job.responsibilities.map((item, index) => (
              <li key={index} className="flex items-start text-slate-600">
                <span className="mr-3">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        {job.responsibilities.length > 4 && (
          <button 
            className="text-blue-600 text-sm mt-2"
            onClick={() => setExpandedSections(prev => ({
              ...prev,
              responsibilities: !prev.responsibilities
            }))}
          >
            {expandedSections.responsibilities ? 'Show less' : 'Show more'}
          </button>
        )}
      </section>

    

      {/* Qualifications */}
      <section>
        <h3 className="text-lg font-medium mb-3">Qualifications</h3>
        <div className={!expandedSections.qualifications ? 'max-h-[200px] overflow-hidden' : ''}>
          <ul className="space-y-2">
            {job.qualifications.map((qualification, index) => (
              <li key={index} className="flex items-start text-slate-600">
                <span className="mr-3">•</span>
                {qualification}
              </li>
            ))}
          </ul>
        </div>
        {job.qualifications.length > 4 && (
          <button 
            className="text-blue-600 text-sm mt-2"
            onClick={() => setExpandedSections(prev => ({
              ...prev,
              qualifications: !prev.qualifications
            }))}
          >
            {expandedSections.qualifications ? 'Show less' : 'Show more'}
          </button>
        )}
      </section>
    </div>
  );
};

export default JobDescriptionContent;