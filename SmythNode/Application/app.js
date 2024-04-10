const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();



// Serve static files (CSS, images, etc.) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL database connection configuration
const pool = new Pool({
    user: 'docker',
    host: 'smythnode-postgres-1',
    database: 'docker',
    password: 'docker',
    port: '5432'
});

module.exports = pool;

// Middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
app.get('/', (req, res) => {
    console.log('Request received for root route.');
    const filePath = 'public/index.html';
    console.log('Resolved file path:', filePath);
    res.sendFile(filePath);
});

app.get('/register', (req, res) => {
    console.log('Request received for register route.');
    const filePath = 'public/register.html';
    console.log('Resolved file path:', filePath);
    res.sendFile(filePath);
});

app.get('/signin', (req, res) => {
    console.log('Request received for register route.');
    const filePath = 'public/signin.html';
    console.log('Resolved file path:', filePath);
    res.sendFile(filePath);
});

app.get('/addevent', (req, res) => {
    console.log('Request received for register route.');
    const filePath = 'public/addevent.html';
    console.log('Resolved file path:', filePath);
    res.sendFile(filePath);
});


// Endpoint for handling login form submission
app.post('/login', async function (req, res) {
    const { username, password } = req.body;

    try {
        // Query the database for the user
        const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);

        if (result.rows.length === 0) {
            res.status(401).send('Invalid details'); // If no matching user found
        } else {
            res.redirect('/membershome.html'); // Redirect if login is successful
        }
    } catch (error) {
        console.error('Error executing login query:', error);
        res.status(500).send('Internal server error');
    }
});


// Handle POST request for sign-up
app.post('/signup', async function (req, res) {
    const {first_name, last_name, username, password, email} = req.body;

    try {
        const query = `
            INSERT INTO users (first_name, last_name, username, password, email)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await pool.query(query, [first_name, last_name, username, password, email]);
        res.status(200).send({ message: 'User signed up successfully' });
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).send({ message: 'Failed to sign up user' });
    }
});

// Define route to retrieve data from events table
app.get('/events', async (req, res) => {
    try {
        const events = await pool.query('SELECT event_name, event_date, time, event_description, venue_name FROM events');
        res.json(events.rows); // Send events data as JSON response
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Handle POST request for adding data to events table
app.post('/create-event', async function (req, res) {
    const { event_name, event_date, venue_name, event_description, time } = req.body;

    try {
        // Perform any necessary validation here

        // Insert the new event into the database
        const query = `
            INSERT INTO events (event_name, event_date, venue_name, event_description, time)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await pool.query(query, [event_name, event_date, venue_name, event_description, time]);

        res.status(200).send({ message: 'Event created successfully' });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).send({ message: 'Failed to create event' });
    }
});




// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});