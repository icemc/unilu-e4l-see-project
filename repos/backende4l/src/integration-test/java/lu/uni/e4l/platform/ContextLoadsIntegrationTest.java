package lu.uni.e4l.platform;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.junit4.SpringRunner;
import lu.uni.e4l.platform.service.QuestionnaireService;
import lu.uni.e4l.platform.service.UserManagementService;

/**
 * Basic smoke test to verify Spring application context loads.
 * Mocks complex services to avoid initialization issues.
 */
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ContextLoadsIntegrationTest {

    @MockBean
    private QuestionnaireService questionnaireService;
    
    @MockBean
    private UserManagementService userManagementService;
    
    @MockBean
    private JavaMailSender mailSender;

    @Test
    public void contextLoads() {
        // Passes if Spring context loads successfully
    }
}
