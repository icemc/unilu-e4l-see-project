package lu.uni.e4l.platform.service;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.*;

import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
public class ExpressionEvaluatorTest {

    @Test
    public void testTokenize_ShouldSplitExpressionIntoTokens() {
        // Given
        String expression = "2 + 3 * (4 - 1)";

        // When
        List<String> tokens = ExpressionEvaluator.tokenize(expression);

        // Then
        assertNotNull("Tokens should not be null", tokens);
        assertTrue("Should have multiple tokens", tokens.size() > 0);
        assertTrue("Should contain addition operator", tokens.contains("+"));
        assertTrue("Should contain multiplication operator", tokens.contains("*"));
        assertTrue("Should contain opening parenthesis", tokens.contains("("));
        assertTrue("Should contain closing parenthesis", tokens.contains(")"));
    }

    @Test
    public void testTokenize_ShouldHandleSimpleExpression() {
        // Given
        String expression = "5 + 3";

        // When
        List<String> tokens = ExpressionEvaluator.tokenize(expression);

        // Then
        assertEquals("Should have 3 tokens", 3, tokens.size());
        assertEquals("First token should be 5", "5", tokens.get(0));
        assertEquals("Second token should be +", "+", tokens.get(1));
        assertEquals("Third token should be 3", "3", tokens.get(2));
    }

    @Test
    public void testReplaceVariablesWithValues_ShouldSubstituteVariables() {
        // Given
        List<String> tokens = Arrays.asList("x", "+", "y");
        Map<String, String> values = new HashMap<>();
        values.put("x", "10");
        values.put("y", "5");

        // When
        List<String> result = ExpressionEvaluator.replaceVariablesWithValues(tokens, values);

        // Then
        assertEquals("Should have 3 tokens", 3, result.size());
        assertEquals("x should be replaced with 10", "10", result.get(0));
        assertEquals("+ should remain unchanged", "+", result.get(1));
        assertEquals("y should be replaced with 5", "5", result.get(2));
    }

    @Test
    public void testReplaceVariablesWithValues_ShouldKeepNumbers() {
        // Given
        List<String> tokens = Arrays.asList("42", "+", "3.14");
        Map<String, String> values = new HashMap<>();

        // When
        List<String> result = ExpressionEvaluator.replaceVariablesWithValues(tokens, values);

        // Then
        assertEquals("Numbers should remain unchanged", tokens, result);
    }

    @Test
    public void testReplaceVariablesWithValues_ShouldThrowExceptionForUnknownVariable() {
        // Given
        List<String> tokens = Arrays.asList("unknown_var", "+", "5");
        Map<String, String> values = new HashMap<>();

        try {
            // When
            ExpressionEvaluator.replaceVariablesWithValues(tokens, values);
            fail("Should have thrown an exception for unknown variable");
        } catch (Exception e) {
            // Then - expect some exception for unknown variable
            assertNotNull("Exception should be thrown", e);
        }
    }

    @Test
    public void testTokenize_ShouldHandleEmptyString() {
        // Given
        String expression = "";

        // When
        List<String> tokens = ExpressionEvaluator.tokenize(expression);

        // Then
        assertNotNull("Tokens should not be null", tokens);
        assertTrue("Empty expression should result in empty token list", tokens.isEmpty());
    }
}
