import "./Header.scss";

function Header({ isRecording }) {
  return (
    <section className="header">
      <div className="footer__name-container">
        <p className="header__name">OneVoice</p>
      </div>
      <div className="header__linebreak"></div>
      {isRecording ? (
        <>
          <span className="header__soundwave"></span>
          <span className="header__soundwave"></span>
          <span className="header__soundwave"></span>
          <span className="header__soundwave"></span>
          <span className="header__soundwave"></span>
        </>
      ) : (
        ""
      )}

      <div className="header__linebreak"></div>
    </section>
  );
}

export default Header;
