import React from "react";
import Container from "react-bootstrap/Container";
import {Button, Modal, Form, Col, Row} from 'react-bootstrap';
import ProgressBar from "react-bootstrap/ProgressBar";
import { connect } from "react-redux";
import { hideNavButton, showNavButton } from "../action/navAction";
import { setSeminarInSession } from "../action/answerAction";
import { seminarsGetRequest,validateSeminarCode } from "../action/seminarAction";
import { Trans } from "react-i18next";
import { Redirect } from "react-router-dom";
import { Link } from "react-router-dom";
import i18n from "../i18n";
import ws1 from '../../public/img/workshop/ws1.jpeg'
import ws2 from '../../public/img/workshop/ws2.jpeg'
import ws3 from '../../public/img/workshop/ws3.jpeg'
import ws4 from '../../public/img/workshop/ws4.jpeg'

// Add this CSS import or include the styles in your CSS file
import '../../css/SeminarCarousel.css';

@connect((store) => {
    return {
        questionnaireReducer: store.questionnaireReducer,
        answerReducer: store.answerReducer,
        seminarReducer: store.seminarReducer,
    };
})
export class SeminarHome extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        seminar_access_code: '',
        i_have_code: false,
        redirect: false,
        error: '',
        isSmallScreen: !window.matchMedia("(min-width: 768px)").matches,
        activeSlide: 1,
        batteryStatus: 'neutral', // 'neutral', 'valid', 'error', 'charged'
        isValidCode: false,
        isChecking: false,
        successMessage: '',
        isGiggling: false // Add giggling state
      }
      this.batteryRef = React.createRef();
      this.giggleTimeout = null; // Store timeout reference
    }

    componentDidMount() {
      this.props.dispatch(showNavButton());
      // Start eye tracking
      this.startEyeTracking();
      document.documentElement.setAttribute("data-theme", localStorage.getItem("kid")=="false"?  "adult-invert": "kid");
    }


    handleBatteryClick = () => {
      // Clear any existing giggle timeout
      if (this.giggleTimeout) {
        clearTimeout(this.giggleTimeout);
      }

      // Set giggling state
      this.setState({ isGiggling: true });

      // Play giggle sound if available (optional)
      this.playGiggleSound();

      // Auto-remove giggling state after animation completes
      this.giggleTimeout = setTimeout(() => {
        this.setState({ isGiggling: false });
        this.giggleTimeout = null;
      }, 1200); // Match CSS animation duration
    }

    // Optional: Add cute giggle sound
    playGiggleSound = () => {
      // You can add a cute giggle sound here
      // For example using the Web Audio API or HTML5 Audio
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        // Fallback: Just play a beep or do nothing if audio fails
        console.log('Giggle!');
      }
    }

    componentWillUnmount() {
      if (this.giggleTimeout) {
        clearTimeout(this.giggleTimeout);
      }
      // Clean up eye tracking
      if (this.eyeTrackingRAF) {
        cancelAnimationFrame(this.eyeTrackingRAF);
      }
    }

    // Continuous eye tracking for entire page
    startEyeTracking = () => {
      const trackEyes = () => {
        const battery = this.batteryRef.current;
        if (battery && document.hasFocus()) {
          const eyes = battery.querySelectorAll('.ws-battery__pupil');
          eyes.forEach(eye => {
            // Get cursor position relative to viewport
            const cursorX = this.cursorPosition.x;
            const cursorY = this.cursorPosition.y;

            if (cursorX !== null && cursorY !== null) {
              const eyeRect = eye.parentElement.getBoundingClientRect();
              const eyeX = eyeRect.left + eyeRect.width / 2;
              const eyeY = eyeRect.top + eyeRect.height / 2;

              const angle = Math.atan2(cursorY - eyeY, cursorX - eyeX);
              const distance = Math.min(4, Math.sqrt(Math.pow(cursorX - eyeX, 2) + Math.pow(cursorY - eyeY, 2)) / 100);

              const moveX = Math.cos(angle) * distance;
              const moveY = Math.sin(angle) * distance;

              eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
          });
        }
        this.eyeTrackingRAF = requestAnimationFrame(trackEyes);
      };

      // Initialize cursor position
      this.cursorPosition = { x: null, y: null };

      // Track cursor movement on entire document
      document.addEventListener('mousemove', (e) => {
        this.cursorPosition = { x: e.clientX, y: e.clientY };
      });

      document.addEventListener('mouseleave', () => {
        this.cursorPosition = { x: null, y: null };
        // Reset eyes to center when cursor leaves
        const battery = this.batteryRef.current;
        if (battery) {
          const eyes = battery.querySelectorAll('.ws-battery__pupil');
          eyes.forEach(eye => {
            eye.style.transform = 'translate(0, 0)';
          });
        }
      });

      trackEyes();
    }


    // Continuous eye tracking
    handleBatteryMouseMove = (e) => {
      const battery = this.batteryRef.current;
      if (!battery) return;

      const rect = battery.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const eyes = battery.querySelectorAll('.ws-battery__pupil');
      eyes.forEach(eye => {
        // Limit movement to eye boundaries
        const maxMove = 3;
        const moveX = Math.max(-maxMove, Math.min(maxMove, x * 0.1));
        const moveY = Math.max(-maxMove, Math.min(maxMove, y * 0.1));

        eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    }

    // Update battery status based on input and validation
    updateBatteryStatus = () => {
      const { seminar_access_code, error } = this.state;

      if (error) {
        this.setState({ batteryStatus: 'error' });
      } else if (seminar_access_code.length >= 6) {
        this.setState({ batteryStatus: 'valid' });
      } else if (seminar_access_code.length > 0) {
        this.setState({ batteryStatus: 'neutral' });
      } else {
        this.setState({ batteryStatus: 'empty' });
      }
    }

    handleInputChange = (event) => {
      const target = event.target;
      const value = target.value;
      this.setState({
        seminar_access_code: value,
        error: '' // Clear error when user types
      }, this.updateBatteryStatus);
    };

//    onClickCalculateButton = async (event) => {
//      event.preventDefault();
//      this.setState({ isChecking: true, error: '', isValidCode: false });
//
//      try {
//        await this.props.dispatch(seminarsGetRequest());
//        let simple_seminars = this.props.seminarReducer.simpleSeminars;
//        let is_correct_access_code = Object.keys(simple_seminars).filter(s => s === this.state.seminar_access_code).length > 0;
//
//        if (!is_correct_access_code) {
//          this.setState({
//            error: "Incorrect access code",
//            isChecking: false,
//            isValidCode: false
//          });
//        } else if (is_correct_access_code && simple_seminars[this.state.seminar_access_code] === 'OPEN') {
//          // Show success state first
//          this.setState({
//            isValidCode: true,
//            successMessage: 'Access code accepted! Preparing your workshop...'
//          });
//           this.handleBatteryClick();
//          // Wait 3 seconds to show the happy battery
//          setTimeout(() => {
//            this.props.dispatch(setSeminarInSession(this.state.seminar_access_code));
//            this.setState({
//              error: '',
//              redirect: true,
//              isChecking: false
//            });
//          }, 3000);
//        } else {
//          this.setState({
//            error: "The seminar with access code " + this.state.seminar_access_code + " is not open yet",
//            isChecking: false,
//            isValidCode: false
//          });
//        }
//      } catch (error) {
//        this.setState({
//          error: "Error checking access code",
//          isChecking: false,
//          isValidCode: false
//        });
//      }
//    };

onClickCalculateButton = async (event) => {
    event.preventDefault();
    this.setState({ isChecking: true, error: '', isValidCode: false });

    try {
        // Use the new validation endpoint
        await this.props.dispatch(validateSeminarCode(this.state.seminar_access_code));

        // Check validation result from reducer
        const { isCodeValid, isSeminarOpen, currentSeminarStatus } = this.props.seminarReducer;

        if (!isCodeValid) {
            this.setState({
                error: "Incorrect access code",
                isChecking: false,
                isValidCode: false
            });
        } else if (isCodeValid && isSeminarOpen) {
            // Show success state first
            this.setState({
                isValidCode: true,
                successMessage: 'Access code accepted! Preparing your workshop...'
            });
            this.handleBatteryClick();

            // Wait 3 seconds to show the happy battery
            setTimeout(() => {
                this.props.dispatch(setSeminarInSession(this.state.seminar_access_code));
                this.setState({
                    error: '',
                    redirect: true,
                    isChecking: false
                });
            }, 3000);
        } else {
            this.setState({
                error: `The seminar with access code ${this.state.seminar_access_code} is not open yet (status: ${currentSeminarStatus})`,
                isChecking: false,
                isValidCode: false
            });
        }
    } catch (error) {
        this.setState({
            error: "Error checking access code",
            isChecking: false,
            isValidCode: false
        });
    }
};


    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        this.setState({
            seminar_access_code: value,
            error: '' // Clear error when user types
        });
    };

    toInputUppercase = (e) => {
        e.target.value = ("" + e.target.value).toUpperCase();
      };

    onIHaveCode = (e) => {
        this.setState({
            i_have_code: true
        });
    }

    handleSlideChange = (slideNumber) => {
        this.setState({ activeSlide: slideNumber });
    }


        handleBatteryMouseMove = (e) => {
          const battery = e.currentTarget;
          const rect = battery.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const eyes = battery.querySelectorAll('.ws-battery__pupil');
          eyes.forEach(eye => {
            const eyeRect = eye.parentElement.getBoundingClientRect();
            const eyeX = eyeRect.left + eyeRect.width / 2;
            const eyeY = eyeRect.top + eyeRect.height / 2;

            const angle = Math.atan2(y - eyeY, x - eyeX);
            const distance = Math.min(4, Math.sqrt(Math.pow(x - eyeX, 2) + Math.pow(y - eyeY, 2)) / 20);

            const moveX = Math.cos(angle) * distance;
            const moveY = Math.sin(angle) * distance;

            eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
          });
        }


    render() {

        let error = this.state.error
        if (this.state.redirect) {
            return <Redirect to={{pathname: "/calculator"}}/>;
        }

        return (
            <React.Fragment>
                <Container>
                    <div>
                        <div className="card">
                            <div className="card-header ">
                                <h4 className="text-center mb-0">
                                    <Trans i18nKey="seminar.home" />
                                </h4>
                            </div>
                            <center>
                                <div style={{width: this.state.isSmallScreen ? "100%" : "65%", marginTop: "24px"}}>
                                    {/* New Animated Carousel */}
                                    <div className="seminar-carousel-wrapper">
                                        <div className="section mx-auto text-center slider-height-padding">
                                            <input
                                                className="checkbox frst"
                                                type="radio"
                                                id="slide-1"
                                                name="slider"
                                                style={{  position: "relative", left: "-9999px !important"}}
                                                checked={this.state.activeSlide === 1}
                                                onChange={() => this.handleSlideChange(1)}
                                            />
                                            <label htmlFor="slide-1" style={{backgroundImage: `url(${ws1})`}}></label>

                                            <input
                                                className="checkbox scnd"
                                                type="radio"
                                                name="slider"
                                                id="slide-2"
                                                checked={this.state.activeSlide === 2}
                                                onChange={() => this.handleSlideChange(2)}
                                            />
                                            <label htmlFor="slide-2" style={{backgroundImage: `url(${ws2})`}}></label>

                                            <input
                                                className="checkbox thrd"
                                                type="radio"
                                                name="slider"
                                                id="slide-3"
                                                checked={this.state.activeSlide === 3}
                                                onChange={() => this.handleSlideChange(3)}
                                            />
                                            <label htmlFor="slide-3" style={{backgroundImage: `url(${ws3})`}}></label>

                                            <input
                                                className="checkbox foth"
                                                type="radio"
                                                name="slider"
                                                id="slide-4"
                                                checked={this.state.activeSlide === 4}
                                                onChange={() => this.handleSlideChange(4)}
                                            />
                                            <label htmlFor="slide-4" style={{backgroundImage: `url(${ws4})`}}></label>

                                            <ul>
                                                <li style={{backgroundImage: `url(${ws1})`}}>
                                                    <span>WORKSHOP IMAGE 1</span>
                                                </li>
                                                <li style={{backgroundImage: `url(${ws2})`}}>
                                                    <span>WORKSHOP IMAGE 2</span>
                                                </li>
                                                <li style={{backgroundImage: `url(${ws3})`}}>
                                                    <span>WORKSHOP IMAGE 3</span>
                                                </li>
                                                <li style={{backgroundImage: `url(${ws4})`}}>
                                                    <span>WORKSHOP IMAGE 4</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </center>
                            <div className="card-body">
                                <Trans i18nKey="seminar.intro">
                                    Intro <Link to="/contactus">contact us</Link>.
                                </Trans>
                            </div>
                            {!this.state.i_have_code &&
                            <div style={{width: "100%", textAlign: "center", color: "#007bff", cursor: "pointer"}}
                                 onClick={this.onIHaveCode}>
                                <b>
                                    <Trans i18nKey="seminar.button"></Trans>
                                </b>
                            </div>
                            }

                            {/*{this.state.i_have_code &&
                            <Form onSubmit={this.onClickCalculateButton}>
                                <Form.Group as={Row} className="justify-content-center" controlId="formPlaintextEmail">

                                    <Form.Control style={{width: "250px", margin: "10px"}} name={"seminar_access_code"}
                                                  autoFocus
                                                  onInput={this.toInputUppercase} onChange={this.handleInputChange}
                                                  type="text" placeholder={i18n.t("seminar.field")}
                                                  value={this.state.seminar_access_code}/>

                                    <Button style={{margin: "10px"}} onClick={this.onClickCalculateButton}>
                                        <Trans i18nKey="seminar.access"/>
                                    </Button>

                                </Form.Group>
                                {error &&
                               <div  style={{ textAlign:"center" ,width: "100%"}}>
                                <Row  style={{ justifyContent: "center",width: "auto",margin: "0 auto", padding: "1%",display:"inline-block"}} className="alert alert-danger" >
                                    {error}</Row>
                                    </div>
                                    }
                            </Form>
                            }*/}

                            {this.state.i_have_code && (
                              <div className={`ws-battery-access-form ${this.state.i_have_code ? 'ws-battery-access-form--visible' : ''}`}>
                                <form onSubmit={this.onClickCalculateButton} className="access-form">
                                  <div className="form-content">
                                    <div className="input-section">
                                      <div className="input-wrapper">
                                        <input
                                          id="seminar-code"
                                          type="text"
                                          name="seminar_access_code"
                                          autoFocus
                                          onInput={this.toInputUppercase}
                                          onChange={this.handleInputChange}
                                          placeholder={i18n.t("seminar.field")}
                                          value={this.state.seminar_access_code}
                                          required
                                          className="seminar-input"
                                        />
                                        <div className="input-underline"></div>
                                      </div>

                                      <Button
                                        type="submit"
                                        className={`access-button ${this.state.seminar_access_code ? 'access-button--active' : ''}`}
                                        disabled={!this.state.seminar_access_code || this.state.isChecking}
                                      >
                                        <span className="button-text">
                                          {this.state.isChecking ? 'Checking...' : <Trans i18nKey="new-changes.EnterWS" /> }
                                        </span>
                                        <svg className="button-icon" viewBox="0 0 24 24">
                                          <path d="M10,17V14H3V10H10V7L15,12L10,17M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V16H7V20H17V4H7V8H5V4A2,2 0 0,1 7,2Z"/>
                                        </svg>
                                        <div className="button-shine"></div>
                                      </Button>

                                      {this.state.successMessage && (
                                        <div className="success-message">
                                          <div className="success-icon">✓</div>
                                          <span>{this.state.successMessage}</span>
                                        </div>
                                      )}

                                      {error && (
                                        <div className="error-message">
                                          <div className="error-icon">⚠</div>
                                          <span>{error}</span>
                                        </div>
                                      )}
                                    </div>

                                    <div
                                      className={`ws-battery ${error ? 'ws-battery--error' : ''} ${this.state.seminar_access_code ? 'ws-battery--has-input' : ''} ${this.state.isValidCode ? 'ws-battery--valid' : ''} ${this.state.isGiggling ? 'ws-battery--giggling' : ''}`}
                                      ref={this.batteryRef}
                                      onClick={this.handleBatteryClick}
                                    >
                                      <div className="ws-battery__cap"></div>
                                      <div className="ws-battery__body">
                                        <div className="ws-battery__face">
                                          <div className="ws-battery__eye ws-battery__eye--left">
                                            <div className="ws-battery__pupil"></div>
                                          </div>
                                          <div className="ws-battery__eye ws-battery__eye--right">
                                            <div className="ws-battery__pupil"></div>
                                          </div>
                                          <div className="ws-battery__mouth ws-battery__mouth--happy"></div>
                                          <div className="ws-battery__mouth ws-battery__mouth--charged"></div>
                                          <div className="ws-battery__mouth ws-battery__mouth--sad"></div>
                                          <div className="ws-battery__mouth ws-battery__mouth--giggle"></div>
                                        </div>
                                        <div className="ws-battery__level"></div>
                                        <div className="ws-battery__sparkle ws-battery__sparkle--1"></div>
                                        <div className="ws-battery__sparkle ws-battery__sparkle--2"></div>
                                      </div>
                                      <div className="ws-battery__arms">
                                        <div className="ws-battery__arm ws-battery__arm--left"></div>
                                        <div className="ws-battery__arm ws-battery__arm--right"></div>
                                      </div>
                                      <div className="ws-battery__legs">
                                        <div className="ws-battery__leg ws-battery__leg--left"></div>
                                        <div className="ws-battery__leg ws-battery__leg--right"></div>
                                      </div>
                                    </div>
                                  </div>
                                </form>
                              </div>
                            )}

                            <div className="card-body">
                                <Row style={{ height: "auto" }}>
                                    <Col style={{ margin: "auto" }}>
                                        <div>
                                            <h6><Trans i18nKey="seminar.objectives.title" /></h6>
                                            <ul>
                                                <li>
                                                    <Trans i18nKey="seminar.objectives.objective_1" />
                                                </li>
                                                <li>
                                                    <Trans i18nKey="seminar.objectives.objective_2" />
                                                </li>
                                                <li>
                                                    <Trans i18nKey="seminar.objectives.objective_3" />
                                                </li>
                                            </ul>
                                        </div>
                                    </Col>
                                </Row>
                                <Row style={{ height: "auto" }}>
                                    <Col style={{ margin: "auto" }}>
                                        <div>
                                            <h6><Trans i18nKey="seminar.learning_outcomes.title" /></h6>
                                            <ul>
                                                <li>
                                                    <Trans i18nKey="seminar.learning_outcomes.learning_outcome_1" />
                                                </li>
                                                <li>
                                                    <Trans i18nKey="seminar.learning_outcomes.learning_outcome_2" />
                                                </li>
                                                <li>
                                                    <Trans i18nKey="seminar.learning_outcomes.learning_outcome_3" />
                                                </li>
                                            </ul>
                                        </div>
                                    </Col>
                                </Row>
                                <Row style={{ height: "auto" }}>
                                    <Col style={{ margin: "auto" }}>
                                        <div>
                                            <h6><Trans i18nKey="seminar.format.title" /></h6>
                                            <ul>
                                                <li>
                                                    <Trans i18nKey="seminar.format.format_1" />
                                                </li>
                                            </ul>
                                        </div>
                                    </Col>
                                </Row>
                                <Row style={{ height: "auto" }}>
                                    <Col style={{ margin: "auto" }}>
                                        <div>
                                            <h6><Trans i18nKey="seminar.target_audience.title" /></h6>
                                            <ul>
                                                <li>
                                                    <Trans i18nKey="seminar.target_audience.target_audience_1" />
                                                </li>
                                            </ul>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                </Container>
            </React.Fragment>
        );
    }
}