import { Page } from 'puppeteer';

export interface AnalyzedElement {
  type: string;
  selector: string;
  [key: string]: any;
}

export interface AnalysisResult {
  elements: AnalyzedElement[];
  possibleLoginForms: string[];
}

export class ElementAnalyzer {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async analyzeCurrentPage(): Promise<AnalysisResult> {
    return await this.page.evaluate(() => {
      // Helper to generate a unique selector for an element
      function generateSelector(element: Element): string {
        if (element.id) return `#${element.id}`;
        if (element.className && typeof element.className === 'string') {
          return `${element.tagName.toLowerCase()}.${element.className.split(' ').join('.')}`;
        }
        return element.tagName.toLowerCase();
      }

      const elements: any[] = [];
      // Find form elements
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        elements.push({
          type: 'form',
          selector: generateSelector(form),
          inputs: Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
            type: (input as HTMLInputElement).type || input.tagName.toLowerCase(),
            name: (input as HTMLInputElement).name,
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
        const hasPasswordField = Array.from(inputs).some(input => (input as HTMLInputElement).type === 'password');
        const hasTextField = Array.from(inputs).some(input => (input as HTMLInputElement).type === 'text' || (input as HTMLInputElement).type === 'email');
        return hasPasswordField && hasTextField;
      });
      return {
        elements,
        possibleLoginForms: possibleLoginForms.map(form => generateSelector(form))
      };
    });
  }
} 