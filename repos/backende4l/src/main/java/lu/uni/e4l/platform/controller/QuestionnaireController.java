package lu.uni.e4l.platform.controller;

import lu.uni.e4l.platform.model.*;
import lu.uni.e4l.platform.model.dto.ResultBreakdown;
import lu.uni.e4l.platform.repository.RequestSourceRepository;
import lu.uni.e4l.platform.service.QuestionnaireService;
import lu.uni.e4l.platform.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.Optional;

@RestController
public class QuestionnaireController {


    @Autowired
    private RequestSourceRepository requestSourceRepository;

    private final QuestionnaireService questionnaireService;
    private final SessionService sessionService;

    @Autowired
    public QuestionnaireController(QuestionnaireService questionnaireService,
                                   SessionService sessionService) {
        this.questionnaireService = questionnaireService;
        this.sessionService = sessionService;
    }

    @GetMapping("/questionnaire")
    public List<Question> getPoll() {
        List<Question> questions = questionnaireService.getDefaultQuestionnaire().getQuestions();

        // avoiding loops on serialization
        for (Question question : questions) {
            for (PossibleAnswer possibleAnswer : question.getPossibleAnswers()) {
                possibleAnswer.setAnswers(null);
                possibleAnswer.setQuestion(null);
            }
        }

        return questions;
    }

    @GetMapping("/responses/count")
    public int allResponsesCount(Boolean kid) {
        return (int) sessionService.getSessions().stream().filter(q->q.getIskid()==kid).count();
//        return (int) sessionService.getSessions().size();
    }

    @GetMapping("/calculateAble")
    public Boolean isCalculateAble(HttpServletRequest request) {
        String uniqueIdentifier = generateUniqueIdentifier(request);
        Optional<RequestSource> requestSourceOptional = requestSourceRepository.findBySource(uniqueIdentifier);

        if (requestSourceOptional.isPresent()) {
            return true;
        }

        return false; // If not found, it means the user has not accessed the questionnaire yet.
    }

    @GetMapping("/responses")
    @PreAuthorize("isAuthenticated()")
    public List<ResultBreakdown> getResponses(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        return sessionService.getSessions().stream()
                .filter(q -> user.getRoles().contains(UserRole.ADMIN) || user.getId() == q.getUser().getId())
                .map(ResultBreakdown::fromSession)
                .collect(Collectors.toList());
    }

    private String generateUniqueIdentifier(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String acceptLanguage = request.getHeader("Accept-Language");
        return ip + ":" + userAgent + ":" + acceptLanguage;
    }
}
