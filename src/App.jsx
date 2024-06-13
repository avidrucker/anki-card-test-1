import { useState, useEffect } from 'react';
import './App.css'

const STYLE_SHEET_2 = 1;  // Index of the second style sheet in the document

const BTN_STYLE = "f6 link dim br3 ph3 pv2 mb1 mr1 dib";
const ACTIVE_BTN_STYLE = "fw6";
const INACTIVE_BTN_STYLE = "light-gray";
const CARD_STYLE = "bg-white br3 ba b--black-10";

function App() {
  const [frontHtml, setFrontHtml] = useState('');
  const [backHtml, setBackHtml] = useState('');
  const [cardCss, setCardCss] = useState('');
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'frontHtml');
  const [viewSide, setViewSide] = useState(localStorage.getItem('viewSide') || 'front');
  const [copied, setCopied] = useState(false);

  const getCurrentTextareaContent = () => {
    if (activeTab === 'frontHtml') {
      return frontHtml;
    } else if (activeTab === 'backHtml') {
      return backHtml;
    } else {
      return cardCss;
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getCurrentTextareaContent())
      .then(() => {
        // alert('Text copied to clipboard'); // Optionally, handle UI feedback here
        setCopied(true);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Load initial state from localStorage on component mount
  useEffect(() => {
    const savedFrontHtml = localStorage.getItem('frontHtml');
    const savedBackHtml = localStorage.getItem('backHtml');
    const savedCardCss = localStorage.getItem('cardCss');

    if (savedFrontHtml) setFrontHtml(savedFrontHtml);
    if (savedBackHtml) setBackHtml(savedBackHtml);
    if (savedCardCss) {
      setCardCss(savedCardCss);
      applyStyles(savedCardCss);
    }
  }, []);

  // Effect to save changes when frontHtml, backHtml, cardCss, activeTab, or viewSide changes
  useEffect(() => {
    saveToLocalStorage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontHtml, backHtml, cardCss, activeTab, viewSide]);  // Including all dependencies for saving

  const applyStyles = (css) => {
    const styleSheet = document.styleSheets[STYLE_SHEET_2];
    try {
      styleSheet.deleteRule(0);
    } catch (error) {
      console.log("No rule to delete.");
    }
    try {
      styleSheet.insertRule(`.card { ${css} }`, 0);
    } catch (error) {
      console.error("Failed to insert rule:", error);
    }
  };

  const handleCssChange = (event) => {
    const newCss = event.target.value;
    setCardCss(newCss);
    applyStyles(newCss);
  };

  const handleChange = (event) => {
    const value = event.target.value;
    if (activeTab === 'frontHtml') {
      setFrontHtml(value);
    } else if (activeTab === 'backHtml') {
      setBackHtml(value);
    } else {
      handleCssChange(event);
    }
    setCopied(false);
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setCopied(false);
  };

  const handleViewChange = (newView) => {
    setViewSide(newView);
  };

  const saveToLocalStorage = () => {
    // console.log('Saving to localStorage:', { frontHtml, backHtml, cardCss, activeTab, viewSide });
    localStorage.setItem('frontHtml', frontHtml);
    localStorage.setItem('backHtml', backHtml);
    localStorage.setItem('cardCss', cardCss);
    localStorage.setItem('activeTab', activeTab);
    localStorage.setItem('viewSide', viewSide);
  };

  return (
    <div className="App w-100 flex flex-column vh-100 pb2">
      <h1 className="ma0 pv2 ph2">Card Designer</h1>
      <div className="workspace flex flex-auto ph2">
        <div className="editor w-50 flex flex-column pr1">
          <div className="tabs">
            <button onClick={() => handleTabChange('frontHtml')} 
              className={activeTab === 'frontHtml' ? 
                ACTIVE_BTN_STYLE + " " + BTN_STYLE : 
                INACTIVE_BTN_STYLE + " " + BTN_STYLE}>Front HTML</button>
            <button onClick={() => handleTabChange('backHtml')} 
              className={activeTab === 'backHtml' ? 
                ACTIVE_BTN_STYLE + " " + BTN_STYLE : 
                INACTIVE_BTN_STYLE + " " + BTN_STYLE}>Back HTML</button>
            <button onClick={() => handleTabChange('cardCss')} 
              className={activeTab === 'cardCss' ? 
                ACTIVE_BTN_STYLE + " " + BTN_STYLE : 
                INACTIVE_BTN_STYLE + " " + BTN_STYLE}>CSS</button>
          </div>
          <div className="relative w-100 flex-auto flex flex-column">
            <button onClick={copyToClipboard}
                className={`absolute top-0 right-0 mt1 mr1 ${BTN_STYLE}`}>
                  {copied ? "Copied!" : "Copy Code"}
            </button>
            <textarea
              className="code w-100 flex-auto resize-none"
              spellCheck="false"
              value={activeTab === 'frontHtml' ? frontHtml : activeTab === 'backHtml' ? backHtml : cardCss}
              onChange={handleChange}
              placeholder={`${activeTab.replace('Html', ' HTML').replace('Css', ' CSS')} Content`}
              rows="10"
              cols="30"
            />
        </div>
        </div>
        <div className="card-display w-50 flex flex-column pl1">
          <div className="view-tabs">
            <button onClick={() => handleViewChange('front')} className={viewSide === 'front' ? `active ${ACTIVE_BTN_STYLE + " " + BTN_STYLE}` : `${INACTIVE_BTN_STYLE + " " + BTN_STYLE}`}>Front View</button>
            <button onClick={() => handleViewChange('back')} className={viewSide === 'back' ? `active ${ACTIVE_BTN_STYLE + " " + BTN_STYLE}` : `${INACTIVE_BTN_STYLE + " " + BTN_STYLE}`}>Back View</button>
          </div>
          <div className="flex-auto flex flex-column">
            <div className={`card flex-auto overflow-y-auto ${CARD_STYLE}`} dangerouslySetInnerHTML={{ __html: viewSide === 'front' ? frontHtml : backHtml }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
