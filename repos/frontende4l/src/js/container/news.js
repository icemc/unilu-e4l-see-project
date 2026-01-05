import React from "react";
import Container from "react-bootstrap/Container";
import { Trans } from "react-i18next";
import { Card } from "react-bootstrap";
import { connect } from "react-redux";
import axios from "axios";
import { hideNavButton, showNavButton } from "../action/navAction";

@connect((store) => {
    return {
    };
})
export class News extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            iFrameHeight: '0px',
            loadError: false
        }
    }

    componentDidMount() {
          document.documentElement.setAttribute("data-theme", localStorage.getItem("kid")=="false"? "adult-invert":"kid" );

        this.checkIframeSrcAvailability();
    }

    checkIframeSrcAvailability = () => {
        fetch("staticnews/index.html")
            .then(response => {
                if (!response.ok) {
                    this.setState({ loadError: true });
                }
            })
            .catch(error => {
                this.setState({ loadError: true });
            });
    }

    handleLoad = (o) => {
        const obj = ReactDOM.findDOMNode(o.target);
        this.setState({
            "iFrameHeight": (obj.contentWindow.document.body.scrollHeight + 100) + 'px'
        });
    }

    render() {
        return (
            <React.Fragment>
                <Container>
                    <Card>
                        <Card.Header>
                            <h4 style={{ width: "100%", textAlign: "center" }}>
                                <Trans i18nKey="news.news" />
                            </h4>
                        </Card.Header>
                        <Card.Body style={{ padding: "0" }}>
                            {!this.state.loadError ? (
                                <iframe
                                    style={{ width: "100%", height: this.state.iFrameHeight, border: "none", overflow: "hidden", backgroundcolor:"white"}}
                                    onLoad={this.handleLoad}
                                    scrolling="no"
                                    src="staticnews/index.html"
                                />
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center' }}>
                                    <p>News content is either currently unavailable or not deployed. This is a placeholder.</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Container>
            </React.Fragment>
        );
    }
}
