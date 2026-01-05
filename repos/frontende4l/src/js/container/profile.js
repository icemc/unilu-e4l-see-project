import React from "react";
import {userPutRequest , logout, checkPassword, getUser} from "../action/userAction";
import {connect} from "react-redux";
import { Redirect } from 'react-router-dom';
import Select from "react-select";
import {Col, Form, Button} from "react-bootstrap";
import languageOptions from '../../public/profile/langs.json';
import {Trans} from "react-i18next";
import i18n from "../i18n";
import '../../css/profile.css'; // Assuming you have an App.css file for styling
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

@connect((store) => {
    return {
        userReducer: store.userReducer
    }
})
export class Profile extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            email: '' ,
            password: '',
            id:0 ,
            language: '',
            age: new Date(),
            country: '',
            nationality: '',
            nucleusComposition: '',
            lessEnergy: null,
            name:'',
            last_name:'',
            roles: [],
            user: this.props.userReducer.user ? this.props.userReducer.user : {},
            utils: {
                submitted: false,
                isUpdated: false,
                blocked: true,
                erroredit:false,
                validated:false,
                showValidatePassword:false
            }
        };
    }

        setUserInState = (user, object) => {
            this.setState({
                id: user.id,
                email: user.email,
                language: user.language,
                roles: user.roles,
                country:user.country ? user.country : '',
                age: user.age ?  new Date(user.age) : '',
                nationality:user.nationality  ? user.nationality : '',
                nucleusComposition:user.nucleusComposition ? user.nucleusComposition : '',
                lessEnergy: user.lessEnergy!==null ? user.lessEnergy : null,
                name:user.name ? user.name : '',
                last_name:user.last_name ? user.last_name : '',
                password: '',
                utils: object
            })
        }
           componentDidMount() {
               this.setUserInState(this.state.user, this.state.utils);
           }

        passbefoechange = '';

        handleValidationPassword = (event) =>{
            const id = this.state.id;
            const pass = this.state.password;
            this.passbefoechange = pass;
            this.props.dispatch(checkPassword(id,pass)).then(() => {
                if (!this.props.userReducer.isCheckPending && this.props.userReducer.isChecked) {
                    this.handleCloseValidatePassword();
                    this.setState({utils: { ...this.state.utils, blocked: false, validated:true } });
                } else {
                    this.setState({utils: { ...this.state.utils, erroredit: true } });

                }
                });

        }

        handleCloseValidatePassword = () =>{
                        this.setState({utils: { ...this.state.utils, showValidatePassword: false } });
        }

        handleShowValidatePassword = () => {
          this.setState({utils: { ...this.state.utils, showValidatePassword: true } });
        }

    getLabelByValue = (object, value) => {
        return object.filter( obj => obj.value === value)[0]
    }

    handleInputChange= (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    };
    handleDateChange = (date) => {
        this.setState({
            age: date
        });
    };

    handleSubmit= (event) => {
        event.preventDefault();

        this.setState({utils: { ...this.state.utils, submitted:true } });

        let profileUpdate = Object.assign({}, this.state);
        delete profileUpdate.utils;
        delete profileUpdate.user;
        for (const key in profileUpdate) {
            if (profileUpdate[key] === '') {
                delete profileUpdate[key];
            }
        }
        console.log(profileUpdate);
//        this.props.dispatch(userPutRequest(profileUpdate));
//        this.state.isUpdated = true;
       this.props.dispatch(userPutRequest(profileUpdate)).then(() => {
            if (!this.props.userReducer.isPutPending && this.props.userReducer.isPut) {
                if(profileUpdate.id == this.props.userReducer.user.id){
                    if (this.props.userReducer.user.email != profileUpdate.email || (profileUpdate.password != this.passbefoechange && profileUpdate.password != null)){
                            this.props.dispatch(logout());
                    }
                    else{
                      this.props.dispatch(getUser());
                 }
                }
            } else {
                error = this.props.userReducer.error.response.data.message;
            }
       });
       this.state.isUpdated = true;
    };


    render() {
        if (!this.props.userReducer.isAuthenticate) {
            return <Redirect to={{pathname: "/login" }}/>;
        }


        const nationalityOptions = [
            {
                "label": "None",
                "value": ""
            },
            {
                "label": i18n.t("profile.nationalities.luxembourg"),
                "value": "lu"
            },
            {
                "label": i18n.t("profile.nationalities.belgium"),
                "value": "be"
            },
            {
                "label": i18n.t("profile.nationalities.france"),
                "value": "fr"
            },
            {
                "label": i18n.t("profile.nationalities.germany"),
                "value": "ger"
            },
            {
                "label": i18n.t("profile.nationalities.other"),
                "value": "other"
            }
        ];

        const countryOptions = [
                    {
                        "label": "None",
                        "value": ""
                    },
            {
                "label": i18n.t("profile.country.luxembourg"),
                "value": "lu"
            },
            {
                "label": i18n.t("profile.country.belgium"),
                "value": "be"
            },
            {
                "label": i18n.t("profile.country.france"),
                "value": "fr"
            },
            {
                "label": i18n.t("profile.country.germany"),
                "value": "ger"
            },
            {
                "label": i18n.t("profile.country.other"),
                "value": "other"
            }
        ];

        const nucleusCompositionOptions = [
                    {
                        "label": "None",
                        "value": ""
                    },
            {
                "label": i18n.t("profile.persons.one"),
                "value": "1"
            },
            {
                "label": i18n.t("profile.persons.two"),
                "value": "2"
            },
            {
                "label": i18n.t("profile.persons.three"),
                "value": "3"
            },
            {
                "label": i18n.t("profile.persons.four"),
                "value": "4"
            },
            {
                "label": i18n.t("profile.persons.five_plus"),
                "value": ">4"
            }
        ];

        const lessEnergyOptions = [
            {
                "label": "None",
                "value": null
            },
            {
                "label": i18n.t("yes"),
                "value": true
            },
            {
                "label": i18n.t("no"),
                "value": false
            }
        ];

        const ageOptions = [

            {
                "label": "0-17",
                "value": "0-17"
            },
            {
                "label": "18-30",
                "value": "18-30"
            },
            {
                "label": "31-50",
                "value": "31-50"
            },
            {
                "label": "51-70",
                "value": "51-70"
            },
            {
                "label": "71+",
                "value": "71+"
            }
        ];

        return (

            <div className="container">
                <div >
                    <div className=" col-md-10 col-md-offset-5" style={{margin: "auto"}}>
                        <div className="card">
                            <div className="card-header ">
                                <h4 className="text-center mb-0"><Trans i18nKey="profile.profile_update" /></h4>
                            </div>
                            <div className="card-body">
                                {this.state.utils.isUpdated &&
                                    <div className="alert alert-success">
                                        <Trans i18nKey="profile.profile_updated" />
                                    </div>}
                                <Form >
                                    <Form.Row>
                                        <Form.Group as={Col} controlId="formGridName">
                                            <Form.Label><Trans i18nKey="profile.name" /></Form.Label>
                                            <Form.Control name={"name"} value={this.state.name} onChange={this.handleInputChange} type="text" placeholder="Users name" />
                                        </Form.Group>
                                        <Form.Group as={Col} controlId="formGridLastName">
                                            <Form.Label><Trans i18nKey="profile.last_name" /></Form.Label>
                                            <Form.Control name={"last_name"} value={this.state.last_name} onChange={this.handleInputChange} type="text" placeholder="Users last name" />
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} controlId="formGridEmail">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                            disabled = {this.state.utils.blocked}
                                                value={this.state.email}
                                                onChange={this.handleInputChange}
                                                name={"email"}
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} controlId="formGridPassword">
                                            <Form.Label>Password</Form.Label>

                                        {this.state.utils.blocked && <Form.Control disabled name={"password"} value={"*********"} type="text" />}
                                        {!this.state.utils.blocked && <Form.Control  name={"password"} value={this.state.password} onChange={this.handleInputChange} type="password" />}


                                        </Form.Group>
                                    </Form.Row>

                                    <Form.Row>
                                        <Form.Group as={Col} controlId="formGridLanguage">
                                            <Form.Label><Trans i18nKey="profile.preferred_lang" /></Form.Label>
                                            <Select
                                                className="basic-single"
                                                classNamePrefix="select"
                                                value={this.getLabelByValue(languageOptions,this.state.language)}
                                                isclearable={"false"}
                                                onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "language"}})}
                                                issearchable={"true"}
                                                name={"language"}
                                                options={languageOptions}
                                                placeholder={i18n.t("profile.select")}
                                            />
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                            <Form.Group as={Col}  controlId="formGridNucleus">
                                                <Form.Label><Trans i18nKey="profile.people_count" /></Form.Label>
                                                <Select
                                                    className="basic-single"
                                                    classNamePrefix="select"
                                                    value={this.getLabelByValue(nucleusCompositionOptions,this.state.nucleusComposition)}
                                                    isclearable={"true"}
                                                    onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "nucleusComposition"}})}
                                                    issearchable={"true"}
                                                    name={"nucleusComposition"}
                                                    options={nucleusCompositionOptions}
                                                    placeholder={i18n.t("profile.select")}
                                                />
                                            </Form.Group>
                                        <Form.Group as={Col}  controlId="formGridAge">
                                            <Form.Label style={{width:"100%"}}><Trans i18nKey="profile.age" /></Form.Label>
                                            <DatePicker disabled placeholderText="No date" name={"age"} className="form-control" dateFormat="dd/MM/yyyy"  selected={this.state.age} onChange={this.handleDateChange} />

                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col}  controlId="formGridCountry">
                                            <Form.Label><Trans i18nKey="profile.residence_country" /></Form.Label>
                                            <Select
                                                className="basic-single"
                                                classNamePrefix="select"
                                                value={this.getLabelByValue(countryOptions,this.state.country)}
                                                isclearable={"true"}
                                                onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "country"}})}
                                                issearchable={"true"}
                                                name={"country"}
                                                options={countryOptions}
                                                placeholder={i18n.t("profile.select")}
                                            />
                                        </Form.Group>

                                        <Form.Group as={Col}  controlId="formGridNationality">
                                            <Form.Label><Trans i18nKey="profile.nationality" /></Form.Label>
                                            <Select
                                                className="basic-single"
                                                classNamePrefix="select"
                                                value={this.getLabelByValue(nationalityOptions,this.state.nationality)}
                                                isclearable={"true"}
                                                onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "nationality"}})}
                                                issearchable={"true"}
                                                name={"nationality"}
                                                options={nationalityOptions}
                                                placeholder={i18n.t("profile.select")}
                                            />
                                        </Form.Group>
                                    </Form.Row>

                                    <Form.Row>
                                        <Form.Group as={Col}  controlId="formGridLessEnergy">
                                            <Form.Label><Trans i18nKey="profile.less_energy" /></Form.Label>
                                            <Select
                                                className="basic-single"
                                                classNamePrefix="select"
                                                value={this.getLabelByValue(lessEnergyOptions,this.state.lessEnergy)}
                                                isclearable={"true"}
                                                onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "lessEnergy"}})}
                                                issearchable={"true"}
                                                name={"lessEnergy"}
                                                options={lessEnergyOptions}
                                                placeholder={i18n.t("profile.select")}
                                            />
                                        </Form.Group>
                                    </Form.Row>

                                    <button className="btn btn-primary btn-block"
                                            type="button"
                                            onClick={this.handleSubmit}
                                    ><Trans i18nKey="profile.update" /></button>

                                    {this.state.utils.blocked && <button className="btn btn-primary btn-block" type="button" onClick={this.handleShowValidatePassword}>Enable change</button>}
                                    {this.state.utils.validated && <div className="alert alert-success" style = {{textAlign:"center",marginBottom:"0px",marginTop:"10px"}} ><h6 style={{ marginBottom: "0px" }}>Password Validated</h6> </div>}


                                </Form>

                                <div className="form-group">
                                    {this.props.userReducer.isSigningUp && <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />}
                                </div>
                            {this.state.utils.showValidatePassword &&
                                <div className="validate-password-container">
                                    <div className="validate-password-form">
                                        {this.getErrorMsgVal() &&
                                            <div className="error-message">
                                                {this.getErrorMsgVal()}
                                            </div>
                                        }
                                        <Form>
                                            <Form.Group as={Col} controlId="formGridPassword" className="mb-3">
                                                <Form.Control
                                                    name="password"
                                                    value={this.state.password}
                                                    onChange={this.handleInputChange}
                                                    type="password"
                                                    placeholder="Enter the password"
                                                    className="password-input" />
                                            </Form.Group>
                                        </Form>
                                        <div className="validate-password-buttons">
                                            <Button variant="secondary" onClick={this.handleCloseValidatePassword}>Close</Button>
                                            <Button variant="primary" onClick={this.handleValidationPassword}>Validate</Button>
                                        </div>
                                    </div>
                                </div>
                            }
                            </div>
                        </div>
                    </div>
                </div>


            </div>





        )
    }
    getErrorMsgVal = () => {
        if (this.state.utils.erroredit) {
            return (
                    <div className="alert alert-danger" style = {{marginBottom:"0px"}} >
                    <h6 style={{ marginBottom: "0px" }}>Wrong Password</h6>
                    </div>
            )
        }
    }
}