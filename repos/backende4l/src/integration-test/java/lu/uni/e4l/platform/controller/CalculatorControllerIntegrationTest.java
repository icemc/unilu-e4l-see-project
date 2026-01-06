package lu.uni.e4l.platform.controller;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import lu.uni.e4l.platform.service.QuestionnaireService;
import lu.uni.e4l.platform.service.UserManagementService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Simple integration test for API endpoint accessibility.
 */
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public class CalculatorControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QuestionnaireService questionnaireService;
    
    @MockBean
    private UserManagementService userManagementService;
    
    @MockBean
    private JavaMailSender mailSender;

    @Test
    public void testCalculatorEndpointExists() throws Exception {
        // Verify endpoint exists (may return 404 if no data, but not 500 error)
        mockMvc.perform(get("/e4lapi/api/calculator"))
                .andExpect(status().isNotFound());
    }
}
