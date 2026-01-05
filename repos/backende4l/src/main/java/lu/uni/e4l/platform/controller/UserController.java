package lu.uni.e4l.platform.controller;

import lu.uni.e4l.platform.exception.ForbiddenException;
import lu.uni.e4l.platform.model.Seminar;
import lu.uni.e4l.platform.model.User;
import lu.uni.e4l.platform.model.UserRole;
import lu.uni.e4l.platform.service.UserManagementService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.*;
import java.util.stream.Collectors;

@RestController
public class UserController {

    private final UserManagementService userManagementService;

    public UserController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @GetMapping("/userlist")
    @PreAuthorize("isAuthenticated()")
    public List<User> getUserList() {
        return userManagementService.getUserList();
    }

    @PostMapping("/user")
    @PreAuthorize("isAuthenticated()")
    public User createUser(@RequestBody User user) {

        if (user.getRoles().contains(UserRole.ADMIN)){
            return null;
        }
        else {
            return userManagementService.createUser(user);
        }
    }
    @DeleteMapping("/user")
    @PreAuthorize("isAuthenticated()")
    public List<User> deleteUser(@RequestBody String userId) {
        Long userIdLong = Long.parseLong(userId);
        userManagementService.deleteUser(userIdLong);

        return userManagementService.getUserList();
    }

    @PutMapping("/user/update")
    @PreAuthorize("isAuthenticated()")
    public User updateUser(@Valid @RequestBody User user) {
        return userManagementService.editProfile(user);
    }

    @PostMapping("/userpass")
    @PreAuthorize("isAuthenticated()")
    public Boolean checkpass(@RequestBody @Valid User user) {
        return userManagementService.checkPassword(user.getId(),user.getPassword());
    }

    @PostMapping("/checkemail")
    public Boolean checkemail(@RequestBody @Valid User user) {
        Optional<User> userOptional = userManagementService.getUserByEmail(user.getUsername());

        if (userOptional.isPresent()) {
            User usertoch = userOptional.get();
            // Assuming the User entity has a method getRoles() that returns a collection of roles
            Set<UserRole> roles = usertoch.getRoles();
            // Check if the user does not have any of the forbidden roles
            return !roles.contains(UserRole.UNABLED) &&
                    !roles.contains(UserRole.ADMIN) &&
                    !roles.contains(UserRole.ANONYMOUS);
        }
        return false; // User is not present, or another condition is not met
    }

    @PostMapping("/tokensend")
    public Boolean tokensend(@RequestBody @Valid User user) {
        return userManagementService.sendToken(user.getUsername());
    }

//    @PostMapping("/tokenval")
//    public Boolean tokenval(@RequestBody @Valid User user, String token) {
//        return userManagementService.validateToken(user.getUsername(),token);
//    }

    @PostMapping("/tokenval")
    public Boolean tokenval(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String token = (String) payload.get("token");
        return userManagementService.validateToken(email,token);
    }

    @PostMapping("/changepass")
    public Boolean changepass(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String pass = (String) payload.get("password");
        String token = (String) payload.get("token");

        return userManagementService.changepass(email, pass,token);
    }

    @GetMapping("/users/me")
    @PreAuthorize("isAuthenticated()")
    public User me() {
        return userManagementService.getCurrentUser();
    }

    @PostMapping("/users/me")
    @PreAuthorize("isAuthenticated()")
    public User editProfile(@RequestBody @Valid User user) {
        User currentUser = userManagementService.getCurrentUser();

        if (currentUser.getRoles().contains(UserRole.ANONYMOUS) ||
                (!currentUser.getRoles().contains(UserRole.ADMIN) && currentUser.getId() != user.getId()))
            throw new ForbiddenException("You do not have permission to edit this user's profile");

        return userManagementService.editProfile(user);
    }

    @PostMapping("/signup")
    public User signup(@RequestBody @Valid User user) {
        return userManagementService.createUser(user);
    }
}