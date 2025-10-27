//Commit Update
const LoginTokenNew = ({ setIsLoggedIn, user, setReload, setSelectedDepartment }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [loginBool, setLoginBool] = useState(true);

  // PKCE helpers
  function base64urlEncode(str) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return base64urlEncode(digest);
  }

  // Generate a random string for code verifier
  function generateCodeVerifier() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return base64urlEncode(array);
  }

  useEffect(() => {
  function handleMessage(event) {
    if (event.data?.type === "pkce-auth-code") {
      const code = event.data.code;

      // Now exchange the code for tokens (via backend or fetch)
      console.log("Received code:", code);
alert(code)
      // You can now proceed to exchange this code with the token endpoint
      // Or send to your server if doing it securely there
    }
  }

  window.addEventListener("message", handleMessage);

  return () => window.removeEventListener("message", handleMessage);
}, []);

  // Start OAuth login with PKCE in popup
  const startOAuthLoginPKCE = async () => {
    const tenant = "a8585420-4088-4906-a78d-06b2693cc3aa";
    const clientId = "8db3d71f-62b7-457d-b653-9f874424f89e";
    //const redirectUri = "http://localhost/pkce-callback"; // Make sure this is registered & able to postMessage back!
    const redirectUri = "http://127.0.0.1:3000/pkce-callback.html"; // Make sure this is registered & able to postMessage back!

    const scopes = "openid profile User.Read offline_access Sites.Manage.All";

    const codeVerifier = generateCodeVerifier();
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?` +
      `client_id=${clientId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_mode=query` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256`;

    // Open popup
    const width = 600;
    const height = 700;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    const popup = window.open(authUrl, 'oauth2-popup', `width=${width},height=${height},top=${top},left=${left}`);

    // Listen for message from popup window (with auth code)
    function receiveMessage(event) {
      if (event.origin !== window.location.origin) return; // validate origin
      if (event.data.type === 'oauth-code' && event.data.code) {
        popup.close();
        exchangeCodeForToken(event.data.code);
        window.removeEventListener('message', receiveMessage);
      }
    }

    window.addEventListener('message', receiveMessage, false);
  };

  // Exchange authorization code for tokens
  const exchangeCodeForToken = async (code) => {
    const tenant = "a8585420-4088-4906-a78d-06b2693cc3aa";
    const clientId = "8db3d71f-62b7-457d-b653-9f874424f89e";
    //const redirectUri = "http://localhost/pkce-callback";
    const redirectUri = "http://127.0.0.1:3000/pkce-callback.html";
    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');

    const tokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;

    const body = new URLSearchParams();
    body.append('client_id', clientId);
    body.append('grant_type', 'authorization_code');
    body.append('code', code);
    body.append('redirect_uri', redirectUri);
    body.append('code_verifier', codeVerifier);

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(`Token exchange failed: ${errorData.error_description || 'Unknown error'}`);
        return;
      }

      const tokenResponse = await response.json();
      setAccessToken(tokenResponse.access_token);
      sessionStorage.setItem('access_token', tokenResponse.access_token);
      setIsLoggedIn();
      setReload(prev => ({ ...prev, status: true }));
      setSelectedDepartment('Handles');
      setLoginBool(true);
    } catch (err) {
      setError(`Token exchange error: ${err.message}`);
    }
  };

  const logOut = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      setReload(prev => ({ ...prev, status: true, tab: 'logout' }));
      sessionStorage.removeItem('access_token');
      setAccessToken(null);
      setSelectedDepartment('Home');
      setLoginBool(false);
    }
  };

  useEffect(() => {
    try {
      if (user.error?.code === "InvalidAuthenticationToken") {
        setLoginBool(false);
      } else if (user.displayName) {
        setReload(prev => ({ ...prev, status: true }));
        setLoginBool(true);
        setSelectedDepartment('Handles');
      }
    } catch (error) {
      console.warn('Waiting for user data');
    }
  }, [user, setReload, setSelectedDepartment]);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('access_token');
    if (storedToken) {
      setAccessToken(storedToken);
    }
  }, []);

  return (
    <div className="ui segment">
      {accessToken && loginBool ? (
        <div className="ui message">
          <h2 className="ui header">
            Centralized Automated Real-Time Reporting
            <div className="ui sub header">Streamlining Efficiency and Data-Driven Decisions</div>
          </h2>
          <h2>You are logged in.</h2>
          <button className="ui red button basic" onClick={logOut}>
            Logout
          </button>
        </div>
      ) : (
        <div id="loginSection" className="ui raised very padded text container segment basic">
          <h2 className="ui header">Click here to log in and get your token.</h2>
          <button className="ui blue button" onClick={startOAuthLoginPKCE}>
            Login with PKCE
          </button>
        </div>
      )}
      {error && <div className="ui red message">{error}</div>}
    </div>
  );
};

