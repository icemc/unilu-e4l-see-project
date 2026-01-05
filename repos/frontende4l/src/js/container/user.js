import React from "react";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";

import { profileUpdateRequest } from "../action/userAction";
import { connect } from "react-redux";
import { Redirect } from 'react-router-dom';
import Select from "react-select";
import languageOptions from '../../public/profile/langs.json';
import { Trans } from "react-i18next";
import i18n from "../i18n";
import { Link } from "react-router-dom";
import { hideNavButton, showNavButton } from "../action/navAction";
import { getUser } from "../action/userAction"
import navReducer from "../reducer/navReducer";
import regeneratorRuntime from "regenerator-runtime";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { StatusSwitchButton } from "../presentation/StatusSwitchButton";
import NavBarAdmin from "../presentation/NavBarAdmin";
// import Table from "react-bootstrap/Table";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import { VerticalSpace } from "../presentation/verticalSpace.js";
import { FixedSizeList } from "react-window";

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import { Column } from "react-virtualized";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import { userListGetRequest, userCreateRequest, userDeleteRequest, userPutRequest, checkPassword, logout } from "../action/userAction";

let checkclose = false
@connect((store) => {
    return {
        userReducer: store.userReducer,
    }
})
export class User extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            utils: {
                page: 0,
                rowsPerPage: 3,
                error: null,
                showCreate: false,
                showUpdate: false,
                showValidatePassword:false,
                enableediting:false,
                erroredit:false,
                erroremail:false,
                createSubmitted: false,
                orderBy: 'eventDateTime',
                selected: null,
                order: 'asc',
                users: this.props.userReducer.users,
            },
            id: 0,
            email: '',
            language:'',
            rolestoshow:'',
            roles:[],
            country:'',
            age:new Date(),
            nationality:'',
            nucleusComposition:'',
            lessEnergy:'',
            password:'',
            name:'',
            last_name:''
        }
    }

    componentDidMount() {
        this.props.dispatch(userListGetRequest())
    }

    reset = () => {

        let new_state = {
            id: 0,
            email: '',
            language:'',
            rolestoshow:'',
            country:'',
            age: new Date(),
            nationality:'',
            nucleusComposition:'',
            lessEnergy:'',
            password:'',
            name:'',
            last_name:'',
            roles: []
        }

        this.setState(new_state)
    }

    resetAndAddToState = (object) => {

        let new_state = {
            id: 0,
            email: '',
            language:'',
            rolestoshow:'',
            country:'',
            age: new Date(),
            nationality:'',
            nucleusComposition:'',
            lessEnergy:'',
            roles: [],
            password:'',
            name:'',
            last_name:'',
            object
        }
        this.setState(new_state)
    }

    handleDateChange = (date) => {
        this.setState({
            age: date
        });
    }

    resetAndAddToStateSelected = (userId) => {
        this.resetAndAddToState({...this.state.utils, selected: userId, submitted: true, users: this.props.userReducer.users, })
    }

    setUserInState = (user, object) => {
        this.setState({
            id: user.id,
            email: user.email,
            language: user.language,
            roles: user.roles,
            rolestoshow: user.roles[0],
            country:user.country !== null ? user.country : '',
            age:   user.age !== null ?  new Date(user.age) : '',
            nationality:user.nationality !== null ? user.nationality : '',
            nucleusComposition:user.nucleusComposition !== null ? user.nucleusComposition : '',
            lessEnergy: user.lessEnergy !== null ? user.lessEnergy : '',
            name: user.name !== null ? user.name : '',
            last_name: user.last_name !== null ? user.last_name : '',
            password: '',
            utils: object
        })
    }
    passbefoechange = '';

    handleValidationPassword = (event) =>{
        const id = this.state.id;
        const pass = this.state.password;
        this.passbefoechange = pass;
        this.props.dispatch(checkPassword(id,pass)).then(() => {
            if (!this.props.userReducer.isCheckPending && this.props.userReducer.isChecked) {
                this.handleCloseValidatePassword();
                this.setState({utils: { ...this.state.utils, enableediting: true, } });
//                this.props.dispatch(userListGetRequest()).then(this.resetAndAddToState({ ...this.state.utils, submitted: true, selected: null, users: this.props.userReducer.users,}))
            } else {
                this.setState({utils: { ...this.state.utils, erroredit: true, } });
            }
            });

    }

    handleInputChange = (event) => {
        const target = event.target;
        let value = target.value;
        let name = target.name;
        this.setState({
            [name]: value
        });
    };


    handleDelete = (id) => {
        this.setState({ utils: {...this.state.utils, page: 0}})
        this.props.dispatch(userDeleteRequest(id)).then(this.resetAndAddToState({utils: { ...this.state.utils, selected: null, page: 0, users: this.props.userReducer.users,} }))
        if (id == this.props.userReducer.user.id){
            this.props.dispatch(logout());
        }
    }

    prepareUser =() => {
        const selectedRole = this.state.rolestoshow;
        const rolesArray = [selectedRole];

        const user = {
            ...this.state,
            roles: rolesArray,
        };
        delete user.utils;
        if (user.object) {delete user.object;}
        delete user.rolestoshow;
        for (const key in user) {
            if (user[key] === '') {
                delete user[key];
            }
        }
    return user
    }

    handleSubmitCreate = (event) => {
        checkclose = true
        event.preventDefault();

            const validateEmail = (email) => {
                const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(String(email).toLowerCase());
            };

            const validatePassword = (password) => {
                const re = /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/;
                return re.test(String(password));
            };

            // Check if the email is valid
            if (!validateEmail(this.state.email) ||  !validatePassword(this.state.password) ) {
                // Set error message and prevent user creation
                this.setState({utils: { ...this.state.utils, erroremail: true, } });
                return;
            }else{
                this.setState({utils: { ...this.state.utils, erroremail: false, } });
            }

    const newUser = this.prepareUser();
        this.props.dispatch(userCreateRequest(newUser)).then(() => {
            if (!this.props.userReducer.isCreationPending && this.props.userReducer.isCreated) {
                this.handleCloseCreate();
                this.props.dispatch(userListGetRequest()).then(this.resetAndAddToState({ ...this.state.utils, submitted: true, selected: null, users: this.props.userReducer.users,}))
            } else {
                error = this.props.userReducer.error.response.data.message;
            }
        });
    };

    handleSubmitUpdate = (event) => {
        checkclose = true
        event.preventDefault();
        const updatedUser = this.prepareUser();

//        let new_user2 = this.props.userReducer.users.find(e => e.id === updatedUser.id);
//        let merged_user = {...new_user2, ...updatedUser}
//        delete merged_user.selectability;
//        console.log(merged_user);
       this.props.dispatch(userPutRequest(updatedUser)).then(() => {
            if (!this.props.userReducer.isPutPending && this.props.userReducer.isPut) {
                this.handleCloseUpdate();
                this.props.dispatch(userListGetRequest()).then(this.resetAndAddToState({ ...this.state.utils, submitted: true, selected: null, users: this.props.userReducer.users,}))

                if(updatedUser.id == this.props.userReducer.user.id){
                    if (this.props.userReducer.user.email != updatedUser.email || (updatedUser.password != this.passbefoechange && updatedUser.password != null) || updatedUser.roles[0] == "USER"){
                            this.props.dispatch(logout());
                    }
                }
            } else {
                error = this.props.userReducer.error.response.data.message;
            }
       });
   };

//    changeOrdering = (column_id, columns) => {
//        let column = columns.find(column => { return column.name === column_id });
//        if (column.orderable) {
//        const isDesc = this.state.utils.orderBy === column_id && this.state.utils.order === 'desc';
//        this.setState({ utils: { ...this.state.utils, selected: null, orderBy: column_id, order: isDesc ? 'asc' : 'desc', page: 0 } });
//        }
//    }

//    sort = (columns, users, status_list) => {
//        let column = columns.find(column => { return column.name === this.state.utils.orderBy });
//        if (column.orderable) {
//        return column.isDate ? this.sortByDate(this.state.utils.order, users) : this.sortByStatus(this.state.utils.order, users, status_list);
//    } else {
//        return this.sortByDate(this.state.utils.order, users)
//    }
//    }

//    sortByDate = (order, users) => {
//        let ordering = order ==='asc' ? 1 : -1;
//        let ordered_users = users.sort( (a, b) => (a.eventDateTime > b.eventDateTime) ? 1*ordering :
//        (a.eventDateTime === b.eventDateTime) ? ((a.id > b.id)? 1*ordering : (-1)*ordering) : (-1)*ordering )
//        return ordered_users
//    }
//
//    sortByStatus = (order, users, status_list) => {
//        let ordering = order ==='asc' ? 1 : -1;
//        let ordered_users = users.sort( (a, b) => (this.getStatusValue(a.status, status_list) > this.getStatusValue(b.status, status_list)) ? 1*ordering :
//        (this.getStatusValue(a.status, status_list) === this.getStatusValue(b.status, status_list)) ? ((a.eventDateTime > b.eventDateTime)? 1*ordering : (-1)*ordering) : (-1)*ordering )
//        return users
//    }
//
//    getStatusValue = (status, status_list) => {
//        return status_list.find(e => {return e.name === status}).value
//    }
//
    toInputUppercase = (e) => {
        e.target.value = ("" + e.target.value).toUpperCase();
      };

    handleChangePage = (event, newPage) => {
        this.setState({ utils: { ...this.state.utils, selected: null, page: newPage, } });
    };

    handleChangeRowsPerPage = (event) => {
        this.setState({ utils: { ...this.state.utils, selected: null, rowsPerPage: event.target.value, page: 0, } })
    };

    handleCloseCreate = () =>{
        checkclose = false
        this.setState({ utils: { ...this.state.utils, selected: null, showCreate: false,erroremail:false, } });
        this.reset();
    }
    handleShowCreate = () => {this.setState({ utils: { ...this.state.utils, selected: null, showCreate: true, } });

    }

    handleCloseUpdate = () => {
    checkclose = false
    this.setState({ utils: { ...this.state.utils, selected: null, showUpdate: false, enableediting: false, showValidatePassword:false, erroredit:false, } });
    this.reset();
    }

    handleShowUpdate = (user) => {
    this.setUserInState(user, { ...this.state.utils, selected: null, showUpdate: true, });}


        handleCloseValidatePassword = () =>{
            checkclose = false
            this.setState({ utils: { ...this.state.utils, selected: null, showValidatePassword: false, } });
        }

        handleShowValidatePassword = () => {this.setState({ utils: { ...this.state.utils, selected: null, showValidatePassword: true, } });

        }

    onRowClick = (value) => {
        if (this.state.utils.selected === null) {
            this.setState({utils: {...this.state.utils, selected: value, }})
        } else if (this.state.utils.selected != value) {
            this.setState({utils: {...this.state.utils, selected: value, }})
        } else {
            this.setState({utils: {...this.state.utils, selected: null, }})
        }
    }
    getLabelByValue = (object, value) => {
        return object.filter( obj => obj.value === value)[0]
    }

    render() {


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
                "value": ""
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
//                {
//                    "label": "ADMIN",
//                    "value": "ADMIN"
//                },
            const rolesOptions = [

                {
                    "label": "USER",
                    "value": "USER"
                },
                {
                    "label": "WORKSHOP",
                    "value": "WORKSHOP"
                }
            ];


        const {users} = this.props.userReducer;

        const columns = [
            { name: 'email', orderable: false, label: 'Email', minWidth: 200 },
            { name: 'language', orderable: false, label: 'Language', minWidth: 200 },
            { name: 'roles', orderable: false, label: 'Role', minWidth: 200 },
        ];

        const roles_list = [
            {name: 'ADMIN', value: 10},
            {name: 'ANONYMOUS', value: 9},
            {name: 'WORKSHOP', value: 8},
        ];

        let ordered_users = users;
        ordered_users.map( e =>  e.selectability = "rowSelectable")
        let selected_user = null;
        if (this.state.utils.selected != null) {
            ordered_users.filter(e => {return e.id === this.state.utils.selected}).map(e => e.selectability = "rowSelected")
            selected_user = ordered_users.find(e => {return e.id === this.state.utils.selected})
        }
        return (
            <React.Fragment>

                <div className="containerE4l">
                    <div className="card " >
                        <div className="card-body" >
                            <Paper>
                                <TableContainer >
                                    <Table  aria-label="sticky table">
                                        <TableHead>
                                            <TableRow>
                                                {columns.map((column) => (
                                                    <TableCell
                                                        key={column.name}
                                                        align={column.align}
                                                        style={{ minWidth: column.minWidth, cursor:"pointer" }}

                                                    >
                                                       {column.orderable==true && this.state.utils.orderBy==column.name && this.state.utils.order=="desc" &&<i className="fas fa-arrow-down"></i>}
                                                       {column.orderable==true && this.state.utils.orderBy==column.name && this.state.utils.order=="asc" &&<i className="fas fa-arrow-up"></i>}
                                                       {column.orderable==true && this.state.utils.orderBy!=column.name &&<i className="fas fa-arrows-alt-v"></i>}
                                                        {column.label}
                                                    </TableCell>
                                                ))}
                                                <TableCell style={{ "width": "50px" }}><Button variant="outline-primary" style={{ "width": "100%" }} onClick={this.handleShowCreate}>Create New User</Button></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {ordered_users.slice(this.state.utils.page * this.state.utils.rowsPerPage, this.state.utils.page * this.state.utils.rowsPerPage + this.state.utils.rowsPerPage).map((el) => (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={el.id} className={ordered_users.find(e => {return e.id === el.id}).selectability} >
                                                    <TableCell onClick={() => this.onRowClick(el.id)} key={"email " + el.email} >
                                                        {el.email}
                                                    </TableCell>
                                                    <TableCell onClick={() => this.onRowClick(el.id)} key={"language " + el.language} >
                                                        {el.language}
                                                    </TableCell>
                                                    <TableCell onClick={() => this.onRowClick(el.id)} key={"roles " + el.roles} >
                                                        {el.roles}
                                                    </TableCell>
                                                    <TableCell style={{ "width": "50px" }}><Button onClick={() => this.handleShowUpdate(el)} style={{ "width": "45%", "marginRight": "4px" }} ><i className="far fa-edit"></i></Button><Button onClick={() => this.handleDelete(el.id)} style={{ "width": "45%", "marginLeft": "4px" }} ><i className="fas fa-trash-alt"></i></Button></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <TablePagination
                                        rowsPerPageOptions={[3, 6, 9]}
                                        component="div"
                                        count={ordered_users.length}
                                        rowsPerPage={this.state.utils.rowsPerPage}
                                        page={this.state.utils.page}
                                        onChangePage={this.handleChangePage}
                                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                    />
                                </TableContainer>
                            </Paper>
                        </div>
                        {this.state.utils.selected!=null && selected_user!=null &&
                        <div className="card-body">
                        <Paper style={{padding: "8px"}}>
                        <Row>
                            <Col><h3>{selected_user.email}</h3></Col>
                        </Row>
                        <Row>
                            <Col>
                                <h5><Trans i18nKey="profile.name" />: {selected_user.name}</h5>
                            </Col>
                            <Col>
                                <h5><Trans i18nKey="profile.last_name" />: {selected_user.last_name}</h5>
                            </Col>
                            <Col>
                                <h5><Trans i18nKey="profile.age" />: {selected_user.age ? new Date(selected_user.age).toLocaleDateString() : ''}</h5>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h5><Trans i18nKey="profile.preferred_lang" />: {selected_user.language}</h5>
                            </Col>
                            <Col>
                                <h5>Roles: {selected_user.roles}</h5>
                            </Col>
                            <Col>
                                <h5><Trans i18nKey="profile.nationality" />: {selected_user.nationality}</h5>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Trans i18nKey="profile.residence_country" />: {selected_user.country}
                            </Col>
                            <Col>
                                <Trans i18nKey="profile.people_count" />: {selected_user.nucleusComposition}
                            </Col>
                          <Col>
                              <Trans i18nKey="profile.less_energy" />: {selected_user.lessEnergy !== null ? selected_user.lessEnergy.toString() : null}
                          </Col>
                        </Row>
                        <Row>

                        </Row>
                        </Paper>
                        </div>}


                    </div>
                </div>

                <Modal
                    show={this.state.utils.showCreate}
                    onHide={this.handleCloseCreate}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>New User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {!this.state.utils.erroremail && this.getErrorMsg()}
                        {this.getErrorWrongEmail()}
                        <Form >
                        <Form.Row>
                            <Form.Group as={Col} controlId="formGridName">
                                <Form.Label><Trans i18nKey="profile.name" /></Form.Label>
                                <Form.Control name={"name"} value={this.state.name} onChange={this.handleInputChange} type="text" placeholder="Users name" />
                            </Form.Group>
                            <Form.Group as={Col} controlId="formGridLastname">
                                <Form.Label><Trans i18nKey="profile.last_name" /></Form.Label>
                                <Form.Control name={"last_name"} value={this.state.last_name} onChange={this.handleInputChange} type="text" placeholder="Users last name" />
                            </Form.Group>
                        </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} controlId="formGridEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control name={"email"} value={this.state.email} onChange={this.handleInputChange} type="text" placeholder="Email of the user" />
                                </Form.Group>
                                <Form.Group as={Col} controlId="formGridLanguage">
                                    <Form.Label><Trans i18nKey="profile.preferred_lang" /></Form.Label>
                                    <Select
                                        classNamePrefix="select"
                                        value={this.getLabelByValue(languageOptions,this.state.language)}
                                        onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "language"}})}
                                        name={"language"}
                                        options={languageOptions}
                                        placeholder={i18n.t("profile.select")}
                                    />

                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} controlId="formGridPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" name={"password"} value={this.state.password} onChange={this.handleInputChange} placeholder="Password" />
                                </Form.Group>
                                <Form.Group as={Col} controlId="formGridRole">
                                    <Form.Label style={{ width: "20%" }}>Role</Form.Label>
                                    <Select
                                        classNamePrefix="select"
                                        value={this.getLabelByValue(rolesOptions,this.state.rolestoshow)}
                                        onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "rolestoshow"}})}
                                        name={"rolestoshow"}
                                        options={rolesOptions}
                                    />
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} controlId="formGridAge">
                                    <Form.Label style={{ "width": "100%" }}><Trans i18nKey="profile.age" /></Form.Label>
                                    <DatePicker placeholderText="Click to select a date" name={"age"} className="form-control" dateFormat="dd/MM/yyyy" selected={this.state.age} onChange={this.handleDateChange} />

                                </Form.Group>
                                <Form.Group as={Col} controlId="formGridCountry">
                                    <Form.Label><Trans i18nKey="profile.residence_country" /></Form.Label>
                                    <Select
                                        classNamePrefix="select"
                                        value={this.getLabelByValue(countryOptions,this.state.country)}
                                        onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "country"}})}
                                        name={"country"}
                                        options={countryOptions}
                                    />

                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} controlId="formGridNationality">
                                    <Form.Label><Trans i18nKey="profile.nationality" /></Form.Label>
                                    <Select
                                        classNamePrefix="select"
                                        value={this.getLabelByValue(nationalityOptions,this.state.nationality)}
                                        onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "nationality"}})}
                                        name={"nationality"}
                                        options={nationalityOptions}
                                    />

                                </Form.Group>
                                <Form.Group as={Col} controlId="formGridNucleusComposition">
                                    <Form.Label><Trans i18nKey="profile.people_count" /></Form.Label>
                                    <Select
                                        classNamePrefix="select"
                                        value={this.getLabelByValue(nucleusCompositionOptions,this.state.nucleusComposition)}
                                        onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "nucleusComposition"}})}
                                        name={"nucleusComposition"}
                                        options={nucleusCompositionOptions}
                                    />
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} controlId="formGridLessEnergy">
                                    <Form.Label><Trans i18nKey="profile.less_energy" /></Form.Label>
                                    <Select
                                        classNamePrefix="select"
                                        value={this.getLabelByValue(lessEnergyOptions,this.state.lessEnergy)}
                                        onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "lessEnergy"}})}
                                        name={"lessEnergy"}
                                        options={lessEnergyOptions}
                                    />
                                </Form.Group>
                            </Form.Row>
                        </Form>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleCloseCreate}>
                            Close
                            </Button>
                        <Button variant="primary" onClick={this.handleSubmitCreate} >Create User</Button>
                    </Modal.Footer>
                </Modal>


                <Modal
                    show={this.state.utils.showUpdate}
                    onHide={this.handleCloseUpdate}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Update User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.getErrorMsg()}
                            <Form >
                                <Form.Row>
                                    <Form.Group as={Col} controlId="formGridName">
                                        <Form.Label><Trans i18nKey="profile.name" /></Form.Label>
                                        <Form.Control name={"name"} value={this.state.name} onChange={this.handleInputChange} type="text" placeholder="Users name" />
                                    </Form.Group>
                                    <Form.Group as={Col} controlId="formGridLastname">
                                        <Form.Label><Trans i18nKey="profile.last_name" /></Form.Label>
                                        <Form.Control name={"last_name"} value={this.state.last_name} onChange={this.handleInputChange} type="text" placeholder="Users last name" />
                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} controlId="formGridEmail">
                                        <Form.Label>Email</Form.Label>
                                        {!this.state.utils.enableediting && <Form.Control disabled name={"email"} value={this.state.email} onChange={this.handleInputChange} type="text" placeholder="Email of the user" />}
                                        {this.state.utils.enableediting &&  <Form.Control name={"email"} value={this.state.email} onChange={this.handleInputChange} type="text" placeholder="Email of the user" />}
                                    </Form.Group>
                                    <Form.Group as={Col} controlId="formGridLanguage">
                                        <Form.Label><Trans i18nKey="profile.preferred_lang" /></Form.Label>
                                        <Select
                                            classNamePrefix="select"
                                            value={this.getLabelByValue(languageOptions,this.state.language)}
                                            onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "language"}})}
                                            name={"language"}
                                            options={languageOptions}
                                            placeholder={i18n.t("profile.select")}
                                        />

                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} controlId="formGridPassword">
                                        <Form.Label>Password</Form.Label>

                                        {!this.state.utils.enableediting && <Form.Control disabled name={"password"} value={"*********"} onChange={this.handleInputChange} type="text" placeholder="Password" />}
                                        {this.state.utils.enableediting && <Form.Control name={"password"} value={this.state.password} onChange={this.handleInputChange} type="text" placeholder="Password" />}


                                    </Form.Group>
                                    <Form.Group as={Col} controlId="formGridRole">
                                        <Form.Label style={{ width: "20%" }}>Role</Form.Label>
                                        <Select
                                            classNamePrefix="select"
                                            value={this.getLabelByValue(rolesOptions,this.state.rolestoshow)}
                                            onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "rolestoshow"}})}
                                            name={"rolestoshow"}
                                            options={rolesOptions}
                                        />
                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} controlId="formGridAge">
                                        <Form.Label style={{ "width": "100%" }}><Trans i18nKey="profile.age" /></Form.Label>
                                        <DatePicker placeholderText="Click to select a date" name={"age"} className="form-control" dateFormat="dd/MM/yyyy"  selected={this.state.age} onChange={this.handleDateChange} />
                                    </Form.Group>
                                    <Form.Group as={Col} controlId="formGridCountry">
                                        <Form.Label>Country</Form.Label>
                                        <Select
                                            classNamePrefix="select"
                                            value={this.getLabelByValue(countryOptions,this.state.country)}
                                            onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "country"}})}
                                            name={"country"}
                                            options={countryOptions}
                                        />

                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} controlId="formGridNationality">
                                        <Form.Label><Trans i18nKey="profile.nationality" /></Form.Label>
                                        <Select
                                            classNamePrefix="select"
                                            value={this.getLabelByValue(nationalityOptions,this.state.nationality)}
                                            onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "nationality"}})}
                                            name={"nationality"}
                                            options={nationalityOptions}
                                        />

                                    </Form.Group>
                                    <Form.Group as={Col} controlId="formGridNucleusComposition">
                                        <Form.Label><Trans i18nKey="profile.people_count" /></Form.Label>
                                        <Select
                                            classNamePrefix="select"
                                            value={this.getLabelByValue(nucleusCompositionOptions,this.state.nucleusComposition)}
                                            onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "nucleusComposition"}})}
                                            name={"nucleusComposition"}
                                            options={nucleusCompositionOptions}
                                        />
                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} controlId="formGridLessEnergy">
                                        <Form.Label><Trans i18nKey="profile.less_energy" /></Form.Label>
                                        <Select
                                            classNamePrefix="select"
                                            value={this.getLabelByValue(lessEnergyOptions,this.state.lessEnergy)}
                                            onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "lessEnergy"}})}
                                            name={"lessEnergy"}
                                            isclearable={"true"}
                                            options={lessEnergyOptions}
                                        />
                                    </Form.Group>
                                </Form.Row>
                            </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        {!this.state.utils.enableediting && <Button variant="secondary" onClick={this.handleShowValidatePassword}>Enable change</Button>}
                        <Button variant="secondary" onClick={this.handleCloseUpdate}>Close</Button>
                        <Button variant="primary" onClick={this.handleSubmitUpdate} ><Trans i18nKey="profile.update" /></Button>
                     </Modal.Footer>

                    {this.state.utils.showValidatePassword &&
                        <Modal.Footer>
                            {this.getErrorMsgVal()}
                                <Form >
                                    <Form.Group style = {{marginBottom:"0px"}} as={Col} controlId="formGridPassword">
                                        <Form.Control name={"password"} value={this.state.password} onChange={this.handleInputChange} type="password" placeholder="Enter the password" />
                                    </Form.Group>
                                </Form>
                                <Button variant="secondary" onClick={this.handleCloseValidatePassword}>Close</Button>
                                <Button variant="primary" onClick={this.handleValidationPassword} >Validate</Button>
                        </Modal.Footer>
                    }
                </Modal>


            </React.Fragment>
        )


    }
//    <div className="show error message"
//        style={{ color: 'red', padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
//        {}
//        <h6><Trans i18nKey="user.create" /></h6>

//    getErrorMsg = () => {
//        if (this.props.userReducer.error != null && this.props.userReducer.error != undefined && this.props.userReducer.error.response != undefined && checkclose) {
//            return (
//                    <div className="alert alert-danger" >
//                    <h6 style={{ marginBottom: "0px" }}>These fields should not be empty: - Name - Last name - Email (unique) - Password - Role</h6>
//                    </div>
//            )
//        }
//    }

    getErrorMsg = () => {
        if (this.props.userReducer.error != null && this.props.userReducer.error != undefined && this.props.userReducer.error.response != undefined && checkclose) {
            // Initialize an array to hold names of empty fields
            let missingFields = [];

            // Check each field and if it's empty, add its name to the array
            if (!this.state.name) missingFields.push(<Trans i18nKey="profile.name" />);
            if (!this.state.last_name) missingFields.push(<Trans i18nKey="profile.last_name" />);
            if (!this.state.email) missingFields.push("Email");
            if (!this.state.password) missingFields.push("Password (should contain: numbers, symbols and capital letters)");
            if (!this.state.rolestoshow) missingFields.push("Role");

            // If there are missing fields, create the error message
            if (missingFields.length > 0) {
                // Create a string listing all missing fields
                let fieldsString = missingFields.join(" - ");
                return (
                    <div className="alert alert-danger" >
                        <h6 style={{ marginBottom: "0px" }}>
                        These fields should not be empty:   {missingFields.reduce((prev, curr) => [prev, ' - ', curr])}
                        </h6>
                    </div>
                );
            }
        }
        // If there's no error or no missing fields, return null or an alternative component/message
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
    getErrorWrongEmail = () => {
        if (this.state.utils.erroremail) {
            return (
                    <div className="alert alert-danger" >
                    <h6 style={{ marginBottom: "0px" }}>Wrong Email (should be example@uni.lu) or weak Password</h6>
                    </div>
            )
        }
    }
}

//                                    <Select
//                                        classNamePrefix="select"
//                                        value={this.getLabelByValue(ageOptions,this.state.age)}
//                                        onChange={(v, e) => this.handleInputChange({target:{value: v ? v.value : v, name: "age"}})}
//                                        name={"age"}
//                                        options={ageOptions}
//                                    />