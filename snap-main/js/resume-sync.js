(function () {
  'use strict';

  var sourcePath = '../LaTeX/sap586.tex';
  var aboutText;

  Array.from(document.querySelectorAll('#section-resume .resume-block')).some(function (block) {
    var heading = block.querySelector('h2');

    if (heading && heading.textContent.trim() === 'About') {
      aboutText = block.querySelector('p');
      return true;
    }

    return false;
  });

  if (!aboutText) {
    return;
  }

  function cleanLatex(text) {
    return text
      .replace(/\\&/g, '&')
      .replace(/\\text[a-zA-Z]+\s*\{([^{}]*)\}/g, '$1')
      .replace(/\\[a-zA-Z]+/g, '')
      .replace(/[{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function loadAboutText() {
    fetch(sourcePath + '?v=' + Date.now(), { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Unable to load the LaTeX resume source.');
        }
        return response.text();
      })
      .then(function (source) {
        var aboutSection = source.match(/\\section\s*\{\s*About\s*\}([\s\S]*?)(?=\n\s*\\section\b)/i);
        var aboutLines;

        if (!aboutSection) {
          throw new Error('The LaTeX About section was not found.');
        }

        aboutLines = Array.from(aboutSection[1].matchAll(/\\textsc\s*\{([^{}]*)\}/g))
          .map(function (match) {
            return cleanLatex(match[1]);
          })
          .filter(Boolean);

        if (aboutLines.length > 0) {
          aboutText.textContent = aboutLines.join(' ');
        }
      })
      .catch(function (error) {
        console.warn('Resume sync skipped:', error.message);
      });
  }

  loadAboutText();
  window.setInterval(loadAboutText, 2000);
}());