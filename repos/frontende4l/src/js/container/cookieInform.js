import React from "react";
import { Button, Dropdown,NavDropdown,Nav } from "react-bootstrap";
import cookieImage from '../../public/img/cookieinformed.png'; // Ensure the path is correct
import "../../css/cookie.css"; // Ensure the path is correct
import { Trans, useTranslation } from "react-i18next";

const CookieInform = ({ onAccept, isVisible }) => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };
    return (
        <div className={`cookie-inform-bar ${isVisible ? 'visible' : 'hidden'}`}>
            <img src={cookieImage} alt="Cookie" className="cookie-inform-image" />
            <div className="cookie-inform-text">
                <b>{i18n.t("home.cookiesinfo")}</b><br/>
                <Trans i18nKey="home.cookiesdesc"><a href='https://secureprivacy.ai/blog/luxembourg-dpa-cookie-guidelines' target="_blank"/></Trans>
            </div>
            <Nav className="justify-content-start">
                <NavDropdown style={{marginTop: "-2px"}} title={i18n.language.toUpperCase()}
                             id="basic-nav-dropdown">
                    <NavDropdown.Item onClick={() => changeLanguage("en")}>EN</NavDropdown.Item>
                    <NavDropdown.Item onClick={() => changeLanguage("fr")}>FR</NavDropdown.Item>
                    <NavDropdown.Item onClick={() => changeLanguage("de")}>DE</NavDropdown.Item>
                    <NavDropdown.Item onClick={() => changeLanguage("lu")}>LU</NavDropdown.Item>
                </NavDropdown>
            </Nav>
            <Button onClick={onAccept} className="btn-accept">Okay</Button>
        </div>
    );
};

export default CookieInform;