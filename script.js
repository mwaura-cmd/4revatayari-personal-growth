const canvas = document.getElementById("quoteCanvas");
const ctx = canvas.getContext("2d");

const quoteInput = document.getElementById("quoteInput");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const fontSelect = document.getElementById("fontSelect");
const sizeRange = document.getElementById("sizeRange");
const sizeValue = document.getElementById("sizeValue");
const boldToggle = document.getElementById("boldToggle");
const italicToggle = document.getElementById("italicToggle");
const lineHeightRange = document.getElementById("lineHeightRange");
const lineHeightValue = document.getElementById("lineHeightValue");
const spacingRange = document.getElementById("spacingRange");
const spacingValue = document.getElementById("spacingValue");
const alignSelect = document.getElementById("alignSelect");
const capsToggle = document.getElementById("capsToggle");
const underlineToggle = document.getElementById("underlineToggle");
const footerAlignSelect = document.getElementById("footerAlignSelect");
const footerXRange = document.getElementById("footerXRange");
const footerXValue = document.getElementById("footerXValue");
const footerYRange = document.getElementById("footerYRange");
const footerYValue = document.getElementById("footerYValue");
const textColorButtons = Array.from(
  document.querySelectorAll(".swatches[aria-label='Text color'] .swatch")
);
const bgColorButtons = Array.from(
  document.querySelectorAll(".swatches[aria-label='Background color'] .swatch")
);

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

// Branding text that is always drawn on the canvas.
const FOOTER_TEXT = "4revatayari";

// Style tuning knobs (adjust freely).
const STYLE = {
  background: "#ffffff",
  textColor: "#0b3d1a",
  fontFamily: '"Cormorant Garamond", serif',
  quoteFontSize: 72,
  quoteMinFontSize: 40,
  quoteFontWeight: "600",
  quoteFontWeightNormal: "600",
  quoteFontWeightBold: "700",
  quoteFontStyle: "normal",
  quoteLineHeight: 1.1,
  quoteLetterSpacing: -0.5,
  quoteAllCaps: false,
  quoteUnderline: false,
  textAlign: "left",
  quotePaddingX: 120,
  quotePaddingTop: 140,
  quotePaddingBottom: 140,
  footerFontSize: 34,
  footerFontWeight: "600",
  footerAlign: "right",
  footerX: 1000,
  footerY: 1290,
};

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

function formatValue(value, decimals, suffix) {
  const fixed = value.toFixed(decimals);
  const trimmed = fixed.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  return `${trimmed}${suffix}`;
}

function getQuoteFont(fontSize) {
  return `${STYLE.quoteFontStyle} ${STYLE.quoteFontWeight} ${fontSize}px ${STYLE.fontFamily}`;
}

function getTextX() {
  if (STYLE.textAlign === "left") {
    return STYLE.quotePaddingX;
  }
  if (STYLE.textAlign === "right") {
    return CANVAS_WIDTH - STYLE.quotePaddingX;
  }
  return CANVAS_WIDTH / 2;
}

function getLineStartX(lineWidth, drawX) {
  if (STYLE.textAlign === "left") {
    return drawX;
  }
  if (STYLE.textAlign === "right") {
    return drawX - lineWidth;
  }
  return drawX - lineWidth / 2;
}

function measureTextWithSpacing(text, fontSize) {
  ctx.font = getQuoteFont(fontSize);
  const baseWidth = ctx.measureText(text).width;
  if (text.length <= 1) {
    return baseWidth;
  }
  return baseWidth + (text.length - 1) * STYLE.quoteLetterSpacing;
}

function wrapText(text, maxWidth, fontSize) {
  ctx.font = getQuoteFont(fontSize);
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = measureTextWithSpacing(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function layoutQuote(text) {
  const maxWidth = CANVAS_WIDTH - STYLE.quotePaddingX * 2;
  const availableTop = STYLE.quotePaddingTop;
  const footerReserveTop = STYLE.footerY - STYLE.footerFontSize;
  let availableBottom = Math.min(
    CANVAS_HEIGHT - STYLE.quotePaddingBottom,
    footerReserveTop - STYLE.quotePaddingBottom
  );
  if (availableBottom < availableTop + 1) {
    availableBottom = availableTop + 1;
  }
  const availableHeight = availableBottom - availableTop;

  let fontSize = STYLE.quoteFontSize;
  let lines = wrapText(text, maxWidth, fontSize);
  let lineHeight = fontSize * STYLE.quoteLineHeight;
  let totalHeight = lines.length * lineHeight;

  while (totalHeight > availableHeight && fontSize > STYLE.quoteMinFontSize) {
    fontSize -= 2;
    lines = wrapText(text, maxWidth, fontSize);
    lineHeight = fontSize * STYLE.quoteLineHeight;
    totalHeight = lines.length * lineHeight;
  }

  const startY = availableTop + (availableHeight - totalHeight) / 2;

  return {
    lines,
    fontSize,
    lineHeight,
    startY,
    maxWidth,
  };
}

function drawCanvas(text) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Background.
  ctx.fillStyle = STYLE.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Quote.
  ctx.fillStyle = STYLE.textColor;
  const safeText = text.trim() || "Type your quote";
  const preparedText = STYLE.quoteAllCaps ? safeText.toUpperCase() : safeText;
  const layout = layoutQuote(preparedText);
  ctx.font = getQuoteFont(layout.fontSize);
  ctx.textAlign = STYLE.textAlign;
  ctx.textBaseline = "top";
  const drawX = getTextX();

  layout.lines.forEach((line, index) => {
    const y = layout.startY + index * layout.lineHeight;
    const lineWidth = measureTextWithSpacing(line, layout.fontSize);
    const startX = getLineStartX(lineWidth, drawX);

    if (STYLE.quoteLetterSpacing === 0) {
      ctx.fillText(line, drawX, y);
    } else {
      // Manual letter spacing for crisp tracking control.
      let currentX = startX;
      for (const char of line) {
        ctx.fillText(char, currentX, y);
        currentX += ctx.measureText(char).width + STYLE.quoteLetterSpacing;
      }
    }

    if (STYLE.quoteUnderline) {
      const underlineOffset = Math.max(6, layout.fontSize * 0.08);
      const underlineThickness = Math.max(2, layout.fontSize * 0.04);
      ctx.strokeStyle = STYLE.textColor;
      ctx.lineWidth = underlineThickness;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(startX, y + layout.fontSize + underlineOffset);
      ctx.lineTo(startX + lineWidth, y + layout.fontSize + underlineOffset);
      ctx.stroke();
    }
  });

  // Footer.
  ctx.font = `${STYLE.footerFontWeight} ${STYLE.footerFontSize}px ${STYLE.fontFamily}`;
  ctx.textAlign = STYLE.footerAlign;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(FOOTER_TEXT, STYLE.footerX, STYLE.footerY);
}

function updateStyleFromControls() {
  STYLE.fontFamily = fontSelect.value;
  STYLE.quoteFontSize = Number(sizeRange.value);
  STYLE.quoteMinFontSize = Math.max(32, Math.round(STYLE.quoteFontSize * 0.6));
  STYLE.quoteFontWeight = boldToggle.checked
    ? STYLE.quoteFontWeightBold
    : STYLE.quoteFontWeightNormal;
  STYLE.quoteFontStyle = italicToggle.checked ? "italic" : "normal";
  STYLE.quoteLineHeight = Number(lineHeightRange.value);
  STYLE.quoteLetterSpacing = Number(spacingRange.value);
  STYLE.quoteAllCaps = capsToggle.checked;
  STYLE.quoteUnderline = underlineToggle.checked;
  STYLE.textAlign = alignSelect.value;
  STYLE.footerAlign = footerAlignSelect.value;
  STYLE.footerX = Number(footerXRange.value);
  STYLE.footerY = Number(footerYRange.value);
  sizeValue.textContent = `${STYLE.quoteFontSize}px`;
  lineHeightValue.textContent = formatValue(STYLE.quoteLineHeight, 2, "x");
  spacingValue.textContent = formatValue(STYLE.quoteLetterSpacing, 1, "px");
  footerXValue.textContent = `${STYLE.footerX}px`;
  footerYValue.textContent = `${STYLE.footerY}px`;
}

function setActiveTextColor(color) {
  STYLE.textColor = color;
  textColorButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.color === color);
  });
}

function setActiveBackground(color) {
  STYLE.background = color;
  bgColorButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.color === color);
  });
}

function downloadImage() {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "quote.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }, "image/png");
}

async function init() {
  await document.fonts.ready;
  const activeTextSwatch =
    textColorButtons.find((button) => button.classList.contains("is-active")) ||
    textColorButtons[0];
  if (activeTextSwatch) {
    setActiveTextColor(activeTextSwatch.dataset.color);
  }

  const activeBgSwatch =
    bgColorButtons.find((button) => button.classList.contains("is-active")) ||
    bgColorButtons[0];
  if (activeBgSwatch) {
    setActiveBackground(activeBgSwatch.dataset.color);
  }
  updateStyleFromControls();
  drawCanvas(quoteInput.value);
}

generateBtn.addEventListener("click", () => {
  updateStyleFromControls();
  drawCanvas(quoteInput.value);
});

quoteInput.addEventListener("input", () => {
  drawCanvas(quoteInput.value);
});

fontSelect.addEventListener("change", () => {
  updateStyleFromControls();
  drawCanvas(quoteInput.value);
});

sizeRange.addEventListener("input", () => {
  updateStyleFromControls();
  drawCanvas(quoteInput.value);
});

boldToggle.addEventListener("change", () => {
  updateStyleFromControls();
  drawCanvas(quoteInput.value);
});

italicToggle.addEventListener("change", () => {
  updateStyleFromControls();
  drawCanvas(quoteInput.value);
});

lineHeightRange.addEventListener("input", () => {
  updateStyleFromControls();
  drawCanvas(quoteInput.value);
});

spacingRange.addEventListener("input", () => {
  updateStyleFromControls();
  drawCanvas(quoteInput.value);
});

alignSelect.addEventListener("change", () => {
  updateStyleFromControls();
  drawCanvas(quoteInput.value);
});

capsToggle.addEventListener("change", () => {
  updateStyleFromControls();
  drawCanvas(quoteInput.value);
});

underlineToggle.addEventListener("change", () => {
  updateStyleFromControls();
  drawCanvas(quoteInput.value);
});

textColorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTextColor(button.dataset.color);
    drawCanvas(quoteInput.value);
  });
});

bgColorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveBackground(button.dataset.color);
    drawCanvas(quoteInput.value);
  });
});

footerAlignSelect.addEventListener("change", () => {
  updateStyleFromControls();
  drawCanvas(quoteInput.value);
});

footerXRange.addEventListener("input", () => {
  updateStyleFromControls();
  drawCanvas(quoteInput.value);
});

footerYRange.addEventListener("input", () => {
  updateStyleFromControls();
  drawCanvas(quoteInput.value);
});

downloadBtn.addEventListener("click", downloadImage);

init();
