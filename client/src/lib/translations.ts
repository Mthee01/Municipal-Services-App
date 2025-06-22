// Translation system for South African municipalities
export interface TranslationKey {
  // Navigation and common
  dashboard: string;
  home: string;
  reports: string;
  payments: string;
  vouchers: string;
  settings: string;
  logout: string;
  login: string;
  register: string;
  
  // Authentication
  username: string;
  password: string;
  email: string;
  phone: string;
  fullName: string;
  municipalityAccountNumber: string;
  keepMeLoggedIn: string;
  createAccount: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  
  // Issue reporting
  reportIssue: string;
  issueTitle: string;
  issueDescription: string;
  category: string;
  priority: string;
  location: string;
  ward: string;
  reporterName: string;
  reporterPhone: string;
  attachPhotos: string;
  submitReport: string;
  
  // Categories
  waterSanitation: string;
  electricity: string;
  roadsTransport: string;
  wasteManagement: string;
  safetySecurity: string;
  housing: string;
  other: string;
  
  // Priorities
  low: string;
  medium: string;
  high: string;
  emergency: string;
  
  // Status
  open: string;
  assigned: string;
  inProgress: string;
  resolved: string;
  closed: string;
  
  // Payments
  waterBill: string;
  electricityBill: string;
  ratesTaxes: string;
  fines: string;
  payNow: string;
  amount: string;
  dueDate: string;
  overdue: string;
  paid: string;
  pending: string;
  
  // Vouchers
  buyVoucher: string;
  waterVoucher: string;
  electricityVoucher: string;
  voucherCode: string;
  voucherAmount: string;
  purchaseDate: string;
  expiryDate: string;
  active: string;
  used: string;
  expired: string;
  
  // Common actions
  view: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  confirm: string;
  close: string;
  next: string;
  previous: string;
  search: string;
  filter: string;
  
  // Messages
  welcome: string;
  yourVoiceMatters: string;
  reportIn60Seconds: string;
  loginSuccessful: string;
  registrationSuccessful: string;
  issueReported: string;
  paymentSuccessful: string;
  voucherPurchased: string;
  
  // Roles
  citizen: string;
  official: string;
  admin: string;
  mayor: string;
  wardCouncillor: string;
  techManager: string;
}

export const translations: Record<string, TranslationKey> = {
  en: {
    // Navigation and common
    dashboard: "Dashboard",
    home: "Home",
    reports: "Reports",
    payments: "Payments",
    vouchers: "Vouchers",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    register: "Register",
    
    // Authentication
    username: "Username",
    password: "Password",
    email: "Email Address",
    phone: "Phone Number",
    fullName: "Full Name",
    municipalityAccountNumber: "Municipality Account Number",
    keepMeLoggedIn: "Keep me logged in",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    
    // Issue reporting
    reportIssue: "Report Issue",
    issueTitle: "Issue Title",
    issueDescription: "Issue Description",
    category: "Category",
    priority: "Priority",
    location: "Location",
    ward: "Ward",
    reporterName: "Reporter Name",
    reporterPhone: "Reporter Phone",
    attachPhotos: "Attach Photos",
    submitReport: "Submit Report",
    
    // Categories
    waterSanitation: "Water & Sanitation",
    electricity: "Electricity",
    roadsTransport: "Roads & Transport",
    wasteManagement: "Waste Management",
    safetySecurity: "Safety & Security",
    housing: "Housing",
    other: "Other",
    
    // Priorities
    low: "Low",
    medium: "Medium",
    high: "High",
    emergency: "Emergency",
    
    // Status
    open: "Open",
    assigned: "Assigned",
    inProgress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
    
    // Payments
    waterBill: "Water Bill",
    electricityBill: "Electricity Bill",
    ratesTaxes: "Rates & Taxes",
    fines: "Fines",
    payNow: "Pay Now",
    amount: "Amount",
    dueDate: "Due Date",
    overdue: "Overdue",
    paid: "Paid",
    pending: "Pending",
    
    // Vouchers
    buyVoucher: "Buy Voucher",
    waterVoucher: "Water Voucher",
    electricityVoucher: "Electricity Voucher",
    voucherCode: "Voucher Code",
    voucherAmount: "Amount",
    purchaseDate: "Purchase Date",
    expiryDate: "Expiry Date",
    active: "Active",
    used: "Used",
    expired: "Expired",
    
    // Common actions
    view: "View",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    next: "Next",
    previous: "Previous",
    search: "Search",
    filter: "Filter",
    
    // Messages
    welcome: "Welcome to Municipal Services",
    yourVoiceMatters: "Your voice matters in building better municipal services",
    reportIn60Seconds: "⚡ Report in under 60 seconds",
    loginSuccessful: "Login successful",
    registrationSuccessful: "Registration successful",
    issueReported: "Issue reported successfully",
    paymentSuccessful: "Payment successful",
    voucherPurchased: "Voucher purchased successfully",
    
    // Roles
    citizen: "Citizen",
    official: "Official",
    admin: "Administrator",
    mayor: "Mayor",
    wardCouncillor: "Ward Councillor",
    techManager: "Technical Manager",
  },
  
  af: {
    // Navigation and common
    dashboard: "Kontrolepaneel",
    home: "Tuis",
    reports: "Verslae",
    payments: "Betalings",
    vouchers: "Koepons",
    settings: "Instellings",
    logout: "Teken uit",
    login: "Teken in",
    register: "Registreer",
    
    // Authentication
    username: "Gebruikersnaam",
    password: "Wagwoord",
    email: "E-pos Adres",
    phone: "Telefoonnommer",
    fullName: "Volledige Naam",
    municipalityAccountNumber: "Munisipaliteit Rekeningnommer",
    keepMeLoggedIn: "Hou my aangemeld",
    createAccount: "Skep Rekening",
    alreadyHaveAccount: "Het reeds 'n rekening?",
    dontHaveAccount: "Het nie 'n rekening nie?",
    
    // Issue reporting
    reportIssue: "Rapporteer Probleem",
    issueTitle: "Probleem Titel",
    issueDescription: "Probleem Beskrywing",
    category: "Kategorie",
    priority: "Prioriteit",
    location: "Ligging",
    ward: "Wyk",
    reporterName: "Verslaggewer Naam",
    reporterPhone: "Verslaggewer Telefoon",
    attachPhotos: "Heg Foto's aan",
    submitReport: "Dien Verslag in",
    
    // Categories
    waterSanitation: "Water & Sanitasie",
    electricity: "Elektrisiteit",
    roadsTransport: "Paaie & Vervoer",
    wasteManagement: "Afvalbestuur",
    safetySecurity: "Veiligheid & Sekuriteit",
    housing: "Behuising",
    other: "Ander",
    
    // Priorities
    low: "Laag",
    medium: "Medium",
    high: "Hoog",
    emergency: "Noodgeval",
    
    // Status
    open: "Oop",
    assigned: "Toegewys",
    inProgress: "In Proses",
    resolved: "Opgelos",
    closed: "Gesluit",
    
    // Payments
    waterBill: "Waterrekening",
    electricityBill: "Elektrisiteitsrekening",
    ratesTaxes: "Tariewe & Belasting",
    fines: "Boetes",
    payNow: "Betaal Nou",
    amount: "Bedrag",
    dueDate: "Vervaldatum",
    overdue: "Oorverskuldig",
    paid: "Betaal",
    pending: "Hangende",
    
    // Vouchers
    buyVoucher: "Koop Koepon",
    waterVoucher: "Water Koepon",
    electricityVoucher: "Elektrisiteit Koepon",
    voucherCode: "Koepon Kode",
    voucherAmount: "Bedrag",
    purchaseDate: "Aankoopdatum",
    expiryDate: "Vervaldatum",
    active: "Aktief",
    used: "Gebruik",
    expired: "Verval",
    
    // Common actions
    view: "Bekyk",
    edit: "Wysig",
    delete: "Verwyder",
    save: "Stoor",
    cancel: "Kanselleer",
    confirm: "Bevestig",
    close: "Sluit",
    next: "Volgende",
    previous: "Vorige",
    search: "Soek",
    filter: "Filter",
    
    // Messages
    welcome: "Welkom by Munisipale Dienste",
    yourVoiceMatters: "Jou stem maak saak in die bou van beter munisipale dienste",
    reportIn60Seconds: "⚡ Rapporteer in minder as 60 sekondes",
    loginSuccessful: "Aanmelding suksesvol",
    registrationSuccessful: "Registrasie suksesvol",
    issueReported: "Probleem suksesvol gerapporteer",
    paymentSuccessful: "Betaling suksesvol",
    voucherPurchased: "Koepon suksesvol gekoop",
    
    // Roles
    citizen: "Burger",
    official: "Amptenaar",
    admin: "Administrateur",
    mayor: "Burgemeester",
    wardCouncillor: "Wyksraadslid",
    techManager: "Tegniese Bestuurder",
  },
  
  zu: {
    // Navigation and common
    dashboard: "Ibhodi Lokulawula",
    home: "Ekhaya",
    reports: "Imibiko",
    payments: "Izinkokhelo",
    vouchers: "Amavawusha",
    settings: "Izilungiselelo",
    logout: "Phuma",
    login: "Ngena",
    register: "Bhalisa",
    
    // Authentication
    username: "Igama Lomsebenzisi",
    password: "Iphasiwedi",
    email: "Ikheli Le-imeyili",
    phone: "Inombolo Yocingo",
    fullName: "Igama Eliphelele",
    municipalityAccountNumber: "Inombolo Ye-akhawunti Kamasipala",
    keepMeLoggedIn: "Ngigcine ngingenile",
    createAccount: "Dala I-akhawunti",
    alreadyHaveAccount: "Usunayo i-akhawunti?",
    dontHaveAccount: "Awunayo i-akhawunti?",
    
    // Issue reporting
    reportIssue: "Bika Inkinga",
    issueTitle: "Isihloko Senkinga",
    issueDescription: "Incazelo Yenkinga",
    category: "Isigaba",
    priority: "Okubalulekile",
    location: "Indawo",
    ward: "Iwadi",
    reporterName: "Igama Lombiki",
    reporterPhone: "Ucingo Lombiki",
    attachPhotos: "Namathisela Izithombe",
    submitReport: "Thumela Umbiko",
    
    // Categories
    waterSanitation: "Amanzi Nokuhlanzeka",
    electricity: "Ugesi",
    roadsTransport: "Imigwaqo Nezokuthutha",
    wasteManagement: "Ukulawulwa Kwemfucuza",
    safetySecurity: "Ukuphepha Nezokuvikela",
    housing: "Izindlu",
    other: "Okunye",
    
    // Priorities
    low: "Okuphansi",
    medium: "Okuphakathi",
    high: "Okuphakeme",
    emergency: "Isimo Esiphuthumayo",
    
    // Status
    open: "Kuvuliwe",
    assigned: "Kwabelwe",
    inProgress: "Kuyaqhubeka",
    resolved: "Kuxazululiwe",
    closed: "Kuvaliwe",
    
    // Payments
    waterBill: "Ibhili Lamanzi",
    electricityBill: "Ibhili Likagesi",
    ratesTaxes: "Izintela Nemithelela",
    fines: "Izinhlawulo",
    payNow: "Khokha Manje",
    amount: "Inani",
    dueDate: "Usuku Lokuphelelwa",
    overdue: "Kuphelelwe Isikhathi",
    paid: "Kukhokhiwe",
    pending: "Kulindile",
    
    // Vouchers
    buyVoucher: "Thenga Ivawusha",
    waterVoucher: "Ivawusha Yamanzi",
    electricityVoucher: "Ivawusha Yikagesi",
    voucherCode: "Ikhodi Yevawusha",
    voucherAmount: "Inani",
    purchaseDate: "Usuku Lokuthenga",
    expiryDate: "Usuku Lokuphelelwa",
    active: "Kusebenza",
    used: "Kusetshenzisiwe",
    expired: "Kuphelelwe",
    
    // Common actions
    view: "Buka",
    edit: "Hlela",
    delete: "Susa",
    save: "Gcina",
    cancel: "Khansela",
    confirm: "Qinisekisa",
    close: "Vala",
    next: "Okulandelayo",
    previous: "Okudlule",
    search: "Sesha",
    filter: "Hlola",
    
    // Messages
    welcome: "Siyakwamukela Ezinsizeni Zikamasipala",
    yourVoiceMatters: "Izwi lakho libalulekile ekwakheni izinsiza zikamasipala ezingcono",
    reportIn60Seconds: "⚡ Bika ngaphansi kwemizuzwana engu-60",
    loginSuccessful: "Ukungenela kuphumelele",
    registrationSuccessful: "Ukubhalisa kuphumelele",
    issueReported: "Inkinga ibikiwe ngempumelelo",
    paymentSuccessful: "Inkokhelo iphumelele",
    voucherPurchased: "Ivawusha ithengwe ngempumelelo",
    
    // Roles
    citizen: "Isakhamuzi",
    official: "Isikhulu",
    admin: "Umphathi",
    mayor: "Umenzi",
    wardCouncillor: "Ikhansela Lewadi",
    techManager: "Umphathi Wezobuchwepheshe",
  },
  
  xh: {
    // Navigation and common
    dashboard: "Ibhodi Yolawulo",
    home: "Ekhaya",
    reports: "Iingxelo",
    payments: "Iintlawulo",
    vouchers: "Iivawutsha",
    settings: "Imimiselo",
    logout: "Phuma",
    login: "Ngena",
    register: "Bhalisa",
    
    // Authentication
    username: "Igama Lomsebenzisi",
    password: "Igama Eligqithisileyo",
    email: "Idilesi Ye-imeyili",
    phone: "Inombolo Yomnxeba",
    fullName: "Igama Elipheleleyo",
    municipalityAccountNumber: "Inombolo Ye-akhawunti Kamasipala",
    keepMeLoggedIn: "Ndigcine ndingene",
    createAccount: "Yenza I-akhawunti",
    alreadyHaveAccount: "Usele unayo i-akhawunti?",
    dontHaveAccount: "Awunayo i-akhawunti?",
    
    // Issue reporting
    reportIssue: "Xela Ingxaki",
    issueTitle: "Isihloko Sengxaki",
    issueDescription: "Inkcazo Yengxaki",
    category: "Udidi",
    priority: "Okubalulekileyo",
    location: "Indawo",
    ward: "Iwadi",
    reporterName: "Igama Lomxeli",
    reporterPhone: "Umnxeba Womxeli",
    attachPhotos: "Qhobosha Imifanekiso",
    submitReport: "Thumela Ingxelo",
    
    // Categories
    waterSanitation: "Amanzi Nococeko",
    electricity: "Umbane",
    roadsTransport: "Iindlela Nezothutho",
    wasteManagement: "Ulawulo Lwenkunkuma",
    safetySecurity: "Ukhuseleko Nokhuseleko",
    housing: "Izindlu",
    other: "Ezinye",
    
    // Priorities
    low: "Ezantsi",
    medium: "Phakathi",
    high: "Ephezulu",
    emergency: "Imeko Engxamisekileyo",
    
    // Status
    open: "Kuvuliwe",
    assigned: "Kwabelwa",
    inProgress: "Kuyaqhubeka",
    resolved: "Kusonjululiwe",
    closed: "Kuvaliwe",
    
    // Payments
    waterBill: "Ityala Lamanzi",
    electricityBill: "Ityala Lombane",
    ratesTaxes: "Iireyiti Neerhafu",
    fines: "Izohlwayo",
    payNow: "Hlawula Ngoku",
    amount: "Imali",
    dueDate: "Umhla Wokuphelelwa",
    overdue: "Kuphelelwe Lixesha",
    paid: "Kuhlawuliwe",
    pending: "Kusalinde",
    
    // Vouchers
    buyVoucher: "Thenga Ivawutsha",
    waterVoucher: "Ivawutsha Yamanzi",
    electricityVoucher: "Ivawutsha Yombane",
    voucherCode: "Ikhowudi Yevawutsha",
    voucherAmount: "Imali",
    purchaseDate: "Umhla Wokuthenga",
    expiryDate: "Umhla Wokuphelelwa",
    active: "Kusebenza",
    used: "Kusetyenzisiwe",
    expired: "Kuphelelwe",
    
    // Common actions
    view: "Jonga",
    edit: "Hlela",
    delete: "Cima",
    save: "Gcina",
    cancel: "Rhoxisa",
    confirm: "Qinisekisa",
    close: "Vala",
    next: "Okulandelayo",
    previous: "Okudlulileyo",
    search: "Khangela",
    filter: "Cinga",
    
    // Messages
    welcome: "Wamkelekile Kwiinkonzo Zikamasipala",
    yourVoiceMatters: "Ilizwi lakho libalulekile ekwakheni iinkonzo zikamasipala ezingcono",
    reportIn60Seconds: "⚡ Xela ngaphantsi kwemizuzwana engama-60",
    loginSuccessful: "Ukungenela kuphumelele",
    registrationSuccessful: "Ukubhalisa kuphumelele",
    issueReported: "Ingxaki ixeliwe ngempumelelo",
    paymentSuccessful: "Intlawulo iphumelele",
    voucherPurchased: "Ivawutsha ithengwe ngempumelelo",
    
    // Roles
    citizen: "Ummi",
    official: "Igosa",
    admin: "Umlawuli",
    mayor: "Usodolophu",
    wardCouncillor: "Ikhanselam Lewadi",
    techManager: "Umlawuli Wezobuchwephesha",
  }
};

// Language context and hook
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' }
];

// Translation hook
export function useTranslation(language: string = 'en') {
  const t = translations[language] || translations.en;
  
  return {
    t,
    language,
    supportedLanguages
  };
}

// Helper function to get translated text
export function getTranslation(key: keyof TranslationKey, language: string = 'en'): string {
  const t = translations[language] || translations.en;
  return t[key] || translations.en[key] || key;
}