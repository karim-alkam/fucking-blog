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
        formData.append('entry.213796773', email.value);      // Email
        formData.append('entry.356773386', fullName.value);   // Name
        formData.append('entry.464557231', message.value);    // Message

        try {
            await fetch('https://docs.google.com/forms/d/e/1FAIpQLSdkaIywoRD7UvDwWXnErCnkfbZNJS3X1PGVLmPjOCVD1xq6UA/formResponse?usp=pp_url', {
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
        <main className="container mx-auto px-4 py-16 max-w-5xl">
            <AnalyticsEvents eventName="contact_view" />
            <div className="grid md:grid-cols-2 gap-16 items-start">

                {/* Contact Info Side */}
                <div className="space-y-12 md:sticky md:top-32">
                    <div className="relative">
                        <div className="absolute -left-6 top-6 w-12 h-[1px] bg-brass/40 hidden md:block"></div>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-starlight mb-6 leading-tight">
                            Establish <br />
                            <span className="italic text-brass font-light">Connection</span>
                        </h1>
                        <p className="text-lg text-aged-parchment/80 font-light max-w-md leading-relaxed">
                            The communication channels are open. Please submit your inquiries, project proposals, or technical correspondence below.
                        </p>
                    </div>

                    <div className="space-y-8 pt-8 border-t border-brass/10">
                        <div className="flex items-center space-x-6">
                            <div className="w-12 h-12 flex items-center justify-center bg-void-black border border-brass/20 text-brass rounded-full shadow-inner">
                                <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-brass font-sans uppercase tracking-[0.2em] text-[10px] mb-1">Signal Origin</h3>
                                <p className="text-starlight/80 font-sans font-light">Amman, Jordan</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="w-12 h-12 flex items-center justify-center bg-void-black border border-celestial-blue/30 text-celestial-blue rounded-full shadow-inner">
                                <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-celestial-blue font-sans uppercase tracking-[0.2em] text-[10px] mb-1">Receiver Status</h3>
                                <p className="text-starlight/80 font-sans font-light">Listening / Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="glass-panel p-10 md:p-12 border-t border-t-brass/30 bg-void-black/70 mt-8 md:mt-0 shadow-2xl">
                    <h2 className="text-3xl font-serif font-bold mb-8 text-starlight italic text-center border-b border-brass/10 pb-6">
                        Transmission Form
                    </h2>
                    <form id="myForm" onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label htmlFor="name" className="block text-xs font-sans text-brass/80 mb-3 uppercase tracking-widest font-light">
                                Designation
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                className="w-full px-5 py-3.5 bg-deep-space/50 text-starlight border border-brass/20 rounded-sm focus:border-brass/80 focus:shadow-[0_0_15px_rgba(197,168,105,0.15)] focus:outline-none transition-all font-sans font-light placeholder-starlight/20"
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-xs font-sans text-brass/80 mb-3 uppercase tracking-widest font-light">
                                Return Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                className="w-full px-5 py-3.5 bg-deep-space/50 text-starlight border border-brass/20 rounded-sm focus:border-brass/80 focus:shadow-[0_0_15px_rgba(197,168,105,0.15)] focus:outline-none transition-all font-sans font-light placeholder-starlight/20"
                                placeholder="Email Address"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-xs font-sans text-brass/80 mb-3 uppercase tracking-widest font-light">
                                Payload
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                rows={6}
                                className="w-full px-5 py-3.5 bg-deep-space/50 text-starlight border border-brass/20 rounded-sm focus:border-brass/80 focus:shadow-[0_0_15px_rgba(197,168,105,0.15)] focus:outline-none transition-all font-sans font-light placeholder-starlight/20 resize-y"
                                placeholder="Message content..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-8 py-4 bg-brass/90 text-void-black font-sans font-medium tracking-[0.2em] uppercase hover:bg-starlight hover:shadow-[0_0_25px_rgba(197,168,105,0.3)] transition-all duration-500 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {isSubmitting ? 'Transmitting...' : 'Dispatch Message'}
                        </button>

                        {submitStatus === 'success' && (
                            <div className="p-4 bg-brass/10 border border-brass/30 text-starlight/90 font-serif italic text-center rounded-sm">
                                Your transmission has been successfully delivered.
                            </div>
                        )}
                        {submitStatus === 'error' && (
                            <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200/90 font-serif italic text-center rounded-sm">
                                We encountered an anomaly. The transmission failed.
                            </div>
                        )}
                    </form>
                </div>

            </div>
        </main>
    );
}
