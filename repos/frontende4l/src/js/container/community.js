import React from "react";
import Container from "react-bootstrap/Container";
import {Trans} from "react-i18next";
import {Col, Image, Row, Button} from "react-bootstrap";
import { connect } from "react-redux";
import {Link, Redirect} from "react-router-dom";
import { hideNavButton, showNavButton } from "../action/navAction";

@connect((store) => {
    return {
    };
})
export class Community extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
      document.documentElement.setAttribute("data-theme", localStorage.getItem("kid")=="false"?  "adult-invert": "kid");

      this.props.dispatch(showNavButton());
    }


  render() {
  function openLinkInNewTab(linkUrl) {
    const newTab = window.open(linkUrl, '_blank');
    if (newTab) {
      newTab.focus();
    } else {
      alert('Please allow pop-ups for this website to open the link.');
    }
  }
    return (
      <React.Fragment>
        <Container>
          <div>
            <div className="card">
              <div className="card-header ">
                <h4 className="text-center mb-0">
                  <Trans i18nKey="community.community" />
                </h4>
              </div>
              <div className="card-body">
                <Row style={{ height: "auto" }}>
                  <Col style={{ margin: "auto" }}>
                    <div>
                      <h5><Trans i18nKey="community.channels" /></h5>
                      <p>
                         <Trans i18nKey="community.channels_desc"/> <a href="/contactus"><Trans i18nKey="contact.contact_us"/> page</a>.
                        Please note that in the future, we may consider creating a Discord server.
                      </p>
                    </div>

                    <div>
                      <h5><Trans i18nKey="community.code_of_cond"/> </h5>
                      <p>
                        <Trans i18nKey="community.code_of_cond_desc"/>   <a href="" onClick={() => openLinkInNewTab("https://gitlab.com/uniluxembourg/fstm/open/e4l/lu.uni.e4l.platform.documentation/-/blob/master/CODE_OF_CONDUCT.md?ref_type=heads")}>Code of Conduct</a>.
                      </p>
                    </div>
                    <div>
                      <h5><Trans i18nKey="community.contrib"/></h5>
                      <p>
                         <Trans i18nKey="community.contrib_desc_1"/> <a href="" onClick={() => openLinkInNewTab("https://gitlab.com/uniluxembourg/fstm/open/e4l/lu.uni.e4l.platform.documentation/-/blob/master/CONTRIBUTING.md?ref_type=heads")}>Contribution Guidelines</a> <Trans i18nKey="community.contrib_desc_2"/> .
                      </p>
                    </div>

                    <div>
                      <h5><Trans i18nKey="community.license"/></h5>
                      <p>
                          <Trans i18nKey="community.license_desc"/> <a href="" onClick={()=> openLinkInNewTab("https://www.gnu.org/licenses/agpl-3.0.en.html")}>AGPL v3 license</a>.
                      </p>
                    </div>
                    <div>
                        <h5
                            onClick={() => window.open("https://gitlab.com/uniluxembourg/fstm/open/e4l/lu.uni.e4l.platform.documentation", "_blank")}
                            style={{ cursor: "pointer" , color: "#007bff"}}
                            onMouseEnter={(e) => {e.target.style.color = "#0056b3"; e.target.style.textDecoration = "underline";}}
                            onMouseLeave={(e) => {e.target.style.color = "#007bff"; e.target.style.textDecoration = "none";}}
                        >
                            <Trans i18nKey="sourcecode"/>
                        </h5>
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





