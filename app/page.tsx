'use client';

import Image from 'next/image'
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

// Color palette
const colors = {
  primary: '#2eb135',       // Updated main green
  secondary: '#f59e0b',     // Amber
  tertiary: '#0369a1',      // Blue
  success: '#059669',       // Success green
  background: '#f8fafc',    // Light background
  text: {
    primary: '#0f172a',     
    secondary: '#475569'
  }
};



interface StatisticProps {
  icon: React.ElementType;
  value: string;
  label: string;
  delay: number;
  color: string;
}

interface OpportunityCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const StatisticCard = ({ icon: Icon, value, label, delay, color }: StatisticProps) => (
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
            <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold tracking-tight" style={{ color: colors.text.primary }}>
              {value}
            </div>
            <div className="text-base font-medium" style={{ color: colors.text.secondary }}>
              {label}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const OpportunityCard = ({ icon: Icon, title, description, color }: OpportunityCardProps) => (
  <Card className="bg-white shadow-sm hover:shadow-lg transition-all duration-300 group">
    <CardContent className="p-6">
      <div className="mb-6 p-3 rounded-xl w-fit transition-all duration-300"
           style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.primary }}>{title}</h3>
      <p style={{ color: colors.text.secondary }}>{description}</p>
    </CardContent>
  </Card>
);

const Header = () => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6">
      <nav className="flex items-center justify-between h-16">
        <Link href="/" className="flex items-center text-xl font-bold">
          <Image 
            src="/luanar.png" 
            alt="LUANAR Logo" 
            width={40} 
            height={40}
            className="mr-2" 
          />
          <span style={{ color: colors.text.primary }}>LUA</span>
          <span style={{ color: colors.primary }}>NAR</span>
          <span className="ml-2" style={{ color: colors.text.primary }}>Careers</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            href="https://luanar.ac.mw/luanar/about_luanar.php" 
            className="text-sm hover:text-slate-900 transition-colors"
            style={{ color: colors.text.secondary }}
          >
            About Us
          </Link>
          <Link 
            href="/" 
            className="text-sm hover:text-slate-900 transition-colors"
            style={{ color: colors.text.secondary }}
          >
            Careers
          </Link>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                className="text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: colors.primary }}
              >
                Sign in
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4">
              <div className="space-y-4">
                <div className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Sign in as:
                </div>
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

const AnimatedStats = () => {
  const stats = [
    {
      icon: Users,
      value: "300+",
      label: "Professional Staff",
      delay: 0,
      color: colors.primary
    },
    {
      icon: Building2,
      value: "7",
      label: "Faculties",
      delay: 100,
      color: colors.secondary
    },
    {
      icon: LineChart,
      value: "50+",
      label: "Active Projects",
      delay: 200,
      color: colors.tertiary
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

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Globe,
      title: "Global Impact",
      description: "Contribute to agricultural and natural resource development across Malawi and beyond",
      color: colors.primary
    },
    {
      icon: Award,
      title: "Professional Growth",
      description: "Access to continuous learning and development opportunities",
      color: colors.secondary
    },
    {
      icon: Users,
      title: "Collaborative Environment",
      description: "Work with diverse teams of experts and researchers",
      color: colors.tertiary
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-24" style={{ backgroundColor: colors.background }}>
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.text.primary }}>
          Why Join LUANAR?
        </h2>
        <p className="max-w-2xl mx-auto" style={{ color: colors.text.secondary }}>
          Be part of an institution that values excellence, innovation, and impact
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <OpportunityCard
            key={index}
            {...benefit}
          />
        ))}
      </div>
    </div>
  );
};

export default function CareerLandingPage() {
  const opportunities = [
    {
      icon: GraduationCap,
      title: "Academic Positions",
      description: "Join our faculty in agriculture, natural resources, development studies, and more.",
      color: colors.primary
    },
    {
      icon: Briefcase,
      title: "Professional Services",
      description: "Opportunities in IT, finance, human resources, and administration.",
      color: colors.secondary
    },
    {
      icon: Boxes,
      title: "Research & Support",
      description: "Research positions and technical support roles across departments.",
      color: colors.tertiary
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <Header />
      
      <main>
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-block mb-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                     style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                  <Briefcase className="w-4 h-4" />
                  <span>We're hiring!</span>
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-6">
                <span style={{ color: colors.text.primary }}>Join LUA</span>
                <span style={{ color: colors.primary }}>NAR</span>
              </h1>
              <p className="text-lg mb-8" style={{ color: colors.text.secondary }}>
                Be part of Malawi's leading institution for agriculture, natural resources, and development studies. 
                Shape the future of education and research excellence.
              </p>
              <Button 
                asChild 
                size="lg"
                className="text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: colors.primary }}
              >
                <Link href="/careers/jobs" className="text-base px-8">
                  Explore Opportunities
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-12">
          <AnimatedStats />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: colors.text.primary }}>
              Opportunities at LUANAR
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: colors.text.secondary }}>
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

        <BenefitsSection />

        <div style={{ backgroundColor: colors.primary }} className="text-white">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
                <p className="max-w-xl opacity-90">
                  Discover your next career opportunity at LUANAR and be part of shaping 
                  the future of education and research in Malawi.
                </p>
              </div>
              <Button 
                asChild 
                size="lg" 
                className="bg-white hover:bg-opacity-90 transition-opacity"
                style={{ color: colors.primary }}
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