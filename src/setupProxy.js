const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
	app.use(
		'/callback',
		createProxyMiddleware({
			target: 'http://localhost:8972/callback',
			changeOrigin: true,
		})
	);
};