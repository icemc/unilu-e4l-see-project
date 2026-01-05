package lu.uni.e4l.platform.repository;

import lu.uni.e4l.platform.model.Seminar;
import lu.uni.e4l.platform.model.SeminarView;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

public interface SeminarRepository extends CrudRepository<Seminar, Long> {
    List<Seminar> findAll();

    List<SeminarView> findBy();
}
