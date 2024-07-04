import { useState, useEffect, useRef } from 'react';
import './App.css'
import hljs from 'highlight.js';
import prettier from 'prettier/standalone';
import htmlParser from 'prettier/plugins/html';
import cssParser from 'prettier/plugins/postcss';

async function highlightJSLoad() {
    return await import('highlight.js');
}
async function highlightLineNumbersLoad() {
    return await import('highlightjs-line-numbers.js');
}

// import 'highlight.js/styles/default.css';
import 'highlight.js/styles/monokai-sublime.css';


const BTN_STYLE = "bn mr1 f6 br3 w35 pv2 dib pointer bg-gray";
const NARROW_BTN_STYLE = "bn f6 reverse-dim br3 ph2 pv2 ml1 dib pointer bg-gray white";
const BTN_STYLE_GLASS = "ba b--gray bw1 br3 dib pa2 w2 h2 pointer transparent-btn";
const BTN_STYLE_TOGGLE = "ba b--gray f6 bw1 br3 w2 dib pa2 pointer transparent-btn"
const ACTIVE_BTN_STYLE = "fw6 white";
const INACTIVE_BTN_STYLE = "light-gray reverse-dim";
const CARD_STYLE = "ba b--black-50";

// <!-- Font Awesome Free 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) -->
const copyIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 448 512"><path d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z"/></svg>;
const checkIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 512 512"><path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"/></svg>
const eyeIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 576 512"><path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"/></svg>;
const eyeSlashIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 640 512"><path d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"/></svg>;

const availableDesigns = ["8 Bit Console.json", 
                          "Blackboard and Chalk.json", 
                          "Blueprint Theme.json", 
                          "Brutalist HTML.json",
                          "Code Rain.json", 
                          "Da Vinci Sketch.json",
                          "Full Photo.json",
                          "Full Photo 2.json",
                          "Game Menu UI.json",
                          "Glowing Blue Circuits.json", 
                          "Index Card.json", 
                          "Ink on Ricepaper.json", 
                          "Zenburn Theme.json"];

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
  const [cardData, setCardData] = useState({});
  const [previewData, setPreviewData] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [editorViewCollapsed, setEditorViewCollapsed] = useState(false);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();  // Automatically focus the textarea when editing
    }
  }, [isEditing]); // Re-run the effect when isEditing changes
  
  const displayCardData = (index) => {
    const cardKeys = Object.keys(cardData).filter(key => key !== 'default');  // Avoid 'default'
    if (cardKeys.length > 0 && cardData[cardKeys[index]]) {
        const currentCard = cardData[cardKeys[index]];
        const htmlWithValues = replacePlaceholders(viewSide === 'front' ? frontHtml : backHtml, 
          currentCard);
        setPreviewData(htmlWithValues);  // Assuming you have a state to hold the preview HTML
    }
  };

  const replacePlaceholders = (htmlContent, cardData) => {
    let updatedHtml = htmlContent;
    updatedHtml = updatedHtml.replace(/{{audio}}/g, cardData.audio === "{{audio}}" ? "{{audio}}" : 
      `<audio class="dn" id="audio" src="${cardData.audio}" controls ></audio><button style="color: inherit; background-color: transparent; border: none; z-index: inherit; cursor: inherit; text-shadow: inherit;" class="play-button" onclick="document.getElementById('audio').play()">▶</button>` || '');
    updatedHtml = updatedHtml.replace(/{{term}}/g, cardData.term || '');
    updatedHtml = updatedHtml.replace(/{{reading}}/g, cardData.reading || '');
    updatedHtml = updatedHtml.replace(/{{translation}}/g, cardData.translation || '');
    updatedHtml = updatedHtml.replace(/{{transliteration}}/g, cardData.transliteration || '');
    updatedHtml = updatedHtml.replace(/{{Tags}}/g, (cardData.Tags || []).join(', '));
    updatedHtml = updatedHtml.replace(/{{picture}}/g, cardData.picture === "{{picture}}" ? "{{picture}}" : `<img src="${cardData.picture}" />` || '');
    return updatedHtml;
  };

  useEffect(() => {
    fetch('dummy_card_data.json')
        .then(response => response.json())
        .then(data => {
            setCardData(data);
            // console.log("data", data);
            displayCardData(0);  // Initialize display with the first card
        })
        .catch(error => console.error('Failed to load card data:', error));
  }, []);

  useEffect(() => {
    if (Object.keys(cardData).length > 0 && frontHtml && backHtml) {
        displayCardData(cardIndex);  // Ensure initial data is displayed on load
    }
}, [cardData, cardCss, frontHtml, backHtml, cardIndex, viewSide]); // Depend on cardData and HTML content

  const handleNextCard = () => {
      const newIndex = (cardIndex + 1) % Object.keys(cardData).length;
      setCardIndex(newIndex);
      displayCardData(newIndex);
  };

  const handlePreviousCard = () => {
      const totalCards = Object.keys(cardData).length;
      const newIndex = (cardIndex - 1 + totalCards) % totalCards;
      setCardIndex(newIndex);
      displayCardData(newIndex);
  };

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
    // Remove existing style tag if it exists
    const existingStyleTag = document.getElementById('dynamic-styles');
    if (existingStyleTag) {
        existingStyleTag.remove();
    }

    // Remove comments
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');

    // Extract and handle @import statements
    let importStatements = [];
    css = css.replace(/@import\s+url\([^)]+\);?/g, (match) => {
        importStatements.push(match.trim());
        return ''; // Remove the import statement from the main CSS text
    });

    // Extract and handle @keyframes rules
    let keyframesRules = [];
    css = css.replace(/@keyframes\s+[\s\S]+?\{([\s\S]+?\}){2,}/g, (match) => {
        keyframesRules.push(match.trim());
        return ''; // Remove the @keyframes rule from the main CSS text
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

    // Create a new style tag
    const styleTag = document.createElement('style');
    styleTag.id = 'dynamic-styles';

    // Insert @import rules at the beginning
    importStatements.forEach(importRule => {
        try {
            styleTag.innerHTML += importRule + '\n';
        } catch (error) {
            console.error("Failed to insert import rule:", importRule, error);
        }
    });

    // Insert @keyframes rules next
    keyframesRules.forEach(keyframeRule => {
        try {
            styleTag.innerHTML += keyframeRule + '\n';
        } catch (error) {
            console.error("Failed to insert keyframe rule:", keyframeRule, error);
        }
    });

    // Insert other CSS rules
    rules.forEach(rule => {
        try {
            if (!rule.startsWith('@import')) {  // Ensure no @import rules are in this batch
                styleTag.innerHTML += rule + '\n';
            }
        } catch (error) {
            console.error("Failed to insert rule:", rule, error);
        }
    });

    // Append the style tag to the head of the document
    document.head.appendChild(styleTag);
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
    highlightJSLoad().then(() => {
        window.hljs = hljs;
        hljs.highlightAll();
        highlightLineNumbersLoad().then(() => {
            const blocks = document.querySelectorAll('pre code');
            blocks.forEach((block) => {
                hljs.lineNumbersBlock(block);
            });
        });
    });
  }, []);

  useEffect(() => {
    // Use setTimeout to ensure this runs after DOM updates
    requestAnimationFrame(() => {
      document.querySelectorAll('pre code').forEach((block) => {
        // Check if the block has already been highlighted
        if (block.dataset.highlighted) {
          // Remove the attribute to allow re-highlighting
          delete block.dataset.highlighted;
        }

        if(hljs.lineNumbersBlock) {
          hljs.highlightElement(block);
          hljs.lineNumbersBlock(block);

          // Set the attribute to mark it as highlighted
          block.dataset.highlighted = 'yes';
        }
        
      });
    }); // A minimal delay to ensure all DOM updates have been processed
  }, [frontHtml, backHtml, cardCss, activeTab, isEditing]); // Dependency array to determine when to re-run the effect

  const prettify = async () => {
    const code = activeTab === 'frontHtml' ? frontHtml : activeTab === 'backHtml' ? backHtml : cardCss;
    const parser = activeTab.includes('Html') ? 'html' : 'css';

    const formattedCode = await prettier.format(code, {
      parser: parser,
      plugins: [parser === 'html' ? htmlParser : cssParser],
      tabWidth: 2,
      useTabs: false
    });
  
    // Update the state with the formatted code
    if (activeTab === 'frontHtml') {
      setFrontHtml(formattedCode);
    } else if (activeTab === 'backHtml') {
      setBackHtml(formattedCode);
    } else {
      setCardCss(formattedCode);
    }
  
    setIsEditing(false); // Optionally hide textarea after formatting
  }

  const handleBlur = async () => {
    await prettify();
  };

  const handleToggleEditorView = () => {
    setEditorViewCollapsed(!editorViewCollapsed);
  }
  

  const loadDesign = (filename) => {
    fetch(`${filename}`)
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

  const finalizeDesignName = (event) => {
    const newName = event.target.value.trim(); // Trim whitespace
    if (!newName) { // Check if the new name is empty after trimming
        setDesignName('Untitled'); // Set default name if empty
    } else {
        setDesignName(newName); // Set to the new name if not empty
    }
    setEditingName(false);
  };

  const formatDesignName = (name) => {
    return name.replace('.json', '');
  }

  return (
    <div className="App w-100 flex flex-column vh-100 pb2">
      <header className="flex flex-column flex-row-ns justify-between items-center pb2">{/*responsive design test classes: bg-blue bg-red-m bg-purple-l*/}
        <div className="header-left-side w-100 flex flex-column items-center-ns flex-row-ns">
          <h1 className="ma0 pv2 ph2 dib w-100 tc tl-ns">
            <a className="link white f2" href="https://avidrucker.github.io/anki-card-test-1/">Card Designer</a>
          </h1>
          {editingName ?
            <input 
              ref={nameInputRef} 
              type="text" 
              className="white bg-dark-gray pv1 ph2 ma0 f3 w-100 tc tl-ns"
              placeholder="Design name" 
              value={designName} 
              onChange={(e) => setDesignName(e.target.value)}
              onBlur={finalizeDesignName}
              onKeyDown={(e) => { if (e.key === 'Enter') setEditingName(false); }}
            /> :
            <h2 title="Click here to name your design" className="ma0 pv1 ph2 dib pointer f3 ba w-100 tc tl-ns b--white bg-dark-gray" onClick={() => setEditingName(true)}>{designName}</h2>
          }
        </div>
        <div className="header-right-side w-100 ph2 flex flex-column-reverse flex-row-l">

          <div className="card-navigation pr2-l dib ml-auto mr-auto mr0-ns mt2 mt1-m mt0-l mr2 flex items-center">
            <button title={editorViewCollapsed ? "Show Editor" : "Hide Editor"} className={`${BTN_STYLE_TOGGLE} relative`} onClick={handleToggleEditorView}>
              <span className="relative flex flex-column justify-center items-center">{editorViewCollapsed ? eyeSlashIcon : eyeIcon}</span>{/*shift-up-right*/}
            </button>
            <button className={`${NARROW_BTN_STYLE}`} title="Previous" onClick={handlePreviousCard}>&lt;</button>
            <p className="ma0 ml1 prevent-select w3 f5 tc">{`Data ${cardIndex + 1}`}</p>
            <button className={`${NARROW_BTN_STYLE}`} title="Next" onClick={handleNextCard}>&gt;</button>
          </div>

          {/* Dropdown for selecting a design */}
          <select className="ph2 pv2 ml-auto-m dib bg-dark-gray white" onChange={handleDesignChange} value={designName}>
            <option value="">Select a Design</option>
            {availableDesigns.map(design => (
              <option key={design} value={design}>{formatDesignName(design)}</option>
            ))}
          </select>
          {/* Import and Export Buttons*/}
          <div className="ml-auto mr-auto mr0-ns dib ml0-l pl1 mb2 mb1-m mb0-l mt2 mt1-m mt0-l flex items-center">
            <button
              title="Load Design" 
              onClick={loadDesignFromJSON} 
              className={NARROW_BTN_STYLE}>
                Import</button>
            <button 
              title="Save Design" 
              onClick={saveDesignToJSON} 
              className={`${NARROW_BTN_STYLE}`}>
                Export</button>
          </div>
        </div>
      </header>
      <div className={`workspace flex flex-column-reverse flex-row-ns flex-auto-ns ph2`}>
        <div className={`editor w-100 w-50-ns flex flex-column w-animate pr1 overflow-x-hidden ${(editorViewCollapsed && " w0-ns-strong ")}`}>
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
          <div className={`relative w-100 flex-auto flex flex-column ${CARD_STYLE}`}>
            <button onClick={copyToClipboard}
              title={copied ? "Copied!" : "Copy"}
              className={`absolute db top-0 right-0 z-999 mt3 mr3 ${BTN_STYLE_GLASS}`}>    
                  <span className="relative shift-up-right">{copied ? checkIcon : copyIcon}</span>
            </button>
            {isEditing ? (
              <textarea
                ref={textareaRef}
                className={"code w-100 pa3 textarea-ph pl-textarea-strong relative z-0 flex-auto resize-none " + (isEditing ? "db" : "dn")}
                spellCheck="false"
                value={activeTab === 'frontHtml' ? frontHtml : activeTab === 'backHtml' ? backHtml : cardCss}
                onChange={handleChange}
                onBlur={handleBlur}  // Hide textarea when it loses focus
                placeholder={`${activeTab.replace('Html', ' HTML').replace('Css', ' CSS')} Content`}
                rows="10"
                cols="30"
                autoFocus  // Automatically focus when shown
              />
            ) : (
              <pre
                className="w-100 flex-auto ma0 relative"
                onClick={() => setIsEditing(true)}  // Show textarea when pre is clicked
              >
                <code className={(activeTab === 'frontHtml' ? "language-html" : activeTab === 'backHtml' ? "language-html" : "language-css") + " w-100 flex-auto hljs pl0-strong"}>
                  {activeTab === 'frontHtml' ? frontHtml : activeTab === 'backHtml' ? backHtml : cardCss}
                </code>
              </pre>
            )}
          </div>
        </div>
        <div className={`card-display pb2 pb0-ns w-100 w-50-ns flex w-animate flex-column pl1 ${(editorViewCollapsed && " w-100-ns-strong ")}`}>
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
          <div className={`card-container flex-auto flex flex-column ${CARD_STYLE}`}>
            <div 
              className={`card flex-auto overflow-y-auto`} 
              dangerouslySetInnerHTML={{ __html: previewData }} />{/*viewSide === 'front' ? frontHtml : backHtml*/}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
