"use client"

import { useState } from 'react';
import AnalyticsEvents from '../components/AnalyticsEvents';

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        const form = event.currentTarget;
        const email = form.querySelector('input[name="email"]') as HTMLInputElement;
        const fullName = form.querySelector('input[name="name"]') as HTMLInputElement;
        const message = form.querySelector('textarea[name="message"]') as HTMLTextAreaElement;

        const formData = new FormData();
        formData.append('entry.984568658', email.value);
        formData.append('entry.1994126310', fullName.value);
        formData.append('entry.401660184', message.value);

        try {
            await fetch('https://docs.google.com/forms/d/e/1FAIpQLSckbwI86tPYpDiJ8Pqlky_a7WK3BXcnbjxBy8DSWle-hWcnZA/formResponse?usp=pp_url', {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            });

            form.reset();
            setSubmitStatus('success');
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="container mx-auto px-4 py-12 max-w-5xl">
            <AnalyticsEvents eventName="contact_view" />
            <div className="grid md:grid-cols-2 gap-12 items-center">

                {/* Contact Form */}
                <div className="cyber-card p-8 border-t-4 border-t-cyber-neon-cyan">
                    <h2 className="text-3xl font-display font-bold mb-6 text-cyber-white">
                        TRANSMIT MESSAGE
                    </h2>
                    <form id="myForm" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-xs font-mono text-cyber-neon-cyan mb-2 uppercase tracking-wide">
                                User Identity
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                className="w-full px-4 py-3 bg-cyber-black text-cyber-white border border-cyber-gray focus:border-cyber-neon-cyan focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] focus:outline-none transition-all font-mono"
                                placeholder="ENTER_NAME"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-xs font-mono text-cyber-neon-cyan mb-2 uppercase tracking-wide">
                                Digital Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                className="w-full px-4 py-3 bg-cyber-black text-cyber-white border border-cyber-gray focus:border-cyber-neon-cyan focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] focus:outline-none transition-all font-mono"
                                placeholder="ENTER_EMAIL"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-xs font-mono text-cyber-neon-cyan mb-2 uppercase tracking-wide">
                                Payload
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                rows={5}
                                className="w-full px-4 py-3 bg-cyber-black text-cyber-white border border-cyber-gray focus:border-cyber-neon-cyan focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] focus:outline-none transition-all font-mono"
                                placeholder="ENTER_MESSAGE..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-6 py-4 bg-cyber-neon-cyan text-cyber-black font-display font-bold tracking-widest uppercase hover:bg-cyber-white hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed clip-path-polygon"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 95% 100%, 0 100%)' }}
                        >
                            {isSubmitting ? 'TRANSMITTING...' : 'INITIATE TRANSMISSION'}
                        </button>

                        {submitStatus === 'success' && (
                            <div className="p-4 bg-green-900/20 border border-green-500 text-green-400 font-mono text-sm text-center">
                                &gt; TRANSMISSION SUCCESSFUL
                            </div>
                        )}
                        {submitStatus === 'error' && (
                            <div className="p-4 bg-red-900/20 border border-red-500 text-red-400 font-mono text-sm text-center">
                                &gt; ERROR: TRANSMISSION FAILED
                            </div>
                        )}
                    </form>
                </div>

                {/* Contact Info Side */}
                <div className="space-y-12">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-display font-bold text-cyber-white mb-6 leading-tight glitch" data-text="CONTACT UPLINK">
                            CONTACT<br />UPLINK
                        </h1>
                        <p className="text-xl text-gray-400 font-light max-w-md">
                            Channels are open. Awaiting signal. Whether it&apos;s a project inquiry or a tech discussion, I&apos;m listening.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 flex items-center justify-center bg-cyber-dark-gray border border-cyber-gray text-cyber-neon-pink rounded-full">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-cyber-white font-bold uppercase tracking-wide text-sm">Location</h3>
                                <p className="text-gray-400 font-mono">Jordan_Sector</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 flex items-center justify-center bg-cyber-dark-gray border border-cyber-gray text-cyber-neon-yellow rounded-full">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-cyber-white font-bold uppercase tracking-wide text-sm">Email Status</h3>
                                <p className="text-gray-400 font-mono text-green-400">Online_Ready</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
