import React from 'react';

export const Footer = () => {
  return (
    <footer className="mt-12 border-t border-slate-200/80 dark:border-slate-800/80 py-6 px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">© 2026 BizMind AI</span>
          <span>•</span>
          <span className="text-slate-400">All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6 font-medium">
          <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy: BizMind AI ensures end-to-end data security and compliance.'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Privacy Policy
          </a>
          <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service: Authorized enterprise workspace portal.'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Terms of Service
          </a>
          <a href="#docs" onClick={(e) => { e.preventDefault(); alert('Documentation: Visit docs.bizmind.ai for REST and Gemini SDK guides.'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            API Documentation
          </a>
          <a href="#support" onClick={(e) => { e.preventDefault(); alert('Support: Contact support@bizmind.ai for 24/7 dedicated assistance.'); }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
