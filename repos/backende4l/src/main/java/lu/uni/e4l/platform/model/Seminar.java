package lu.uni.e4l.platform.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import java.util.Optional;
import javax.persistence.*;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import javax.validation.constraints.Size;
import com.fasterxml.jackson.annotation.*;

@Data
@Entity
@JsonInclude(JsonInclude.Include.NON_NULL)
@RequiredArgsConstructor
@JsonIdentityInfo(generator=ObjectIdGenerators.IntSequenceGenerator.class, property="@id")
public class Seminar {

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private long id;

    private String name;

    private String description;

    private ZonedDateTime createdDateTime;

    private String address;

    // @NonNull
    private ZonedDateTime eventDateTime;

    private String audience;

    private String presenters;

    // @NonNull
    @Column(unique=true, length = 99)
    private String accessCode;

    private SeminarStatus status;

    private long seminarCounter;

    @OneToMany(mappedBy = "seminar", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Session> sessions;

    public boolean isThisId(long findid) {
        return findid == id;
    }

    public int myseslen() {
        return sessions.size();
    }

    public static Seminar fromSeminarView(SeminarView seminarView) {
        Seminar seminar = new Seminar();
        seminar.setId(seminarView.getId());
        seminar.setName(seminarView.getName());
        seminar.setDescription(seminarView.getDescription());
        seminar.setCreatedDateTime(seminarView.getCreatedDateTime());
        seminar.setAddress(seminarView.getAddress());
        seminar.setEventDateTime(seminarView.getEventDateTime());
        seminar.setAudience(seminarView.getAudience());
        seminar.setPresenters(seminarView.getPresenters());
        seminar.setAccessCode(seminarView.getAccessCode());
        seminar.setStatus(seminarView.getStatus());
        seminar.setSeminarCounter(seminarView.getSeminarCounter());

        return seminar;
    }

    public Optional<Session> getSession(long sessionId) {
        return sessions.stream()
                .filter(s -> s.getId() == sessionId)
                .findAny();
    }

    public void addSession(Session session) {
        sessions.add(session);
    }

    @Override
    public String toString(){
        StringBuilder s = new StringBuilder();
        s.append("ID: ");
        s.append(id);
        s.append("\nQuantity: ");
        s.append(seminarCounter);
        s.append("\nAccess code: ");
        s.append(accessCode);
        s.append("\n");
        return s.toString();
    }
}

