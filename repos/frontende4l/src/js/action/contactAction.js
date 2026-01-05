import axios from "axios/index";

export function sendMessage(message) {
    delete axios.defaults.headers.common["Authorization"];
    return {
        type: "SEND_MESSAGE",
        payload: axios.post("/contact", message)
    }
}

export function sendMessageWithPdf(message) {
    delete axios.defaults.headers.common["Authorization"];
    return {
        type: "SEND_MESSAGE_WITH_PDF",
        payload: axios.post("/contact_w_pdf", message)
    }
}