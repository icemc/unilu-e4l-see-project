package lu.uni.e4l.platform.model;

import org.junit.Before;
import org.junit.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.*;

import static org.junit.Assert.*;

public class UserTest {

    private User user;

    @Before
    public void setUp() {
        Set<UserRole> roles = new HashSet<>();
        roles.add(UserRole.USER);
        user = new User("test@example.com", "John", "Doe", roles);
    }

    @Test
    public void testUserCreation_ShouldSetBasicProperties() {
        // Then
        assertEquals("Email should be set correctly", "test@example.com", user.getEmail());
        assertEquals("Name should be set correctly", "John", user.getName());
        assertEquals("Last name should be set correctly", "Doe", user.getLast_name());
        assertEquals("Default language should be English", Locale.ENGLISH, user.getLanguage());
    }

    @Test
    public void testGetUsername_ShouldReturnEmail() {
        // When
        String username = user.getUsername();

        // Then
        assertEquals("Username should be the email", "test@example.com", username);
    }

    @Test
    public void testGetAuthorities_ShouldReturnRolesAsAuthorities() {
        // Given
        Set<UserRole> roles = new HashSet<>();
        roles.add(UserRole.USER);
        roles.add(UserRole.ADMIN);
        user.setRoles(roles);

        // When
        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();

        // Then
        assertEquals("Should have 2 authorities", 2, authorities.size());
        assertTrue("Should contain USER authority",
            authorities.stream().anyMatch(auth -> auth.getAuthority().equals("USER")));
        assertTrue("Should contain ADMIN authority",
            authorities.stream().anyMatch(auth -> auth.getAuthority().equals("ADMIN")));
    }

    @Test
    public void testAccountFlags_ShouldReturnTrueByDefault() {
        // Then
        assertTrue("Account should not be expired", user.isAccountNonExpired());
        assertTrue("Account should not be locked", user.isAccountNonLocked());
        assertTrue("Credentials should not be expired", user.isCredentialsNonExpired());
        assertTrue("User should be enabled", user.isEnabled());
    }

    @Test
    public void testSetPassword_ShouldUpdatePassword() {
        // Given
        String newPassword = "newPassword123";

        // When
        user.setPassword(newPassword);

        // Then
        assertEquals("Password should be updated", newPassword, user.getPassword());
    }

    @Test
    public void testSetLanguage_ShouldUpdateLanguage() {
        // Given
        Locale newLanguage = Locale.FRENCH;

        // When
        user.setLanguage(newLanguage);

        // Then
        assertEquals("Language should be updated", Locale.FRENCH, user.getLanguage());
    }

    @Test
    public void testRoleManagement_ShouldAllowAddingAndRemovingRoles() {
        // Given
        Set<UserRole> newRoles = new HashSet<>();
        newRoles.add(UserRole.ADMIN);

        // When
        user.setRoles(newRoles);

        // Then
        assertTrue("Should contain ADMIN role", user.getRoles().contains(UserRole.ADMIN));
        assertFalse("Should not contain USER role", user.getRoles().contains(UserRole.USER));
    }
}
