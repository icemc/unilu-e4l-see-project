package lu.uni.e4l.platform.model;

import java.time.ZonedDateTime;

import javax.persistence.Column;

public interface SeminarView {
    public long getId();

    public String getName();

    public String getDescription();

    public ZonedDateTime getCreatedDateTime();

    public String getAddress();

    public ZonedDateTime getEventDateTime();

    public String getAudience();

    public String getPresenters();

    public String getAccessCode();

    public SeminarStatus getStatus();

    public long getSeminarCounter();

}
