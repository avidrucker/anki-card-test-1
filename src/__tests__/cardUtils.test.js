import { describe, it, expect } from "vitest";
import {
  removeConsecutiveSpaces,
  replacePlaceholders,
  processConditionalContent,
  formatDesignName,
  nextCardIndex,
  prevCardIndex,
} from "../cardUtils";

// ---------------------------------------------------------------------------
// removeConsecutiveSpaces
// ---------------------------------------------------------------------------

describe("removeConsecutiveSpaces", () => {
  it("collapses multiple spaces into one", () => {
    expect(removeConsecutiveSpaces("a  b")).toBe("a b");
  });

  it("collapses tabs into a single space", () => {
    expect(removeConsecutiveSpaces("a\t\tb")).toBe("a b");
  });

  it("collapses newlines into a single space", () => {
    expect(removeConsecutiveSpaces("a\n\nb")).toBe("a b");
  });

  it("collapses mixed whitespace into a single space", () => {
    expect(removeConsecutiveSpaces("a \t\n b")).toBe("a b");
  });

  it("leaves a string with no whitespace unchanged", () => {
    expect(removeConsecutiveSpaces("hello")).toBe("hello");
  });

  it("leaves a single space unchanged", () => {
    expect(removeConsecutiveSpaces("a b")).toBe("a b");
  });

  it("handles an empty string", () => {
    expect(removeConsecutiveSpaces("")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// formatDesignName
// ---------------------------------------------------------------------------

describe("formatDesignName", () => {
  it("strips a .json suffix", () => {
    expect(formatDesignName("Index Card.json")).toBe("Index Card");
  });

  it("leaves a name without .json unchanged", () => {
    expect(formatDesignName("Index Card")).toBe("Index Card");
  });

  it("only strips the first .json occurrence", () => {
    // edge case: two occurrences — only first is removed
    expect(formatDesignName("foo.json.json")).toBe("foo.json");
  });

  it("handles an empty string", () => {
    expect(formatDesignName("")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// nextCardIndex / prevCardIndex
// ---------------------------------------------------------------------------

describe("nextCardIndex", () => {
  it("advances by one normally", () => {
    expect(nextCardIndex(0, 5)).toBe(1);
    expect(nextCardIndex(3, 5)).toBe(4);
  });

  it("wraps from the last card back to 0", () => {
    expect(nextCardIndex(4, 5)).toBe(0);
  });

  it("wraps correctly for a single-card deck", () => {
    expect(nextCardIndex(0, 1)).toBe(0);
  });
});

describe("prevCardIndex", () => {
  it("goes back by one normally", () => {
    expect(prevCardIndex(3, 5)).toBe(2);
    expect(prevCardIndex(1, 5)).toBe(0);
  });

  it("wraps from 0 to the last card", () => {
    expect(prevCardIndex(0, 5)).toBe(4);
  });

  it("wraps correctly for a single-card deck", () => {
    expect(prevCardIndex(0, 1)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// replacePlaceholders — helpers
// ---------------------------------------------------------------------------

const BASIC_CARD = {
  term: "猫",
  reading: "ねこ",
  translation: "cat",
  transliteration: "neko",
  Tags: ["animals", "noun"],
  audio: ["cat_neko.mp3"],
  picture: "cat.jpg",
};

const EMPTY_CARD = {
  term: "",
  reading: "",
  translation: "",
  transliteration: "",
  Tags: [],
  audio: [],
  picture: "",
};

describe("replacePlaceholders — text fields", () => {
  it("replaces {{term}}", () => {
    expect(replacePlaceholders("{{term}}", BASIC_CARD)).toBe("猫");
  });

  it("replaces {{reading}}", () => {
    expect(replacePlaceholders("{{reading}}", BASIC_CARD)).toBe("ねこ");
  });

  it("replaces {{translation}}", () => {
    expect(replacePlaceholders("{{translation}}", BASIC_CARD)).toBe("cat");
  });

  it("replaces {{transliteration}}", () => {
    expect(replacePlaceholders("{{transliteration}}", BASIC_CARD)).toBe("neko");
  });

  it("replaces {{Tags}} with comma-joined list", () => {
    expect(replacePlaceholders("{{Tags}}", BASIC_CARD)).toBe("animals, noun");
  });

  it("replaces missing text fields with empty string", () => {
    expect(replacePlaceholders("{{term}}", EMPTY_CARD)).toBe("");
    expect(replacePlaceholders("{{reading}}", EMPTY_CARD)).toBe("");
    expect(replacePlaceholders("{{translation}}", EMPTY_CARD)).toBe("");
    expect(replacePlaceholders("{{transliteration}}", EMPTY_CARD)).toBe("");
  });

  it("replaces {{Tags}} with empty string when Tags is empty", () => {
    expect(replacePlaceholders("{{Tags}}", EMPTY_CARD)).toBe("");
  });

  it("replaces all occurrences of the same placeholder", () => {
    const result = replacePlaceholders("{{term}} / {{term}}", BASIC_CARD);
    expect(result).toBe("猫 / 猫");
  });
});

describe("replacePlaceholders — audio", () => {
  it("produces one audio element + play button for a single source", () => {
    const result = replacePlaceholders("{{audio}}", BASIC_CARD);
    expect(result).toContain('<audio class="dn" id="audio0" src="cat_neko.mp3"');
    expect(result).toContain("▶");
  });

  it("produces two audio elements for a two-source card", () => {
    const card = { ...BASIC_CARD, audio: ["a.mp3", "b.mp3"] };
    const result = replacePlaceholders("{{audio}}", card);
    expect(result).toContain('id="audio0" src="a.mp3"');
    expect(result).toContain('id="audio1" src="b.mp3"');
  });

  it("replaces {{audio}} with empty string when audio array is empty", () => {
    expect(replacePlaceholders("{{audio}}", EMPTY_CARD)).toBe("");
  });

  it("replaces {{audio}} with empty string when audio field is absent", () => {
    const card = { term: "test" };
    expect(replacePlaceholders("{{audio}}", card)).toBe("");
  });
});

describe("replacePlaceholders — picture", () => {
  it("wraps a picture path in an img tag", () => {
    const result = replacePlaceholders("{{picture}}", BASIC_CARD);
    expect(result).toBe('<img src="cat.jpg" />');
  });

  it("wraps a picture URL in an img tag", () => {
    const card = { ...BASIC_CARD, picture: "https://example.com/cat.jpg" };
    const result = replacePlaceholders("{{picture}}", card);
    expect(result).toBe('<img src="https://example.com/cat.jpg" />');
  });

  it("leaves {{picture}} literal unchanged when picture === '{{picture}}'", () => {
    const card = { ...BASIC_CARD, picture: "{{picture}}" };
    const result = replacePlaceholders("{{picture}}", card);
    expect(result).toBe("{{picture}}");
  });

  it("produces an img tag with empty src when picture is empty string", () => {
    const result = replacePlaceholders("{{picture}}", EMPTY_CARD);
    expect(result).toBe('<img src="" />');
  });
});

describe("replacePlaceholders — type input", () => {
  it("replaces {{type:Reading}} with a text input", () => {
    const result = replacePlaceholders("{{type:Reading}}", BASIC_CARD);
    expect(result).toContain('<input type="text"');
    expect(result).toContain('id="typeans"');
  });

  it("uses the type tag as placeholder when no input-container is found", () => {
    const result = replacePlaceholders("{{type:Reading}}", BASIC_CARD);
    expect(result).toContain('placeholder="{{type:Reading}}"');
  });

  it("uses the input-container placeholder attribute when present", () => {
    const html =
      '<div id="input-container" placeholder="Type the reading">{{type:Reading}}</div>';
    const result = replacePlaceholders(html, BASIC_CARD);
    expect(result).toContain('placeholder="Type the reading"');
  });
});

describe("replacePlaceholders — combined template", () => {
  it("handles a full card template in one pass", () => {
    const template =
      "<p>{{term}} ({{reading}}) — {{translation}}</p><p>{{Tags}}</p>";
    const result = replacePlaceholders(template, BASIC_CARD);
    expect(result).toBe("<p>猫 (ねこ) — cat</p><p>animals, noun</p>");
  });
});

// ---------------------------------------------------------------------------
// processConditionalContent
// ---------------------------------------------------------------------------

describe("processConditionalContent — positive conditionals ({{#key}})", () => {
  it("shows content when the key exists in cardData", () => {
    const card = { reading: "ねこ" };
    const result = processConditionalContent(
      "{{#reading}}has reading{{/reading}}",
      card,
      false
    );
    expect(result).toBe("has reading");
  });

  it("hides content when the key is absent from cardData", () => {
    const result = processConditionalContent(
      "{{#reading}}has reading{{/reading}}",
      {},
      false
    );
    expect(result).toBe("");
  });

  it("hides content when the key value is falsy (empty string)", () => {
    const card = { reading: "" };
    const result = processConditionalContent(
      "{{#reading}}has reading{{/reading}}",
      card,
      false
    );
    expect(result).toBe("");
  });
});

describe("processConditionalContent — negative conditionals ({{^key}})", () => {
  it("shows content when the key is absent from cardData", () => {
    const result = processConditionalContent(
      "{{^reading}}no reading{{/reading}}",
      {},
      false
    );
    expect(result).toBe("no reading");
  });

  it("hides content when the key exists", () => {
    const card = { reading: "ねこ" };
    const result = processConditionalContent(
      "{{^reading}}no reading{{/reading}}",
      card,
      false
    );
    expect(result).toBe("");
  });
});

describe("processConditionalContent — nested conditionals", () => {
  it("processes nested positive conditional", () => {
    const card = { reading: "ねこ", translation: "cat" };
    const html =
      "{{#reading}}has reading: {{#translation}}and translation{{/translation}}{{/reading}}";
    expect(processConditionalContent(html, card, false)).toBe(
      "has reading: and translation"
    );
  });

  it("hides inner content when inner key is absent", () => {
    const card = { reading: "ねこ" };
    const html =
      "{{#reading}}has reading: {{#translation}}and translation{{/translation}}{{/reading}}";
    expect(processConditionalContent(html, card, false)).toBe("has reading: ");
  });

  it("processes nested negative inside positive", () => {
    const card = { reading: "ねこ" };
    const html =
      "{{#reading}}R:{{^translation}} no trans{{/translation}}{{/reading}}";
    expect(processConditionalContent(html, card, false)).toBe("R: no trans");
  });
});

describe("processConditionalContent — front-side blank fallback", () => {
  it("shows blank-card message when front is empty and isFrontSide is true", () => {
    const result = processConditionalContent("", {}, true);
    expect(result).toContain("The front of this card is blank.");
    expect(result).toContain("<a");
  });

  it("returns empty string on back side when content is blank", () => {
    const result = processConditionalContent("", {}, false);
    expect(result).toBe("");
  });

  it("does NOT show blank-card message when front has content", () => {
    const result = processConditionalContent("<p>hello</p>", {}, true);
    expect(result).toBe("<p>hello</p>");
    expect(result).not.toContain("The front of this card is blank.");
  });

  it("triggers blank-card message when all conditionals are false and it is the front", () => {
    const card = {};
    const html = "{{#reading}}has reading{{/reading}}";
    const result = processConditionalContent(html, card, true);
    expect(result).toContain("The front of this card is blank.");
  });
});

describe("processConditionalContent — multiple independent blocks", () => {
  it("handles two separate positive blocks independently", () => {
    const card = { reading: "ねこ" };
    const html =
      "{{#reading}}R{{/reading}}|{{#translation}}T{{/translation}}";
    expect(processConditionalContent(html, card, false)).toBe("R|");
  });

  it("shows both blocks when both keys are present", () => {
    const card = { reading: "ねこ", translation: "cat" };
    const html =
      "{{#reading}}R{{/reading}}|{{#translation}}T{{/translation}}";
    expect(processConditionalContent(html, card, false)).toBe("R|T");
  });
});
