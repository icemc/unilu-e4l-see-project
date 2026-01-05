package lu.uni.e4l.platform.security.service;

import lu.uni.e4l.platform.repository.RequestSourceRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CleanupService {

    private final RequestSourceRepository requestSourceRepository;

    public CleanupService(RequestSourceRepository requestSourceRepository) {
        this.requestSourceRepository = requestSourceRepository;
    }

    @Scheduled(fixedRate = 180000) // Every 24 hours
    @Transactional
    public void cleanDatabase() {
        requestSourceRepository.deleteByExpirationTimeBefore(LocalDateTime.now());
    }
}
