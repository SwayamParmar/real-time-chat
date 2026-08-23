import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiGithub, FiZap } from 'react-icons/fi';
import useReveal from './useReveal';

const CTASection = () => {
    const reveal = useReveal();

    return (
        <section
            id="cta"
            className="section relative text-center overflow-hidden"
            style={{ background: 'var(--surface-base)' }}
        >
            {/* Decorative background */}
            <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
                style={{
                    background:
                        'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(99,102,241,0.12) 0%, transparent 70%)',
                }}
            />
            <div className="grid-bg grid-bg-bottom" aria-hidden="true" />

            <div ref={reveal} className="reveal relative z-[1] max-w-[680px] mx-auto">
                <div className="pill pill-brand mb-6">
                    <FiZap size={12} aria-hidden="true" />
                    Fully open-source
                </div>

                <h2
                    className="font-display font-extrabold tracking-[-0.03em] leading-[1.08] mb-4"
                    style={{ fontSize: 'clamp(30px, 5.2vw, 54px)', color: 'var(--chat-primary)', textWrap: 'balance' }}
                >
                    Start a conversation
                    <br />
                    on <span className="grad-text">TalkStream</span>.
                </h2>

                <p
                    className="text-[16px] leading-[1.7] mb-9 mx-auto max-w-[520px]"
                    style={{ color: 'var(--chat-muted)', textWrap: 'pretty' }}
                >
                    Create an account in seconds, or dig into the source to see how every module —
                    presence, receipts, uploads — is put together.
                </p>

                <div className="flex justify-center gap-3 flex-wrap">
                    <Link to="/register" className="btn btn-primary">
                        Create free account
                        <FiArrowRight size={16} aria-hidden="true" />
                    </Link>
                    <a
                        href="https://github.com/SwayamParmar/real-time-chat"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                    >
                        <FiGithub size={16} aria-hidden="true" />
                        View on GitHub
                    </a>
                </div>

                <p className="text-[13px] mt-6" style={{ color: 'var(--chat-faint)' }}>
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold no-underline" style={{ color: 'var(--brand)' }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </section>
    );
};

export default CTASection;
