package com.dev.journal.dao;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import org.springframework.stereotype.Component;

@Entity
@Table(name = "Journal")
@Component
public class Journal {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    private  long id;
	
	@NotNull
    @Size(max = 100)
    private String title;
	
	@NotNull
    private  String content;
	
	public void setContent(String content) {
		this.content = content;
	}
	@ManyToMany(fetch = FetchType.LAZY,
            cascade = {
                CascadeType.PERSIST,
                CascadeType.MERGE
            })
    @JoinTable(name = "journal_tags",
            joinColumns = { @JoinColumn(name = "journal_id") },
            inverseJoinColumns = { @JoinColumn(name = "tag_id") })
    private List<Tag> tags = new ArrayList<>();
  
    public Journal(long id,String title, String content,List<Tag> tags) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.tags = tags;
    }
    
    public Journal() {}

    public long getId() {
        return id;
    }
    public String getContent() {
        return content;
    }

	public List<Tag> getTags() {
		return tags;
	}

	public void setTags(List<Tag> tags) {
		this.tags = tags;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
}