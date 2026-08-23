import React, { Suspense, lazy } from 'react';

import '../landingpage/landing.css';

// ── Above the fold: shipped in the initial bundle ───────────────────────────
import Header from '../landingpage/Header';
import HeroSection from '../landingpage/HeroSection';

// ── Below the fold: split into separate chunks ──────────────────────────────
// Everything past the hero moves out of the entry bundle. The browser still
// requests these chunks straight away (in parallel, alongside the main one),
// but the hero can parse, execute and paint without waiting on them — which
// is what matters for first paint on a slow mobile connection.
const StatsStrip = lazy(() => import('../landingpage/StatsStrip'));
const FeaturesSection = lazy(() => import('../landingpage/FeaturesSection'));
const HowItWorksSection = lazy(() => import('../landingpage/HowItWorksSection'));
const TechStackSection = lazy(() => import('../landingpage/TechStackSection'));
const ModulesSection = lazy(() => import('../landingpage/ModulesSection'));
const SecuritySection = lazy(() => import('../landingpage/SecuritySection'));
const FAQSection = lazy(() => import('../landingpage/FAQSection'));
const CTASection = lazy(() => import('../landingpage/CTASection'));
const Footer = lazy(() => import('../landingpage/Footer'));

/**
 * Reserves vertical space while a lazy section is still loading, so the page
 * does not shift as chunks arrive (CLS stays at zero).
 */
const SectionFallback = ({ minHeight = 420 }) => (
    <div style={{ minHeight }} aria-hidden="true" />
);

const Home = () => (
    <div className="landing-root">
        <Header />

        <main>
            {/* 1. Hero — headline, tech pills, CTAs, product mockup */}
            <HeroSection />

            {/* Below-the-fold sections stream in as their chunks resolve. */}
            <Suspense fallback={<SectionFallback minHeight={120} />}>
                {/* 2. Stats — latency, receipts, history, upload limit */}
                <StatsStrip />
            </Suspense>

            <Suspense fallback={<SectionFallback minHeight={700} />}>
                {/* 3. Features — nine capability tiles */}
                <FeaturesSection />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
                {/* 4. How It Works — auth, connect, emit, receive */}
                <HowItWorksSection />
            </Suspense>

            <Suspense fallback={<SectionFallback minHeight={620} />}>
                {/* 5. Tech Stack — layers plus the frontend/backend diagram */}
                <TechStackSection />
            </Suspense>

            <Suspense fallback={<SectionFallback minHeight={700} />}>
                {/* 6. Modules — the twelve engineering modules */}
                <ModulesSection />
            </Suspense>

            <Suspense fallback={<SectionFallback minHeight={520} />}>
                {/* 7. Security — what actually guards the data */}
                <SecuritySection />
            </Suspense>

            <Suspense fallback={<SectionFallback minHeight={560} />}>
                {/* 8. FAQ — native <details>, no JS of its own */}
                <FAQSection />
            </Suspense>

            <Suspense fallback={<SectionFallback minHeight={380} />}>
                {/* 9. CTA — sign-up and source links */}
                <CTASection />
            </Suspense>
        </main>

        <Suspense fallback={<SectionFallback minHeight={360} />}>
            <Footer />
        </Suspense>
    </div>
);

export default Home;
