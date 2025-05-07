"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGenerator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
class ReportGenerator {
    constructor(resultManager) {
        this.resultManager = resultManager;
    }
    async generateHTMLReport(runDir) {
        const results = this.resultManager.loadResults(path_1.default.join(runDir, 'results.json'));
        if (!results)
            throw new Error('Results not found');
        const screenshots = fs_1.default.readdirSync(runDir)
            .filter(file => file.endsWith('.png'))
            .map(file => ({
            name: file.replace('.png', ''),
            path: path_1.default.join(runDir, file)
        }));
        let html = `
<!DOCTYPE html>
<html>
<head>
<title>Automation Report - ${new Date().toLocaleString()}</title>
<style>
body { font-family: Arial, sans-serif; margin: 20px; }
.header { background: #f5f5f5; padding: 10px; margin-bottom: 20px; }
.success { color: green; }
.error { color: red; }
.screenshot { max-width: 800px; margin: 10px 0; border: 1px solid #ddd; }
.action { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
</style>
</head>
<body>
<div class="header">
<h1>Automation Report</h1>
<p>Generated: ${new Date().toLocaleString()}</p>
<p>Sequence: ${results.sequenceName || 'Unknown'}</p>
</div>
<h2>Summary</h2>
<p>Total Actions: ${results.length}</p>
<p>Successful: ${results.filter((r) => r.type === 'success').length}</p>
<p>Failed: ${results.filter((r) => r.type === 'error').length}</p>
<h2>Actions</h2>
`;
        results.forEach((result, index) => {
            html += `
<div class="action">
<h3>${index + 1}. ${result.action.type} ${result.type === 'success' ? '✓' : '✗'}</h3>
<p class="${result.type}">Status: ${result.type}</p>
<p>Timestamp: ${result.timestamp}</p>
<p>Details: ${JSON.stringify(result.action)}</p>
${result.type === 'error' ? `<p class="error">Error: ${result.error}</p>` : ''}
</div>
`;
        });
        html += '<h2>Screenshots</h2>';
        for (const screenshot of screenshots) {
            const imgData = fs_1.default.readFileSync(screenshot.path);
            const base64Image = Buffer.from(imgData).toString('base64');
            html += `
<div>
<h3>${screenshot.name}</h3>
<img class="screenshot" src="data:image/png;base64,${base64Image}" />
</div>
`;
        }
        html += `
</body>
</html>
`;
        const reportPath = path_1.default.join(runDir, 'report.html');
        fs_1.default.writeFileSync(reportPath, html);
        return reportPath;
    }
    async generatePDFReport(runDir) {
        const results = this.resultManager.loadResults(path_1.default.join(runDir, 'results.json'));
        if (!results)
            throw new Error('Results not found');
        const screenshots = fs_1.default.readdirSync(runDir)
            .filter(file => file.endsWith('.png'))
            .map(file => ({
            name: file.replace('.png', ''),
            path: path_1.default.join(runDir, file)
        }));
        const pdfPath = path_1.default.join(runDir, 'report.pdf');
        const doc = new pdfkit_1.default({ margin: 50 });
        doc.pipe(fs_1.default.createWriteStream(pdfPath));
        doc.fontSize(25).text('Automation Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
        doc.text(`Sequence: ${results.sequenceName || 'Unknown'}`);
        doc.moveDown();
        doc.fontSize(16).text('Summary');
        doc.fontSize(12).text(`Total Actions: ${results.length}`);
        doc.text(`Successful: ${results.filter((r) => r.type === 'success').length}`);
        doc.text(`Failed: ${results.filter((r) => r.type === 'error').length}`);
        doc.moveDown();
        doc.fontSize(16).text('Actions');
        doc.moveDown();
        results.forEach((result, index) => {
            doc.fontSize(14).text(`${index + 1}. ${result.action.type} ${result.type === 'success' ? '✓' : '✗'}`);
            doc.fillColor(result.type === 'success' ? 'green' : 'red')
                .fontSize(12)
                .text(`Status: ${result.type}`);
            doc.fillColor('black')
                .text(`Timestamp: ${result.timestamp}`);
            doc.text(`Details: ${JSON.stringify(result.action)}`);
            if (result.type === 'error') {
                doc.fillColor('red')
                    .text(`Error: ${result.error}`);
                doc.fillColor('black');
            }
            doc.moveDown();
        });
        doc.addPage();
        doc.fontSize(16).text('Screenshots', { align: 'center' });
        doc.moveDown();
        for (const screenshot of screenshots) {
            doc.fontSize(14).text(screenshot.name);
            doc.image(screenshot.path, { width: 500 });
            doc.moveDown();
        }
        doc.end();
        return pdfPath;
    }
    async generateCSVReport(runDir) {
        const results = this.resultManager.loadResults(path_1.default.join(runDir, 'results.json'));
        if (!results)
            throw new Error('Results not found');
        let csv = 'Index,Action Type,Status,Timestamp,Details,Error\n';
        results.forEach((result, index) => {
            const row = [
                index + 1,
                result.action.type,
                result.type,
                result.timestamp,
                JSON.stringify(result.action).replace(/"/g, '""'),
                result.error || ''
            ];
            csv += row.map(field => `"${field}"`).join(',') + '\n';
        });
        const csvPath = path_1.default.join(runDir, 'report.csv');
        fs_1.default.writeFileSync(csvPath, csv);
        return csvPath;
    }
    async generateJSONReport(runDir) {
        const results = this.resultManager.loadResults(path_1.default.join(runDir, 'results.json'));
        if (!results)
            throw new Error('Results not found');
        const jsonPath = path_1.default.join(runDir, 'report.json');
        fs_1.default.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
        return jsonPath;
    }
}
exports.ReportGenerator = ReportGenerator;
//# sourceMappingURL=ReportGenerator.js.map