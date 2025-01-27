'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Briefcase, 
  GraduationCap, 
  Users, 
  ArrowRight, 
  Building2, 
  Boxes, 
  LineChart 
} from 'lucide-react';

// Types
interface StatisticProps {
  icon: React.ElementType;
  value: string;
  label: string;
  delay: number;
}

interface OpportunityCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const StatisticCard = ({ icon: Icon, value, label, delay }: StatisticProps) => (
  <div 
    className="animate-in fade-in slide-in-from-bottom-6 duration-500 fill-mode-forwards"
    style={{ animationDelay: `${delay}ms` }}
  >
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
      <CardContent className="p-8">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-[#0041E9] opacity-5 rounded-full 
                      group-hover:scale-110 transition-transform duration-300" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[#0041E9] bg-opacity-10 rounded-xl">
              <Icon className="w-6 h-6 text-[#0041E9]" />
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

const OpportunityCard = ({ icon: Icon, title, description }: OpportunityCardProps) => (
  <Card className="bg-white shadow-sm hover:shadow-lg transition-all duration-300">
    <CardContent className="p-6">
      <div className="mb-6 p-3 bg-[#0041E9] bg-opacity-10 rounded-xl w-fit">
        <Icon className="w-6 h-6 text-[#0041E9]" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </CardContent>
  </Card>
);

const Header = () => (
  <header className="bg-white border-b border-slate-200">
    <div className="max-w-7xl mx-auto px-6">
      <nav className="flex items-center justify-between h-16">
        <Link href="/" className="flex items-center text-xl font-bold">
          <span>LUA</span>
          <span className="text-green-600">NAR</span>
          <span className="ml-2 text-slate-900">Recruit</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            href="/careers" 
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Careers
          </Link>
          <Button asChild className="bg-[#0041E9] text-white hover:bg-[#0036c4]">
            <Link href="/careers/auth/signin">Sign in</Link>
          </Button>
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
      delay: 0
    },
    {
      icon: Building2,
      value: "4",
      label: "Faculties",
      delay: 100
    },
    {
      icon: LineChart,
      value: "50+",
      label: "Active Projects",
      delay: 200
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <StatisticCard
          key={index}
          icon={stat.icon}
          value={stat.value}
          label={stat.label}
          delay={stat.delay}
        />
      ))}
    </div>
  );
};

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
        <div className="max-w-7xl mx-auto px-6 mt-16">
          <AnimatedStats />
        </div>

        {/* Opportunities Section */}
        <div className="max-w-7xl mx-auto px-6 pt-40 pb-32">
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
                icon={opportunity.icon}
                title={opportunity.title}
                description={opportunity.description}
              />
            ))}
          </div>
        </div>

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