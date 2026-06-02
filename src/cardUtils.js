export function removeConsecutiveSpaces(str) {
  return str.replace(/\s+/g, " ");
}

export function replacePlaceholders(htmlContent, cardData) {
  let updatedHtml = htmlContent;

  const placeholderRegex = /<div id="input-container".*?placeholder="([^"]+)"/;
  const match = removeConsecutiveSpaces(updatedHtml).match(placeholderRegex);
  const placeholder = match ? match[1] : "";

  if (Array.isArray(cardData.audio) && cardData.audio.length) {
    const audioElements = cardData.audio
      .map(
        (audioSrc, index) =>
          `<audio class="dn" id="audio${index}" src="${audioSrc}" controls ></audio>` +
          `<button class="play-button" onclick="document.getElementById('audio${index}').play()">▶</button>`
      )
      .join("");
    updatedHtml = updatedHtml.replace(/{{audio}}/g, audioElements);
  } else {
    updatedHtml = updatedHtml.replace(/{{audio}}/g, "");
  }

  updatedHtml = updatedHtml.replace(/{{term}}/g, cardData.term || "");
  updatedHtml = updatedHtml.replace(/{{reading}}/g, cardData.reading || "");
  updatedHtml = updatedHtml.replace(/{{translation}}/g, cardData.translation || "");
  updatedHtml = updatedHtml.replace(/{{transliteration}}/g, cardData.transliteration || "");
  updatedHtml = updatedHtml.replace(/{{Tags}}/g, (cardData.Tags || []).join(", "));
  updatedHtml = updatedHtml.replace(
    /{{picture}}/g,
    cardData.picture === "{{picture}}"
      ? "{{picture}}"
      : `<img src="${cardData.picture}" />`
  );
  updatedHtml = updatedHtml.replace(/{{type:([^}]+)}}/g, (type) => {
    return `<input type="text" id="typeans" class="input-field" placeholder="${placeholder || type}" />`;
  });

  return updatedHtml;
}

export function processConditionalContent(htmlContent, cardData, isFrontSide) {
  const positiveRegex = /{{#([^{}]+)}}([\s\S]*?){{\/\1}}/g;
  const negativeRegex = /{{\^([^{}]+)}}([\s\S]*?){{\/\1}}/g;

  const processConditionals = (content, regex, keepIfTrue) => {
    return content.replace(regex, (_match, key, innerContent) => {
      const hasData = !!cardData[key];
      if (keepIfTrue === hasData) {
        innerContent = processConditionals(innerContent, positiveRegex, true);
        innerContent = processConditionals(innerContent, negativeRegex, false);
        return innerContent || "";
      }
      return "";
    });
  };

  htmlContent = processConditionals(htmlContent, positiveRegex, true);
  htmlContent = processConditionals(htmlContent, negativeRegex, false);

  if (isFrontSide && htmlContent.trim() === "") {
    htmlContent =
      `<div class="black"><p>The front of this card is blank.</p>` +
      `<a class="blue link underline" href="https://anki.tenderapp.com/kb/card-appearance/the-front-of-this-card-is-blank">More information</a></div>`;
  }

  return htmlContent;
}

export function formatDesignName(name) {
  return name.replace(".json", "");
}

export function nextCardIndex(current, total) {
  return (current + 1) % total;
}

export function prevCardIndex(current, total) {
  return (current - 1 + total) % total;
}
