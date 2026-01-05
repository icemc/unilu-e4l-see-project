import axios from "axios";
import {getUser} from "../action/userAction";
import i18n from "../i18n";

const initState = {
    isAuthenticate: false,
    token: null,
    user: null,
    loginFailed: false,
    error: null,
    isLoggingIn:false,
    isSignedUp:false,
    isSigningUp:false,
    signingUpFailed:false,
    isInfoPending:false,
    isInfoReceived:false,
    isCreationPending:false,
    isCreated:false,
    isDeletePending:false,
    isDeleted:false,
    isPutPending:false,
    isPut:false,
    lang: "en",
    isCheckPending:false,
    isChecked:false,
    users: [],
    isEmailReal:false,
    isTokenSent:false,
    isTokenValidated:false,
    isPassChanged:false
};

export function userReducer(state=initState, action){
    switch (action.type) {
        case "AUTHENTICATION_REQUEST_PENDING":{
            return Object.assign({},state,
                {
                    isLoggingIn:true,
                    error: null,
                    isInfoPending: true,
                    loginFailed: false
                });
        }
        case "AUTHENTICATION_REQUEST_REJECTED":{
            return Object.assign({},state,
                {
                    isAuthenticate: false,
                    token: null,
                    user:null,
                    error: action.payload,
                    loginFailed: true,
                    isLoggingIn:false
                });
        }
        case "AUTHENTICATION_REQUEST_FULFILLED":{
            console.log("hi1")
            return Object.assign({},state,
                {
                    isAuthenticate: true,
                    token: action.payload.data,
                    loginFailed: false,
                    isLoggingIn:false,
                    error: null,
                    isSignedUp:true
                });

        }

         case "USER_CREATE_REQUEST_PENDING":{
            return Object.assign({}, state,
                {
                    isCreationPending:true,
                    error:null,
                    isCreated:false

                });
        }
        case "USER_CREATE_REQUEST_REJECTED":{
            return Object.assign({}, state,
                {
                    isCreationPending: false,
                    error: action.payload
                });
        }
        case "USER_CREATE_REQUEST_FULFILLED":{
            return Object.assign({}, state,
                {
                    isCreationPending: false,
                    isCreated: true
                });
        }

        case "USER_DELETE_REQUEST_PENDING":{
            return Object.assign({}, state,
                {
                    error:null,
                    isDeletePending:true,
                    isDeleted:false
                });
        }
        case "USER_DELETE_REQUEST_REJECTED":{
            return Object.assign({}, state,
                {
                    isDeletePending: false,
                    error: action.payload
                });
        }
        case "USER_DELETE_REQUEST_FULFILLED":{
            return Object.assign({}, state,
                {
                    isDeletePending: false,
                    isDeleted: true,
                    users: action.payload.data
                });
        }


        case "USER_LIST_GET_REQUEST_PENDING":{
            return Object.assign({}, state,
                {
                    error:null,
                });
        }
        case "USER_LIST_GET_REQUEST_REJECTED":{
            return Object.assign({}, state,
                {
                    error: action.payload
                });
        }
        case "USER_LIST_GET_REQUEST_FULFILLED":{
            return Object.assign({}, state,
                {
                    users: action.payload.data
                });
        }


        case "USER_PUT_REQUEST_PENDING":{
            return Object.assign({}, state,
                {
                    error:null,
                    isPutPending:true,
                    isPut:false
                });
        }
        case "USER_PUT_REQUEST_REJECTED":{
            return Object.assign({}, state,
                {
                    isPutPending: false,
                    error: action.payload
                });
        }
        case "USER_PUT_REQUEST_FULFILLED":{
            return Object.assign({}, state,
                {
                    isPutPending: false,
                    isPut: true
                });
        }


        case "CHECK_PASS_POST_REQUEST_PENDING":{
            return Object.assign({}, state,
                {
                    error:null,
                    isCheckPending:true,
                    isChecked:false
                });
        }
        case "CHECK_PASS_POST_REQUEST_REJECTED":{
            return Object.assign({}, state,
                {
                    isCheckPending: false,
                    error: action.payload
                });
        }
        case "CHECK_PASS_POST_REQUEST_FULFILLED":{
        console.log(action.payload.data);
            return Object.assign({}, state,
                {
                    isCheckPending: false,
                    isChecked: action.payload.data
                });
        }


        case "SIGNUP_REQUEST_PENDING":{
            return Object.assign({},state,
                {
                    isSigningUp:true
                });
        }
        case "SIGNUP_REQUEST_REJECTED":{
            return Object.assign({},state,
                {
                    isSigningUp:false,
                    error: action.payload,
                    signingUpFailed:true
                });
        }
        case "SIGNUP_REQUEST_FULFILLED":{
            return Object.assign({},state,
                {
                    isSigningUp:false,
                    isSignedUp:true
                });

        }

        case "LOGOUT":{
            return Object.assign({},state,
                {
                    isAuthenticate: false,
                    token: null,
                    user: null,
                    loginFailed: false,
                    error: null,
                    isLoggingIn:false,
                    isSignedUp:false,
                    isSigningUp:false,
                    signingUpFailed:false,
                });

        }

        case "GET_USER_REQUEST_PENDING":{
            return Object.assign({},state,
                {
                    isInfoPending: true
                });
        }
        case "GET_USER_REQUEST_REJECTED":{
            return Object.assign({},state,
                {
                    isInfoPending: true
                });
        }
        case "GET_USER_REQUEST_FULFILLED":{
            if(action.payload.data.roles.includes("UNABLED")){
                console.log("hi2")
                return Object.assign({},state,
                    {
                        isAuthenticate: false,
                        isInfoPending: true,
                        isInfoReceived:false,
                        user: null,
                        token:null,
                        loginFailed: true,
                        error: "unabled",
                        isSignedUp:false,
                        isLoggingIn:false
                    });
            }
            else{
            return Object.assign({},state,
                {
                    isInfoPending: false,
                    isInfoReceived:true,
                    user: action.payload.data
                });
                }
        }

        case "PROFILE_UPDATE_REQUEST_PENDING":{
            return state;
        }
        case "PROFILE_UPDATE_REQUEST_REJECTED":{
            return state;
        }
        case "PROFILE_UPDATE_REQUEST_FULFILLED":{
            return Object.assign({},state,
                {
                    user: action.payload.data
                });
        }
        case "CHANGE_LANGUAGE": {

            i18n.changeLanguage(action.payload);

            return Object.assign({},state,
                {
                    lang: action.payload
                });
        }
        case "EMAIL_CHECK_REQUEST_PENDING":{
            return state;
        }
        case "EMAIL_CHECK_REQUEST_REJECTED":{
            return state;
        }
        case "EMAIL_CHECK_REQUEST_FULFILLED":{
            return Object.assign({},state,
                {
                    isEmailReal: action.payload.data
                });
        }
        case "SEND_TOKEN_REQUEST_PENDING":{
            return state;
        }
        case "SEND_TOKEN_REQUEST_REJECTED":{
            return state;
        }
        case "SEND_TOKEN_REQUEST_FULFILLED":{
            return Object.assign({},state,
                {
                    isTokenSent: action.payload.data
                });
        }
        case "VAL_TOKEN_REQUEST_PENDING":{
            return state;
        }
        case "VAL_TOKEN_REQUEST_REJECTED":{
            return state;
        }
        case "VAL_TOKEN_REQUEST_FULFILLED":{
            return Object.assign({},state,
                {
                    isTokenValidated: action.payload.data
                });
        }

        case "CHANGE_PASS_REQUEST_PENDING":{
            return state;
        }
        case "CHANGE_PASS_REQUEST_REJECTED":{
            return state;
        }
        case "CHANGE_PASS_REQUEST_FULFILLED":{
            return Object.assign({},state,
                {
                    isPassChanged: action.payload.data
                });
        }
    }
    return state;
}
