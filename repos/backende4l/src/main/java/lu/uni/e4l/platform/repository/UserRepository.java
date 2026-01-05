package lu.uni.e4l.platform.repository;

import lu.uni.e4l.platform.model.User;
import org.springframework.data.repository.CrudRepository;
import java.util.Date;
import java.util.List;
public interface UserRepository extends CrudRepository<User, Long> {
    User findByEmail(String email);
    List<User> findByTokenExpirationBefore(Date now);
}
