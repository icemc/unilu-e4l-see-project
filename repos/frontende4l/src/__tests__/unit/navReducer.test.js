import navReducer from '../../js/reducer/navReducer';

describe('navReducer', () => {
  const initialState = {
    isNavButtonsDisabled: "false",
    isLogoutButtonDisabled: "true",
  };

  test('should return initial state when no action is provided', () => {
    const result = navReducer(undefined, {});
    expect(result).toEqual(initialState);
  });

  test('should handle HIDE_NAV_BUTTONS action', () => {
    const action = { type: 'HIDE_NAV_BUTTONS' };
    const result = navReducer(initialState, action);
    
    expect(result.isNavButtonsDisabled).toBe("true");
    expect(result.isLogoutButtonDisabled).toBe("true");
  });

  test('should handle SHOW_NAV_BUTTONS action', () => {
    const action = { type: 'SHOW_NAV_BUTTONS' };
    const result = navReducer(initialState, action);
    
    expect(result.isNavButtonsDisabled).toBe("false");
    expect(result.isLogoutButtonDisabled).toBe("true");
  });

  test('should handle HIDE_LOGOUT_BUTTONS action', () => {
    const action = { type: 'HIDE_LOGOUT_BUTTONS' };
    const result = navReducer(initialState, action);
    
    expect(result.isNavButtonsDisabled).toBe("false");
    expect(result.isLogoutButtonDisabled).toBe("true");
  });

  test('should handle SHOW_LOGOUT_BUTTONS action', () => {
    const action = { type: 'SHOW_LOGOUT_BUTTONS' };
    const result = navReducer(initialState, action);
    
    expect(result.isNavButtonsDisabled).toBe("true");
    expect(result.isLogoutButtonDisabled).toBe("false");
  });

  test('should not mutate the original state', () => {
    const action = { type: 'HIDE_NAV_BUTTONS' };
    const stateBefore = { ...initialState };
    navReducer(initialState, action);
    
    expect(initialState).toEqual(stateBefore);
  });
});
