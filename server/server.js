
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for all routes (adjust origin as needed)
app.use(express.static(path.join(__dirname, '..'))); // Serve files from the root

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use environment secret
const usersFilePath = path.join(__dirname, 'users.json');
const feedbackFilePath = path.join(__dirname, 'feedback.json');

// --- Helper Functions ---
async function readFile(filePath, defaultReturn = null) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT' && defaultReturn !== null) {
            console.warn(`File not found: ${filePath}. Returning default.`);
            return defaultReturn;
        }
        console.error(`Error reading ${path.basename(filePath)}:`, error);
        throw error;
    }
}

async function writeFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Successfully wrote to ${filePath}`);
    } catch (error) {
        console.error(`Error writing to ${path.basename(filePath)}:`, error);
        throw error;
    }
}

function generateToken(user) {
    const payload = {
        userId: user.email,
        email: user.email,
        username: user.username
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('No token provided');
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

// --- Routes ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html')); // Serve index.html from the root
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    console.log('Registration attempt:', { username, email });

    if (!username || !email || !password) {
        console.warn('Missing registration fields');
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Server-side validation
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        const users = await readFile(usersFilePath, []);

        const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
            console.warn('Email already exists:', email);
            return res.status(409).json({ message: 'Email already exists.' });
        }

        const usernameExists = users.some(user => user.username.toLowerCase() === username.toLowerCase());
         if (usernameExists) {
             console.warn('Username already exists:', username);
             return res.status(409).json({ message: 'Username already exists.' });
         }


        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            username,
            email,
            password: hashedPassword
        };

        users.push(newUser);
        await writeFile(usersFilePath, users);

        console.log('User registered successfully:', email);
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed.' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt:', { email });

    if (!email || !password) {
        console.warn('Missing login fields');
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const users = await readFile(usersFilePath, []);
        const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            console.warn('Invalid credentials - email not found:', email);
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.warn('Invalid credentials - password mismatch:', email);
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = generateToken(user);
        console.log('Login successful:', email);
        res.status(200).json({
            message: 'Login successful.',
            token,
            username: user.username
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed.' });
    }
});

app.get('/profile', authenticateToken, (req, res) => {
    res.json({
        message: `Welcome, ${req.user.email}!`,
        user: req.user
    });
});

app.post('/feedback', authenticateToken, async (req, res) => {
    const {
        text
    } = req.body;
    const username = req.user.username;

    if (!text) {
        console.warn('Feedback text is required');
        return res.status(400).json({
            message: 'Feedback text is required.'
        });
    }

    try {
        const feedback = await readFile(feedbackFilePath, {});
        feedback[username] = {
            text
        }; // Overwrite existing feedback
        await writeFile(feedbackFilePath, feedback);

        console.log('Feedback submitted successfully by:', username);
        res.status(201).json({
            message: 'Feedback submitted successfully.'
        });
    } catch (error) {
        console.error('Feedback submission error:', error);
        res.status(500).json({
            message: 'Feedback submission failed.'
        });
    }
});

app.get('/feedback', async (req, res) => {
    try {
        const feedback = await readFile(feedbackFilePath, {});
        res.status(200).json(feedback);
    } catch (error) {
        console.error('Error reading feedback:', error);
        res.status(500).json({
            message: 'Failed to read feedback.'
        });
    }
});

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(500).json({
        message: "An unexpected error occurred."
    });
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
