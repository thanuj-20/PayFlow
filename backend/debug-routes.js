// Quick Route Test - Add this temporarily to server.js after all app.use() calls
// to see all registered routes

console.log('\n=== Registered Routes ===');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    // Routes registered directly on the app
    console.log(`${Object.keys(middleware.route.methods)[0].toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    // Router middleware
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        const path = middleware.regexp.source
          .replace('\\/?', '')
          .replace('(?=\\/|$)', '')
          .replace(/\\\//g, '/')
          .replace('^', '');
        console.log(`${Object.keys(handler.route.methods)[0].toUpperCase()} ${path}${handler.route.path}`);
      }
    });
  }
});
console.log('========================\n');
