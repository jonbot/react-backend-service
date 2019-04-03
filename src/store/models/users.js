export const initialUser = {
  uid: '',
  email: '',
  firstname: '',
  lastname: '',
  language: 'en',
  emailVerified: '',
  registered: '',
  updated: '',
  role: 'client',
  group: '',
  company: '',
  logo: '',
  websiteUrl: '',
  handleInstagram: '',
  handleFacebook: '',
  industry: '',
  companySize: '',
  audiences: {},
  cardInfo: {},
  photoSource: "",
  photos: {},
  ads: {},
  plan: {},
  access: {
    adWords: false,
    facebook: false
  },
};

export const initialUserState = {
  users: {
    user: initialUser,
    userAuthChecked: false,
    loggedIn: false,
    registered: false,
    userError: "",
    passwordEmailSent: false,
    uploadedFiles: [],
    uploadPending: false,
    emailVerified: "",
    passwordEmailSent: false,
    passwordResetCodeVerified: false,
    passwordWasReset: false,
    authUrl: "",
    authTokenStatus: "",
    adWordsConnect: {
      campaigns: {},
      adGroups: {},
      status: "",
    },
    hasPublishedAds: false,  
  }
};

export const requiredFields = [
  //'plan',
  "email",
  // 'firstname',
  // 'lastname',
  "company",
  "industry"
  // 'companySize',
  // 'targetGender',
  // 'targetAge',
  // 'targetLocations',
  // 'photoSource',
];
