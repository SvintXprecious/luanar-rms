'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from "next-auth/react";

import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Search,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  Bell,
  Plus,
  ChevronRight,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Loader2,
  LucideIcon
} from 'lucide-react';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import HRSettingsPage from './Settings/settingsPage';
import JobPostingModal from '../jobs/JobPosting';
import JobsContent from '../jobs/JobsListing';


// Type definitions
interface Props {
  session: any; // You can define a proper Session type
}

interface JobCounts {
  active_jobs: number;
  inactive_jobs: number;
  total_jobs: number;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  id: string;
  badge?: number;
  adminOnly?: boolean;
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  description: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: LucideIcon;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: LucideIcon;
  iconBackground: string;
  iconColor: string;
}

// Navigation configuration
const NAVIGATION: NavCategory[] = [
  {
    title: 'Main',
    items: [
      { icon: LayoutDashboard, label: 'Overview', id: 'overview' }
    ]
  },
  {
    title: 'Recruitment',
    items: [
      { icon: Briefcase, label: 'Jobs', id: 'jobs' },
      //{ icon: FileText, label: 'Resumes', id: 'resumes' },
      //{ icon: Users, label: 'Candidates', id: 'candidates', badge: 12 }
    ]
  },
  {
    title: 'System',
    items: [
      { icon: Settings, label: 'Settings', id: 'settings', adminOnly: true }
    ]
  }
];

const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    title: 'New application received',
    description: 'Sarah Miller applied for Senior Developer position',
    timestamp: '5 minutes ago',
    icon: Activity,
    iconBackground: 'bg-[#0041E9] bg-opacity-10',
    iconColor: 'text-[#0041E9]'
  },
  {
    id: '2',
    title: 'Interview scheduled',
    description: 'Technical interview for UX Designer position',
    timestamp: '2 hours ago',
    icon: Users,
    iconBackground: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    id: '3',
    title: 'New position opened',
    description: 'Product Manager position published',
    timestamp: '1 day ago',
    icon: Briefcase,
    iconBackground: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  }
];

const RecruitDashboard: React.FC<Props> = ({ session }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [jobCounts, setJobCounts] = useState<JobCounts | null>(null);
  const userInitials = session.user.name?.split(' ').map((n: string) => n[0]).join('');

  // Fetch job counts
  useEffect(() => {
    const fetchJobCounts = async () => {
      try {
        const response = await fetch('/api/jobs?counts=true');
        if (!response.ok) throw new Error('Failed to fetch job counts');
        const data = await response.json();
        if (data.success) {
          setJobCounts(data.data);
        }
      } catch (error) {
        console.error('Error fetching job counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobCounts();
  }, []);

  // Get dynamic metric cards with real job counts
  const getMetricCards = (): MetricCard[] => [
    {
      id: 'total-applications',
      title: 'Total Applications',
      value: '1',
      description: 'Applications this month',
      trend: { value: 1, isPositive: true },
      icon: Users
    },
    {
      id: 'open-positions',
      title: 'Open Positions',
      value: jobCounts?.active_jobs || 0,
      description: 'Active job posts',
      trend: { value: 1, isPositive: true },
      icon: Briefcase
    },
    {
      id: 'time-to-hire',
      title: 'Time to Hire',
      value: '0',
      description: 'Average days to hire',
      trend: { value: 0, isPositive: false },
      icon: LineChart
    }
  ];

  // Dynamic navigation with job counts
  const getNavigationWithCounts = () => {
    return NAVIGATION.map(category => ({
      ...category,
      items: category.items.map(item => ({
        ...item,
        badge: item.id === 'jobs' ? jobCounts?.active_jobs || 0 : item.badge
      }))
    }));
  };

  // Filter navigation items based on user role
  const filteredNavigation = getNavigationWithCounts().map(category => ({
    ...category,
    items: category.items.filter(item => !item.adminOnly || session.user.isAdmin)
  }));

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 text-[#0041E9] animate-spin" />
          <span className="text-lg font-medium text-slate-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Render functions for UI elements
  const renderNavItem = (item: NavItem) => {
    const IconComponent = item.icon;
    
    return (
      <button 
        key={item.id}
        onClick={() => setActiveSection(item.id)}
        className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium 
          ${activeSection === item.id 
            ? 'bg-[#0041E9] text-white' 
            : 'text-slate-600 hover:bg-slate-100'}`}
      >
        <IconComponent className={`w-5 h-5 ${
          activeSection === item.id ? 'text-white' : 'text-slate-600'
        }`} />
        
        {!isCollapsed && (
          <>
            <span className="ml-3">{item.label}</span>
            {item.badge !== undefined && (
              <span className={`ml-auto px-2 py-0.5 text-xs rounded-lg ${
                activeSection === item.id
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-[#0041E9] bg-opacity-10 text-[#0041E9]'
              }`}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  const renderMetricCard = (card: MetricCard) => {
    const IconComponent = card.icon;
    
    return (
      <Card key={card.id} className="border-slate-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">
              {card.title}
            </CardTitle>
            {IconComponent && <IconComponent className="w-4 h-4 text-slate-400" />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">{card.value}</div>
              <CardDescription className="text-xs mt-1">
                {card.description}
              </CardDescription>
            </div>
            {card.trend && (
              <div className={`flex items-center space-x-1 text-sm ${
                card.trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.trend.isPositive ? 
                  <ArrowUpRight className="w-4 h-4" /> : 
                  <ArrowDownRight className="w-4 h-4" />
                }
                <span>{card.trend.value}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderActivityItem = (activity: ActivityItem) => {
    const IconComponent = activity.icon;
    
    return (
      <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b border-slate-200 last:border-0">
        <div className={`rounded-lg p-2 ${activity.iconBackground}`}>
          <IconComponent className={`w-4 h-4 ${activity.iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium text-slate-900">{activity.title}</h4>
              <p className="text-sm text-slate-500">{activity.description}</p>
            </div>
            <span className="text-xs text-slate-400">{activity.timestamp}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${
          isCollapsed ? 'w-16' : 'w-56'
        } bg-white border-r border-slate-200 flex flex-col transition-all duration-300`}>
          <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && <h1 className="text-xl font-bold text-slate-800">Recruit</h1>}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-6">
            {filteredNavigation.map(category => (
              <div key={category.title}>
                {!isCollapsed && (
                  <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {category.title}
                  </div>
                )}
                <div className="space-y-1">
                  {category.items.map(item => renderNavItem(item))}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-slate-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-slate-100 ${
                  isCollapsed ? 'justify-center' : 'justify-start'
                }`}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#0041E9] text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {session.user.role}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {session.user.isAdmin && (
                  <DropdownMenuItem>Admin Settings</DropdownMenuItem>
                )}
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>Account Settings</DropdownMenuItem>
                <Separator className="my-2" />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-slate-200">
            <div className="flex items-center h-16 px-6">
              <h2 className="text-lg font-semibold text-slate-800 min-w-[200px]">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </h2>

              <div className="flex items-center justify-end flex-1 space-x-4">
                {/* Search */}
                <div className="relative w-[300px]">
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border-slate-200 rounded-full 
                             focus:ring-2 focus:ring-[#0041E9] focus:border-[#0041E9]
                             bg-slate-50 hover:bg-white transition-colors"
                  />
                  <Search 
                    className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" 
                  />
                </div>

                {/* Notifications */}
                <button 
                  className="p-2.5 rounded-full hover:bg-slate-50 text-slate-600 relative
                           transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-slate-200 rounded-full px-5 py-2.5"
                    >
                      Actions
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48 mt-2 rounded-xl overflow-hidden"
                  >
                    <DropdownMenuItem 
                      className="focus:bg-slate-100 cursor-pointer"
                      onClick={() => setShowJobModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Job Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto bg-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Breadcrumb */}
              <nav 
                aria-label="Breadcrumb" 
                className="mb-6 flex items-center text-sm text-slate-600"
              >
                <button 
                  onClick={() => setActiveSection('overview')}
                  className="hover:text-[#0041E9] transition-colors"
                >
                  Dashboard
                </button>
                <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
                <span className="text-slate-900" aria-current="page">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </span>
              </nav>

              {/* Dynamic Section Content */}
              <div className="space-y-6">
                {activeSection === 'overview' && (
                  <>
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {getMetricCards().map(renderMetricCard)}
                    </div>

                    {/* Recent Activity Card */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Recent Activity</CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[#0041E9]"
                          >
                            View All
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {RECENT_ACTIVITIES.map(renderActivityItem)}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Jobs Section */}
                {activeSection === 'jobs' && <JobsContent />}

                {/* Settings Section */}
                {activeSection === 'settings' && session.user.isAdmin && <HRSettingsPage />}

                {/* Other Sections */}
                {!['overview', 'jobs', 'settings'].includes(activeSection) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                      </CardTitle>
                      <CardDescription>
                        This section will be implemented in the next phase
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="py-4 text-center text-slate-600">
                        <div className="mb-4">
                          <FileText className="w-12 h-12 mx-auto text-slate-400" />
                        </div>
                        <p className="text-lg font-medium">
                          Content for {activeSection} is coming soon
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          This section is being developed and will be available in future updates.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Posting Modal */}
      <JobPostingModal 
        open={showJobModal} 
        onClose={() => setShowJobModal(false)} 
        session={session}
      />
    </div>
  );
};

export default RecruitDashboard;