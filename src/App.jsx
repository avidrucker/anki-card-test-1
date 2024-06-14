import { useState, useEffect, useRef } from 'react';
import './App.css'
import hljs from 'highlight.js';
// import 'highlight.js/styles/default.css';
import 'highlight.js/styles/monokai-sublime.css';

const STYLE_SHEET_2 = 1;  // Index of the second style sheet in the document

const BTN_STYLE = "f6 link dim br3 w35 pv2 dib pointer";
const NARROW_BTN_STYLE = "f6 link dim br3 ph2 pv2 ml1 dib pointer";
const BTN_STYLE_GLASS = "link ba b--gray bw1 br3 dib pa2 w2 h2 pointer";
const ACTIVE_BTN_STYLE = "fw6";
const INACTIVE_BTN_STYLE = "light-gray";
const CARD_STYLE = "ba b--black-10";

// <!-- Font Awesome Free 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) -->
const copyIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 448 512"><path d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z"/></svg>;
const checkIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 512 512"><path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"/></svg>

const availableDesigns = ["8 Bit Console.json", "Blackboard and Chalk.json", "Code Rain.json", "Full Photo.json", "Index Card.json", "Ink on Ricepaper.json", "Zenburn Theme.json"];

function App() {
  const [frontHtml, setFrontHtml] = useState('');
  const [backHtml, setBackHtml] = useState('');
  const [cardCss, setCardCss] = useState('');
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'frontHtml');
  const [viewSide, setViewSide] = useState(localStorage.getItem('viewSide') || 'front');
  const [copied, setCopied] = useState(false);
  const [designName, setDesignName] = useState(localStorage.getItem('designName') || 'Untitled');
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef(null); // Create a reference to the input element
  const textareaRef = useRef(null); // Create a reference to the textarea element
  const [isEditing, setIsEditing] = useState(false); 

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();  // Automatically focus the textarea when editing
    }
  }, [isEditing]); // Re-run the effect when isEditing changes
  

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
  }, [frontHtml, backHtml, cardCss, activeTab, viewSide, designName]);  // Including all dependencies for saving

  useEffect(() => {
    // Whenever editingName becomes true, focus the input
    if (editingName) {
        nameInputRef.current && nameInputRef.current.focus();
    }
  }, [editingName]); // Depend on editingName to re-run the effect

  const applyStyles = (css) => {
    const styleSheet = document.styleSheets[STYLE_SHEET_2];

    // Remove existing rules
    while (styleSheet.cssRules.length > 0) {
        styleSheet.deleteRule(0);
    }

    // Remove comments
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');

    // Extract and handle @import statements
    let importStatements = [];
    css = css.replace(/@import\s+url\([^)]+\);?/g, (match) => {
        importStatements.push(match.trim());
        return ''; // Remove the import statement from the main CSS text
    });

    // Insert @import rules at the beginning
    importStatements.forEach(importRule => {
        try {
            styleSheet.insertRule(importRule, styleSheet.cssRules.length);
        } catch (error) {
            console.error("Failed to insert import rule:", importRule, error);
        }
    });

    // Process and insert other CSS rules
    const rules = css.split('}')
        .filter(rule => rule.trim() !== '')
        .map(rule => {
            if (rule.trim().startsWith(':root') || rule.trim().startsWith('@font-face')) {
                return rule.trim();
            } else if (!rule.trim().startsWith('.card-container')) {
                return `.card-container ${rule.trim()}`;
            }
            return rule.trim();
        })
        .map(rule => rule + '}')  // Close the rule
        .filter(rule => rule.length > 2);  // Filter out empty rules

    rules.forEach(rule => {
        try {
            if (!rule.startsWith('@import')) {  // Ensure no @import rules are in this batch
                styleSheet.insertRule(rule, styleSheet.cssRules.length);
            }
        } catch (error) {
            console.error("Failed to insert rule:", rule, error);
        }
    });
  };

  const handleCssChange = (event) => {
    const newCss = event.target.value;
    setCardCss(newCss);
    applyStyles(newCss);  // Apply the raw CSS from the editor
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
    localStorage.setItem('designName', designName);
  };

  const saveDesignToJSON = () => {
    const designData = {
      frontHtml,
      backHtml,
      cardCss,
      designName
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(designData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", designName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
  
  const handleFileRead = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        try {
          const jsonData = JSON.parse(content);
          setFrontHtml(jsonData.frontHtml || '');
          setBackHtml(jsonData.backHtml || '');
          // Update the CSS and immediately apply it
          if (jsonData.cardCss) {
            setCardCss(jsonData.cardCss);
            applyStyles(jsonData.cardCss); // Apply styles immediately after loading
        }
          setDesignName(jsonData.designName || 'Untitled');
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  }
  
  const loadDesignFromJSON = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = handleFileRead;
    fileInput.click();
  }  

  useEffect(() => {
    hljs.highlightAll();
  });  

  useEffect(() => {
    // Use setTimeout to ensure this runs after DOM updates
    setTimeout(() => {
      document.querySelectorAll('pre code').forEach((block) => {
        // Check if the block has already been highlighted
        if (block.dataset.highlighted) {
          // Remove the attribute to allow re-highlighting
          delete block.dataset.highlighted;
        }
        // Now apply highlighting
        hljs.highlightElement(block);
        // Set the attribute to mark it as highlighted
        block.dataset.highlighted = 'yes';
      });
    }, 0); // A minimal delay to ensure all DOM updates have been processed
  }, [frontHtml, backHtml, cardCss, activeTab, isEditing]); // Dependency array to determine when to re-run the effect

  const loadDesign = (filename) => {
    fetch(`/designs/${filename}`)
      .then(res => res.json())
      .then(data => {
        setFrontHtml(data.frontHtml || '');
        setBackHtml(data.backHtml || '');
        setCardCss(data.cardCss || '');
        setDesignName(filename.replace('.json', ''));
        setActiveTab('cardCss');  // Switch to CSS tab
        setViewSide('back');  // Switch to back view
        applyStyles(data.cardCss || ''); // Apply styles immediately after loading
      })
      .catch(err => console.error('Failed to load design:', err));
  };

  const handleDesignChange = (event) => {
    loadDesign(event.target.value);
  };

  return (
    <div className="App w-100 flex flex-column vh-100 pb2">
      <header className="flex justify-between items-center">
        <div className="">
          <h1 className="ma0 pv2 ph2 dib">Card Designer</h1>
          {editingName ?
            <input 
              ref={nameInputRef} 
              type="text" 
              placeholder="Design name" 
              value={designName} 
              onChange={(e) => setDesignName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') setEditingName(false); }}
            /> :
            <h2 className="ma0 pv1 ph2 dib" onClick={() => setEditingName(true)}>{designName}</h2>
          }
        </div>
        <div className="pr2">
          {/* Dropdown for selecting a design */}
          <select className="ph2 pv2" onChange={handleDesignChange} value={designName}>
            <option value="">Select a Design</option>
            {availableDesigns.map(design => (
              <option key={design} value={design}>{design}</option>
            ))}
          </select>
          <button 
            title="Save Design" 
            onClick={saveDesignToJSON} 
            className={`${NARROW_BTN_STYLE}`}>
              Export</button>
          <button
            title="Load Design" 
            onClick={loadDesignFromJSON} 
            className={NARROW_BTN_STYLE}>
              Import</button>
        </div>
        </header>
      <div className="workspace flex flex-auto ph2">
        <div className="editor w-50 flex flex-column pr1">
          <div className="tabs">
            <button onClick={() => handleTabChange('frontHtml')} 
              className={activeTab === 'frontHtml' ? 
                ACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-l" : 
                INACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-l"}>Front HTML</button>
            <button onClick={() => handleTabChange('backHtml')} 
              className={activeTab === 'backHtml' ? 
                ACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-m" : 
                INACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-m"}>Back HTML</button>
            <button onClick={() => handleTabChange('cardCss')} 
              className={activeTab === 'cardCss' ? 
                ACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-r" : 
                INACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-r"}>CSS</button>
          </div>
          <div className="relative w-100 flex-auto flex flex-column">
            <button onClick={copyToClipboard}
              title={copied ? "Copied!" : "Copy"}
              className={`absolute top-0 right-0 mt3 mr3 transparent-btn ${BTN_STYLE_GLASS}`}>    
                  {copied ? checkIcon : copyIcon}
            </button>
            {isEditing ? (
              <textarea
                ref={textareaRef}
                className={"code w-100 flex-auto resize-none " + (isEditing ? "db" : "dn")}
                spellCheck="false"
                value={activeTab === 'frontHtml' ? frontHtml : activeTab === 'backHtml' ? backHtml : cardCss}
                onChange={handleChange}
                onBlur={() => setIsEditing(false)}  // Hide textarea when it loses focus
                placeholder={`${activeTab.replace('Html', ' HTML').replace('Css', ' CSS')} Content`}
                rows="10"
                cols="30"
                autoFocus  // Automatically focus when shown
              />
            ) : (
              <pre
                className="w-100 flex-auto"
                onClick={() => setIsEditing(true)}  // Show textarea when pre is clicked
              >
                <code className={(activeTab === 'frontHtml' ? "language-html" : activeTab === 'backHtml' ? "language-html" : "language-css") + " w-100 flex-auto hljs"}>
                  {activeTab === 'frontHtml' ? frontHtml : activeTab === 'backHtml' ? backHtml : cardCss}
                </code>
              </pre>
            )}
          </div>
        </div>
        <div className="card-display w-50 flex flex-column pl1">
          <div className="view-tabs">
            <button onClick={() => handleViewChange('front')} 
              className={viewSide === 'front' ? 
                `active ${ACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-l "}` : 
                `${INACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-l"}`}>Front View</button>
            <button onClick={() => handleViewChange('back')} 
              className={viewSide === 'back' ? 
                `active ${ACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-r "}` : 
                `${INACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-r"}`}>Back View</button>
          </div>
          <div className="card-container flex-auto flex flex-column">
            <div className={`card flex-auto overflow-y-auto ${CARD_STYLE}`} dangerouslySetInnerHTML={{ __html: viewSide === 'front' ? frontHtml : backHtml }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
