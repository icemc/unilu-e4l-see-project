import React from "react";
import {connect} from "react-redux";
import {authenticationRequest, getUser,checkEmailPresence, sendToken, valToken,changePass} from "../action/userAction";
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col'
import { Link, Redirect } from 'react-router-dom';
import {Trans} from "react-i18next";
import i18n from "../i18n";
import { Loader } from "tabler-react";

import {hideLogoutButton, hideNavButton} from "../action/navAction"
import ReCAPTCHA from "react-google-recaptcha";

@connect((store) => {
    return {
        userReducer: store.userReducer,
        navReducer:store.navReducer

    }
})
export class Login extends React.Component {

    constructor(props) {
        super(props);
        this.props.userReducer.error = null;
        this.props.userReducer.isEmailReal = false;
        this.props.userReducer.isTokenSent = false;
        this.props.userReducer.isTokenValidated = false;
        this.props.userReducer.isPassChanged =false;
        this.state = {
            token:'',
            email: '',
            password: '',
            newpassword1: '',
            newpassword2: '',
            submitted:false,
            toreset: false,
            bademail: false,
            notRobot:false,
            badPassword: false
        };
    }
    // componentDidUpdate() {
    //     if(this.state.submitted) {
    //         this.props.dispatch(getUser()).then(this.setState({loaded: true}))         
    //     }

    // }
    componentDidMount() {
        this.props.dispatch(hideNavButton())
        this.props.dispatch(hideLogoutButton())
    }

    authenticationRequest = () => {
        if (this.state.notRobot){
        this.props.dispatch(authenticationRequest(this.state.email,this.state.password)).then (() => this.props.dispatch(getUser()) );
                 }
                 else {
                             alert('Please confirm that you are not a robot.');
                         }
    };

    handleInputChange= (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    };

    handleSubmit= (event) => {
        event.preventDefault();

        this.setState({ submitted: true });
        const { email, password } = this.state;
        if (email && password) {
            this.authenticationRequest();
        }
    };

    changePass= (event) => {
                const validatePassword = (password) => {
                    const re = /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/;
                    return re.test(String(password));
                };
            if(this.state.newpassword1 == this.state.newpassword2 && validatePassword(this.state.newpassword1)){
                this.setState({ badPassword: false });
                this.props.dispatch(changePass(this.state.email, this.state.newpassword2, this.state.token))
                this.props.userReducer.error = null;
                this.props.userReducer.isEmailReal = false;
                this.props.userReducer.isTokenSent = false;
                this.props.userReducer.isTokenValidated = false;
            }
            else{
             this.setState({ badPassword: true });
            }
      };

    handleReset= (event) => {
        event.preventDefault();
                    const validateEmail = (email) => {
                        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        return re.test(String(email).toLowerCase());
                    };
                this.setState({ toreset: true });
        if(this.state.email!=="" && this.state.email!=="admin@e4l.lu" && validateEmail(this.state.email)){
                this.props.dispatch(checkEmailPresence(this.state.email)).then (() => {
                if(this.props.userReducer.isEmailReal){
                    this.setState({ bademail: false });
                     this.props.dispatch(sendToken(this.state.email))

                }
                else{
                 this.setState({ bademail: true });
                }

                });
        }
        else{
            this.setState({ bademail: true });
        }
    };

    validateToken= (event) => {
         //captcha
         if (this.state.notRobot){
         this.props.dispatch(valToken(this.state.email,this.state.token))
         }
         else {
                     alert('Please confirm that you are not a robot.');
                 }
    };
    handleRecaptcha = (value) => {
        // When the user completes the reCAPTCHA, value will be the verification token;
        // if value is null, it means the reCAPTCHA has expired or been reset.
        this.setState({
            notRobot: !!value, // Convert the value to a boolean, true if value is not null
        });
    };

    render() {
        const { email, password, submitted } = this.state;
        if (this.props.userReducer.isAuthenticate && this.props.userReducer.user!=null) {
            if(this.props.userReducer.isInfoPending) {
                return <Loader/>;
            }
            if (!this.props.userReducer.isInfoPending && this.props.userReducer.user!=null && this.props.userReducer.user.roles.includes('ADMIN')){
                return <Redirect to={{pathname: "/admin"}}/>;
            }
            else return <Redirect to={{pathname: "/" }}/>;
        }

        return (

            <div className="container containerE4l">
                <div className="row" >

                    <div className=" col-md-6 col-md-offset-3" style={{margin: "auto"}}>
                        <div className="card">
                            <div className="card-header ">
                                <h4 className="text-center mb-0"><Trans i18nKey="profile.login" /></h4>
                            </div>
                            <div className="card-body">
                                {this.props.userReducer.error &&
                                    <div className="alert alert-danger" >
                                    <Trans i18nKey="profile.logerr" />
                                    </div>}
                                 {!this.props.userReducer.isPassChanged && this.state.toreset && this.state.bademail &&
                                     <div className="alert alert-danger" >
                                     ENTER VALID EMAIL TO RESET
                                     </div>}
                                 {!this.props.userReducer.isPassChanged && this.state.toreset && !this.state.bademail && this.props.userReducer.isTokenSent &&
                                  <div className="alert alert-success" >
                                  RECEIVE YOUR TOKEN
                                  </div>}
                                 {!this.props.userReducer.isPassChanged && this.state.toreset && !this.state.bademail && !this.props.userReducer.isTokenSent &&
                                       <div className="alert alert-danger" >
                                       TOKEN WAS NOT SENT
                                       </div>}
                                 {this.props.userReducer.isPassChanged &&
                                       <div className="alert alert-success" >
                                       NOW YOU HAVE A NEW PASSWORD, CONGRATS
                                       </div>}
                                <div className="form-group">
                                    <div className="input-group">
                                        <input name={"email"}
                                               className="form-control "
                                               style={{width:"100%"}}
                                               type="text"
                                               value={this.state.email}
                                               onChange={this.handleInputChange}
                                               placeholder={i18n.t("login.email")}/>
                                        {submitted && !email &&
                                        <small id="passwordHelpBlock" className="form-text text-muted" ><div style={{color:"brown"}}><Trans i18nKey="login.email_required" /></div></small>
                                        }
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div className="input-group">
                                        <input name={"password"}
                                               className="form-control "
                                               style={{width:"100%"}}
                                               type="password"
                                               value={this.state.password}
                                               onChange={this.handleInputChange}
                                               placeholder={i18n.t("login.password")}
                                        />
                                        {submitted && !password &&
                                        <small id="passwordHelpBlock" className="form-text text-muted"><div style={{color:"brown"}}><Trans i18nKey="login.password_required" /></div></small>
                                        }
                                    </div>
                                </div>
                                <div className="form-group">
                                    {!this.props.userReducer.isLoggingIn &&
                                    <button className="btn btn-primary btn-block"
                                            type="button"
                                            onClick={this.handleSubmit}
                                    ><Trans i18nKey="profile.login" /></button>}
                                    {this.props.userReducer.isLoggingIn &&
                                    <Col className="btn btn-block"><img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" /></Col>}
                                    {(!this.props.userReducer.isPassChanged && !this.state.isTokenSent) && <button className="btn btn-primary btn-block"
                                                                                type="button"
                                                                                onClick={this.handleReset}
                                                                        >Reset the password</button>}
                                 {this.state.toreset && !this.state.bademail && this.props.userReducer.isTokenSent && !this.props.userReducer.isTokenValidated &&
                                   <div style={{marginTop:"20px"}} className="input-group">
                                        Enter token:
                                      <input name={"token"}
                                         className="form-control "
                                         style={{width:"100%"}}
                                         type="text"
                                         value={this.state.token}
                                         onChange={this.handleInputChange}
                                         placeholder={"token..."}/>
                                        <button style={{marginTop:"20px"}} className="btn btn-primary btn-block"
                                            type="button"
                                            onClick={this.validateToken}
                                    >Validate Token</button>
                              </div>

                                  }
                               {this.state.badPassword &&
                                  <div className="alert alert-danger" style={{marginTop:"20px"}} >
                                  The password is weak
                                  </div>}
                                  {this.props.userReducer.isTokenValidated &&
                                    <div style={{marginTop:"20px"}} className="input-group">
                                            Enter new Password:
                                          <input name={"newpassword1"}
                                             className="form-control"
                                             style={{width:"100%",marginTop:"5px",marginBottom: "10px" }}
                                             type="password"
                                             value={this.state.newpassword1}
                                             onChange={this.handleInputChange}
                                             placeholder={"New password"}/>
                                           <input name={"newpassword2"}
                                            className="form-control"
                                            style={{width:"100%"}}
                                            type="password"
                                            value={this.state.newpassword2}
                                            onChange={this.handleInputChange}
                                            placeholder={"Repeat password"}/>
                                            <button style={{marginTop:"20px"}} className="btn btn-primary btn-block"
                                                type="button"
                                                onClick={this.changePass}
                                        >Change password</button>
                                  </div>


                                  }
                              </div>
                                {/* <div className="form-group">
                                    <Link to="/signup"><Button variant="light" className=" btn-block"
                                                               type="button"
                                    ><Trans i18nKey="profile.signup" /></Button></Link>
                                </div> */}

                                <ReCAPTCHA
                                    sitekey="6LdO8bYpAAAAADeGwPqyP9UyzFA3h3LwW0mXdFYE"
                                    onChange={this.handleRecaptcha}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
        }
        }
