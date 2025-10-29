//Commit Update
const LoginTokenNew = ({ setIsLoggedIn, user, setReload,setSelectedDepartment }) => {

  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [loginBool, setLoginBool] = useState(true);


  const extractTokenData = (url) => {
  const hashString = url.split('#')[1] || '';
  const hashParams = new URLSearchParams(hashString);

  const tokenData = {};
  for (const [key, value] of hashParams.entries()) {
    tokenData[key] = value;
  }

  return tokenData;
};

const decodeJWT = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT', error);
    return null;
  }
};

const handleTokenSubmit = (url) => {
  const tokenData = extractTokenData(url);

  if (tokenData.access_token) {
    setAccessToken(tokenData.access_token);
    sessionStorage.setItem('access_token', tokenData.access_token);

    // ✅ Optionally decode and store user info
    const decoded = decodeJWT(tokenData.access_token);
    if (decoded) {
      console.log('Decoded Token:', decoded);
      sessionStorage.setItem('user_name', decoded.name || '');
      sessionStorage.setItem('user_email', decoded.upn || decoded.email || '');
    }

    // Optional: save other fields like scope, token_type
    for (const [key, value] of Object.entries(tokenData)) {
      sessionStorage.setItem(key, value);
    }

    setIsLoggedIn();
    location.reload();
  } else {
    setError('No access token found in the provided URL.');
  }
};

  const handleTokenSubmitOld = (url) => {
  const tokenData = extractTokenData(url);

  if (tokenData.access_token) {
    setAccessToken(tokenData.access_token);
    sessionStorage.setItem('access_token', tokenData.access_token);
    
    // Optional: store other tokenData values if needed
    sessionStorage.setItem('token_type', tokenData.token_type || '');
    sessionStorage.setItem('expires_in', tokenData.expires_in || '');
    sessionStorage.setItem('scope', tokenData.scope || '');

    setIsLoggedIn();
    location.reload();
  } else {
    setError('No access token found in the provided URL.');
  }
};


  

  const startOAuthLogin = () => {
  const tenant = "a8585420-4088-4906-a78d-06b2693cc3aa";
  const clientId = "8db3d71f-62b7-457d-b653-9f874424f89e";
  const redirectUri = ['http://127.0.0.1:3000/oauth.html','https://keef60.github.io/DigiFactory/oauth.html'];

  const scopes = "openid profile User.Read offline_access Sites.Manage.All";
  const responseType = 'token';
  const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri[1]}&scope=${encodeURIComponent(scopes)}`;

  const popup = window.open(authUrl, '_blank', 'width=600,height=400,scrollbars=yes');

  const handleMessage = (event) => {
    if (event.origin !== window.location.origin) return;

    const { data } = event;
    if (data.type === 'oauth_callback' && data.url) {
      handleTokenSubmit(data.url); // ✅ Use the passed URL directly
      popup.close();
      window.removeEventListener('message', handleMessage);
    }
  };

  window.addEventListener('message', handleMessage);
};


  const startOAuthLogin1 = () => {
    const tenant = "a8585420-4088-4906-a78d-06b2693cc3aa"; // Replace with your tenant ID
    const clientId = "8db3d71f-62b7-457d-b653-9f874424f89e"; // Replace with your client ID
    const redirectUri = 'http://localhost'; // Replace with your redirect URI

    const scopes = "openid profile User.Read offline_access Sites.Manage.All";

    //const scopes = 'Sites.Manage.All';
    const responseType = 'token';
    const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}&scope=${scopes}`;

    
    window.open(authUrl, '_blank', 'width=600,height=400,scrollbars=yes');
  };
  const logOut = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      setReload(prev => ({ ...prev, status: true, tab:'logout' })); // e.g., call logout handler
      sessionStorage.setItem('access_token', '');
      setAccessToken(null)
      setSelectedDepartment('Home');
    }

  }

  useEffect(() => {
    try {
      if (user.error.code === "InvalidAuthenticationToken") {
        setLoginBool(false);
      } else if (user.displayName !== '') {
        setReload(prev => ({ ...prev, status: true }));
        setLoginBool(true);
        setSelectedDepartment('Handles')
      }
    } catch (error) {
      console.warn('Waiting for user data')
    }

  }, [user, loginBool])

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
          <button
            className="ui red button basic"
            onClick={() => logOut()}
          >
            Logout
          </button>
        </div>
      ) : (
        <div id="loginSection" className="ui raised very padded text container segment basic">
          <h2 className="ui header">Click here to log in and get your token.</h2>
          <button
            className="ui blue button"
            onClick={startOAuthLogin}
          >
            Get Access Token
          </button>
         {/*  <h3>Manually paste your access token URL below:</h3>
          <div className="ui action input fluid">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste the URL containing your access token here"
            />
            <button
              className="ui button"
              onClick={handleTokenSubmit}
            >
              Submit Token
            </button>
          </div> */}
        </div>
      )}
      {error && <div className="ui red message">{error}</div>}
    </div>
  );
};
