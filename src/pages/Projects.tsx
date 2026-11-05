import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useProjectsStore } from '../hooks/useProjectsStore';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectSkeleton } from '../components/ProjectSkeleton';
import { Reveal } from '../components/motion/Reveal';
import { StaggerChildren } from '../components/motion/StaggerChildren';
import { springBouncy } from '../lib/motion';
import { SDG_GOALS } from '../lib/sdg-data';
import { Search, SlidersHorizontal, ArrowDownAZ, HelpCircle, X, Shield, Goal } from 'lucide-react';
import { PillButton } from '../components/PillButton';

interface ProjectsProps {
  onNavigate: (view: string, id?: string) => void;
  initialSdg?: number | null;
}

export function Projects({ onNavigate, initialSdg = null }: ProjectsProps) {
  const { projects, loading: storeLoading } = useProjectsStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSdg, setSelectedSdg] = useState<number | null>(initialSdg);
  const [compensationFilter, setCompensationFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'funding_raised' | 'funding_target'>('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialSdg != null && initialSdg >= 1 && initialSdg <= 17) {
      setSelectedSdg(initialSdg);
    } else {
      setSelectedSdg(null);
    }
  }, [initialSdg]);

  // Trigger brief shimmer loading state when filters change for realistic perceived performance
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 650);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedSdg, compensationFilter, sortOption]);

  // Interactive filtered project list
  const filteredProjects = projects
    .filter((p) => {
      // Must be active (or completed) to see in public feed, but let's show all except pending (to match handover spec)
      const isPublic = p.status === 'active' || p.status === 'completed';
      if (!isPublic) return false;

      // 1. Search Query
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        p.title.toLowerCase().includes(query) ||
        p.summary.toLowerCase().includes(query) ||
        p.ownerName.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query);

      // 2. SDG Goal Filter
      const matchesSdg = selectedSdg === null || p.sdgs.includes(selectedSdg);

      // 3. Volunteer Compensation
      const matchesComp = 
        compensationFilter === 'all' || 
        p.volunteerCompensation === compensationFilter;

      return matchesSearch && matchesSdg && matchesComp;
    })
    .sort((a, b) => {
      // 4. Sort routines
      if (sortOption === 'funding_raised') {
        return b.fundingRaised - a.fundingRaised;
      }
      if (sortOption === 'funding_target') {
        return b.fundingTarget - a.fundingTarget;
      }
      // default newest:
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="page-container py-10 space-y-6">
      
      <Reveal direction="up" className="space-y-2.5 select-none border-b border-slate-200/50 pb-6">
        <h1 className="text-3xl sm:text-4xl xl:text-5xl font-serif font-normal text-slate-900 tracking-tight">Campaigns</h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed">
          Donate to a project or offer to volunteer. Filter by UN goal to find causes you care about.
        </p>
      </Reveal>

      <Reveal direction="down" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4 select-none">
        
        {/* Row 1: Search + Hard Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Search box */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by title, creator, sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 outline-none rounded-xl border border-slate-200 focus:border-slate-400 transition-colors text-xs font-mono"
            />
          </div>

          {/* Volunteer compensation Filter */}
          <div>
            <select
              value={compensationFilter}
              onChange={(e) => setCompensationFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 outline-none rounded-xl border border-slate-200 focus:border-slate-400 transition-colors text-xs font-mono bg-white"
            >
              <option value="all">All volunteer roles</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Sort selection */}
          <div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="w-full px-3 py-2.5 outline-none rounded-xl border border-slate-200 focus:border-slate-400 transition-colors text-xs font-mono bg-white"
            >
              <option value="newest">Newest first</option>
              <option value="funding_raised">Most raised</option>
              <option value="funding_target">Biggest goal</option>
            </select>
          </div>

        </div>

        {/* Row 2: SDG Badges Horizontal Row Filter */}
        <div className="space-y-1 pb-1">
          <div className="flex justify-between items-baseline text-[10px] uppercase font-mono text-slate-400 font-semibold">
            <span>Filter by UN Sustainable Goal:</span>
            {selectedSdg !== null && (
              <PillButton
                variant="outline"
                caps={false}
                onClick={() => setSelectedSdg(null)}
                textColor="#059669"
                pillColor="#B24724"
                className="py-1 px-3 text-[11px] font-bold"
              >
                Clear SDG filter <X className="h-3 w-3" />
              </PillButton>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none pt-1">
            {SDG_GOALS.map((goal) => {
              const count = projects.filter(p => (p.status === 'active' || p.status === 'completed') && p.sdgs.includes(goal.number)).length;
              if (count === 0) return null; // Only show active goals

              const isSelected = selectedSdg === goal.number;

              return (
                <button
                  key={goal.number}
                  onClick={() => setSelectedSdg(isSelected ? null : goal.number)}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 shrink-0 transition-all ${
                    isSelected
                      ? 'text-white border-transparent shadow-xs font-semibold'
                      : 'bg-slate-50 border-slate-200/60 text-slate-700 hover:border-slate-300'
                  }`}
                  style={isSelected ? { backgroundColor: goal.color } : {}}
                >
                  <span className={`h-4 w-4 rounded-full flex items-center justify-center font-bold text-[9px] ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-800'}`}>
                    {goal.number}
                  </span>
                  <span>{goal.name}</span>
                </button>
              );
            })}
          </div>
        </div>

      </Reveal>

      {/* CAMPAIGN LISTINGS CONTAINER */}
      <div className="space-y-6">
        <div className="flex justify-between items-baseline border-b border-slate-100 pb-2 select-none">
          <p className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
            {filteredProjects.length} matching campaign{filteredProjects.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {storeLoading || loading ? (
          <ProjectSkeleton count={6} />
        ) : (
          <>
            <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6" stagger={0.08}>
              {filteredProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onClick={() => onNavigate('project_detail', p.id)}
                />
              ))}
            </StaggerChildren>

            {filteredProjects.length === 0 && (
              <div className="text-center py-24 bg-white border border-slate-100 rounded-2xl p-8 space-y-3 max-w-md mx-auto shadow-2xs select-none">
                <div className="h-10 w-10 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto text-sm">
                  <Goal className="h-5 w-5" />
                </div>
                <h3 className="font-serif font-semibold text-slate-800 text-base">No campaigns yet</h3>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  Nothing matches right now. Try a different search or clear the filters.
                </p>
                <PillButton
                  variant="primary"
                  caps={false}
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSdg(null);
                    setCompensationFilter('all');
                  }}
                  className="mt-3 py-1.5 px-4 text-xs font-mono shadow-2xs"
                >
                  Reset Directories
                </PillButton>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
