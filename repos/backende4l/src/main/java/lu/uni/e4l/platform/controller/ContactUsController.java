package lu.uni.e4l.platform.controller;

import lombok.RequiredArgsConstructor;
import lu.uni.e4l.platform.model.dto.ContactUs;
import lu.uni.e4l.platform.service.ContactUsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequiredArgsConstructor
public class ContactUsController {
    private final ContactUsService contactUsService;


    @PostMapping("/contact")
    public ResponseEntity<?> contactUs(@RequestHeader("accept-language") String lang,
                                       @RequestBody ContactUs contactUs,
                                       HttpServletRequest request) {
        contactUsService.onNewMessage(contactUs, lang, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/contact_w_pdf")
    public ResponseEntity<?> getPdfResults(@RequestHeader("accept-language") String lang,
                                           @RequestParam("firstName") String firstName,
                                           @RequestParam("lastName") String lastName,
                                           @RequestParam("email") String email,
                                           @RequestParam("pdf") MultipartFile pdfFile,
                                           HttpServletRequest request) {
        // Set other fields as needed
        String emailBody = String.format("<p>Dear %s %s,</p><p>Thank you very much for your help.</p>", firstName, lastName);
        contactUsService.sendMailWithAttachment(email,"Your Energy score results", emailBody, pdfFile);
        return ResponseEntity.ok().build();
    }

}
