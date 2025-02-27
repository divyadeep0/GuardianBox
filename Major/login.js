// Initialize Supabase
const SUPABASE_URL = 'https://your-supabase-url.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'your-anon-key'; // Replace with your Supabase Anon Key
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Login with Email
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    document.getElementById('message').textContent = error ? `Error: ${error.message}` : "Login successful! Redirecting...";
    if (!error) window.location.href = "dashboard.html";
});
