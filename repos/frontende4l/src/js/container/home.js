import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import React from "react";
import { fetchSessionCount, fetchIsCalculatedisabled, setKid } from "../action/questionnaireAction";
import { connect } from "react-redux";
import { VerticalSpace } from "../presentation/verticalSpace";
import exampleImage from "../../public/img/self.png";
import { Textfit } from "react-textfit";
import { Trans } from "react-i18next";
import { hideNavButton, showNavButton } from "../action/navAction";
import Collapse from "react-bootstrap/Collapse";
import Fade from "react-bootstrap/Fade";
import '../../css/home.css';
import ModePicker from "./ModePicker";
import CountUp from "react-countup";
import HeartParticlesButton from "./HeartParticlesButton";
import CalculatePillButton from "./CalculatePillButton";
import { RadialRevealButton } from "./RadialReveal"; // adjust the path to the canvas file
import VerticalEnergyBatteryCounter from "./ParticleBatteryCounter"; // adjust path
import DragEnergyHero from "./DragEnergyHero"; // adjust path




@connect((store) => ({
  questionnaireReducer: store.questionnaireReducer,
}))
export class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pickingAudience: true, // show the two big rectangles first
          showPicker: true,   // whether the picker is mounted
          pickerOpen: true,   // whether the picker is expanded (for animation)
    };
        this.cardRefs = [];
        for (let i = 0; i < 3; i++) {
          this.cardRefs[i] = React.createRef(); // Adjust the number of cards
        }
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(showNavButton());
    dispatch(fetchIsCalculatedisabled());
    // don't fetch session count yet—wait until audience is chosen
      // Load persisted audience choice


      const storedKid = localStorage.getItem("kid");
      if (storedKid !== null) {
        const isKid = JSON.parse(storedKid);
        dispatch(setKid(isKid));
        dispatch(fetchSessionCount(isKid));
        this.applyTheme(isKid ? "kid" : "adult-invert");
        // Skip picker entirely
        this.setState({ showPicker: false, pickerOpen: false });
      }
      else{
         this.applyTheme("kid");
      }

    // Set up IntersectionObserver to detect when the card is in the viewport
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Adding a delay effect for each card
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, index * 400); // 300ms delay between each card
          } else {
            entry.target.classList.remove("visible");
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe each card
    this.cardRefs.forEach((ref) => {
      if (ref.current) {
        this.observer.observe(ref.current);
      }
    });

  }


  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

    applyTheme = (mode /* "kid" | "adult" */) => {
      document.documentElement.setAttribute("data-theme", mode);
    };

  chooseAudience = (isKid) => {
    const { dispatch } = this.props;
    dispatch(setKid(isKid));
    localStorage.setItem("kid", JSON.stringify(isKid));
    dispatch(fetchSessionCount(isKid));
    this.applyTheme(isKid ? "kid" : "adult-invert");

    this.setState({ pickerOpen: false });
    setTimeout(() => this.setState({ showPicker: false }), 650);
  };

  onClickCalculateButton = () => {
    this.props.dispatch(hideNavButton());
  };


//              <Link to="/calculator">
//
//
//                <CalculatePillButton
//                  onClick={() => this.props.dispatch(hideNavButton())}
//                  disabled={questionnaireReducer.calculateAble}
//                />
//
//              </Link>

  renderMain() {
    const { questionnaireReducer } = this.props;
    return (

      <Fade in={!this.state.showPicker} mountOnEnter>
        <div>
          <Row className="align-items-center my-3 justify-content-center g-4">
            <Col md={5} className="text-center">





            <RadialRevealButton
              onClick={() => this.props.dispatch(hideNavButton())}
              disabled={questionnaireReducer.calculateAble}
              revealColor={document.documentElement.getAttribute("data-theme") === "kid" ? "#f5f7f6" : "#0b132b"}
              duration={650}     // circle expand duration
              exitFadeMs={450}   // NEW: fade-out length after navigation
              onComplete={() => {
              const isKid = this.props.questionnaireReducer.kid;
                const kidPath = "/calculator-kids";
                const adultPath = "/calculator";

                if (this.props.history && this.props.history.push) {
                  this.props.history.push(isKid ? kidPath : adultPath);
                } else {
                  window.location.assign(isKid ? kidPath : adultPath);
                }
              }
              }
              label={
                <CalculatePillButton
                  disabled={questionnaireReducer.calculateAble}
                  title="Calculate energy score"
                  variant="regular"
                />
              }
              style={{ background: "transparent", padding: 0, border: "none" }}
            />

              <div className="mode-chip">
                Mode: {questionnaireReducer.kid ? <Trans i18nKey="new-changes.modeKid" /> : <Trans i18nKey="new-changes.modeAdult" />}
              </div>

            </Col>

            <Col md={5} className="mob-adj">
              <VerticalEnergyBatteryCounter
                value={questionnaireReducer.sessionCount  || 0}
                max={questionnaireReducer.sessionCount*1.4}
                height={132}
                width={70}
                duration={5000}
                coreColor="#ffe457"         // yellow top
                coreColorBottom="#f6b800"   // richer yellow bottom
                particleCount={8}           // fewer
                particleMinMs={1800}        // slower
                particleMaxMs={2800}        // slower
                label="energyScores"
                shell="metal"               // or "dark"
                orientation="horizontal"
              />
            </Col>




          </Row>
        </div>
      </Fade>
    );
  }

//              {true & (<Trans
//                i18nKey="home.scores_calculated"
//                values={{ scores: questionnaireReducer.sessionCount }}
//              /> )}
//            <Col>
//               Already <CountUp end={questionnaireReducer.sessionCount || 0} duration={5} /> energy scores calculated!
//            </Col>
  render() {
    return (



    <div>
    { !this.state.showPicker && this.props.questionnaireReducer.kid && <div className="container-fluid p-0">
      <DragEnergyHero
        maxEnergy={90}
        size="compact"
        fieldMax="300px"
         logoSize="62px"
/*        leftSlot={
          <div>
            <RadialRevealButton
              onClick={() => this.props.dispatch(hideNavButton())}
              disabled={this.props.questionnaireReducer.calculateAble}
              revealColor={document.documentElement.getAttribute("data-theme") === "kid" ? "#f5f7f6" : "#0b132b"}
              duration={650}
              exitFadeMs={450}
              onComplete={() =>
                this.props.history.push
                  ? this.props.history.push("/calculator")
                  : window.location.assign("/calculator")
              }
              label={
                <CalculatePillButton
                  disabled={this.props.questionnaireReducer.calculateAble}
                  title="Calculate energy score"
                />
              }
              style={{ background: "transparent", padding: 0, border: "none" }}
            />
            <div className="mode-chip" style={{ marginTop: 8 }}>
              Mode: {this.props.questionnaireReducer.kid ? "Kid" : "Adult"}
            </div>
            <VerticalEnergyBatteryCounter
                        value={this.props.questionnaireReducer.sessionCount || 0}
                        max={(this.props.questionnaireReducer.sessionCount || 0) * 1.4 || 100}
                        height={132}
                        width={70}
                        duration={2400}
                        coreColor="#ffe457"
                        coreColorBottom="#f6b800"
                        particleCount={8}
                        particleMinMs={1800}
                        particleMaxMs={2800}
                        label="energy scores calculated"
                        shell={document.documentElement.getAttribute("data-theme") === "kid" ? "metal" : "dark"}
                        orientation="horizontal"
                      />
          </div>
        }*/

      />
</div>}

      <div className="container containerE4l">
        <div  ref={this.cardRefs[0]} className="card-unique">
          <div className="card-header">
            <h4 className="text-center mb-0">
              <Trans i18nKey="home.welcome" />
            </h4>
          </div>
          <div className="card-body">

            <Trans i18nKey="home.intro">
              Intro <HeartParticlesButton color={"#ff4d6d"} rate={18}   burstOnEnter={8}  spread={95} >seminar link</HeartParticlesButton>
            </Trans>




            <ModePicker visible={this.state.showPicker} onPick={this.chooseAudience} />

            {this.renderMain()}
          </div>
        </div>



        <VerticalSpace vheight={1} />

        <div ref={this.cardRefs[1]}  className="card-unique">
          <div className="card-body">
            <Row className="align-items-center g-4">
              {/* Text (left) */}
              <Col md={6}>
                <h5><Trans i18nKey="home.why.title" /></h5>
                <ul className="mb-2">
                  <li><Trans i18nKey="home.why.limited" /></li>
                  <li><Trans i18nKey="home.why.heating" /></li>
                  <li><Trans i18nKey="home.why.health" /></li>
                  <li><Trans i18nKey="home.why.expensive" /></li>
                </ul>
                <h6><Trans i18nKey="home.why.habits" /></h6>
              </Col>

              {/* Video (right) */}
              <Col md={6}>
                <div className="video-pop" tabIndex={0} aria-label="Energy 4 Life video">
                  <div className="video-inner">
                    <div className="video-ratio">
                      <iframe
                        className="video-frame"
                        src="https://www.youtube.com/embed/p3HW8M-09os"
                        title="Why video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        <VerticalSpace vheight={1} />

        {/* HOW IT WORKS block */}
        <div ref={this.cardRefs[2]} className="card-unique">
          <div className="card-body">
            <Row className="align-items-center g-4">
              {/* Text (left) */}
              <Col md={6}>
                <h5><Trans i18nKey="home.how_it_works.title" /></h5>
                <ul className="mb-0">
                  <li><Trans i18nKey="home.how_it_works.avg_energy_use" /></li>
                  <li><Trans i18nKey="home.how_it_works.gave_every_activity_score" /></li>
                  <li><Trans i18nKey="home.how_it_works.choose_picture" /></li>
                  <li><Trans i18nKey="home.how_it_works.add_pictures_up" /></li>
                  <li><Trans i18nKey="home.how_it_works.compare" /></li>
                </ul>
              </Col>

              {/* Video (right) */}
              <Col md={6}>
                <div className="video-pop" tabIndex={0} aria-label="How it works video">
                  <div className="video-inner">
                    <div className="video-ratio">
                      <iframe
                        className="video-frame"
                        src="https://www.youtube.com/embed/IiiJfyWC74s"
                        title="How it works video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>


        <VerticalSpace vheight={1} />

      </div>
 </div>
    );
  }
}



/*

        <div className="card ">
          <div className="card-body">
            <Row>
              <Col style={{ margin: "auto" }}>
                <h5>
                  <Trans i18nKey="home.why.title" />
                </h5>
                <ul>
                  <li>
                    <Trans i18nKey="home.why.limited" />
                  </li>
                  <li>
                    <Trans i18nKey="home.why.heating" />
                  </li>
                  <li>
                    <Trans i18nKey="home.why.health" />
                  </li>
                  <li>
                    <Trans i18nKey="home.why.expensive" />
                  </li>
                </ul>
                <h6>
                  <Trans i18nKey="home.why.habits" />
                </h6>
              </Col>
            </Row>
            <Row>
              <Col style={{ margin: "auto", textAlign: "center" }}>
                {" "}
                <div className="card ">
                  <div className="card-body">
                    <Row>
                      <Col
                        style={{
                          margin: "auto",
                          height: "100%",
                          textAlign: "center",
                        }}
                      >
                        <iframe
                          style={{maxWidth: "560px", width: "100%"}}
                          height="315"
                          src="https://www.youtube.com/embed/p3HW8M-09os"
                          frameBorder="0"
                          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </Col>
                    </Row>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
        <VerticalSpace vheight={1} />

        <VerticalSpace vheight={1} />
        <div className="card ">
          <div className="card-body">
            <Row>
              <Col style={{ margin: "auto" }}>
                <h5>
                  <Trans i18nKey="home.how_it_works.title" />
                </h5>
                <ul>
                  <li>
                    <Trans i18nKey="home.how_it_works.avg_energy_use" />
                  </li>
                  <li>
                    <Trans i18nKey="home.how_it_works.gave_every_activity_score" />
                  </li>
                  <li>
                    <Trans i18nKey="home.how_it_works.choose_picture" />
                  </li>
                  <li>
                    <Trans i18nKey="home.how_it_works.add_pictures_up" />
                  </li>
                  <li>
                    <Trans i18nKey="home.how_it_works.compare" />
                  </li>
                </ul>
              </Col>
            </Row>
            <Row>
              <Col style={{ margin: "auto", textAlign: "center" }}>
                {" "}
                <div className="card ">
                  <div className="card-body">
                    <Row>
                      <Col
                        style={{
                          margin: "auto",
                          height: "100%",
                          textAlign: "center",
                        }}
                      >
                        <iframe
                          style={{maxWidth: "560px", width: "100%"}}
                          height="315"
                          src="https://www.youtube.com/embed/IiiJfyWC74s"
                          frameBorder="0"
                          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </Col>
                    </Row>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
        <VerticalSpace vheight={1} />*/
