const express = require('express');

module.exports = function setupProxy(app) {
    if (!app) {
        return;
    }

    const analyzeHandler = require('../api/analyze');

    app.use('/api/analyze', express.json({ limit: '2mb' }));
    app.use('/api/analyze', (req, res) => analyzeHandler(req, res));
};
