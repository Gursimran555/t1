require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve HTML & JS files

// ✅ Secure Signup (Stores user in DB with Service Role Key)
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return res.status(400).json({ message: error.message });

    // Insert user into "users" table using Service Role Key
    const { error: dbError } = await supabaseAdmin
        .from('users')
        .insert([{ email, password }]);

    if (dbError) return res.status(400).json({ message: dbError.message });

    res.json({ message: 'Signup successful! Check your email for verification.' });
});

// ✅ Secure Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(400).json({ message: error.message });

    res.json({ message: 'Login successful!', user: data });
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
