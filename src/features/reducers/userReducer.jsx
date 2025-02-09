const initialState = {
  user: null,
  role: null,
  name: null, 
  email: null, 
  numdep: null, 
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        role: action.payload.role,
        name: action.payload.name, 
        email: action.payload.email, 
        numdep: action.payload.numdep, 
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        role: null,
        name: null, 
        email: null,
        numdep: null,
      };
    default:
      return state;
  }
};