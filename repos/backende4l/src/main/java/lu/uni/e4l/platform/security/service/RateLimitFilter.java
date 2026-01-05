package lu.uni.e4l.platform.security.service;

import lu.uni.e4l.platform.controller.SeminarController;
import lu.uni.e4l.platform.model.RequestSource;
import lu.uni.e4l.platform.repository.RequestSourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;



import javax.servlet.ServletException;

public class RateLimitFilter extends OncePerRequestFilter {

    @Autowired
    private RequestSourceRepository requestSourceRepository;
    @Autowired
    private SeminarController seminarController;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!seminarController.isRateLimiterEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        String requestURI = request.getRequestURI();

        if (requestURI.startsWith("/e4lapi/session")) {
            String uniqueIdentifier = generateUniqueIdentifier(request);
            Optional<RequestSource> requestSourceOptional = requestSourceRepository.findBySource(uniqueIdentifier);

            if (requestSourceOptional.isPresent()) {
                RequestSource requestSource = requestSourceOptional.get();
                if (requestSource.getExpirationTime().isAfter(LocalDateTime.now())) {
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.getWriter().write("Too many requests");
                    return;
                } else {
                    // Update expiration time
                    requestSource.setExpirationTime(LocalDateTime.now().plusMinutes(1)); // Set new expiration time
                    requestSourceRepository.save(requestSource);
                }
            } else {
                // Add new source with expiration time
                RequestSource newRequestSource = new RequestSource();
                newRequestSource.setSource(uniqueIdentifier);
                newRequestSource.setExpirationTime(LocalDateTime.now().plusMinutes(1)); // Set expiration time
                requestSourceRepository.save(newRequestSource);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String generateUniqueIdentifier(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String acceptLanguage = request.getHeader("Accept-Language");
        return ip + ":" + userAgent + ":" + acceptLanguage;
    }
}