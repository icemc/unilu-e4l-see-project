const initState = {
    seminars: [],
    simpleSeminars: [],
    isCreationPending: false,
    isCreated: false,
    isPutPending: false,
    isPut: false,
    isStatusPutPending: false,
    isStatusPut: false,
    isDeletePending: false, 
    isDeleted: false,
    isGetPending: false,
    isComputePending: false,
    isComputed: false,
    isGet: false,
    error: null,
    seminarResult: null,
    seminarAmounts:[],
    seminarAmC:null,
    rateLimiterMode:true,
    isCodeValid:false,
    isSeminarOpen:null,
    currentSeminarStatus: null,
}

export function seminarReducer(state = initState, action) {
    switch (action.type){

    case "VALIDATE_SEMINAR_CODE_REQUEST_PENDING":{
                return Object.assign({}, state,
                    {
                        error:null,
                        isGetPending: true,
                        isCodeValid: false
                    });
            }

        case "VALIDATE_SEMINAR_CODE_REQUEST_REJECTED":{
            return Object.assign({}, state,
                {
                    isGetPending: false,
                    error: action.payload
                });
        }

        case "VALIDATE_SEMINAR_CODE_REQUEST_FULFILLED":{
            const { isValid, isOpen, seminarStatus } = action.payload.data;
            return Object.assign({}, state, {
                isGetPending: false,
                isCodeValid: isValid,
                isSeminarOpen: isOpen, // Add this new field
                currentSeminarStatus: seminarStatus // Add this new field
            });
        }

        case "SEMINAR_CREATE_REQUEST_PENDING":{
            return Object.assign({}, state,
                {
                    isCreationPending:true,
                    error:null,
                    isCreated:false

                });
        }
        case "SEMINAR_CREATE_REQUEST_REJECTED":{
            return Object.assign({}, state,
                {
                    isCreationPending: false,
                    error: action.payload
                });
        }
        case "SEMINAR_CREATE_REQUEST_FULFILLED":{
            return Object.assign({}, state,
                {
                    isCreationPending: false,
                    isCreated: true
                });
        }
        case "SEMINAR_PUT_REQUEST_PENDING":{
            return Object.assign({}, state,
                {
                    error:null,
                    isPutPending:true,
                    isPut:false
                });
        }
        case "SEMINAR_PUT_REQUEST_REJECTED":{
            return Object.assign({}, state,
                {
                    isPutPending: false,
                    error: action.payload
                });
        }
        case "SEMINAR_PUT_REQUEST_FULFILLED":{
            return Object.assign({}, state,
                {
                    isPutPending: false,
                    isPut: true
                });
        }
        case "SEMINAR_STATUS_PUT_REQUEST_PENDING":{
            return Object.assign({}, state,
                {
                    error:null,
                    isStatusPutPending:true,
                    isStatusPut:false
                });
        }
        case "SEMINAR_STATUS_PUT_REQUEST_REJECTED":{
            return Object.assign({}, state,
                {
                    isStatusPutPending: false,
                    error: action.payload
                });
        }
        case "SEMINAR_STATUS_PUT_REQUEST_FULFILLED":{
            return Object.assign({}, state,
                {
                    isStatusPutPending: false,
                    isStatusPut: true
                });
        }
        case "SEMINAR_DELETE_REQUEST_PENDING":{
            return Object.assign({}, state,
                {
                    error:null,
                    isDeletePending:true,
                    isDeleted:false
                });
        }
        case "SEMINAR_DELETE_REQUEST_REJECTED":{
            return Object.assign({}, state,
                {
                    isDeletePending: false,
                    error: action.payload
                });
        }
        case "SEMINAR_DELETE_REQUEST_FULFILLED":{
            return Object.assign({}, state,
                {
                    isDeletePending: false,
                    isDeleted: true,
                    seminars: action.payload.data
                });
        }
        case "SEMINAR_LIST_GET_REQUEST_PENDING":{
            return Object.assign({}, state,
                {
                    error:null,
                    isGetPending: true,
                    isGet: false
                });
        }
        case "SEMINAR_LIST_GET_REQUEST_REJECTED":{
            return Object.assign({}, state,
                {
                    isGetPending: false,
                    error: action.payload
                });
        }
        case "SEMINAR_LIST_GET_REQUEST_FULFILLED":{

            const seminarAmountsMY = action.payload.data.map(seminar => ({
                    id: seminar.id,
                    amount: seminar.seminarCounter,
                }));
            return Object.assign({}, state,
                {
                    isGetPending: false,
                    isGet: true,
                    seminarAmounts:seminarAmountsMY,
                    seminars: action.payload.data
                });
        }
        case "SEMINARS_GET_REQUEST_PENDING":{
            return Object.assign({}, state,
                {
                    error:null,
                    isGetPending: true,
                    isGetSimple: false
                });
        }
        case "SEMINARS_GET_REQUEST_REJECTED":{
            return Object.assign({}, state,
                {
                    isGetPending: false,
                    error: action.payload
                });
        }
        case "SEMINARS_GET_REQUEST_FULFILLED":{
            return Object.assign({}, state,
                {
                    isGetPending: false,
                    isGetSimple: true,
                    simpleSeminars: action.payload.data
                });
        }
        case "SEMINAR_COMPUTE_ENERGY_PENDING":{
            return Object.assign({}, state,
                {
                    error:null,
                    isComputePending: true,
                    isComputed: false
                });
        }
        case "SEMINAR_COMPUTE_ENERGY_REJECTED":{
            return Object.assign({}, state,
                {
                    isComputePending: false,
                    error: action.payload
                });
        }
        case "SEMINAR_COMPUTE_ENERGY_FULFILLED":{
            return Object.assign({}, state,
                {
                    isComputePending: false,
                    isComputed: true,
                    seminarResult: action.payload.data
                });
        }
        case "SEMINAR_LIST_ONE_GET_REQUEST_FULFILLED":{
        console.log(action.payload.data)

             return Object.assign({}, state,
                {
                    isGetPending: false,
                    isGet: true,
                    seminarAmC: action.payload.data
                });
        }

        case "FETCH_RATELIMITER_STATUS_PENDING": {
              return state;
            }
            case "FETCH_RATELIMITER_STATUS_REJECTED": {
              return state;
            }
            case "FETCH_RATELIMITER_STATUS_FULFILLED": {
              return Object.assign({}, state, {
                rateLimiterMode: action.payload.data,
              });
            }

        case "CHANGE_RATELIMITER_PENDING": {
              return state;
            }
            case "CHANGE_RATELIMITER_REJECTED": {
              return state;
            }
            case "CHANGE_RATELIMITER_FULFILLED": {
                 return Object.assign({}, state, {
                   rateLimiterMode: action.payload.data,
                 });
            }

    }
    return state;
}