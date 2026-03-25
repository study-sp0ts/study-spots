import React, { useState } from 'react';
import './LoginSignup.css';

const LoginSignup = () => {
  const [rightPanelActive, setRightPanelActive] = useState(false);

  const handleSignUpClick = () => {
    setRightPanelActive(true);
  };

  const handleSignInClick = () => {
    setRightPanelActive(false);
  };

  return (
    <div className="login-page">
      <div className={`container ${rightPanelActive ? 'right-panel-active' : ''}`} id="container">
        <div className="form-container sign-up-container">
          <form action="#">
            <h1>Profil erstellen</h1>
            {/* <div className="social-container">
              <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
              <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
            </div> 
            <span>or use your email for registration</span> */}
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Passwort" />
            <button>Registrieren</button>
          </form>
        </div>
        <div className="form-container sign-in-container">
          <form action="#">
            <h1>Einloggen</h1>
            {/* <div className="social-container">
              <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
              <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
            </div> 
            <span>or use your account</span> */}
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Passwort" />
            <a href="#" style={{ color: '#666666' }}>Passwort vergessen?</a>
            <button>Einloggen</button>
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Wilkommen zurück!</h1>
              <p>Um auf alle Fuktionen zugriff zu haben, logge dich bitte mit deinen Anmeldedaten ein</p>
              <button className="ghost" onClick={handleSignInClick} id="signIn">Einloggen</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 id="h1up">Hallo, Freund!</h1>
              <p id="divup">Erzähl uns ein wenig über dich und starte unser gemeinsames Kapitel</p>
              <button className="ghost" onClick={handleSignUpClick} id="signUp">Registrieren</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;