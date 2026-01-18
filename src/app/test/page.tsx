'use client';

export default function TestPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#020205',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <h1 style={{ fontSize: '2rem' }}>Tip2Post</h1>
            <p>Mobile Test - If you see this, the app works!</p>
            <a href="/" style={{ color: '#7B3FE4', textDecoration: 'underline' }}>
                Back to Home
            </a>
        </div>
    );
}
