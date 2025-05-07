const BrowserAutomation = require('./src/common/BrowserAutomation');

(async () => {
  const browserService = new BrowserAutomation();
  await browserService.launch();
  await browserService.goto('https://media.getitfree.us/admin/index.php');
  const title = await browserService.getTitle();
  console.log(title);

  // Wait for the login form (try a common selector)
  await browserService.waitForSelector('input[name="username"]');
  await browserService.waitForSelector('input[name="password"]');

  // Take a screenshot of the login page
  await browserService.screenshot('admin-login.png');
  // Optionally, type into the username field (demo)
  // await browserService.type('input[name="username"]', 'demo');
  // await browserService.type('input[name="password"]', 'demo');
  // await browserService.click('input[type="submit"]');

  await browserService.close();
})(); 