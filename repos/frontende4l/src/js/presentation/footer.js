import React, {Component} from "react";
import {Link} from "react-router-dom";
import {VerticalSpace} from "./verticalSpace";
import {Trans} from "react-i18next";

export class Footer extends React.Component {
    render() {
        return (
            <div className="container containerE4l">
                <VerticalSpace vheight={2.5}/>
                <div className="footer">
                    <Trans i18nKey="footer.copyright">
                        <a href="https://www.uni.lu" target="_blank" style={{margin: "0px 4px", color:"#4c8ee0"}}></a>
                    </Trans>
                    { new Date().getFullYear() + ". " }
                    <Trans i18nKey="footer.rights"></Trans>
                    <Link to="/privacyNotice" style={{margin: "0px 4px", color:"#4c8ee0"}}>
                        <Trans i18nKey="privacy.privacy_notice"/>
                    </Link>
                    {/*<div className="social">*/}
                    {/*    <a href="https://www.facebook.com/uni.lu" target="_blank"><i className="fa fa-facebook"></i></a>*/}
                    {/*    <a href="https://twitter.com/uni_lu" target="_blank"><i className="fa fa-twitter"></i></a>*/}
                    {/*    <a href="https://www.linkedin.com/school/university-of-luxembourg/" target="_blank"><i*/}
                    {/*        className="fa fa-linkedin"></i></a>*/}
                    {/*    <a href="https://www.instagram.com/uni.lu" target="_blank"><i*/}
                    {/*        className="fa fa-instagram"></i></a>*/}
                    {/*    <a href="https://www.youtube.com/luxuni" target="_blank"><i className="fa fa-youtube"></i></a>*/}
                    {/*</div>*/}
                </div>
                <div style={{height: "172px", width: "100%"}} />
            </div>
        );
    }
}
