const initialState = {
  vehicle: [],
  // counter:0,
  // counterNO:0,
  // cartid:0,
  paypal_payment: [],
  user: [],
  location: [],
  social_user: [],
  finger_touch: false,
  check_support:[],
  lab_tests:[],
  all_medicines:[],


 
  Status1: "sta",
  Status2: "stat",
 
};

const reducer = (state = initialState, action) => {
 

  if (action.type === "Status") {
    return {
      ...state,
      Status1: action.payload,      
    };
  }

  if (action.type === "Status1") {
    return {
      ...state,
      Status2: action.payload,      
    };
  }

  if (action.type === "selected_tests") {
    return {
      ...state,
      lab_tests: action.payload,      
    };
  }
  if (action.type === "selected_medicines") {
    return {
      ...state,
      all_medicines: action.payload,      
    };
  }
  
  return state;
};

export default reducer;
