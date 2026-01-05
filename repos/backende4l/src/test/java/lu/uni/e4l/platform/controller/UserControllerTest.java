package lu.uni.e4l.platform.controller;

import lu.uni.e4l.platform.model.User;
import lu.uni.e4l.platform.model.UserRole;
import lu.uni.e4l.platform.service.UserManagementService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class UserControllerTest {

    @Mock
    private UserManagementService userManagementService;

    private UserController userController;

    @Before
    public void setUp() {
        userController = new UserController(userManagementService);
    }

    @Test
    public void testGetUserList_ShouldReturnUsersFromService() {
        // Given
        User user1 = createUser(1L, "user1@example.com", Set.of(UserRole.USER));
        User user2 = createUser(2L, "user2@example.com", Set.of(UserRole.USER));
        List<User> expectedUsers = Arrays.asList(user1, user2);

        when(userManagementService.getUserList()).thenReturn(expectedUsers);

        // When
        List<User> result = userController.getUserList();

        // Then
        assertEquals("Should return users from service", expectedUsers, result);
        assertEquals("Should return 2 users", 2, result.size());
        verify(userManagementService).getUserList();
    }

    @Test
    public void testCreateUser_ShouldCreateRegularUser() {
        // Given
        User userToCreate = createUser(null, "newuser@example.com", Set.of(UserRole.USER));
        User createdUser = createUser(1L, "newuser@example.com", Set.of(UserRole.USER));

        when(userManagementService.createUser(userToCreate)).thenReturn(createdUser);

        // When
        User result = userController.createUser(userToCreate);

        // Then
        assertNotNull("Should return created user", result);
        assertEquals("Should return user with ID", Long.valueOf(1L), Long.valueOf(result.getId()));
        verify(userManagementService).createUser(userToCreate);
    }

    @Test
    public void testCreateUser_ShouldRejectAdminUser() {
        // Given
        User adminUser = createUser(null, "admin@example.com", Set.of(UserRole.ADMIN));

        // When
        User result = userController.createUser(adminUser);

        // Then
        assertNull("Should return null for admin user", result);
        verify(userManagementService, never()).createUser(any(User.class));
    }

    @Test
    public void testDeleteUser_ShouldCallServiceAndReturnUpdatedList() {
        // Given
        String userId = "123";
        User remainingUser = createUser(2L, "remaining@example.com", Set.of(UserRole.USER));
        List<User> updatedList = Arrays.asList(remainingUser);

        when(userManagementService.getUserList()).thenReturn(updatedList);

        // When
        List<User> result = userController.deleteUser(userId);

        // Then
        assertEquals("Should return updated user list", updatedList, result);
        verify(userManagementService).deleteUser(123L);
        verify(userManagementService).getUserList();
    }

    @Test(expected = NumberFormatException.class)
    public void testDeleteUser_ShouldHandleInvalidUserId() {
        // Given
        String invalidUserId = "not-a-number";

        // When
        userController.deleteUser(invalidUserId);

        // Then - expect NumberFormatException
    }

    private User createUser(Long id, String email, Set<UserRole> roles) {
        User user = new User(email, "Test", "User", new HashSet<>(roles));
        if (id != null) {
            user.setId(id);
        }
        return user;
    }
}
