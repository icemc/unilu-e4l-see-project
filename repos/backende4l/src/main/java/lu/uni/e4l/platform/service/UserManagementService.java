package lu.uni.e4l.platform.service;

import com.google.common.collect.Sets;
import lu.uni.e4l.platform.exception.BadRequestException;
import lu.uni.e4l.platform.exception.ForbiddenException;
import lu.uni.e4l.platform.exception.NotFoundException;
import lu.uni.e4l.platform.model.Seminar;
import lu.uni.e4l.platform.model.Session;
import lu.uni.e4l.platform.model.SeminarView;
import lu.uni.e4l.platform.service.ContactUsService;
import lu.uni.e4l.platform.security.service.JWTService;
import lu.uni.e4l.platform.model.User;
import lu.uni.e4l.platform.model.UserRole;
import lu.uni.e4l.platform.repository.UserRepository;
import lu.uni.e4l.platform.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.util.Date;
import java.util.Optional;

import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;


@Service
public class UserManagementService {

    private final static String ANONYMOUS_USERNAME = "anonymous";

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${e4l.contact.email}")
    private String contactEmail;
    @Value("${jwt.secret}")
    private String secretKey;


    @Autowired
    private ContactUsService contactUsService;
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private final SessionRepository sessionRepository;
    @Autowired
    private final JWTService jwtService;
    public UserManagementService(UserRepository userRepository,
                                 PasswordEncoder passwordEncoder, SessionRepository sessionRepository,JWTService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionRepository = sessionRepository;
        this.jwtService = jwtService;
    }

    public List<User> getUserList() {
        return StreamSupport.stream(userRepository.findAll().spliterator(), true)
                .filter(user -> !user.getRoles().contains(UserRole.ADMIN) && !user.getRoles().contains(UserRole.ANONYMOUS) && !user.getRoles().contains(UserRole.UNABLED))
                .sorted(Comparator.comparing(User::getUsername).reversed())
                .collect(Collectors.toList());
    }

    public void deleteUser(Long userId) {
//        List<Session> sessions = StreamSupport.stream(sessionRepository.findAll().spliterator(), true)
//                .filter(s -> s.getUser() != null && s.getUser().getId() == userId)
//                .collect(Collectors.toList());
//
//        User anonymousUser1 = userRepository.findByEmail("anonymous");
//
//        if (anonymousUser1 == null) {
//            // Handle the case where the anonymous user does not exist
//            System.out.println("Anonymous user not found");
//            return;
//        }
//        for (Session session : sessions) {
//            session.setUser(anonymousUser1);
//        }
//
//        sessionRepository.saveAll(sessions);

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent() && !userOptional.get().getRoles().contains(UserRole.ADMIN)) {
            User user = userOptional.get();
            // Clear existing roles and set to UNABLED (assuming you meant a role like DISABLED or something similar)
            user.getRoles().clear(); // Clear current roles
            user.getRoles().add(UserRole.UNABLED); // Add the UNABLED role
            userRepository.save(user); // Save the user back with the new role
        }
//            userRepository.deleteById(userId);

    }

    public Boolean checkPassword(Long userId, String pass) {
        Optional<User> userToCheckOptional = StreamSupport.stream(userRepository.findAll().spliterator(), true)
                .filter(s -> s.getId() == userId)
                .findFirst();

        if (userToCheckOptional.isPresent()) {
            User userToCheck = userToCheckOptional.get();
            return passwordEncoder.matches(pass, userToCheck.getPassword());
        } else {
            return false; // User with the given ID not found
        }
    }

    public Boolean sendToken(String email) {
        System.out.println("Token sent to" + email);

        // Generate JWT with a 1-minute expiration
        long expirationTimeInMilliSeconds = 300000; // 1 minute
        Date issuedAt = new Date();
        Date expiration = new Date(issuedAt.getTime() + expirationTimeInMilliSeconds);

        // Assuming your JWTService has a method to get the signing key
//        String token = JWT.create()
//                .withSubject(email)
//                .withIssuedAt(issuedAt)
//                .withExpiresAt(expiration)
//                .sign(Algorithm.HMAC512(secretKey));
        String token2 = UUID.randomUUID().toString();
        // Fetch the user by email
        User user = userRepository.findByEmail(email);
        if (user == null) {
            System.out.println("No user found with email: " + email);
            return false;
        }

        user.setToken(token2); // Assuming User class has setToken method
        user.setTokenExpiration(expiration);
        userRepository.save(user);

        // Send the token using the ContactUsService (adapt as needed)
        String message = "Your reset token is: " + token2;
        contactUsService.sendEmailToken(email, message);

        return true;
    }

    @Scheduled(fixedRate = 300000) // Run every minute
    private void cleanExpiredTokens() {
        Date now = new Date();
        List<User> usersWithExpiredTokens = userRepository.findByTokenExpirationBefore(now);
        for (User user : usersWithExpiredTokens) {
            user.setToken(null);
            user.setTokenExpiration(null);
            userRepository.save(user);
        }
    }

    public Boolean validateToken(String email, String token) {
        User user = userRepository.findByEmail(email);
        if (user != null && user.getToken() != null) {
            return user.getToken().equals(token);
        }
        return false;
    }
    public Boolean changepass(String email, String pass, String token) {
        User user = userRepository.findByEmail(email);
        if (user != null && user.getToken() != null && user.getToken().equals(token)) {
            user.setPassword(passwordEncoder.encode(pass));
            user.setToken(null);
            user.setTokenExpiration(null);
            userRepository.save(user);
            return true;
        }
            return false;
    }
    public User getAnonymousUser() {
        return getUserByEmail(ANONYMOUS_USERNAME).orElseThrow(() -> new NotFoundException("Anonymous user not found"));
    }

    public Optional<User> getUserByEmail(String email) {
        return Optional.ofNullable(userRepository.findByEmail(email));
    }

    public User createUser(User user) {

        if (user.getPassword() == null ||user.getName() == null || user.getLastName() == null || user.getEmail() == null
                || user.getPassword().isEmpty() || user.getEmail().isEmpty() || user.getName().isEmpty()|| user.getLastName().isEmpty()  || user.getRoles().contains(UserRole.ADMIN))
            throw new BadRequestException("Empty email or password");

        try {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("User with this email is already registered");
        }
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication instanceof AnonymousAuthenticationToken
                || !(authentication.getPrincipal() instanceof User))
            return getAnonymousUser();

        return userRepository.findById(((User) authentication.getPrincipal()).getId())
                .orElseThrow(() -> new ForbiddenException("You've been deleted from the system"));
    }

    public User editProfile(User newUser) {
        if (newUser.getName() == null || newUser.getLastName() == null || newUser.getEmail() == null
                || newUser.getEmail().isEmpty() || newUser.getName().isEmpty()|| newUser.getLastName().isEmpty() ||newUser.getRoles().contains(UserRole.ADMIN))
            throw new BadRequestException("Empty email or password");


        User user = userRepository.findById(newUser.getId())
                .orElseThrow(() -> new NotFoundException("User id=" + newUser.getId() + " not found"));

//        user.setRoles(newUser.getRoles());
//        user.setEmail(newUser.getEmail());
//        user.setLanguage(newUser.getLanguage());
//        user.setPassword(passwordEncoder.encode(newUser.getPassword()));
        if (newUser.getPassword() == null){
            newUser.setPassword(user.getPassword());
        }
        else{
            newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        }
        return userRepository.save(newUser);
    }

    @PostConstruct
    private void createDefaultUsers() {
        if (userRepository.findByEmail(ANONYMOUS_USERNAME) == null)
            userRepository.save(new User(ANONYMOUS_USERNAME,ANONYMOUS_USERNAME,ANONYMOUS_USERNAME,Sets.newHashSet(UserRole.ANONYMOUS)));

        if (userRepository.findByEmail(adminEmail) == null) {
            User admin = new User(adminEmail,"Phillip","Dale", Sets.newHashSet(UserRole.ADMIN));
            admin.setPassword(passwordEncoder.encode(adminPassword));
            userRepository.save(admin);
        }
    }
}