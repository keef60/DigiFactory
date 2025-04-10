const { useEffect, useRef, useState } = React

const LoginTokenNew = ({ setIsLoggedIn, isLoggedIn }) => {

  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [tokenInput, setTokenInput] = useState('');

  const extractAccessToken = (url) => {
    const urlParams = new URLSearchParams(url.split('#')[1] || '');
    return urlParams.get('access_token');
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

  const startOAuthLogin = () => {
    const tenant = "a8585420-4088-4906-a78d-06b2693cc3aa"; // Replace with your tenant ID
    const clientId = "8db3d71f-62b7-457d-b653-9f874424f89e"; // Replace with your client ID
    const redirectUri = 'http://localhost'; // Replace with your redirect URI

    const scopes = 'Sites.Read.All';
    const responseType = 'token';
    const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}&scope=${scopes}`;

    window.open(authUrl, '_blank', 'width=600,height=400,scrollbars=yes');
  };

  useEffect(() => {
    const storedToken = sessionStorage.getItem('access_token');
    if (storedToken) {
      setAccessToken(storedToken);
    }
  }, []);

  return (
    <div className="ui segment">
      {accessToken && isLoggedIn ? (
        <div className="ui message">
          <h2 className="ui header">
            Centralized Automated Real-Time Reporting
            <div className="ui sub header">Streamlining Efficiency and Data-Driven Decisions</div>
          </h2>
          <h2>You are logged in.</h2>
          <button
            className="ui red button basic"
            onClick={() => setAccessToken(null)}
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


