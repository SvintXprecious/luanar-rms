'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Briefcase, 
  GraduationCap, 
  Users, 
  ArrowRight, 
  Building2, 
  Boxes, 
  LineChart,
  Globe,
  Award
} from 'lucide-react';

// Type definitions for our components
interface StatisticProps {
  icon: React.ElementType;
  value: string;
  label: string;
  delay: number;
  color?: string;
}

interface OpportunityCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

// Reusable card component for statistics with animation
const StatisticCard = ({ icon: Icon, value, label, delay, color = "#0041E9" }: StatisticProps) => (
  <div 
    className="animate-in fade-in slide-in-from-bottom-6 duration-500 fill-mode-forwards"
    style={{ animationDelay: `${delay}ms` }}
  >
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-8">
        <div 
          className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 opacity-5 rounded-full 
                     group-hover:scale-110 transition-transform duration-300"
          style={{ backgroundColor: color }} 
        />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-6 h-6" style={{ color: color }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold tracking-tight text-slate-900">
              {value}
            </div>
            <div className="text-base font-medium text-slate-600">
              {label}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Card component for displaying career opportunities
const OpportunityCard = ({ icon: Icon, title, description }: OpportunityCardProps) => (
  <Card className="bg-white shadow-sm hover:shadow-lg transition-all duration-300 group">
    <CardContent className="p-6">
      <div className="mb-6 p-3 bg-[#0041E9] bg-opacity-10 rounded-xl w-fit 
                    group-hover:bg-opacity-20 transition-all duration-300">
        <Icon className="w-6 h-6 text-[#0041E9]" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </CardContent>
  </Card>
);

// Header component with simplified sign-in options
const Header = () => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6">
      <nav className="flex items-center justify-between h-16">
        <Link href="/" className="flex items-center text-xl font-bold">
          <span>LUA</span>
          <span className="text-green-600">NAR</span>
          <span className="ml-2 text-slate-900">Careers</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            href="https://luanar.ac.mw/luanar/about_luanar.php" 
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            About Us
          </Link>
          <Link 
            href="/" 
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Careers
          </Link>
          <Popover>
            <PopoverTrigger asChild>
              <Button className="bg-[#0041E9] text-white hover:bg-[#0036c4]">
                Sign in
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4">
              <div className="space-y-4">
                <div className="text-sm font-medium text-slate-900 mb-2">Sign in as:</div>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full justify-start text-left mb-2"
                >
                  <Link href="/recruit/signin">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Recruiter
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full justify-start text-left"
                >
                  <Link href="/applicant/signin">
                    <Users className="w-4 h-4 mr-2" />
                    Job Applicant
                  </Link>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>
    </div>
  </header>
);

// Animated statistics section with key metrics
const AnimatedStats = () => {
  const stats = [
    {
      icon: Users,
      value: "300+",
      label: "Professional Staff",
      delay: 0,
      color: "#0041E9"
    },
    {
      icon: Building2,
      value: "4",
      label: "Faculties",
      delay: 100,
      color: "#16a34a"
    },
    {
      icon: LineChart,
      value: "50+",
      label: "Active Projects",
      delay: 200,
      color: "#0041E9"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <StatisticCard
          key={index}
          {...stat}
        />
      ))}
    </div>
  );
};

// Benefits section highlighting key advantages
const BenefitsSection = () => {
  const benefits = [
    {
      icon: Globe,
      title: "Global Impact",
      description: "Contribute to agricultural and natural resource development across Malawi and beyond"
    },
    {
      icon: Award,
      title: "Professional Growth",
      description: "Access to continuous learning and development opportunities"
    },
    {
      icon: Users,
      title: "Collaborative Environment",
      description: "Work with diverse teams of experts and researchers"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 bg-slate-50">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Why Join LUANAR?
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Be part of an institution that values excellence, innovation, and impact
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <OpportunityCard
            key={index}
            icon={benefit.icon}
            title={benefit.title}
            description={benefit.description}
          />
        ))}
      </div>
    </div>
  );
};

// Main career landing page component
export default function CareerLandingPage() {
  const opportunities = [
    {
      icon: GraduationCap,
      title: "Academic Positions",
      description: "Join our faculty in agriculture, natural resources, development studies, and more."
    },
    {
      icon: Briefcase,
      title: "Professional Services",
      description: "Opportunities in IT, finance, human resources, and administration."
    },
    {
      icon: Boxes,
      title: "Research & Support",
      description: "Research positions and technical support roles across departments."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-block mb-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600">
                  <Briefcase className="w-4 h-4" />
                  <span>We're hiring!</span>
                </div>
              </div>
              <h1 className="text-5xl font-bold text-slate-900 mb-6">
                Join LUA<span className="text-green-600">NAR</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8">
                Be part of Malawi's leading institution for agriculture, natural resources, and development studies. 
                Shape the future of education and research excellence.
              </p>
              <Button 
                asChild 
                size="lg"
                className="bg-[#0041E9] hover:bg-[#0036c4] text-white"
              >
                <Link href="/careers/jobs" className="text-base px-8">
                  Explore Opportunities
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="max-w-7xl mx-auto px-6 -mt-12">
          <AnimatedStats />
        </div>

        {/* Opportunities Section */}
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Opportunities at LUANAR
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Join our diverse team of professionals across academic and administrative roles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {opportunities.map((opportunity, index) => (
              <OpportunityCard
                key={index}
                {...opportunity}
              />
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <BenefitsSection />

        {/* CTA Section */}
        <div className="bg-[#0041E9] text-white">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
                <p className="text-blue-100 max-w-xl">
                  Discover your next career opportunity at LUANAR and be part of shaping 
                  the future of education and research in Malawi.
                </p>
              </div>
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-[#0041E9] hover:bg-blue-50"
              >
                <Link href="/careers/jobs" className="text-base px-8">
                  View All Positions
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}