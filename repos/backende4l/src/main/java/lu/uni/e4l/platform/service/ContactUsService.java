package lu.uni.e4l.platform.service;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import lu.uni.e4l.platform.model.dto.ContactUs;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.text.MessageFormat;
import java.util.Arrays;

import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.MailException;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.InternetAddress;
import javax.mail.MessagingException;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.multipart.MultipartFile;
import javax.mail.Message;
import javax.mail.internet.InternetAddress;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactUsService {
    private final JavaMailSender emailSender;

    @Value("${e4l.contact.from}")
    private String emailFrom;

    @Value("${e4l.contact.email}")
    private String contactEmail;

    public void sendMailWithAttachment(String to, String subject, String body, MultipartFile fileToAttach) {
        MimeMessagePreparator preparator = mimeMessage -> {
            mimeMessage.setRecipient(Message.RecipientType.TO, new InternetAddress(to));
            mimeMessage.setFrom(new InternetAddress("e4l@noreply.uni.lu"));
            mimeMessage.setSubject(subject);

            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setText(body, true); // true indicates that the body is HTML (set to false if it's plain text)

            // Add the MultipartFile as an attachment
            String attachmentFilename = fileToAttach.getOriginalFilename() != null ? fileToAttach.getOriginalFilename() : "attachment.pdf";
            helper.addAttachment(attachmentFilename, fileToAttach);
        };

        try {
            emailSender.send(preparator);
        } catch (MailException ex) {
            // simply log it and go on...
            System.err.println(ex.getMessage());
        }
    }

    public void onNewMessage(ContactUs message, String lang, HttpServletRequest request) {
        lang = lang.trim().toLowerCase();
        lang = Arrays.asList("en", "fr", "de", "lu").contains(lang) ? lang : "en";

        SimpleMailMessage forwardedMail = forwardUserMessage(message, lang, request);
        SimpleMailMessage confirmationMail = sendReceiveConfirmation(message.getEmail(), message.getFirstName(),
                message.getLastName(), lang);

        log.info("Successfully forwarded message from {}", message.getEmail());
    }

    @SneakyThrows
    private SimpleMailMessage forwardUserMessage(ContactUs message, String lang, HttpServletRequest req) {
        String userAgent = req.getHeader("User-Agent");

        String resourcePath = "/email/contact/forward_message.txt";
        String template = IOUtils.toString(this.getClass().getResourceAsStream(resourcePath), StandardCharsets.UTF_8);
        String text = MessageFormat.format(
                template,
                message.getFirstName(),
                message.getLastName(),
                message.getEmail(),
                message.getSubject(),
                message.getMessage()
        );

        return sendEmail(contactEmail, message.getEmail(), "[E4L Contact Form] " + message.getSubject(), text);
    }

    @SneakyThrows
    private SimpleMailMessage sendReceiveConfirmation(String email, String firstName, String lastName, String lang) {
        String resourcePath = "/email/contact/receive_confirmation_" + lang + ".txt";
        String template = IOUtils.toString(this.getClass().getResourceAsStream(resourcePath), StandardCharsets.UTF_8);
        String text = MessageFormat.format(template, firstName, lastName);

        return sendEmail(email, contactEmail, "Energy4Life", text);
    }

    public SimpleMailMessage sendEmailToken(String email, String text) {

        return sendEmail(email,contactEmail,"Energy4Life reset password token",text);
    }

    private SimpleMailMessage sendEmail(String email, String replyTo, String subject, String text) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(emailFrom);
        mail.setReplyTo(replyTo);
        mail.setTo(email.split(","));
        mail.setSubject(subject);
        mail.setText(text);

        emailSender.send(mail);
        return mail;
    }
}
