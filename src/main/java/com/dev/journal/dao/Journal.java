package com.dev.journal.dao;

import java.util.List;

public class Journal {

    private  long id;
    private String name;
    private  String content;
    private List<Tags> tags;
  
    public Journal(long id,String name, String content,List<Tags> tags) {
        this.id = id;
        this.name = name;
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

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public List<Tags> getTags() {
		return tags;
	}

	public void setTags(List<Tags> tags) {
		this.tags = tags;
	}
}