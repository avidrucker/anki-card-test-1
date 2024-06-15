const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the build folder
app.use('/anki-card-test-1', express.static(path.join(__dirname, 'build')));

// Start the server
const port = 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});