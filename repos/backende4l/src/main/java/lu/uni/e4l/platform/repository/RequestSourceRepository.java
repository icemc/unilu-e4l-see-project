package lu.uni.e4l.platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import lu.uni.e4l.platform.model.RequestSource;


public interface RequestSourceRepository extends JpaRepository<RequestSource, Long> {
    Optional<RequestSource> findBySource(String source);
    void deleteByExpirationTimeBefore(LocalDateTime now);
}
