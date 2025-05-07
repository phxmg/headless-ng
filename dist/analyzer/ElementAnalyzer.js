"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementAnalyzer = void 0;
class ElementAnalyzer {
    constructor(page) {
        this.page = page;
    }
    async analyzeCurrentPage() {
        return await this.page.evaluate(() => {
            // Helper to generate a unique selector for an element
            function generateSelector(element) {
                if (element.id)
                    return `#${element.id}`;
                if (element.className && typeof element.className === 'string') {
                    return `${element.tagName.toLowerCase()}.${element.className.split(' ').join('.')}`;
                }
                return element.tagName.toLowerCase();
            }
            const elements = [];
            // Find form elements
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                elements.push({
                    type: 'form',
                    selector: generateSelector(form),
                    inputs: Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
                        type: input.type || input.tagName.toLowerCase(),
                        name: input.name,
                        id: input.id,
                        selector: generateSelector(input)
                    }))
                });
            });
            // Find buttons and links
            const clickables = document.querySelectorAll('button, a, [role="button"]');
            clickables.forEach(el => {
                elements.push({
                    type: 'clickable',
                    text: el.textContent ? el.textContent.trim() : '',
                    selector: generateSelector(el)
                });
            });
            // Detect login forms using heuristics
            const possibleLoginForms = Array.from(forms).filter(form => {
                const inputs = form.querySelectorAll('input');
                const hasPasswordField = Array.from(inputs).some(input => input.type === 'password');
                const hasTextField = Array.from(inputs).some(input => input.type === 'text' || input.type === 'email');
                return hasPasswordField && hasTextField;
            });
            return {
                elements,
                possibleLoginForms: possibleLoginForms.map(form => generateSelector(form))
            };
        });
    }
}
exports.ElementAnalyzer = ElementAnalyzer;
//# sourceMappingURL=ElementAnalyzer.js.map