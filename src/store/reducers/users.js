import { initialUserState } from "../models/users";
import { userConstants } from "../actions/actionType";

export function users(state = {}, action = {}) {
  switch (action.type) {

    case userConstants.PRE_SET_USER_DATA:
    case userConstants.PROCESS_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };

    case userConstants.USER_LOGGED_IN:
      return {
        ...state,
        loggedIn: true,
        userAuthChecked: true
      };

    case userConstants.USER_NOT_LOGGED_IN:
      return {
        ...state,
        loggedIn: false,
        userAuthChecked: true
      };

    case userConstants.LOGIN_START:
      return {
        ...state,
        loggedIn: false,
        userError: {}
      };

    case userConstants.LOGIN_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        },
        loggedIn: true,
        registered: false,
        userError: ""
      };

    case userConstants.LOGIN_FAILURE:
      return {
        ...state,
        userError: {
          type: "login_failure",
          className: "alert-danger",
          message: action.payload
        }
      };

    case userConstants.LOGOUT_FAILURE:
      return {
        ...state,
        userError: {
          type: "logout_failure",
          className: "alert-danger",
          message: action.payload.message
        }
      };

    case userConstants.REGISTER_START:
      return {
        ...state,
        registered: false,
        userError: {}
      };

    case userConstants.REGISTER_SUCCESS:
      return {
        ...state,
        loggedIn: false,
        registered: true,
        userError: "",
        user: {
          ...state.user,
          ...action.payload
        }
      };

    case userConstants.REGISTER_FAILURE:
      return {
        ...state,
        userError: {
          type: "register_failure",
          className: "alert-danger",
          message: action.payload
        }
      };

    case userConstants.EMAIL_VERIFY_SUCCESS:
      return {
        ...state,
        loggedIn: false,
        registered: false,
        userError: "",
        emailVerified: true
      };

    case userConstants.EMAIL_VERIFY_FAILURE:
      return {
        ...state,
        userError: {
          type: "email_verify_failure",
          className: "alert-danger",
          message: action.payload
        }
      };

    case userConstants.USERS_PASSWORD_EMAIL_SUCCESS:
      return {
        ...state,
        loggedIn: false,
        registered: false,
        userError: "",
        passwordEmailSent: true
      };

    case userConstants.EMAIL_VERIFY_FAILURE:
      return {
        ...state,
        loggedIn: false,
        registered: false,
        passwordEmailSent: false,
        userError: {
          type: "password_reset_failure",
          className: "alert-danger",
          message: action.payload
        }
      };

    case userConstants.VERIFY_PASSWORD_RESET_CODE_SUCCESS:
      return {
        ...state,
        loggedIn: false,
        userError: "",
        passwordResetCodeVerified: true
      };

    case userConstants.VERIFY_PASSWORD_RESET_CODE_FAILURE:
      return {
        ...state,
        userError: {
          type: "password_reset_verify_failure",
          className: "alert-danger",
          message: action.payload
        }
      };

    case userConstants.PASSWORD_RESET_SUCCESS:
      return {
        ...state,
        loggedIn: false,
        userError: "",
        passwordWasReset: true
      };

    case userConstants.PASSWORD_RESET_FAILURE:
      return {
        ...state,
        passwordWasReset: false,
        userError: {
          type: "password_reset_failure",
          className: "alert-danger",
          message: action.payload
        }
      };

    case userConstants.UPDATE_SUCCESS:
      return {
        ...state,
        userError: "",
        uploadedFiles: [],
        user: {
          ...state.user,
          ...action.payload
        }
      };

    case userConstants.UPDATE_FAILURE:
      return {
        ...state,
        userError: {
          type: "update_failure",
          className: "alert-danger",
          message:
            "There was a problem saving your information. Please make sure you've filled out all fields and try again."
        }
      };
    case userConstants.UPLOAD_FILES_PENDING:
      return {
        ...state,
        uploadPending: true
      };

    case userConstants.UPLOAD_FILES_SUCCESS:
      return {
        ...state,
        userError: "",
        uploadPending: false,
        uploadedFiles: action.payload
      };

    case userConstants.UPLOAD_FILES_FAILURE:
      return {
        ...state,
        uploadPending: false,
        userError: {
          type: "upload_failure",
          className: "alert-danger",
          message: "There was a problem uploading your files."
        }
      };

    case userConstants.PASSWORD_EMAIL_SUCCESS:
      return {
        ...state,
        passwordEmailSent: true,
        userError: ""
      };

    case userConstants.PASSWORD_EMAIL_FAILURE:
      return {
        ...state,
        userError: {
          type: "password_email_failure",
          className: "alert-danger",
          message: action.payload
        }
      };
      
    case userConstants.UPDATE_USER_PLAN_SUCCESS:
      return state;

    case userConstants.GET_AUTH_URL_SUCCESS:
      return {
        ...state,
        authUrl: action.payload,
        userError: ""
      };

    case userConstants.GET_AUTH_TOKEN_PENDING:
      return {
        ...state,
        authUrl: "",
        userError: "",
        authTokenStatus: "PENDING"
      };

    case userConstants.GET_AUTH_TOKEN_SUCCESS:
      return {
        ...state,
        authUrl: "",
        userError: "",
        adWordsConnect: {
          ...state.adWordsConnect,
          status: 'AUTH_TOKEN_RETRIEVED'
        }
      };

    case userConstants.DEAUTH_SUCCESS:
      return {
        ...state,
        authUrl: "",
        userError: "",
        authTokenStatus: ""
      };

    case userConstants.CHANGE_ADWORDS_STATUS:
      return {
        ...state,
        adWordsConnect: {
          ...state.adWordsConnect,
          status: action.payload
        }
      };

    case userConstants.GET_CAMPAIGNS_SUCCESS:
      return {
        ...state,
        userError: "",
        adWordsConnect: {
          ...state.adWordsConnect,
          campaigns: action.payload,
          status: 'CAMPAIGNS_RETRIEVED'
        }
      };
    
    case userConstants.GET_ADGROUPS_SUCCESS:
      return {
        ...state,
        userError: "",
        adWordsConnect: {
          ...state.adWordsConnect,
          adGroups: action.payload,
          status: 'ADGROUPS_RETRIEVED'
        }
      };

    case userConstants.CREATE_ADGROUP_SUCCESS:
    case userConstants.CREATE_ADGROUP_FAILURE:
      return {
        ...state,
        user: {
          ...state.user,
          adWordsConnect: {
            ...state.user.adWordsConnect,
            adGroups: [...state.user.adWordsConnect.adGroups, action.payload]
          }
        }
      };

    case userConstants.GET_ADGROUPS_FAILURE:
    case userConstants.GET_CAMPAIGNS_FAILURE:
    case userConstants.PUBLISH_ADS_FAILURE:
      return {
        ...state,
        userError: {
          type: "adwords_connect_failure",
          className: "alert-danger",
          message: action.payload
        },
        adWordsConnect: {
          ...state.adWordsConnect,
          status: 'ADWORDS_ERROR'
        }
      };

    case userConstants.PUBLISH_ADS_SUCCESS:
      return {
        ...state,
        userError: "",
        hasPublishedAds: true,
        adWordsConnect: {
          ...state.adWordsConnect,
          status: 'ADS_PUBLISHED'
        }
      };

    case userConstants.GET_AUTH_URL_FAILURE:
    case userConstants.GET_AUTH_TOKEN_FAILURE:
    case userConstants.DEAUTH_FAILURE:
      return {
        ...state,
        authUrl: "",
        authTokenStatus: "",
        userError: {
          type: "auth_url_failure",
          className: "alert-danger",
          message: action.payload
        }
      };

    default:
      return state;
  }
}
