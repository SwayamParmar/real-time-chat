import React, { useEffect } from 'react';

// ── Section Components ──────────────────────────────────────────────────────
import Header from '../landingpage/Header';
import HeroSection from '../landingpage/HeroSection';
import StatsStrip from '../landingpage/StatsStrip';
import FeaturesSection from '../landingpage/FeaturesSection';
import HowItWorksSection from '../landingpage/HowItWorksSection';
import TechStackSection from '../landingpage/TechStackSection';
import ModulesSection from '../landingpage/ModulesSection';
import CTASection from '../landingpage/CTASection';
import Footer from '../landingpage/Footer';
import '../landingpage/landing.css';

const Home = () => {

    // ── Global scroll-reveal observer ─────────────────────────────────────────
    // Each section component also registers its own observer on mount,
    // but this one catches any reveal elements added after initial render.
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const revealEls = document.querySelectorAll('.reveal');
        revealEls.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="landing-root">
            {/* ── Fixed Header ── */}
            <Header />

            {/* ── Page Sections ── */}
            <main>
                {/* 1. Hero — headline, subtext, tech pills, CTA buttons, chat mockup */}
                <HeroSection />

                {/* 2. Stats strip — 12 modules, <50ms latency, ∞ scroll, etc. */}
                <StatsStrip />

                {/* 3. Features — 9-card grid with icons, titles, descriptions */}
                <FeaturesSection />

                {/* 4. How It Works — 4-step flow: auth → socket → emit → receive */}
                <HowItWorksSection />

                {/* 5. Tech Stack — 5 tech cards + frontend↔backend architecture diagram */}
                <TechStackSection />

                {/* 6. Modules — all 12 engineering modules with numbered badges + tags */}
                <ModulesSection />

                {/* 7. CTA — strong call to action with demo + GitHub buttons */}
                <CTASection />
            </main>

            {/* ── Footer ── */}
            <Footer />
        </div>
    );
};

export default Home;
