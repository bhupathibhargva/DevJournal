package com.dev.journal.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.journal.dao.Journal;
import com.dev.journal.dao.Tag;
import com.dev.journal.repository.JournalRepository;


@RestController
public class DevJournalController {
    
	@Autowired
	JournalRepository  jourRepo;
	
	@Autowired
	Journal jour;
	
	@Autowired
	Tag tag ;
	
	@PostMapping
	@RequestMapping("/journal/add")
	public void addJournal(@RequestBody Journal journal) {
		List<Tag> tags = journal.getTags();
		jour.setTitle(journal.getTitle());
		jour.setContent(journal.getContent());
		jour.setTags(tags);
		tag.getJournals().add(jour);
		jourRepo.save(jour);
		
	}
	
	@CrossOrigin(origins = "*")
	@GetMapping
	@RequestMapping("/journal")
	public ResponseEntity<List<Journal>> getJournal() {


		return null;
	}
}