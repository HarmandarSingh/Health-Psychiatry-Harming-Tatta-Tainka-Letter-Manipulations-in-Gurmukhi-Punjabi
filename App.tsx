import * as React from 'react';
import { Tab } from './types';
import Header from './components/Header';
import Introduction from './components/Introduction';
import ElementsExplorer from './components/ElementsExplorer';
import GurmukhiMatrix from './components/GurmukhiMatrix';
import CymaticsVisualizer from './components/CymaticsVisualizer';
import ConceptExplainer from './components/ConceptExplainer';
import AiStreamsVisualizer from './components/AiStreamsVisualizer';
import UniverseSimulator from './components/UniverseSimulator';
import BusinessModelSimulator from './components/BusinessModelSimulator';
import ResearchLibrary from './components/ResearchLibrary';
import ShareAndConnect from './components/ShareAndConnect';
import Journal from './components/Journal';
import AdsenseUnit from './components/AdsenseUnit';
import { ADSENSE_FOOTER_AD_SLOT } from './constants';
import { useLanguage } from './LanguageContext';

const LanguageSelector = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = React.useState(false);
    const wrapperRef = React.useRef(null);

    const languages = {
        en: 'English',
        pa: 'ਪੰਜਾਬੀ (Punjabi)',
        es: 'Español (Spanish)',
        fr: 'Français (French)',
        de: 'Deutsch (German)',
        hi: 'हिन्दी (Hindi)',
        zh: '简体中文 (Chinese)',
    };

    React.useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative z-10 flex-shrink-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 text-slate-300 hover:bg-slate-600/70 rounded-md transition-colors"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.83 5.5 7 5.5s.488.23 1.056.827l.11.119a.75.75 0 001.178-.97l-.11-.119a2.25 2.25 0 00-3.352-1.258 7.5 7.5 0 00-2.28 3.44c-.23.63-.36 1.3.03 2.023.23.44.52.81-.87 1.125a2.25 2.25 0 003.414-.142.75.75 0 00-1.154- .962C8.343 12.33 8.1 11.83 8.1 11.5c0-.49.12-.94.332-1.341a5.96 5.96 0 012.556-2.127.75.75 0 00-.5-1.418 7.5 7.5 0 00-4.148 2.613c-.35.49-.6.98-.75 1.456a.75.75 0 001.44.368zM14.25 12a.75.75 0 00.5-1.418 7.5 7.5 0 00-4.148-2.613c-.35-.49-.6-.98-.75-1.456a.75.75 0 00-1.44-.368 7.5 7.5 0 002.28 3.44c.23.63.36 1.3-.03 2.023-.23.44-.52.81-.87 1.125a2.25 2.25 0 00-3.414.142.75.75 0 001.154.962c.421-.5.657-1 .657-1.5 0-.49-.12-.94-.332-1.341a5.96 5.96 0 01-2.556-2.127.75.75 0 00.5-1.418 7.5 7.5 0 004.148 2.613c.35.49.6.98.75 1.456a.75.75 0 001.44-.368z" clipRule="evenodd" /></svg>
                <span>{languages[language]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 max-h-60 overflow-y-auto">
                    {Object.entries(languages).map(([key, value]) => (
                        <button
                            key={key}
                            onClick={() => handleLanguageChange(key)}
                            className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                        >
                            {value}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


const App = () => {
  const [activeTab, setActiveTab] = React.useState(Tab.Introduction);
  const { t } = useLanguage();

  const renderTabContent = React.useCallback(() => {
    switch (activeTab) {
      case Tab.Introduction:
        return <Introduction />;
      case Tab.Elements:
        return <ElementsExplorer />;
      case Tab.GurmukhiMatrix:
        return <GurmukhiMatrix />;
      case Tab.Cymatics:
        return <CymaticsVisualizer />;
      case Tab.Explainer:
        return <ConceptExplainer />;
      case Tab.AiDrive:
        return <AiStreamsVisualizer />;
      case Tab.UniverseSimulator:
        return <UniverseSimulator />;
      case Tab.BusinessModel:
        return <BusinessModelSimulator />;
      case Tab.ResearchLibrary:
        return <ResearchLibrary />;
      case Tab.Share:
        return <ShareAndConnect />;
      case Tab.Journal:
        return <Journal />;
      default:
        return <Introduction />;
    }
  }, [activeTab]);

  const NavButton = ({ tab, children }) => (
    <button
      id={`tab-${tab}`}
      role="tab"
      aria-selected={activeTab === tab}
      aria-controls={`tabpanel-${tab}`}
      onClick={() => setActiveTab(tab)}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
        activeTab === tab
          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/70'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative flex justify-center items-center mb-8">
            <Header />
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <LanguageSelector />
            </div>
        </div>

        <main>
          <div
            role="tablist"
            aria-label="Main navigation"
            className="flex flex-wrap justify-center gap-2 my-8 p-2 bg-slate-800/60 rounded-lg max-w-5xl mx-auto"
          >
            <NavButton tab={Tab.Introduction}>{t('navIntro')}</NavButton>
            <NavButton tab={Tab.Elements}>{t('navElements')}</NavButton>
            <NavButton tab={Tab.GurmukhiMatrix}>{t('navMatrix')}</NavButton>
            <NavButton tab={Tab.Cymatics}>{t('navVisualizer')}</NavButton>
            <NavButton tab={Tab.Explainer}>{t('navAiAssistant')}</NavButton>
            <NavButton tab={Tab.AiDrive}>{t('navCloudDrive')}</NavButton>
            <NavButton tab={Tab.UniverseSimulator}>{t('navCosmicAbacus')}</NavButton>
            <NavButton tab={Tab.BusinessModel}>{t('navEconomicEngine')}</NavButton>
            <NavButton tab={Tab.ResearchLibrary}>{t('navLibrary')}</NavButton>
            <NavButton tab={Tab.Share}>{t('navShareConnect')}</NavButton>
            <NavButton tab={Tab.Journal}>{t('navJournal')}</NavButton>
          </div>
          <div
            id={`tabpanel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="mt-6"
            key={activeTab}
          >
            {renderTabContent()}
          </div>
        </main>
        
        <div className="mt-12">
            <AdsenseUnit adSlot={ADSENSE_FOOTER_AD_SLOT} />
        </div>

        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Exploring the intersection of consciousness, physics, and art.</p>
          <p>Powered by Gemini and React.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;