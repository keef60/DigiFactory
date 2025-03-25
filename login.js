const { useState, useEffect } = React;

const LoginToken = (props) => {
    const {getMe} = props;
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
            getMe()      
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

    return React.createElement('div', {className:'ui segment'},
        accessToken ? (
            React.createElement('div', { className: 'ui message' },
                 React.createElement('h2', { className: ' ui header' },"Centralized Automated Real-Time Reporting", React.createElement('div',{className:'ui sub header'},'Streamlining Efficiency and Data-Driven Decisions')),
                React.createElement('h2', null, 'You are logged in.'),   
                

                React.createElement('button', { className: 'ui red button basic', onClick: () => setAccessToken(null) }, 'Logout')
            )
        ) : (
            React.createElement('div', { id: 'loginSection', className: 'ui raised very padded text container segment basic' },
                React.createElement('h2', { className: 'ui header' }, 'Click here to log in and get your token.'),
                React.createElement('button', { className: 'ui blue button', onClick:  startOAuthLogin }, 'Get Access Token'),
                React.createElement('h3', null, 'Manually paste your access token URL below:'),
                React.createElement('div', { className: 'ui action input fluid' },
                    React.createElement('input', {
                        type: 'text',
                        value: tokenInput,
                        onChange: (e) => setTokenInput(e.target.value),
                        placeholder: 'Paste the URL containing your access token here'
                    }),
                    React.createElement('button', { className: 'ui button', onClick: handleTokenSubmit }, 'Submit Token')
                )
            )
        ),
        error && React.createElement('div', { className: 'ui red message' }, error)
    );
};

export default LoginToken;
