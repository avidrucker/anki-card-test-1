import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import {
  replacePlaceholders,
  processConditionalContent,
  formatDesignName,
  nextCardIndex,
  prevCardIndex,
} from "./cardUtils";
// import hljs from "highlight.js";
import prettier from "prettier/standalone";
import htmlParser from "prettier/plugins/html";
import cssParser from "prettier/plugins/postcss";
import { copyIcon, checkIcon, eyeIcon, eyeSlashIcon } from "./icons";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
// import { javascript } from '@codemirror/lang-javascript';
import { less } from "@codemirror/lang-less";
import { html } from "@codemirror/lang-html";
import { monokai } from "@uiw/codemirror-theme-monokai";

// async function highlightJSLoad() {
//   return await import("highlight.js");
// }
// async function highlightLineNumbersLoad() {
//   return await import("highlightjs-line-numbers.js");
// }

// import 'highlight.js/styles/default.css';
import "highlight.js/styles/monokai-sublime.css";

const BTN_STYLE = "bn mr1 f6 br3 w35 pv2 dib pointer bg-gray";
const NARROW_BTN_STYLE =
  "bn f6 reverse-dim br3 ph2 pv2 ml1 dib pointer bg-gray white";
const BTN_STYLE_GLASS =
  "ba b--gray bw1 br3 dib pa2 w2 h2 pointer transparent-btn";
const BTN_STYLE_TOGGLE =
  "ba b--gray f6 bw1 br3 w2 dib pa2 pointer transparent-btn";
const ACTIVE_BTN_STYLE = "fw6 white";
const INACTIVE_BTN_STYLE = "light-gray reverse-dim";
const CARD_STYLE = "ba b--black-50";

const availableDesigns = [
  "8 Bit Console.json",
  "Beach Night Poster.json",
  "Blackboard and Chalk.json",
  "Blueprint Theme.json",
  "Brutalist HTML.json",
  "Classic Apple.json",
  "Code Rain.json",
  "Da Vinci Sketch.json",
  "Full Photo.json",
  "Full Photo 2.json",
  "Game Menu UI.json",
  "Glowing Blue Circuits.json",
  "Index Card.json",
  "Ink on Ricepaper.json",
  "Starry Night Poster.json",
  "Stormy Night Poster.json",
  "Zenburn Theme.json",
];

function App() {
  const [frontHtml, setFrontHtml] = useState(
    localStorage.getItem("frontHtml") || "<!--put your front html here-->"
  );
  const [backHtml, setBackHtml] = useState(
    localStorage.getItem("backHtml") || "<!--put your back html here-->"
  );
  const [cardCss, setCardCss] = useState(
    localStorage.getItem("cardCss") || "/*put your css here*/"
  );
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("activeTab") || "backHtml"
  );
  const [viewSide, setViewSide] = useState(
    localStorage.getItem("viewSide") || "back"
  );
  const [copied, setCopied] = useState(false);
  const [designName, setDesignName] = useState(
    localStorage.getItem("designName") || availableDesigns[0]
  );
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef(null); // Create a reference to the input element
  const [cardData, setCardData] = useState({});
  const [previewData, setPreviewData] = useState("");
  const [cardIndex, setCardIndex] = useState(
    parseInt(localStorage.getItem("cardIndex"), 10) || 1
  );
  const [editorViewCollapsed, setEditorViewCollapsed] = useState(false);
  const [currentEditorText, setCurrentEditorText] = useState("");
  const [designLoaded, setDesignLoaded] = useState(false);
  const isLoadingTabContentRef = useRef(false);

  // Load the editor content when switching tabs or when source content changes externally
  useEffect(() => {
    // console.log('LOAD Effect - activeTab:', activeTab, 'isLoading:', isLoadingTabContentRef.current);
    // console.log('LOAD Effect - frontHtml length:', frontHtml.length, 'backHtml length:', backHtml.length, 'cardCss length:', cardCss.length);
    
    isLoadingTabContentRef.current = true;
    
    let contentToLoad = '';
    if (activeTab === "frontHtml") {
      contentToLoad = frontHtml;
    } else if (activeTab === "backHtml") {
      contentToLoad = backHtml;
    } else {
      contentToLoad = cardCss;
    }
    
    // console.log('LOAD Effect - Setting currentEditorText to:', contentToLoad.substring(0, 50) + '...');
    setCurrentEditorText(contentToLoad);
    
    // Reset the flag after the current execution context
    const timerId = setTimeout(() => {
      // console.log('LOAD Effect - Resetting isLoading flag');
      isLoadingTabContentRef.current = false;
    }, 50); // Small delay to ensure state updates are processed
    
    return () => clearTimeout(timerId);
  }, [activeTab, frontHtml, backHtml, cardCss]);

  // Save editor content back to the appropriate state variable (only when user types)
  useEffect(() => {
    // console.log('SAVE Effect - currentEditorText changed, isLoading:', isLoadingTabContentRef.current);
    // console.log('SAVE Effect - activeTab:', activeTab, 'currentEditorText length:', currentEditorText.length);
    
    // Don't save if we're currently loading content from a tab switch
    if (isLoadingTabContentRef.current) {
      // console.log('SAVE Effect - BLOCKED because isLoading is true');
      return;
    }
    
    // console.log('SAVE Effect - SAVING to', activeTab);
    if (activeTab === "frontHtml") {
      setFrontHtml(currentEditorText);
    } else if (activeTab === "backHtml") {
      setBackHtml(currentEditorText);
    } else {
      setCardCss(currentEditorText);
    }
  }, [currentEditorText, activeTab]);



  const displayCardData = useCallback((index) => {
    const cardKeys = Object.keys(cardData).filter((key) => key !== "default"); // Avoid 'default'
    if (cardKeys.length > 0 && cardData[cardKeys[index]]) {
      const currentCard = cardData[cardKeys[index]];
      const htmlWithValues = replacePlaceholders(
        viewSide === "front" ? frontHtml : backHtml,
        currentCard
      );
      const conditionalHtml = processConditionalContent(
        htmlWithValues,
        currentCard,
        viewSide === "front"
      );
      setPreviewData(conditionalHtml); // Assuming you have a state to hold the preview HTML
    }
  }, [cardData, viewSide, frontHtml, backHtml]);

  useEffect(() => {
    if ((Object.keys(cardData).length > 0 && frontHtml) || backHtml) {
      displayCardData(cardIndex); // Ensure initial data is displayed on load
    }
  }, [cardData, cardCss, frontHtml, backHtml, cardIndex, viewSide, displayCardData]); // Depend on cardData and HTML content

  // when changing content for the frontHtml, it
  // will trigger updating of currentEditorText
  const updateEditorTextConditionally = () => {
    if (activeTab === "frontHtml") {
      setCurrentEditorText(frontHtml);
    } else if (activeTab === "backHtml") {
      setCurrentEditorText(backHtml);
    } else {
      setCurrentEditorText(cardCss);
    }
  };

  useEffect(() => {
    fetch("dummy_card_data.json")
      .then((response) => response.json())
      .then((data) => {
        setCardData(data);
        displayCardData(0); // Initialize display with the first card
      })
      .catch((error) => console.error("Failed to load card data:", error));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally omits displayCardData — it depends on cardData, adding it here would re-trigger the fetch

  const applyStyles = useCallback((css) => {
    // Remove existing style tag if it exists
    const existingStyleTag = document.getElementById("dynamic-styles");
    if (existingStyleTag) {
      existingStyleTag.remove();
    }

    // Remove comments
    css = css.replace(/\/\*[\s\S]*?\*\//g, "");

    // Extract and handle @import statements
    let importStatements = [];
    css = css.replace(/@import\s+url\([^)]+\);?/g, (match) => {
      importStatements.push(match.trim());
      return ""; // Remove the import statement from the main CSS text
    });

    // Extract and handle @keyframes rules
    let keyframesRules = [];
    css = css.replace(/@keyframes\s+[\s\S]+?\{([\s\S]+?\}){2,}/g, (match) => {
      keyframesRules.push(match.trim());
      return ""; // Remove the @keyframes rule from the main CSS text
    });

    // Process and insert other CSS rules
    const rules = css
      .split("}")
      .filter((rule) => rule.trim() !== "")
      .map((rule) => {
        if (
          rule.trim().startsWith(":root") ||
          rule.trim().startsWith("@font-face")
        ) {
          return rule.trim();
        } else if (!rule.trim().startsWith(".card-container")) {
          return `.card-container ${rule.trim()}`;
        }
        return rule.trim();
      })
      .map((rule) => rule + "}") // Close the rule
      .filter((rule) => rule.length > 2); // Filter out empty rules

    // Create a new style tag
    const styleTag = document.createElement("style");
    styleTag.id = "dynamic-styles";

    // Insert @import rules at the beginning
    importStatements.forEach((importRule) => {
      try {
        styleTag.innerHTML += importRule + "\n";
      } catch (error) {
        console.error("Failed to insert import rule:", importRule, error);
      }
    });

    // Insert @keyframes rules next
    keyframesRules.forEach((keyframeRule) => {
      try {
        styleTag.innerHTML += keyframeRule + "\n";
      } catch (error) {
        console.error("Failed to insert keyframe rule:", keyframeRule, error);
      }
    });

    // Insert other CSS rules
    rules.forEach((rule) => {
      try {
        if (!rule.startsWith("@import")) {
          // Ensure no @import rules are in this batch
          styleTag.innerHTML += rule + "\n";
        }
      } catch (error) {
        console.error("Failed to insert rule:", rule, error);
      }
    });

    // Append the style tag to the head of the document
    document.head.appendChild(styleTag);
  }, []);

  // Shared state-setter for any design load (dropdown or file import).
  // activeTab/viewSide are intentionally NOT reset here — callers set them as needed.
  const applyDesignData = useCallback((data, name) => {
    setFrontHtml(data.frontHtml || "");
    setBackHtml(data.backHtml || "");
    setCardCss(data.cardCss || "");
    applyStyles(data.cardCss || "");
    setDesignName(name);
    setDesignLoaded(true);
  }, [applyStyles]);

  // Called when selecting a design from the dropdown. Always resets to back view
  // because the user is intentionally switching to a different design.
  const loadDesign = useCallback((filename) => {
    fetch(`${filename}`)
      .then((res) => res.json())
      .then((data) => {
        applyDesignData(data, formatDesignName(filename));
        setActiveTab("backHtml");
        setViewSide("back");
      })
      .catch((err) => console.error("Failed to load design:", err));
  }, [applyDesignData]);

  // Load initial state from localStorage on component mount
  useEffect(() => {
    const savedDesignName = localStorage.getItem("designName");
    const savedFrontHtml = localStorage.getItem("frontHtml");
    const savedBackHtml = localStorage.getItem("backHtml");
    const savedCardCss = localStorage.getItem("cardCss");
    const savedActiveTab = localStorage.getItem("activeTab");
    const savedViewSide = localStorage.getItem("viewSide");
    const savedCardIndex = parseInt(localStorage.getItem("cardIndex")) || 0;

    // If no saved design, load the first design from availableDesigns
    if (!savedDesignName || !savedFrontHtml || !savedBackHtml || !savedCardCss) {
      loadDesign(availableDesigns[0]);
    } else {
      // Load from localStorage
      if (savedFrontHtml) setFrontHtml(savedFrontHtml);
      if (savedBackHtml) setBackHtml(savedBackHtml);
      if (savedCardCss) {
        setCardCss(savedCardCss);
        applyStyles(savedCardCss);
      }

      setActiveTab(savedActiveTab || "backHtml");
      setViewSide(savedViewSide || "back");
      setCardIndex(savedCardIndex);

      setDesignLoaded(true);
    }
  }, [applyStyles, loadDesign]);

  const handleNextCard = () => {
    const newIndex = nextCardIndex(cardIndex, Object.keys(cardData).length);
    setCardIndex(newIndex);
    displayCardData(newIndex);
    localStorage.setItem("cardIndex", newIndex);
  };

  const handlePreviousCard = () => {
    const newIndex = prevCardIndex(cardIndex, Object.keys(cardData).length);
    setCardIndex(newIndex);
    displayCardData(newIndex);
    localStorage.setItem("cardIndex", newIndex);
  };

  const getCurrentTextareaContent = () => {
    if (activeTab === "frontHtml") {
      return frontHtml;
    } else if (activeTab === "backHtml") {
      return backHtml;
    } else {
      return cardCss;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(getCurrentTextareaContent())
      .then(() => {
        // alert('Text copied to clipboard'); // Optionally, handle UI feedback here
        setCopied(true);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  // Effect to save changes when frontHtml, backHtml, cardCss, activeTab, or viewSide changes
  useEffect(() => {
    saveToLocalStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontHtml, backHtml, cardCss, activeTab, viewSide, designName]); // Including all dependencies for saving

  useEffect(() => {
    // Whenever editingName becomes true, focus the input
    if (editingName) {
      nameInputRef.current && nameInputRef.current.focus();
    }
  }, [editingName]); // Depend on editingName to re-run the effect


  useEffect(() => {
    applyStyles(cardCss);
  }, [cardCss, applyStyles]); // Re-run the effect whenever the CSS changes

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === "frontHtml") {
      setViewSide("front");
    }
    if (newTab === "backHtml") {
      setViewSide("back");
    }
    setCopied(false);
  };

  const handleViewChange = (newView) => {
    if (newView === "front") {
      setActiveTab("frontHtml");
    } else {
      setActiveTab("backHtml");
    }
    setViewSide(newView);
  };

  const saveToLocalStorage = () => {
    localStorage.setItem("frontHtml", frontHtml);
    localStorage.setItem("backHtml", backHtml);
    localStorage.setItem("cardCss", cardCss);
    localStorage.setItem("activeTab", activeTab);
    localStorage.setItem("viewSide", viewSide);
    localStorage.setItem("designName", designName);
    localStorage.setItem("cardIndex", cardIndex);
  };

  const saveDesignToJSON = () => {
    const designData = {
      frontHtml,
      backHtml,
      cardCss,
      designName,
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(designData));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", designName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleFileRead = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          applyDesignData(jsonData, jsonData.designName || "Untitled");
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const loadDesignFromJSON = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.onchange = handleFileRead;
    fileInput.click();
  };

  const onEditorChange = useCallback((val) => {
    setCurrentEditorText(val);
    setCopied(false); // set copied icon back
  }, []);

  const handleToggleEditorView = () => {
    setEditorViewCollapsed(!editorViewCollapsed);
  };

  // useEffect to call updateEditorTextConditionally after state updates
  useEffect(() => {
    if (designLoaded) {
      updateEditorTextConditionally();
      // Reset designLoaded to false
      setDesignLoaded(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designLoaded, cardCss, frontHtml, backHtml]); // omits updateEditorTextConditionally — plain fn, would cause infinite re-runs

  const handleDesignChange = (event) => {
    loadDesign(event.target.value);
  };

  const finalizeDesignName = (event) => {
    const newName = event.target.value.trim(); // Trim whitespace
    if (!newName) {
      // Check if the new name is empty after trimming
      setDesignName("Untitled"); // Set default name if empty
    } else {
      setDesignName(newName); // Set to the new name if not empty
    }
    setEditingName(false);
  };

  // activetab in this onblur will be the old tab
  // ( if we are in fronthtml and click backhtml it will be fronthtml )
  const formatCode = async () => {
    // Don't format if we're in the middle of a tab switch
    if (isLoadingTabContentRef.current) {
      console.log('formatCode - SKIPPED because tab is switching');
      return;
    }
    
    // Verify that currentEditorText matches the current tab's content
    // to prevent formatting old content after a tab switch
    const expectedContent = getCurrentTextareaContent();
    
    if (currentEditorText !== expectedContent) {
      console.log('formatCode - SKIPPED because content does not match current tab');
      console.log('formatCode - Expected length:', expectedContent.length, 'Got:', currentEditorText.length);
      return;
    }
    
    const parser = activeTab.includes("Html") ? "html" : "css";

    const formattedCode = await prettier.format(currentEditorText, {
      parser: parser,
      plugins: [parser === "html" ? htmlParser : cssParser],
      tabWidth: 2,
      useTabs: false,
    });

    console.log('formatCode - Formatting code for', activeTab);
    setCurrentEditorText(formattedCode);
  };

  return (
    <div className="App w-100 flex flex-column vh-100 pb2">
      <header className="flex flex-column flex-row-ns justify-between items-center pb2">
        {/*responsive design test classes: bg-blue bg-red-m bg-purple-l*/}
        <div className="header-left-side w-100 flex flex-column items-center-ns flex-row-ns">
          <h1 className="ma0 pv2 ph2 dib w-100 tc tl-ns">
            <a
              className="link white f2"
              href="https://avidrucker.github.io/anki-card-test-1/"
            >
              Card Designer
            </a>
          </h1>
          {editingName ? (
            <input
              ref={nameInputRef}
              type="text"
              className="white bg-dark-gray pv1 ph2 ma0 f3 w-100 tc tl-ns"
              placeholder="Design name"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              onBlur={finalizeDesignName}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditingName(false);
              }}
            />
          ) : (
            <h2
              title="Click here to name your design"
              className="ma0 pv1 ph2 dib pointer f3 ba w-100 tc tl-ns b--white bg-dark-gray"
              onClick={() => setEditingName(true)}
            >
              {designName}
            </h2>
          )}
        </div>
        <div className="header-right-side w-100 ph2 flex flex-column-reverse flex-row-l">
          <div className="card-navigation pr2-l dib ml-auto mr-auto mr0-ns mt2 mt1-m mt0-l mr2 flex items-center">
            <button
              title={editorViewCollapsed ? "Show Editor" : "Hide Editor"}
              className={`${BTN_STYLE_TOGGLE} relative`}
              onClick={handleToggleEditorView}
            >
              <span className="relative flex flex-column justify-center items-center">
                {editorViewCollapsed ? eyeSlashIcon : eyeIcon}
              </span>
              {/*shift-up-right*/}
            </button>
            <button
              className={`${NARROW_BTN_STYLE}`}
              title="Previous"
              onClick={handlePreviousCard}
            >
              &lt;
            </button>
            <p className="ma0 ml1 prevent-select w3 f5 tc">{`Data ${cardIndex + 1}`}</p>
            <button
              className={`${NARROW_BTN_STYLE}`}
              title="Next"
              onClick={handleNextCard}
            >
              &gt;
            </button>
          </div>

          {/* Dropdown for selecting a design */}
          <select
            className="ph2 pv2 ml-auto-m dib bg-dark-gray white"
            onChange={handleDesignChange}
            value={designName}
          >
            <option value="">Select a Design</option>
            {availableDesigns.map((design) => (
              <option key={design} value={design}>
                {formatDesignName(design)}
              </option>
            ))}
          </select>
          {/* Import and Export Buttons*/}
          <div className="ml-auto mr-auto mr0-ns dib ml0-l pl1 mb2 mb1-m mb0-l mt2 mt1-m mt0-l flex items-center">
            <button
              title="Load Design"
              onClick={loadDesignFromJSON}
              className={NARROW_BTN_STYLE}
            >
              Import
            </button>
            <button
              title="Save Design"
              onClick={saveDesignToJSON}
              className={`${NARROW_BTN_STYLE}`}
            >
              Export
            </button>
          </div>
        </div>
      </header>
      <div
        className={`workspace flex flex-column-reverse flex-row-ns flex-auto-ns ph2`}
      >
        <div
          className={`editor w-100 w-50-ns flex flex-column w-animate pr1 overflow-x-hidden ${editorViewCollapsed && " w0-ns-strong "}`}
        >
          <div className="tabs">
            <button
              onClick={() => handleTabChange("frontHtml")}
              className={
                activeTab === "frontHtml"
                  ? ACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-l"
                  : INACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-l"
              }
            >
              Front HTML
            </button>
            <button
              onClick={() => handleTabChange("backHtml")}
              className={
                activeTab === "backHtml"
                  ? ACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-m"
                  : INACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-m"
              }
            >
              Back HTML
            </button>
            <button
              onClick={() => handleTabChange("cardCss")}
              className={
                activeTab === "cardCss"
                  ? ACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-r"
                  : INACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-r"
              }
            >
              CSS
            </button>
          </div>
          <div
            className={`relative w-100 h-100 overflow-y-hidden ${CARD_STYLE}`}
          >
            <button
              onClick={copyToClipboard}
              title={copied ? "Copied!" : "Copy"}
              className={`absolute db top-0 right-0 z-999 mt3 mr3 ${BTN_STYLE_GLASS}`}
            >
              <span className="relative shift-up-right">
                {copied ? checkIcon : copyIcon}
              </span>
            </button>

            <section className="w-100 ma0 relative bg-monokai h-100 overflow-y-scroll">
              <CodeMirror
                onBlur={formatCode}
                value={currentEditorText}
                height="100%"
                extensions={[
                  activeTab === "cardCss" ? less() : html(),
                  EditorView.lineWrapping,
                ]}
                theme={monokai}
                onChange={onEditorChange}
              />
            </section>
          </div>
        </div>
        <div
          className={`card-display pb2 pb0-ns w-100 w-50-ns flex w-animate flex-column pl1 ${editorViewCollapsed && " w-100-ns-strong "}`}
        >
          <div className="view-tabs">
            <button
              onClick={() => handleViewChange("front")}
              className={
                viewSide === "front"
                  ? `active ${ACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-l "}`
                  : `${INACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-l"}`
              }
            >
              Front View
            </button>
            <button
              onClick={() => handleViewChange("back")}
              className={
                viewSide === "back"
                  ? `active ${ACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-r "}`
                  : `${INACTIVE_BTN_STYLE + " " + BTN_STYLE + " br3--btn-r"}`
              }
            >
              Back View
            </button>
          </div>
          <div
            className={`card-container flex-auto flex flex-column ${CARD_STYLE}`}
          >
            <div
              className={`card flex-auto overflow-y-auto`}
              dangerouslySetInnerHTML={{ __html: previewData }}
            />
            {/*viewSide === 'front' ? frontHtml : backHtml*/}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
