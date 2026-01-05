import React, { useState } from "react";
import { Modal, Tab, Nav, Button, Form } from "react-bootstrap";
import cookieImage from '../../public/img/cookie.png'; // Import the cookie image
import "../../css/cookie.css"; // Make sure to import your custom CSS styles

const CookieConsent = ({ onAccept, onRefuse, onCustomize }) => {
    const [activeKey, setActiveKey] = useState('consent');
    const [cookies, setCookies] = useState({
        necessary: true,
        preferences: false,
        statistics: false,
        marketing: false,
    });

    const handleCheckboxChange = (event) => {
        setCookies({ ...cookies, [event.target.name]: event.target.checked });
    };

    const handleCustomizeClick = () => {
        setActiveKey('details');
    };

    const handleAllowSelectionClick = () => {
        onCustomize(cookies);
    };

   const cookieDescriptions = {
        necessary: " help make a website usable by enabling basic functions like page navigation and access to secure areas of the website. The website cannot function properly without these cookies.",
        preferences: " enable a website to remember information that changes the way the website behaves or looks, like your preferred language or the region that you are in.",
        statistics: " help website owners to understand how visitors interact with websites by collecting and reporting information anonymously.",
        marketing: " are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third-party advertisers.",
    };

    return (
    <div className="cookie-consent-modal">
        <Modal show={true} centered size="lg">
            <Modal.Header  className="flex-row justify-content-around">
                <Modal.Title>
                    <img src={cookieImage} alt="Cookie" className="cookie-logo"/>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
                    <Nav variant="pills" className="flex-row justify-content-around">
                        <Nav.Item>
                            <Nav.Link eventKey="consent">Consent</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="details">Details</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="about">About</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    <hr></hr>
                    <Tab.Content>
                        <Tab.Pane eventKey="consent">
                            <p><strong>This website uses cookies</strong></p>
                               <p>We use cookies to analyse the traffic on our website and use the findings from such analyses to improve the user experience. On certain pages we also use, after you have given your consent, cookies to personalise content, emails and ads, but only with your consent. You can allow installation of all cookies on your device or allow necessary cookies only.</p>

                        </Tab.Pane>
                        <Tab.Pane eventKey="details">
                           <Form>
                                {Object.keys(cookies).map((key) => (
                                    <div key={key}>
                                        <Form.Check
                                            type="checkbox"
                                            id={`cookie-${key}`}
                                            label={`Allow ${key.charAt(0).toUpperCase() + key.slice(1)} cookies`}
                                            name={key}
                                            checked={cookies[key]}
                                            onChange={handleCheckboxChange}
                                            disabled={key === 'necessary'}
                                        />
                                        <p></p>
                                        <p><strong>{`${key.charAt(0).toUpperCase() + key.slice(1)} Cookies`}</strong> {cookieDescriptions[key]}</p>
                                            <hr></hr>
                                    </div>
                                ))}
                            </Form>
                        </Tab.Pane>
                        <Tab.Pane eventKey="about">
                                                  <p><strong>Information on what cookies are and how they are used.</strong></p>
                                                   <p>Cookies are small text files that can be used by websites to make a user's experience more efficient.</p>

                                                   <p>The law states that we can store cookies on your device if they are strictly necessary for the operation of this site. For all other types of cookies we need your permission.</p>

                                                   <p>This site uses different types of cookies. Some cookies are placed by third party services that appear on our pages.</p>

                                                   <p>You can at any time change or withdraw your consent from the Cookie Declaration on our website.</p>

                                                   <p>Learn more about who we are, how you can contact us and how we process personal data in our  site</p>

                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
            <Modal.Footer >
                {activeKey === 'consent' || activeKey === 'about'? (
                    <div >
                        <Button variant="secondary" onClick={onRefuse}  className="button-spacing">Deny</Button>
                        <Button variant="info" onClick={handleCustomizeClick}  className="button-spacing">Customise</Button>
                        <Button variant="primary" onClick={onAccept}>Allow All</Button>
                    </div>
                ) : (
                    <div>
                        <Button variant="secondary" onClick={onRefuse}  className="button-spacing">Deny</Button>
                        <Button variant="info" onClick={handleAllowSelectionClick}  className="button-spacing">Allow Selection</Button>
                        <Button variant="primary" onClick={onAccept}>Allow All</Button>
                    </div>
                )}
            </Modal.Footer>
        </Modal>
        </div>
    );
};

export default CookieConsent;