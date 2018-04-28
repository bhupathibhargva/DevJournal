package com.dev.journal.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DevJournalController {
	
    @PostMapping
    @RequestMapping("/greeting")
    public String greeting( String name) {
    	name = "bhargav";
        return name;
    }
}