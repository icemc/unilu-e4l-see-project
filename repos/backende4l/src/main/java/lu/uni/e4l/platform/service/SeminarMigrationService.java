package lu.uni.e4l.platform.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lu.uni.e4l.platform.model.Seminar;
import lu.uni.e4l.platform.repository.SeminarRepository;

@Service
public class SeminarMigrationService {

    @Autowired
    private SeminarRepository seminarRepository;

    public void migrateSeminarCounters() {
        List<Seminar> seminars = seminarRepository.findAll();
        for (Seminar seminar : seminars) {
            int sessionCount = seminar.getSessions().size();
            seminar.setSeminarCounter(sessionCount);
            seminarRepository.save(seminar);
        }
    }
}