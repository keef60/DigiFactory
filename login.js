const LoginTokenNew = ({ setIsLoggedIn, user, setReload,setSelectedDepartment }) => {

  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [loginBool, setLoginBool] = useState(true);


  const extractAccessToken = (url) => {

    // First try to extract access_token from hash (implicit flow)
    const hashParams = new URLSearchParams(url.split('#')[1] || '');
    const accessToken = hashParams.get('access_token');
    if (accessToken) {
      setReload(prev => ({ ...prev, status: true }))
      return accessToken;
    }

    // If no access_token, try to extract code from query string (auth code flow)
    const queryParams = new URLSearchParams(url.split('?')[1] || '');
    return queryParams.get('code'); // This is the authorization code


  };

  const handleTokenSubmit = () => {
    const tokenFromUrl = extractAccessToken(tokenInput);
    if (tokenFromUrl) {
      setAccessToken(tokenFromUrl);
      sessionStorage.setItem('access_token', tokenFromUrl);
      setIsLoggedIn();
    } else {
      setError('Please enter a valid URL containing the access token');
    }
  };
  const startOAuthLoginOffline = () => {
    const tenant = "a8585420-4088-4906-a78d-06b2693cc3aa"; // Replace with your tenant ID
    const clientId = "8db3d71f-62b7-457d-b653-9f874424f89e"; // Replace with your client ID
    const redirectUri = 'http://localhost'; // Replace with your redirect URI

    const scopes = 'Sites.Read.All offline_access'; // Add offline_access scope
    const responseType = 'code'; // Must use "code" to get refresh token
    const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}`;

    window.open(authUrl, '_blank', 'width=600,height=400,scrollbars=yes');
  };

  const startOAuthLogin = () => {
    const tenant = "a8585420-4088-4906-a78d-06b2693cc3aa"; // Replace with your tenant ID
    const clientId = "8db3d71f-62b7-457d-b653-9f874424f89e"; // Replace with your client ID
    const redirectUri = 'http://localhost'; // Replace with your redirect URI

    const scopes = 'Sites.Manage.All';
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
          <h3>Manually paste your access token URL below:</h3>
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
          </div>
        </div>
      )}
      {error && <div className="ui red message">{error}</div>}
    </div>
  );
};


