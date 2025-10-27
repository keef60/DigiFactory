//Commit Update
const LoginTokenNew = ({ setIsLoggedIn, user, setReload, setSelectedDepartment }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [loginBool, setLoginBool] = useState(true);
  const [msalInstance, setMsalInstance] = useState(null);

  const msalConfig = {
    auth: {
      clientId: "8db3d71f-62b7-457d-b653-9f874424f89e",
      authority: "https://login.microsoftonline.com/a8585420-4088-4906-a78d-06b2693cc3aa",
      redirectUri: 'https://keef60.github.io/DigiFactory/oauth.html',
    },
  };

  const loginRequest = {
    scopes: ["openid", "profile", "User.Read", "offline_access", "Sites.Manage.All"],
  };

  const decodeJWT = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (err) {
      console.error('Token decoding failed:', err);
      return null;
    }
  };

  const handleLogin = async () => {
    try {
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      const account = loginResponse.account;
      msalInstance.setActiveAccount(account);

      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account,
      });

      const token = tokenResponse.accessToken;
      setAccessToken(token);
      sessionStorage.setItem('access_token', token);

      const decoded = decodeJWT(token);
      if (decoded) {
        sessionStorage.setItem('user_name', decoded.name || '');
        sessionStorage.setItem('user_email', decoded.upn || decoded.email || '');
      }

      setIsLoggedIn();
      setReload(prev => ({ ...prev, status: true }));
      setSelectedDepartment('Handles');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please try again.');
    }
  };

  const logOut = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      await msalInstance.logoutPopup();
      setAccessToken(null);
      sessionStorage.setItem('access_token', '');
      setReload(prev => ({ ...prev, status: true, tab: 'logout' }));
      setSelectedDepartment('Home');
    }
  };

  useEffect(() => {
    if (window.msal) {
      const instance = new window.msal.PublicClientApplication(msalConfig);
      setMsalInstance(instance);
    } else {
      console.error('MSAL library not loaded from CDN');
    }
  }, []);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('access_token');
    if (storedToken) {
      setAccessToken(storedToken);
    }

    try {
      if (user?.error?.code === "InvalidAuthenticationToken") {
        setLoginBool(false);
      } else if (user?.displayName) {
        setLoginBool(true);
        setReload(prev => ({ ...prev, status: true }));
        setSelectedDepartment('Handles');
      }
    } catch (err) {
      console.warn('Waiting for user data');
    }
  }, [user]);

  return (
    <div className="ui segment">
      {accessToken && loginBool ? (
        <div className="ui message">
          <h2 className="ui header">
            Centralized Automated Real-Time Reporting
            <div className="ui sub header">Streamlining Efficiency and Data-Driven Decisions</div>
          </h2>
          <h2>You are logged in.</h2>
          <button className="ui red button basic" onClick={logOut}>Logout</button>
        </div>
      ) : (
        <div className="ui raised very padded text container segment basic">
          <h2 className="ui header">Click here to log in with Microsoft</h2>
          <button className="ui blue button" onClick={handleLogin}>Login with Microsoft</button>
        </div>
      )}
      {error && <div className="ui red message">{error}</div>}
    </div>
  );
};


