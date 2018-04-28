package com.dev.journal.dao;

public class Journal {

    private  long id;
    private String name;
    private  String content;
  
    public Journal(long id,String name, String content) {
        this.id = id;
        this.name = name;
        this.content = content;
    }

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
}