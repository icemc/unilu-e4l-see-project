import axios from "axios/index";
import store from '../store'

export function authenticationRequest(email, password){
    const url = `login`;
    const data = {
        email: email,
        password: password
    };

    return {
        type: "AUTHENTICATION_REQUEST",
        payload: axios.post(url, data)
    }
}

export function logout() {
    return {
        type: "LOGOUT",
        payload: null
    }

}

export function signupRequest(email, password) {
    const url = `signup`;
    const data = {
        email: email,
        password: password
    };
    return {
        type: "SIGNUP_REQUEST",
        payload: axios.post(url, data)
    }
}

export function getUser() {

    const url = `users/me`;
    return {
        type: "GET_USER_REQUEST",
        payload: axios.get(url)
    }

}

export function profileUpdateRequest(data) {

    const url = `users/me`;
    return {
        type:"PROFILE_UPDATE_REQUEST",
        payload: axios.post(url, data)
    }

}

export function changeWebsiteLanguage(language) {
    return {
        type: "CHANGE_LANGUAGE",
        payload: language
    }
}

export function userListGetRequest() {
   const url = `userlist`;
   return {
       type: "USER_LIST_GET_REQUEST",
       payload: axios.get(url)
    }
}

export function userCreateRequest(data) {
    const url = `user`;
    return {
        type: "USER_CREATE_REQUEST",
        payload: axios.post(url,data)
    }
}

export function userDeleteRequest(data) {
    const url = `user`;
    return {
        type: "USER_DELETE_REQUEST",
        payload: axios.delete(url,{data: data})
    }
}

export function userPutRequest(data) {
    const url = `user/update`;
    return {
        type: "USER_PUT_REQUEST",
        payload: axios.put(url,data)
    }
}

export function checkPassword(id,password) {
    const url = `userpass`;
    const data = {
        id: id,
        email: '',
        password: password
    };
    return {
        type: "CHECK_PASS_POST_REQUEST",
        payload: axios.post(url,data)
    }
}

export function checkEmailPresence(email) {
    const url = `checkemail`;
    const data = {
        email: email,
        password: ''
    };
    return {
        type: "EMAIL_CHECK_REQUEST",
        payload: axios.post(url,data)
    }
}

export function sendToken(email) {
    const url = `tokensend`;
        const data = {
            email: email,
            password: ''
        };
    return {
        type: "SEND_TOKEN_REQUEST",
        payload: axios.post(url,data)
    }
}

export function valToken(email,token) {
    const url = `tokenval`;
        const data = {
            email: email,
            password: '',
            token: token,
        };
    return {
        type: "VAL_TOKEN_REQUEST",
        payload: axios.post(url,data)
    }

}

export function changePass(email,password,token) {
    const url = `changepass`;
        const data = {
            email: email,
            password: password,
            token: token,
        };
    return {
        type: "CHANGE_PASS_REQUEST",
        payload: axios.post(url,data)
    }

}