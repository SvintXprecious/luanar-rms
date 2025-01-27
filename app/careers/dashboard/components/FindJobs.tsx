'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 10;

const FindJobs = ({ searchQuery: initialSearchQuery = "", onJobSelect }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("all");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchJobs();
  }, [selectedDepartment, selectedEmploymentType, debouncedSearchQuery]);

  useEffect(() => {
    fetchJobs();
  }, [currentPage]);

  const fetchFilters = async () => {
    try {
      const [deptResponse, empTypeResponse] = await Promise.all([
        fetch('/api/settings/departments'),
        fetch('/api/settings/employment')
      ]);
      
      if (!deptResponse.ok || !empTypeResponse.ok) {
        throw new Error('Failed to fetch filters');
      }
      
      const deptData = await deptResponse.json();
      const empTypeData = await empTypeResponse.json();
      
      if (deptData.success && empTypeData.success) {
        setDepartments(deptData.departments.filter(dept => dept.is_active));
        setEmploymentTypes(empTypeData.employmentTypes.filter(type => type.is_active));
      } else {
        throw new Error('Invalid response format from filters API');
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
      setError('Failed to load filters. Please try again later.');
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(selectedDepartment !== 'all' && { department_id: selectedDepartment }),
        ...(selectedEmploymentType !== 'all' && { employment_type_id: selectedEmploymentType }),
        ...(debouncedSearchQuery && { search: debouncedSearchQuery })
      });

      const response = await fetch(`/api/jobs/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.data);
        setTotalJobs(data.total || 0);
      } else {
        throw new Error(data.error || 'Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs. Please try again later.');
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (value, filterType) => {
    setCurrentPage(1);
    if (filterType === 'department') {
      setSelectedDepartment(value);
    } else if (filterType === 'employmentType') {
      setSelectedEmploymentType(value);
    }
  };

  const renderFilters = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <Select
          value={selectedDepartment}
          onValueChange={(value) => handleFilterChange(value, 'department')}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedEmploymentType}
          onValueChange={(value) => handleFilterChange(value, 'employmentType')}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Employment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {employmentTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderJobStatus = (job) => {
    const closingDate = new Date(job.closing_date);
    const today = new Date();
    const daysLeft = Math.ceil((closingDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
          Closed
        </span>
      );
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${
        daysLeft <= 3 
          ? "bg-red-100 text-red-700"
          : daysLeft <= 7
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700"
      }`}>
        {daysLeft} day{daysLeft === 1 ? '' : 's'} left
      </span>
    );
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalJobs / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      for (
        let i = Math.max(1, currentPage - delta);
        i <= Math.min(totalPages, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 1) {
        range.unshift('...');
        range.unshift(1);
      }
      if (currentPage + delta < totalPages) {
        range.push('...');
        range.push(totalPages);
      }

      return range;
    };

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-slate-600">
          Showing {Math.min(ITEMS_PER_PAGE * (currentPage - 1) + 1, totalJobs)} to{' '}
          {Math.min(ITEMS_PER_PAGE * currentPage, totalJobs)} of {totalJobs} jobs
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          {getPageNumbers().map((pageNum, idx) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 py-1">...</span>
            ) : (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className={currentPage === pageNum ? "bg-[#0041E9]" : ""}
              >
                {pageNum}
              </Button>
            )
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  const renderJobCards = () => (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card 
          key={job.id} 
          className="cursor-pointer hover:border-[#0041E9] transition-colors"
          onClick={() => onJobSelect(job)}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-lg text-slate-900 mb-2">{job.title}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {job.department_name}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                    {job.employment_type_name}
                  </span>
                  {job.location && (
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-700/10">
                      {job.location}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {renderJobStatus(job)}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJobSelect(job);
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs text-slate-500">
                Posted {new Date(job.created_at).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="text-xs text-slate-500">
                Deadline: {new Date(job.closing_date).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Positions</CardTitle>
            <CardDescription>
              Browse and apply for open positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderFilters()}
            
            <div className="mt-6">
              {error ? (
                <div className="text-center py-8 text-red-500">
                  {error}
                  <Button 
                    variant="outline"
                    size="sm"
                    className="ml-4"
                    onClick={() => {
                      setError(null);
                      fetchFilters();
                      fetchJobs();
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              ) : loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0041E9]" />
                </div>
              ) : jobs.length > 0 ? (
                <>
                  {renderJobCards()}
                  {renderPagination()}
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No jobs found matching your criteria
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FindJobs;