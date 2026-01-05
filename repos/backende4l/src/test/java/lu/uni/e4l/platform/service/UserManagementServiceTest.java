package lu.uni.e4l.platform.service;

import lu.uni.e4l.platform.model.User;
import lu.uni.e4l.platform.model.UserRole;
import lu.uni.e4l.platform.repository.SessionRepository;
import lu.uni.e4l.platform.repository.UserRepository;
import lu.uni.e4l.platform.security.service.JWTService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class UserManagementServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private JWTService jwtService;

    private UserManagementService userManagementService;

    @Before
    public void setUp() {
        userManagementService = new UserManagementService(
            userRepository, passwordEncoder, sessionRepository, jwtService
        );
    }

    @Test
    public void testGetUserList_ShouldFilterOutAdminAndAnonymousUsers() {
        // Given
        User regularUser = createUser(1L, "user@example.com", Set.of(UserRole.USER));
        User adminUser = createUser(2L, "admin@example.com", Set.of(UserRole.ADMIN));
        User anonymousUser = createUser(3L, "anonymous@example.com", Set.of(UserRole.ANONYMOUS));

        List<User> allUsers = Arrays.asList(regularUser, adminUser, anonymousUser);
        when(userRepository.findAll()).thenReturn(allUsers);

        // When
        List<User> result = userManagementService.getUserList();

        // Then
        assertEquals(1, result.size());
        assertEquals("user@example.com", result.get(0).getEmail());
        assertFalse(result.contains(adminUser));
        assertFalse(result.contains(anonymousUser));
    }

    @Test
    public void testGetUserList_ShouldReturnEmptyListWhenNoValidUsers() {
        // Given
        User adminUser = createUser(1L, "admin@example.com", Set.of(UserRole.ADMIN));
        when(userRepository.findAll()).thenReturn(Arrays.asList(adminUser));

        // When
        List<User> result = userManagementService.getUserList();

        // Then
        assertTrue(result.isEmpty());
    }

    @Test
    public void testDeleteUser_ShouldMarkUserAsUnabled() {
        // Given
        Long userId = 1L;
        User user = createUser(userId, "user@example.com", new HashSet<>(Set.of(UserRole.USER)));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // When
        userManagementService.deleteUser(userId);

        // Then
        verify(userRepository).save(user);
        assertTrue(user.getRoles().contains(UserRole.UNABLED));
        assertFalse(user.getRoles().contains(UserRole.USER));
    }

    @Test
    public void testDeleteUser_ShouldNotDeleteAdminUser() {
        // Given
        Long userId = 1L;
        User adminUser = createUser(userId, "admin@example.com", Set.of(UserRole.ADMIN));
        when(userRepository.findById(userId)).thenReturn(Optional.of(adminUser));

        // When
        userManagementService.deleteUser(userId);

        // Then
        verify(userRepository, never()).save(any());
        assertTrue(adminUser.getRoles().contains(UserRole.ADMIN));
    }

    @Test
    public void testDeleteUser_ShouldHandleNonExistentUser() {
        // Given
        Long userId = 999L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When
        userManagementService.deleteUser(userId);

        // Then
        verify(userRepository, never()).save(any());
    }

    private User createUser(Long id, String email, Set<UserRole> roles) {
        User user = new User(email, "Test", "User", new HashSet<>(roles));
        user.setId(id);
        return user;
    }
}
