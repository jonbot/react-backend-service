import { userConstants } from "./actionType";
import * as userService from "../../services/user.service";
// import * as photoService from '../../services/photo.service';

import { initialUser } from "../models/users";

import * as helpers from "../../helpers";
import { history } from "../../helpers/history";
import { planOptions } from "../../helpers/formOptions";
import approvedRoutes from "../../helpers/approvedRoutes";
import * as errorConstants from "../../helpers/errors";

import * as adActions from "./ads.action";
import * as photoActions from "./photos.action";
import BackendService from "../../backend/service";

export const registerStart = () => {
  return {
    type: userConstants.REGISTER_START
  };
};

export const register = (formVals = {}) => {
  return dispatch => {
    dispatch(registerStart());

    BackendService.registerUser(formVals)
      .then(user => {
        let extraData = { plan: formVals.plan };
        let query = helpers.serialize(extraData);
        let continueUrl = approvedRoutes.homePage + "?" + query + "#login";

        return BackendService.sendEmailConfirm(formVals.email, continueUrl);
      })
      .then(res => {
        dispatch(logout());
        dispatch(success());
      })
      .catch(error => {
        dispatch(failure(errorConstants.firebaseErrors[error.code]));
      });
  };

  function success() {
    return { type: userConstants.REGISTER_SUCCESS };
  }
  function failure(error) {
    return { type: userConstants.REGISTER_FAILURE, payload: error };
  }
};

export const loginStart = () => {
  return {
    type: userConstants.LOGIN_START
  };
};

// @TODO: Un-nest promises.
export const login = (email = "", password = "", plan = "") => {
  let firstLogin = false;
  let curUser = null;

  return (dispatch, getState) => {
    dispatch(loginStart());

    BackendService.loginUser(email, password)
      .then(userCredential => {
        curUser = getState().users.user;
        const planKeys = Object.keys(planOptions);

        const planObj =
          planOptions[plan] && plan !== planKeys[0]
            ? {
                name: plan,
                quota: +plan.split("ads")[0]
              }
            : {
                name: planKeys[0],
                quota: 10
              };

        // First-time login.
        if (curUser.emailVerified === "") {
          dispatch(
            update({
              ...curUser,
              email,
              plan: planObj,
              uid: userCredential.uid,
              emailVerified: new Date()
            })
          );

          firstLogin = true;
          return dispatch(firstTimeLogin(userCredential.uid, planObj));
        } 

        return true;

      }).then(() => {
        return dispatch(success(processUser(curUser)));

      }).then(() => {

        if (firstTimeLogin) {
          history.push("/process");
        } else {
          history.push("/dashboard");
        }

      }).catch(error => {
        const errorMessage =
          typeof errorConstants.firebaseErrors[error.code] !== "undefined"
            ? errorConstants.firebaseErrors[error.code]
            : errorConstants.firebaseErrors["auth/invalid-email"];
        dispatch(failure(errorMessage));
      });
  };

  function success(user) {
    return { type: userConstants.LOGIN_SUCCESS, payload: user };
  }
  function failure(error) {
    return { type: userConstants.LOGIN_FAILURE, payload: error };
  }
};


const firstTimeLogin = (uid = '', plan = {}) => {
  return {
    type: userConstants.PURCHASE,
    payload: {
      transactionId: uid,
      transactionTotal: 0.00,
      transactionAffiliation: window.location.hostname,
      transactionProducts: [ {
        sku: plan.name,
        name: plan.name,
        price: 0.00,
        quantity: 1,
      }],
    },
  }
}


export const verifyEmail = (actionCode = "") => {
  return dispatch => {
    BackendService.verifyEmail(actionCode)
      .then(res => {
        dispatch(success());
      })
      .catch(verifyError => {
        dispatch(failure(errorConstants.firebaseErrors[verifyError.code]));
      });
  };
  function success() {
    return { type: userConstants.EMAIL_VERIFY_SUCCESS };
  }
  function failure(error) {
    return { type: userConstants.EMAIL_VERIFY_FAILURE, payload: error };
  }
};

export const verifyPasswordResetCode = (actionCode = "") => {
  return dispatch => {
    BackendService.verifyPasswordResetCode(actionCode)
      .then(email => {
        dispatch(success(email));
      })
      .catch(verifyError => {
        dispatch(failure(errorConstants.firebaseErrors[verifyError.code]));
      });
  };
  function success(email) {
    return {
      type: userConstants.VERIFY_PASSWORD_RESET_CODE_SUCCESS,
      payload: email
    };
  }
  function failure(error) {
    return {
      type: userConstants.VERIFY_PASSWORD_RESET_CODE_FAILURE,
      payload: error
    };
  }
};

export const resetPassword = (actionCode = "", password = "") => {
  return dispatch => {
    BackendService.resetPassword(actionCode, password)
      .then(() => {
        dispatch(success());
      })
      .catch(error => {
        dispatch(failure(errorConstants.firebaseErrors[error.code]));
      });
  };
  function success() {
    return { type: userConstants.PASSWORD_RESET_SUCCESS };
  }
  function failure(error) {
    return { type: userConstants.PASSWORD_RESET_FAILURE, payload: error };
  }
};

export const process = (user = {}) => {
  return dispatch => {
    if (user.ads && Object.keys(user.ads).length > 0) {
      BackendService.getTracking();
      dispatch(adActions.processAds(Object.keys(user.ads)));
    }

    if (user.photos && Object.keys(user.photos).length > 0) {
      dispatch(photoActions.processPhotos(Object.keys(user.photos)));
    }

    return dispatch({
      type: userConstants.PROCESS_USER,
      payload: processUser(user)
    });
  };
};

const processUser = (user = {}) => {
  let processedUser = initialUser;
  const skip = ["constructor", "password"]; // Never keep password around.

  for (let i in user) {
    if (
      typeof initialUser[i] !== "undefined" &&
      !helpers.isBlank(user[i]) &&
      skip.indexOf(i) < 0
    ) {
      processedUser = {
        ...processedUser,
        [i]: user[i]
      };
    }
  }

  // Don't even keep the field name.
  processedUser = helpers.deleteProperty(processedUser, "password");
  return processedUser;
};

export const userIsLoggedIn = () => {
  return {
    type: userConstants.USER_LOGGED_IN,
    payload: {}
  };
};

export const userNotLoggedIn = () => {
  return {
    type: userConstants.USER_NOT_LOGGED_IN,
    payload: {}
  };
};

export const update = (user = {}, first = false) => {
  return (dispatch, getState) => {
    //Make sure user data is in correct format. 
    let cleanedUser = helpers.prepareUserforSave(user);

    let updatedUser = {
      ...cleanedUser,
      updated: new Date(),
    }
    return BackendService.update("users/" + user.uid, updatedUser)
      .then((res) => { 
        if (first) {
          console.log('process');
          BackendService.freeTrialProcess(user.uid, user.email, getState().intl.locale);
        }
        dispatch(success(user));
      })
      .catch(error => {
        let errorMessage = errorConstants.updateFailure;
        dispatch(failure(errorMessage));
      });
  };

  function success(user) {
    return { type: userConstants.UPDATE_SUCCESS, payload: user };
  }
  function failure(error) {
    return { type: userConstants.UPDATE_FAILURE, payload: error };
  }
};

export const uploadClientLogo = file => {
  return (dispatch, getState) => {
    // @TODO: Check mime types?
    const user = getState().users.user;

    BackendService.uploadFiles("client_logos/", [file])
      .then(metadatas => {
        let toUpdate = {
          ...user,
          logo: metadatas[0]
        };

        dispatch(update(toUpdate));
        dispatch(success());
      })
      .catch(error => {
        console.log("could not upload logo", error);
      });
  };

  function success() {
    return { type: userConstants.UPLOAD_FILES_SUCCESS };
  }
  // function failure(error) { return { type: userConstants.UPDATE_FAILURE, payload: error } }
};

export const uploadClientPhotos = (files = []) => {
  return (dispatch, getState) => {
    // @TODO: Check mime types?
    const user = getState().users.user;
    let photosData = [];
    dispatch(pending());
    return new Promise(resolve => {
      BackendService.uploadFiles("client_uploads/", files)
        .then(metadatas => {
          let promises = metadatas.map((data, i) => {
            data = {
              ...data,
              uid: user.uid
            };
            return BackendService.create("photos", data);
          });

          photosData = [...photosData, ...metadatas];

          return Promise.all(promises)
            .then(photoIDs => {
              return photoIDs;
            })
            .catch(error => {
              let errorMessage = "Problem with creating photo record";
              dispatch(failure(errorMessage));
            });
        })
        .then(photoIDs => {
          let vals = {
            photos: {
              ...user.photos
            }
          };

          // let newVals = photoIDs.map(photo => {
          //   vals.photos = {
          //     ...vals.photos,
          //     [photo]: true,
          //   }
          // });

          return BackendService.update("users/" + user.uid, vals)
            .then(res => {
              dispatch(success(photoIDs));
              resolve(
                photoIDs.map((id, i) => ({
                  [id]: photosData[i].downloadUrl
                }))
              );
            })
            .catch(error => {
              let errorMessage = "Problem with updating user record";
              resolve(dispatch(failure(errorMessage)));
            });
        })
        .catch(error => {
          let errorMessage = "Problem with uploading files.";
          resolve(dispatch(failure(errorMessage)));
        });
    });
  };
  function pending() {
    return { type: userConstants.UPLOAD_FILES_PENDING, payload: true };
  }
  function success(photoIDs) {
    return { type: userConstants.UPLOAD_FILES_SUCCESS, payload: photoIDs };
  }
  function failure(error) {
    return { type: userConstants.UPLOAD_FILES_FAILURE, payload: error };
  }
};

export const logout = () => {
  return dispatch => {
    BackendService.logout()
      .then(res => {
        if (typeof res.logout !== "undefined") {
          if (window.location.pathname !== "/") {
            history.push(approvedRoutes.homePage + "#login");
          }

          return dispatch(success(res));
        } else {
          let errorMessage = errorConstants.logoutFailure;
          return dispatch(failure(errorMessage));
        }
      })
      .catch(error => {
        return dispatch(failure(error));
      });
  };

  function success(result) {
    return { type: userConstants.LOGOUT, payload: null };
  }
  function failure(error) {
    return { type: userConstants.LOGOUT_FAILURE, payload: error };
  }
};

export const sendPasswordEmail = (email = "") => {
  const continueUrl = "/#login";
  return dispatch => {
    return BackendService.sendPasswordEmail(email, continueUrl)
      .then(() => {
        dispatch(success());
      })
      .catch(error => {
        const errorMessage =
          typeof error.code !== "undefined"
            ? errorConstants.firebaseErrors[error.code]
            : errorConstants.resetPasswordError;
        dispatch(failure(errorMessage));
      });
  };

  function success() {
    return { type: userConstants.PASSWORD_EMAIL_SUCCESS };
  }
  function failure(error) {
    return { type: userConstants.PASSWORD_EMAIL_FAILURE, payload: error };
  }
};

export const getUserPlan = () => {
  return (dispatch, getState) => {
    const { plan, uid } = getState().users.user;
    const planKeys = Object.keys(planOptions);

    return {
      isFree: [null, undefined, planKeys[0]].includes(plan.name) || !plan,
      isTrial: [planKeys[1]].includes(plan.name),
      quota: plan.quota || 0,
    };
  };
};

export const updateUserPlan = plan => {
  return (dispatch, getState) => {
    // @TODO: update user plan/quota
    dispatch(success());
  };
  function success() {
    return { type: userConstants.UPDATE_USER_PLAN_SUCCESS };
  }
};

export const getAdGroups = (type = "adWords", uid = "", campaignId = '') => {
  const success = campaign => ({
    type: userConstants.GET_ADGROUPS_SUCCESS,
    payload: campaign
  });
  const failure = error => ({
    type: userConstants.GET_ADGROUPS_FAILURE,
    payload: error
  });
  const pending = () => ({
    type: userConstants.CHANGE_ADWORDS_STATUS, 
    payload: "GET_ADGROUPS_PENDING",
  });

  return dispatch => {
    let promise = "";

    dispatch(pending());

    switch (type) {
      case "adWords":
      default:
        promise = BackendService.callHttpsFunction("adWords-getAdGroups", {
          uid: uid,
          campaignId: campaignId,
        });
    }

    promise
      .then(adGroups => dispatch(success(adGroups)))
      .catch(err => dispatch(failure(err.message)));
  };
};

export const createAdGroup = (
  uid = "",
  bid = null,
  campaignId = "",
  name = ""
) => {
  const success = () => ({
    type: userConstants.CREATE_ADGROUP_SUCCESS,
    payload: name
  });
  const failure = err => ({
    type: userConstants.CREATE_ADGROUP_FAILURE,
    payload: err
  });
  return dispatch => {
    let promise = BackendService.callHttpsFunction("adWords-createAdGroup", {
      uid,
      bid,
      campaignId,
      name
    });
    promise
      .then(result => dispatch(success))
      .catch(err => dispatch(failure(err)));
  };
};

export const getCampaigns = (type = "adWords", uid = "") => {
  const success = campaign => ({
    type: userConstants.GET_CAMPAIGNS_SUCCESS,
    payload: campaign
  });
  const failure = error => ({
    type: userConstants.GET_CAMPAIGNS_FAILURE,
    payload: error
  });
  function pending() {
    return { type: userConstants.CHANGE_ADWORDS_STATUS, payload: "GET_CAMPAIGNS_PENDING" };
  }

  return dispatch => {
    let promise = "";

    dispatch(pending());

    switch (type) {
      case "adWords":
      default:
        promise = BackendService.callHttpsFunction("adWords-getCampaigns", {
          uid: uid
        });
    }

    promise
      .then(campaigns => {
        dispatch(success(campaigns));
      })
      .catch(err => {
        dispatch(failure(err.message));
      });
  };
};

export const publishAds = (type = "adWords", uid = '', adIds = [], adGroupId = '') => {
  return dispatch => {
    let promise = "";

    dispatch(pending());

    switch (type) {
      case "adWords":
      default:
        promise = BackendService.callHttpsFunction("adWords-publishAds", {
          uid: uid,
          adIds: adIds,
          adGroupId: adGroupId,
        });
    }

    promise
      .then(result => {
        dispatch(success());
      })
      .catch(error => {
        dispatch(failure(error.message));
      });
  };

  function pending() {
    return { type: userConstants.CHANGE_ADWORDS_STATUS, payload: "PUBLISH_ADS_PENDING" };
  }
  function success() {
    return { type: userConstants.PUBLISH_ADS_SUCCESS, payload: type };
  }
  function failure(error) {
    return { type: userConstants.PUBLISH_ADS_FAILURE, payload: error };
  }
};

export const resetAdWordsStatus = () => {
  return { 
    type: userConstants.CHANGE_ADWORDS_STATUS, 
    payload: ""
  };
};

export const getAuthUrl = (type = "adWords") => {
  return dispatch => {
    let promise = "";

    dispatch(pending());

    switch (type) {
      case "adWords":
      default:
        promise = BackendService.callHttpsFunction("adWords-getAuthUrl", {
          domain: window.location.origin + window.location.pathname // No query vars.
        });
    }

    promise
      .then(authUrl => {
        dispatch(success(authUrl));
      })
      .catch(error => {
        dispatch(failure(error));
      });
  };

  function pending() {
    return { type: userConstants.CHANGE_ADWORDS_STATUS, payload: "AUTH_URL_PENDING" };
  }
  function success(authUrl) {
    return { type: userConstants.GET_AUTH_URL_SUCCESS, payload: authUrl };
  }
  function failure(error) {
    return { type: userConstants.GET_AUTH_URL_FAILURE, payload: error };
  }
};

export const getAuthToken = (type = "adWords", uid = "", code = "") => {
  return (dispatch, getState) => {
    let promise = "";

    dispatch(pending());

    switch (type) {
      case "adWords":
      default:
        promise = BackendService.callHttpsFunction("adWords-getAuthToken", {
          domain: window.location.origin + window.location.pathname,
          uid: uid,
          code: code
        });
    }

    promise
      .then(result => {
        if (!result.tokenReceived) {
          throw "Token not received";
        }

        let user = getState().users.user;
        user.access = {
          ...user.access,
          adWords: true
        };

        return dispatch(update(user));
      })
      .then(() => {
        dispatch(success());
      })
      .catch(error => {
        dispatch(failure(error));
      });
  };

  function pending() {
    return { type: userConstants.GET_AUTH_TOKEN_PENDING };
  }
  function success() {
    return { type: userConstants.GET_AUTH_TOKEN_SUCCESS };
  }
  function failure(error) {
    return { type: userConstants.GET_AUTH_TOKEN_FAILURE, payload: error };
  }
};

export const deAuth = (type = "adWords", uid = "") => {
  return (dispatch, getState) => {
    let promise = "";

    switch (type) {
      case "adWords":
      default:
        promise = BackendService.callHttpsFunction("adWords-deAuthUser", {
          uid: uid
        });
    }

    promise
      .then(result => {
        let user = getState().users.user;
        user.access = {
          ...user.access,
          adWords: false
        };

        return dispatch(update(user));
      })
      .then(() => {
        //dispatch(success());
      })
      .catch(error => {
        dispatch(failure(error));
      });
  };

  function success(authUrl) {
    return { type: userConstants.DEAUTH_SUCCESS };
  }
  function failure(error) {
    return { type: userConstants.DEAUTH_FAILURE, payload: error };
  }
};

export const preSetUser = (data) => ({
  type: userConstants.PRE_SET_USER_DATA,
  payload: data,
})
