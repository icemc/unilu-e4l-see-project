import React from "react";
import Container from "react-bootstrap/Container";
import {Trans} from "react-i18next";
import fstm from "../../public/img/sponsors/fstm.png";
import fnr from "../../public/img/sponsors/fnr.png";
import bics from "../../public/img/sponsors/bics.png"
import lem from "../../public/img/sponsors/lem.png"
import lpv from "../../public/img/sponsors/lpv.png"
import scienteens from "../../public/img/sponsors/scienteens-lab.png"
import DCS from "../../public/img/sponsors/DCS.png"
import DPhyMS from "../../public/img/sponsors/DPhyMS.png"
import {Col, Image, Row} from "react-bootstrap";
import { hideNavButton, showNavButton } from "../action/navAction";
import { connect } from "react-redux";

@connect((store) => {
    return {
    };
})
export class Sponsors extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
      document.documentElement.setAttribute("data-theme", localStorage.getItem("kid")=="false"?  "adult-invert": "kid");

      this.props.dispatch(showNavButton());
    }

    render() {
        return (
            <React.Fragment>
                <Container>
                    <div className="card">
                        <div className="card-header ">
                            <h4 className="text-center">
                                <Trans i18nKey="sponsors.sponsors"/>
                            </h4>
                        </div>
                        <div className="card-body">
                            <Row >
                                  <h5 style={{width:"100%"}}><Trans i18nKey="sponsors.evolutionE4L"/>:</h5>
                                 <p><Trans i18nKey="sponsors.desc1evolutionE4L"/> </p>
                                 <p><Trans i18nKey="sponsors.desc2evolutionE4L"/> </p>

                            </Row>
                            <p/>
                            <Row >
                                   <h5 style={{width:"100%"}}><Trans i18nKey="sponsors.donation"/>:</h5>
                                   <p><Trans i18nKey="sponsors.descdonation"><a href="/contactus"/> </Trans></p>
                            </Row>
                            <p/>
                             <Row >
                                   <h5 style={{width:"100%"}}><Trans i18nKey="sponsors.currspon.title"/>:</h5>
                            </Row>
                            <Row className="justify-content-center" style={{textAlign: "center"}}>
                                                            <Col xs={6} md={4} style={{marginBottom: "35px"}}>
                                                                <div className="img-container">
                                                                    <a href="https://wwwen.uni.lu/lcsb/scienteens_lab" target="_blank">
                                                                        <Image src={scienteens} fluid/>
                                                                    </a>
                                                                </div>
                                                                    <Trans i18nKey="sponsors.currspon.descSCILAB"/>
                                                            </Col>
                                                             <Col xs={6} md={4} style={{marginBottom: "35px"}}>
                                                                <div className="img-container">
                                                                    <a href="https://www.uni.lu/fstm-en/research-departments/department-of-computer-science/" target="_blank">
                                                                        <Image src={DCS} fluid/>
                                                                    </a>
                                                                </div>
                                                                    <Trans i18nKey="sponsors.currspon.descDCS"/>
                                                            </Col>
                                                            <Col xs={6} md={4} style={{marginBottom: "35px"}}>
                                                                <div className="img-container">
                                                                    <a href="https://www.uni.lu/fstm-en/research-departments/department-of-physics-materials-science/" target="_blank">
                                                                        <Image src={DPhyMS} fluid/>
                                                                    </a>
                                                                </div>
                                                                <Trans i18nKey="sponsors.currspon.descDPhyMS"/>
                                                            </Col>
                             </Row>

                             <Row >
                                   <h5 style={{width:"100%"}}><Trans i18nKey="sponsors.pastspon"/>:</h5>
                            </Row>

                            <Row>
                            <ul>
                                <li style={{width: "100%"}}>
                                    Faculty of Science, Technology and Medicine (<a href="https://wwwen.uni.lu/fstm/" target="_blank">FSTM</a>)
                                </li>
                                <li style={{width: "100%"}}>
                                   The Luxembourg National Research Fund (<a href="https://www.fnr.lu/" target="_blank">FNR</a>)
                                </li>
                                <li style={{width: "100%"}}>
                                    Bachelor in Computer Science Programme (<a href="https://bics.uni.lu/" target="_blank">BICS</a>)
                                </li>
                                <li style={{width: "100%"}}>
                                   Laboratory for Energy Materials (<a href="https://wwwen.uni.lu/research/fstm/dphyms/research/energy_materials" target="_blank">LEM</a>)
                                </li>
                                <li style={{width: "100%"}}>
                                     Laboratory for Photovoltaics (<a href="https://wwwen.uni.lu/research/fstm/dphyms/research/photovoltaics" target="_blank">LPV</a>)
                                </li>
                                <li style={{width: "100%"}}>
                                     Laboratory for Energy Materials (<a href="https://www.uni.lu/fstm-en/research-groups/laboratory-for-energy-materials/" target="_blank">LEM</a>)
                                </li>
                                </ul>
                            </Row>
                        </div>
                    </div>
                </Container>
            </React.Fragment>
        );
    }
}