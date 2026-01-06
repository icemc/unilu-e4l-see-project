import { 
  hideNavButton, 
  showNavButton, 
  hideLogoutButton, 
  showLogoutButton 
} from '../../js/action/navAction';

describe('navAction', () => {
  test('hideNavButton should create HIDE_NAV_BUTTONS action', () => {
    const expectedAction = {
      type: 'HIDE_NAV_BUTTONS',
      payload: {}
    };
    
    expect(hideNavButton()).toEqual(expectedAction);
  });

  test('showNavButton should create SHOW_NAV_BUTTONS action', () => {
    const expectedAction = {
      type: 'SHOW_NAV_BUTTONS',
      payload: {}
    };
    
    expect(showNavButton()).toEqual(expectedAction);
  });

  test('hideLogoutButton should create HIDE_LOGOUT_BUTTONS action', () => {
    const expectedAction = {
      type: 'HIDE_LOGOUT_BUTTONS',
      payload: {}
    };
    
    expect(hideLogoutButton()).toEqual(expectedAction);
  });

  test('showLogoutButton should create SHOW_LOGOUT_BUTTONS action', () => {
    const expectedAction = {
      type: 'SHOW_LOGOUT_BUTTONS',
      payload: {}
    };
    
    expect(showLogoutButton()).toEqual(expectedAction);
  });

  test('all action creators should return objects with type and payload', () => {
    const actions = [
      hideNavButton(),
      showNavButton(),
      hideLogoutButton(),
      showLogoutButton()
    ];

    actions.forEach(action => {
      expect(action).toHaveProperty('type');
      expect(action).toHaveProperty('payload');
      expect(typeof action.type).toBe('string');
      expect(typeof action.payload).toBe('object');
    });
  });
});
