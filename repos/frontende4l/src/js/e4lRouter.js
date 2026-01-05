import { Questionnaire } from "./container/questionnaire.js";
import { Mission } from "./container/mission.js";
import { News } from "./container/news.js";
import { Team } from "./container/team.js";
import { ContactUs } from "./container/contactus.js";
import { PrivacyNotice } from "./container/privacyNotice.js";
import { Home } from "./container/home.js";
import { SeminarHome } from "./container/seminarHome.js";
import { NavBar } from "./presentation/NavBar";
import React from "react";
import { connect } from "react-redux";
import axios from "axios/index";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { VerticalSpace } from "./presentation/verticalSpace.js";
import {Community} from "./container/community.js";
import { Login } from "./container/login.js";
import { Signup } from "./container/signup";
import { Profile } from "./container/profile";
import {AdminDashboard } from "./container/admin";
import {ResultSeminar} from "./container/resultSeminar";
import {KidsQuestionnaire} from "./container/kids/KidsQuestionnaire";
import jwt from "jwt-decode";

import i18n from "./i18n";
import { Result } from "./container/result";
import { Footer } from "./presentation/footer.js";
import {Sponsors} from "./container/sponsors";
import {Info} from "./container/info";
import {logout} from "./action/userAction";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import '../css/bics.css';

@connect((store) => {
  return {
    userReducer: store.userReducer,
  };
})
export default class E4lRouter extends React.Component {
  render() {
    let baseName = window.location.hostname == "localhost" ? "" : "PUBLIC_PATH";

    axios.defaults.headers.common["Authorization"] = this.props.userReducer
      .token
      ? `Bearer ${this.props.userReducer.token}`
      : "";

    axios.interceptors.request.use((config) => {
      try {
        const token = axios.defaults.headers.common["Authorization"];
        if (!token)
          return config;

        const decodedToken = jwt(token.split(" ")[1], {complete: true});

        if (decodedToken.exp < (new Date().getTime() / 1000)) {
          console.log("Token expired. Logging out...")
          this.props.dispatch(logout());
        }
      } catch (e) {
        console.log(e)
      }
      return config
    })

    if (this.props.userReducer.lang) {
      i18n.changeLanguage(this.props.userReducer.lang);
      axios.defaults.headers.common[
        "accept-language"
      ] = this.props.userReducer.lang;
    } else {
      delete axios.defaults.headers.common["accept-language"];
    }

    

    return (
      <Router basename={baseName}>
        {/* Route with render-prop gives us location for animations */}
        <Route
          render={({ location }) => (
            <div className="app-shell">
              <NavBar />
              <VerticalSpace vheight={2.5} />

              {/* Wrapper for page transitions */}
              <TransitionGroup className="page-wrapper">
                <CSSTransition
                  key={location.key}
                  classNames="page"
                  timeout={400}   // 0.4s animation
                >
                  {/* The animated "page" container */}
                  <div className="page">
                    <Switch location={location}>
                      <Route exact path="/" component={Home} />
                      <Route path="/calculator" component={Questionnaire} />
                      <Route path="/calculator-kids" component={KidsQuestionnaire} />
                      <Route path="/mission" component={Mission} />
                      <Route path="/news" component={News} />
                      <Route path="/seminarHome" component={SeminarHome} />
                      <Route path="/team" component={Team} />
                      <Route path="/sponsors" component={Sponsors} />
                      <Route path="/info" component={Info} />
                      <Route path="/contactus" component={ContactUs} />
                      <Route path="/privacyNotice" component={PrivacyNotice} />
                      <Route path="/login" component={Login} />
                      <Route path="/community" component={Community} />
                      <Route path="/profile" component={Profile} />
                      {/*<Route path="/signup" component={Signup} /> */}
                      <Route path="/result/:sessionId" component={Result} />
                      <Route
                        path="/resultSeminar/:accessCode"
                        component={ResultSeminar}
                      />
                      <Route path="/admin" component={AdminDashboard} />
                      <Route component={Home} />
                    </Switch>
                  </div>
                </CSSTransition>
              </TransitionGroup>

              <Footer />
            </div>
          )}
        />
      </Router>
    );
  }
}
